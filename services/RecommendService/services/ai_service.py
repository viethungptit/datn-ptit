import os
import json
import requests
import logging
import re
from typing import List, Dict, Any
import asyncio
from db import get_pool
from utils.openai_proxy_client import send_openai_request_sync
from utils.service_client import get_cv_details_batch
from datetime import datetime

logger = logging.getLogger("ai_service")

# Service-level exceptions for matching logic
class MatchJobError(Exception):
    pass
class JobNotFound(MatchJobError):
    pass
class DBError(MatchJobError):
    pass

# Environment keys
OPENAI_KEY = os.getenv("OPENAI_API_KEY")

# OpenAI endpoint
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

PROMPT_TEMPLATE = r"""
    Bạn là một trợ lý viết CV chuyên nghiệp, chính xác và không thêm thông tin không có trong đầu vào.
    --- INPUT (hãy hiểu các giá trị):
    - language: "{language}"   # "vi"|"en"|"auto"
    - position: "{position}"
    - section: "{section}"     # one of experience, projects, education, skills, awards, summary, objective
    - content: "{content}"     # raw text from user (may be short)
    - style: "{style}"         # one of: professional | concise | impact      

    --- NGUYÊN TẮC CHUNG (bắt buộc):
    1) KHÔNG BAO GIỜ BỔ SUNG THÔNG TIN HOẶC SỐ LIỆU KHÔNG CÓ TRONG `content`. Nếu không có con số/chi tiết, viết chung chung, trung tính.
    2) Giữ nguyên tên riêng, công ty, thời gian, hoặc chi tiết thật nếu có.
    3) Nếu language == "auto", hãy detect ngôn ngữ chính từ `content`. Nếu không rõ, mặc định "en".
    4) Nếu language == "vi" hoặc "en", TRẢ LỜI HOÀN TOÀN bằng ngôn ngữ đó (không lẫn).
    5) Bắt đầu câu bằng động từ hành động (action verb): ví dụ "Phát triển", "Thiết kế", "Triển khai", "Led", "Implemented".
    6) Dùng active voice; tone tùy theo `style`.
    7) Nếu `style` là "professional" → văn phong chuyên nghiệp, lịch sự, từ ngữ trang trọng, thể hiện chuyên môn và trách nhiệm.
    8) Nếu `style` là "concise" → ngắn gọn, súc tích, loại bỏ chi tiết thừa, tập trung ý chính.
    9) Nếu `style` là "impact" → nhấn mạnh thành tích, kết quả đạt được, dùng từ mạnh mẽ (nhưng chỉ nếu có thật).

    --- QUY ƯỚC THEO SECTION (linh hoạt hơn):
    - experience:
      Người dùng có thể nhập nhiều hơn 1 công ty nên không được rút gọn hay bỏ sót công ty nào. 
      Nếu hết 1 công ty thì **xuống dòng cách một dòng trống** để tách rõ.
      Khi viết lại, **phải giữ nguyên và hiển thị rõ chức vụ (vị trí làm việc)** trong câu đầu tiên của mỗi công ty, theo định dạng:
      "**<Vị trí>** tại **<Tên công ty>** (*<Thời gian làm việc>*)."
      Sau đó là mô tả nhiệm vụ và kết quả dưới dạng gạch đầu dòng nếu có từ 2 ý trở lên.
      Ví dụ:
      Input:
      "Công ty ABC (2022–2024), vị trí Backend Developer. Viết API, quản lý database, tối ưu hiệu năng."
      → Output:
      **Backend Developer** tại **Công ty ABC** (*2022–2024*)  
      - Thiết kế và phát triển REST API  
      - Quản lý cơ sở dữ liệu MySQL  
      - Tối ưu hiệu năng truy vấn để cải thiện tốc độ phản hồi của hệ thống
    - projects:
      Người dùng có thể nhập nhiều hơn 1 project, không được gộp chung. Nếu hết 1 project thì **xuống dòng cách một dòng trống**.
      Format:
      "**<Tên dự án>** – <Số người trong nhóm (nếu có)> – **<Vị trí làm việc>**."
      Sau đó mô tả project (1–4 câu) nêu công nghệ, vai trò, mục tiêu, kết quả.
      Ví dụ:
      Input:
      "Hệ thống quản lý kho, nhóm 5 người, tôi làm frontend bằng React, kết nối API, thiết kế giao diện."
      → Output:
      **Hệ thống quản lý kho** – Nhóm 5 người – **Frontend Developer**  
      - Phát triển giao diện người dùng bằng React  
      - Tích hợp REST API từ backend  
      - Đảm bảo trải nghiệm mượt mà và tối ưu hiệu năng hiển thị
    - education:
      Giữ nguyên tên trường, degree, major, GPA nếu có.
      Format mỗi trường như sau (xuống dòng sau tên trường, không gạch đầu dòng):
        **<Tên trường>**
        <Degree>
        <Major>
        <GPA> (nếu có)
        (*<Năm vào> – <Năm ra>*)
      Nếu có nhiều trường, cách nhau bằng **1 dòng trống**.
    - skills:
      Giữ nguyên cấu trúc nhóm nếu có (ví dụ: “Programming”, “Tools”, “Soft skills”).
      Không thêm kỹ năng mới hoặc mức độ không có trong input.
      Nếu có thể, giữ nguyên định dạng:  
      "Programming: Python (thành thạo), Java (cơ bản); Tools: Git, Docker."
    - awards/certificates:
      Mỗi giải thưởng hoặc chứng chỉ 1 dòng, format:  
      "**<Tên giải thưởng hoặc chứng chỉ>** (*<Năm>* nếu có)*."
      Nếu có nhiều giải, cách nhau **1 dòng trống**.
    - summary/objective:
      Viết 1–3 câu mô tả điểm mạnh và định hướng nghề nghiệp, không thêm thông tin mới.

    --- ĐỊNH DẠNG XUẤT RA (Markdown rules):
    Trong phần "suggested", sử dụng **Markdown format** để đảm bảo hiển thị đẹp khi render:
    - **In đậm (bold)** tên công ty, trường, dự án, hoặc vai trò.
    - *In nghiêng (italic)* cho khoảng thời gian.
    - Dùng dấu gạch đầu dòng (-) cho danh sách nhiệm vụ, kết quả, kỹ năng.
    - Giữa các mục (công ty, dự án, trường) phải có **1 dòng trống**.
    - Không thêm tiêu đề mới (ví dụ ### Experience), chỉ định dạng nội dung gốc.
    - Không dùng bullet nếu chỉ có 1 câu mô tả.
    --- OUTPUT (RẤT QUAN TRỌNG):
    - Chỉ trả về **một** JSON object duy nhất, KHÔNG có text nào khác.
    - JSON phải theo schema dưới đây và dùng đúng key name.
    SCHEMA:
    {{
      "language": "vi"|"en",
      "section": "{section}",
      "style_used": "{style}",
      "original": "<nội dung gốc>",
      "suggested": "<nội dung viết lại theo định dạng Markdown>"
    }}
    --- MẪU OUTPUT:
    {{
      "language": "vi",
      "section": "experience",
      "style_used": "professional",
      "original": "Làm giao diện react, fix bug",
      "suggested": "**Frontend Developer** tại **Công ty ABC** (*2023–2024*)  \n- Phát triển giao diện người dùng bằng React  \n- Khắc phục lỗi và cải thiện hiệu suất hiển thị"
    }}
"""

def generate_prompt(language: str, position: str, section: str, content: str, style: str) -> str:
    """
    Hàm này dùng để điền các giá trị đầu vào vào PROMPT_TEMPLATE.
    Đảm bảo nội dung được truyền vào an toàn, tránh lỗi định dạng.
    Trả về chuỗi prompt hoàn chỉnh để gửi cho AI.
    """
    safe_content = content.replace('"""', '\"\"\"')
    return PROMPT_TEMPLATE.format(
        language=language,
        position=position,
        section=section,
        content=safe_content,
        style=style
    )

def extract_first_json_object(text: str) -> str:
    """
    Hàm này dùng để tách ra JSON object đầu tiên (cân bằng dấu ngoặc) từ một chuỗi text.
    Duyệt từng ký tự để tìm đoạn JSON hợp lệ đầu tiên.
    Nếu không tìm thấy sẽ raise ValueError.
    """
    start = text.find('{')
    if start == -1:
        raise ValueError("No JSON object found")
    stack = []
    for i in range(start, len(text)):
        ch = text[i]
        if ch == '{':
            stack.append('{')
        elif ch == '}':
            if not stack:
                # unmatched closing
                continue
            stack.pop()
            if not stack:
                # matched root object
                return text[start:i+1]
    raise ValueError("No balanced JSON object found")

def parse_model_json(response_text: str) -> Dict[str, Any]:
    """
    Hàm này cố gắng parse một JSON object từ kết quả trả về của AI:
    1) Thử parse trực tiếp bằng json.loads.
    2) Nếu lỗi, dùng extract_first_json_object để lấy đoạn JSON đầu tiên rồi parse lại.
    3) Nếu vẫn lỗi, raise ValueError.
    """
    try:
        # Direct parse
        data = json.loads(response_text)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    # Try extract
    try:
        json_sub = extract_first_json_object(response_text)
        data = json.loads(json_sub)
        if isinstance(data, dict):
            return data
    except Exception as e:
        logger.debug("Failed to extract JSON via scanner: %s", e)

    raise ValueError("Unable to parse JSON from model response")



def call_openai_api(system_prompt: str, user_prompt: str, model: str = "gpt-4.1-nano", max_tokens: int = 1000, temperature: float = 0.7) -> str:
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    try:
        resp = send_openai_request_sync("chat/completions", json_body=body, method="POST")
        resp.raise_for_status()
        j = resp.json()
        try:
            return j["choices"][0]["message"]["content"]
        except Exception:
            return resp.text
    except requests.HTTPError as e:
        logger.exception("HTTP error calling OpenAI (sync): %s", e)
        raise
    except Exception as e:
        logger.exception("Unexpected error calling OpenAI (sync): %s", e)
        raise


async def suggest_cv_content(language: str, position: str, section: str, content: str, style: str, user_id: str) -> Dict[str, Any]:
    system_prompt = "Bạn là một trợ lý viết CV chuyên nghiệp, chính xác và không thêm thông tin không có trong đầu vào. Luôn trả về đúng một JSON object duy nhất theo schema đã cho, không thêm text nào khác."
    user_prompt = generate_prompt(language, position, section, content, style)
    response_text = None
    if OPENAI_KEY:
        try:
            logger.info("Calling OpenAI API")
            response_text = await asyncio.to_thread(call_openai_api, system_prompt, user_prompt, "gpt-4.1-nano")
        except Exception as e:
            logger.exception("OpenAI API call failed: %s", e)
            response_text = None

    try:
        ai_json = parse_model_json(response_text)
        required_keys = {"language", "section", "style_used", "original", "suggested"}
        if not required_keys.issubset(set(ai_json.keys())):
            logger.warning("AI response JSON missing required keys; filling fallback fields")
            ai_json.setdefault("original", content)
            ai_json.setdefault("suggested", "")
            ai_json.setdefault("language", language)
            ai_json.setdefault("section", section)
            ai_json.setdefault("style_used", style or "professional")
        try:
            suggestion_text = ai_json.get("suggested", "")
            await insert_ai_suggestion(section_name=section, original_content=content, suggested_content=suggestion_text, user_id=user_id, style_used=style)
        except Exception:
            logger.exception("Failed to persist ai_suggestion to DB")
        return ai_json
    except Exception as e:
        logger.exception("Failed to parse model JSON: %s", e)
        fallback_text = ""
        if response_text and isinstance(response_text, str):
            fallback_text = response_text.strip().replace("\n", " ")[:400]
        else:
            fallback_text = "Unable to generate suggestion at this time."
        ai_result = {
            "original": content,
            "suggested": fallback_text,
            "language": language,
            "section": section,
            "style_used": style or "professional",
        }
        try:
            await insert_ai_suggestion(section_name=section, original_content=content, suggested_content=fallback_text, user_id=user_id, style_used=style)
        except Exception:
            logger.exception("Failed to persist fallback ai_suggestion to DB")
        return ai_result

async def insert_ai_suggestion(section_name: str, original_content: str, suggested_content: str, user_id: str, style_used: str) -> str:
    """
    Insert a row into ai_suggestions and return the generated suggestion_id (UUID string).
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO ai_suggestions (section_name, original_content, suggested_content, user_id, style_used)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING suggestion_id
            """,
            section_name,
            original_content,
            suggested_content,
            user_id,
            style_used
        )
    return str(row["suggestion_id"]) if row and row["suggestion_id"] is not None else None

async def match_job(job_id: str, top_k: int = 10) -> List[Dict[str, Any]]:
    try:
        pool = await get_pool()
    except Exception as e:
        logging.getLogger("ai_service").exception("Failed to get DB pool: %s", e)
        raise DBError("Database pool unavailable")

    try:
        async with pool.acquire() as conn:
            job_row = await conn.fetchrow(
                "SELECT embedding_vector FROM embedding_jd WHERE job_id = $1",
                job_id,
            )
            if not job_row:
                raise JobNotFound("Job embedding not found")

            rows = await conn.fetch(
                """
                SELECT 
                    a.application_id,
                    1 - (c.embedding_vector <=> j.embedding_vector) AS score,
                    a.cv_id, a.applied_at
                FROM embedding_cv c
                JOIN applications a ON a.cv_id = c.cv_id   -- chỉ lấy CV đã nộp
                JOIN embedding_jd j ON j.job_id = $1       -- job đang xét
                WHERE a.job_id = $1                        -- chỉ những applications thuộc job này
                ORDER BY (c.embedding_vector <=> j.embedding_vector)
                LIMIT $2
                """,
                job_id,
                top_k,
            )
    except JobNotFound:
        raise
    except Exception as e:
        logging.getLogger("ai_service").exception("DB query failed: %s", e)
        raise DBError("Database query failed")

    raw_results = [
        {
            "application_id": str(r["application_id"]),
            "cv_id": str(r["cv_id"]),
            "score": float(r["score"]) if r["score"] else None,
            "applied_at": r["applied_at"].isoformat() if r["applied_at"] else None,
        }
        for r in rows
    ]

    enriched_results = await enrich_results_with_cv_and_user(raw_results)

    return enriched_results;


async def create_recommend_batch(job_id: str, user_id: str) -> str:
    """
    Create a recommend_batches row and return batch_id (UUID string).
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO recommend_batches (job_id, user_id)
            VALUES ($1, $2)
            RETURNING batch_id
            """,
            job_id,
            user_id,
        )
    return str(row["batch_id"]) if row and row["batch_id"] is not None else None


async def store_recommend_results(batch_id: str, results: List[Dict[str, Any]]) -> None:
    """
    Insert multiple rows into recommend_results for a given batch.
    `results` is a list of dicts with keys: cv_id (str) and score (float)
    """
    if not results:
        return
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            for r in results:
                # Use explicit NULL if score missing
                score = r.get("score")
                await conn.execute(
                    """
                    INSERT INTO recommend_results (batch_id, application_id, score)
                    VALUES ($1, $2, $3)
                    """,
                    batch_id,
                    r.get("application_id"),
                    score,
                )


async def match_and_store(job_id: str, user_id: str, top_k: int = 10) -> Dict[str, Any]:
    results = await match_job(job_id, top_k=top_k)
    now = datetime.utcnow()
    try:
        batch_id = await create_recommend_batch(job_id=job_id, user_id=user_id)
        if batch_id:
            await store_recommend_results(batch_id=batch_id, results=results)
    except Exception:
        logger.exception("Failed to persist recommend batch/results")
        batch_id = None

    return {"batch_id": batch_id, "job_id": job_id, "user_id": user_id, "created_at": now.isoformat() if now else None, "results": results}


async def enrich_results_with_cv_and_user(results: list[dict]) -> list[dict]:
    # Lấy tất cả cv_id duy nhất
    cv_ids = list({r["cv_id"] for r in results})

    # Gọi batch API 1 lần
    cv_data_map = await get_cv_details_batch(cv_ids)

    # Merge vào kết quả
    enriched = []
    for r in results:
        enriched.append({
            **r,
            "cv": cv_data_map.get(r["cv_id"]),  # Trả None nếu không có
        })

    return enriched



async def get_recommend_batches_for_user(
    user_id: str | None,
    job_id: str,
    limit: int = 10
) -> List[Dict[str, Any]]:

    pool = await get_pool()
    async with pool.acquire() as conn:
        # ADMIN: không lọc theo user_id
        if user_id is None:
            batch_rows = await conn.fetch(
                """
                SELECT batch_id, job_id, user_id, created_at
                FROM recommend_batches
                WHERE job_id = $1
                ORDER BY created_at DESC
                LIMIT $2
                """,
                job_id, limit
            )
          
        else:
            # EMPLOYER: chỉ lấy của mình
            batch_rows = await conn.fetch(
                """
                SELECT batch_id, job_id, user_id, created_at
                FROM recommend_batches
                WHERE user_id = $1 AND job_id = $2
                ORDER BY created_at DESC
                LIMIT $3
                """,
                user_id, job_id, limit
            )

        # Return only batch metadata (no results/enrichment) for listing.
        batches: List[Dict[str, Any]] = []
        for br in batch_rows:
            batches.append(
                {
                    "batch_id": str(br["batch_id"]),
                    "job_id": str(br["job_id"]),
                    "user_id": str(br["user_id"]),
                    "created_at": br["created_at"].isoformat() if br["created_at"] else None,
                }
            )

    return batches


async def get_recommend_batch_detail(batch_id: str) -> Dict[str, Any]:
    """
    Return a single recommend batch with enriched results (including CV data).
    Raises ValueError if batch not found.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        br = await conn.fetchrow(
            """
            SELECT batch_id, job_id, user_id, created_at
            FROM recommend_batches
            WHERE batch_id = $1
            """,
            batch_id,
        )
        if not br:
            raise ValueError("Batch not found")

        results = await conn.fetch(
            """
            SELECT rr.application_id, rr.score, rr.created_at, a.cv_id, a.applied_at
            FROM recommend_results rr
            JOIN applications a ON rr.application_id = a.application_id
            WHERE rr.batch_id = $1
            ORDER BY rr.score DESC
            """,
            batch_id,
        )

        raw_results = [
            {
                "application_id": str(r["application_id"]),
                "cv_id": str(r["cv_id"]),
                "score": float(r["score"]) if r["score"] else None,
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                "applied_at": r["applied_at"].isoformat() if r["applied_at"] else None,
            }
            for r in results
        ]

        enriched_results = await enrich_results_with_cv_and_user(raw_results)

        return {
            "batch_id": str(br["batch_id"]),
            "job_id": str(br["job_id"]),
            "user_id": str(br["user_id"]),
            "created_at": br["created_at"].isoformat() if br["created_at"] else None,
            "results": enriched_results,
        }

