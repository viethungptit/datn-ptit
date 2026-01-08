import asyncio
import json
import os
import aio_pika
from services.embedding import summarize_text, create_embedding
from db import get_pool
from services.extract_text_from_url import extract_text_from_url
from utils.service_client import update_status_embedding_job, update_status_embedding_cv
import logging
from dotenv import load_dotenv
from difflib import SequenceMatcher
import re
load_dotenv()

logger = logging.getLogger("rabbitmq")

RABBIT_URL = os.getenv("RABBITMQ_URL")
EXCHANGE_NAME = os.getenv("EMBEDDING_EXCHANGE")
CV_QUEUE = os.getenv("EMBEDDING_CV_QUEUE")
CV_ROUTING_KEY = os.getenv("EMBEDDING_CV_ROUTING_KEY")
JD_QUEUE = os.getenv("EMBEDDING_JD_QUEUE")
JD_ROUTING_KEY = os.getenv("EMBEDDING_JD_ROUTING_KEY")
APPLICATION_QUEUE = os.getenv("EMBEDDING_APPLICATION_QUEUE")
APPLICATION_ROUTING_KEY = os.getenv("EMBEDDING_APPLICATION_ROUTING_KEY")
EMBEDDING_DELETE_APPLICATION_ROUTING_KEY = os.getenv("EMBEDDING_DELETE_APPLICATION_ROUTING_KEY")
EMBEDDING_APPLICATION_STATUS_ROUTING_KEY = os.getenv("EMBEDDING_APPLICATION_STATUS_ROUTING_KEY")
EMBEDDING_DELETE_QUEUE = os.getenv("EMBEDDING_DELETE_QUEUE")
EMBEDDING_DELETE_CV_ROUTING_KEY = os.getenv("EMBEDDING_DELETE_CV_ROUTING_KEY")
EMBEDDING_DELETE_JD_ROUTING_KEY = os.getenv("EMBEDDING_DELETE_JD_ROUTING_KEY")
MINIO_URL = os.getenv("MINIO_URL")

async def start_rabbit_listener():
    retry_interval = 5       
    max_wait = 120          
    elapsed = 0
    while elapsed < max_wait:
        try:
            logger.info("Trying to connect to RabbitMQ...")
            connection = await aio_pika.connect_robust(RABBIT_URL)
            channel = await connection.channel()
            await channel.set_qos(prefetch_count=10)

            async def handle_application_events(message: aio_pika.IncomingMessage):
                routing_key = message.routing_key
                if routing_key == APPLICATION_ROUTING_KEY:
                    await process_event_application(message, "applications", "application_id")
                elif routing_key == EMBEDDING_APPLICATION_STATUS_ROUTING_KEY:
                    await process_event_application_status(message, "applications", "application_id")
                elif routing_key == EMBEDDING_DELETE_APPLICATION_ROUTING_KEY:
                    await process_event_application_delete(message, "applications", "application_id")
                else:
                    logger.warning(f"Unknown routing_key='{routing_key}', skipping message")

            exchange = await channel.declare_exchange(EXCHANGE_NAME, aio_pika.ExchangeType.DIRECT, durable=True)
            cv_queue = await channel.declare_queue(CV_QUEUE, durable=True)
            jd_queue = await channel.declare_queue(JD_QUEUE, durable=True)
            application_queue = await channel.declare_queue(APPLICATION_QUEUE, durable=True)
            delete_queue = await channel.declare_queue(EMBEDDING_DELETE_QUEUE, durable=True)

            await cv_queue.bind(exchange, routing_key=CV_ROUTING_KEY)
            await jd_queue.bind(exchange, routing_key=JD_ROUTING_KEY)
            await application_queue.bind(exchange, routing_key=APPLICATION_ROUTING_KEY)
            await application_queue.bind(exchange, routing_key=EMBEDDING_APPLICATION_STATUS_ROUTING_KEY)
            await application_queue.bind(exchange, routing_key=EMBEDDING_DELETE_APPLICATION_ROUTING_KEY)
            await delete_queue.bind(exchange, routing_key=EMBEDDING_DELETE_CV_ROUTING_KEY)
            await delete_queue.bind(exchange, routing_key=EMBEDDING_DELETE_JD_ROUTING_KEY)

            await cv_queue.consume(lambda msg: process_event_embedding(msg, "embedding_cv", "cv_id"))
            await jd_queue.consume(lambda msg: process_event_embedding(msg, "embedding_jd", "job_id"))
            await application_queue.consume(handle_application_events)
            await delete_queue.consume(lambda msg: process_event_delete_embedding(msg))

            logger.info("RabbitMQ listeners started successfully.")
            return connection

        except Exception as e:
            logger.error(f"RabbitMQ connection failed: {e}")
            if elapsed + retry_interval >= max_wait:
                logger.critical("Cannot connect to RabbitMQ after 60 seconds. Exiting...")
                raise RuntimeError("Failed to connect to RabbitMQ within max wait time")
            logger.info(f"Retrying in {retry_interval} seconds...")
            await asyncio.sleep(retry_interval)
            elapsed += retry_interval

def find_most_similar_raw_text(
    new_text: str,
    rows,
    threshold: float = 0.9
):
    best_ratio = 0.0
    best_row = None


    for row in rows:
        old_text = row["raw_text"]
        ratio = SequenceMatcher(None, new_text, old_text).ratio()

        if ratio > best_ratio:
            best_ratio = ratio
            best_row = row

    return best_row if best_ratio >= threshold else None, best_ratio

def is_similar_text(new_text: str, old_text: str, threshold: float = 0.95) -> bool:
    ratio = SequenceMatcher(None, new_text, old_text).ratio()
    logger.info("Computed similarity ratio: %.3f", ratio)
    return ratio >= threshold


async def process_event_embedding(message: aio_pika.IncomingMessage, table: str, id_field: str):
    logger.info("[🐇] Starting RabbitMQ listener...")
    async with message.process():
        data = json.loads(message.body)
        record_id = data.get(id_field)
        file_url = data.get("file_url")
        raw_text = data.get("raw_text")
        if not record_id:
            logger.warning("Skipping embedding: missing %s in event: %s", id_field, data)
            return

        status = "failed"
        try:
            if file_url:
                full_url = MINIO_URL + file_url
                raw_text = await extract_text_from_url(full_url)
            
            if id_field == "cv_id":
                pool = await get_pool()
                async with pool.acquire() as conn:
                    row = await conn.fetchrow(
                        f"""
                        SELECT raw_text
                        FROM {table}
                        WHERE {id_field} = $1
                        """,
                        record_id
                    )

                if row and row["raw_text"]:
                    old_raw_text = row["raw_text"]
                    ratio = SequenceMatcher(None, raw_text, old_raw_text).ratio()
                    if ratio >= 0.95:
                        logger.info(
                            "Skip embedding for cv_id=%s (change_ratio=%.3f >= 0.95)",
                            record_id,
                            ratio
                        )
                        await update_status_embedding_cv(record_id, "embedded")
                        return


            if id_field == "cv_id":
                    pool = await get_pool()
                    async with pool.acquire() as conn:
                        rows = await conn.fetch(
                            """
                            SELECT cv_id, raw_text, origin_text, embedding_vector
                            FROM embedding_cv
                            WHERE raw_text IS NOT NULL
                            AND cv_id != $1
                            """,
                            record_id
                        )

                    best_row, best_ratio = find_most_similar_raw_text(
                        raw_text, rows, threshold=0.9
                    )

                    if best_row:
                        logger.info(
                            "Reuse embedding from cv_id=%s (similarity=%.3f)",
                            best_row["cv_id"],
                            best_ratio
                        )

                        pool = await get_pool()
                        async with pool.acquire() as conn:
                            await conn.execute(
                                """
                                INSERT INTO embedding_cv (
                                    cv_id,
                                    origin_text,
                                    raw_text,
                                    embedding_vector,
                                    created_at
                                )
                                VALUES ($1, $2, $3, $4, NOW())
                                ON CONFLICT (cv_id) DO UPDATE
                                SET
                                    origin_text = EXCLUDED.origin_text,
                                    raw_text = EXCLUDED.raw_text,
                                    embedding_vector = EXCLUDED.embedding_vector,
                                    created_at = NOW()
                                """,
                                record_id,
                                best_row["origin_text"],
                                raw_text,
                                best_row["embedding_vector"],
                            )

                        status = "embedded"
                        await update_status_embedding_cv(record_id, status)
                        return
                    
            summary = await summarize_text(raw_text)
            vector = await create_embedding(summary)
            pg_vector = "[" + ",".join(str(x) for x in vector) + "]"
            pool = await get_pool()
            async with pool.acquire() as conn:
                await conn.execute(f"""
                    INSERT INTO {table} ({id_field}, origin_text, raw_text, embedding_vector, created_at)
                    VALUES ($1, $2, $3, $4, NOW())
                    ON CONFLICT ({id_field}) DO UPDATE
                        SET 
                            origin_text = EXCLUDED.origin_text,
                            raw_text = EXCLUDED.raw_text,
                            embedding_vector = EXCLUDED.embedding_vector,
                            created_at = NOW()
                    """, record_id, summary, raw_text, pg_vector)

            status = "embedded"
            logger.info("%s updated for %s=%s", table, id_field, record_id)
        except Exception as e:
            logger.exception("Error embedding for %s %s=%s", table, id_field, record_id)

        try:
            if id_field == "job_id":
                await update_status_embedding_job(record_id, status)
            elif id_field == "cv_id":
                await update_status_embedding_cv(record_id, status)
            else:
                pass
        except Exception:
            logger.exception("Error calling update_status_embedding for %s=%s", id_field, record_id)

async def process_event_application(message: aio_pika.IncomingMessage, table: str, id_field: str):
    async with message.process():
        data = json.loads(message.body)
        application_id = data.get(id_field)
        job_id = data.get("job_id")
        cv_id = data.get("cv_id")
        apply_status = data.get("apply_status")

        if not application_id or not job_id or not cv_id or not apply_status:
            logger.warning("Skipping application sync: missing required fields in event: %s", data)
            return

        pool = await get_pool()
        async with pool.acquire() as conn:
            await conn.execute(f"""
                INSERT INTO {table} ({id_field}, job_id, cv_id, apply_status, applied_at)
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT ({id_field}) DO UPDATE
                    SET job_id = EXCLUDED.job_id,
                        cv_id = EXCLUDED.cv_id,
                        apply_status = EXCLUDED.apply_status,
                        applied_at = EXCLUDED.applied_at
                """, application_id, job_id, cv_id, apply_status)

        logger.info("%s synced for %s=%s", table, id_field, application_id)

async def process_event_application_status(message: aio_pika.IncomingMessage, table: str, id_field: str):
    async with message.process():
        data = json.loads(message.body)
        application_id = data.get(id_field)
        apply_status = data.get("apply_status")
        if not application_id or not apply_status:
            logger.warning("Skipping application status update: missing %s or apply_status in event: %s", id_field, data)
            return

        pool = await get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(f"UPDATE {table} SET apply_status = $1 WHERE {id_field} = $2", apply_status, application_id)

        logger.info("%s status updated for %s=%s to %s, result=%s", table, id_field, application_id, apply_status, result)


async def process_event_application_delete(message: aio_pika.IncomingMessage, table: str, id_field: str):
    async with message.process():
        data = json.loads(message.body)
        application_id = data.get(id_field)
        if not application_id:
            logger.warning("Skipping application delete: missing %s in event: %s", id_field, data)
            return

        pool = await get_pool()
        async with pool.acquire() as conn:
            result = await conn.execute(f"DELETE FROM {table} WHERE {id_field} = $1", application_id)

        logger.info("%s delete executed for %s=%s, result=%s", table, id_field, application_id, result)


async def process_event_delete_embedding(message: aio_pika.IncomingMessage):
    async with message.process():
        try:
            data = json.loads(message.body)
        except Exception:
            logger.warning("Invalid JSON for delete-embedding event: %s", message.body)
            return

        routing_key = getattr(message, "routing_key", None)
        pool = await get_pool()

        if routing_key == EMBEDDING_DELETE_CV_ROUTING_KEY:
            table = "embedding_cv"
            id_field = "cv_id"
            id_value = data.get("cv_id")
        elif routing_key == EMBEDDING_DELETE_JD_ROUTING_KEY:
            table = "embedding_jd"
            id_field = "job_id"
            id_value = data.get("job_id")
        else:
            if "cv_id" in data:
                table = "embedding_cv"
                id_field = "cv_id"
                id_value = data.get("cv_id")
            elif "job_id" in data:
                table = "embedding_jd"
                id_field = "job_id"
                id_value = data.get("job_id")
            else:
                logger.warning("Unknown delete-embedding event (no routing key match and no cv_id/job_id): %s", data)
                return

        if not id_value:
            logger.warning("Skipping delete-embedding: missing %s in event: %s", id_field, data)
            return

        async with pool.acquire() as conn:
            try:
                result = await conn.execute(f"DELETE FROM {table} WHERE {id_field} = $1", id_value)
                logger.info("Deleted from %s where %s=%s, result=%s", table, id_field, id_value, result)
            except Exception:
                logger.exception("Error deleting embedding from %s for %s=%s", table, id_field, id_value)
