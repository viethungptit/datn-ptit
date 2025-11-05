import os
import json
import requests
import logging
import re
from typing import List, Dict, Any
import asyncio
from db import get_pool

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
    - content: "{content}"  # raw text from user (may be short)
    - style: "{style}"  # one of: professional | concise | impact      

    --- NGUYÊN TẮC CHUNG (bắt buộc):
    1) KHÔNG BAO GIỜ BỔ SUNG THÔNG TIN HOẶC SỐ LIỆU KHÔNG CÓ TRONG `content`. Nếu không có con số/chi tiết, viết chung chung, trung tính.
    2) Giữ nguyên tên riêng, công ty, dates nếu đã xuất hiện trong `content`.
    3) Nếu language == "auto", hãy detect ngôn ngữ chính từ `content`. Nếu không rõ, mặc định "en".
    4) Nếu language == "vi" hoặc "en", TRẢ LỜI HOÀN TOÀN bằng ngôn ngữ đó (không lẫn).
    5) Bắt đầu câu bằng động từ hành động (action verb): ví dụ "Phát triển", "Thiết kế", "Triển khai", "Led", "Implemented".
    6) Dùng active voice; tone tùy theo `style`.
    7) Nếu `style` có "professional" => ưu tiên văn phong chuyên nghiệp, lịch sự, dùng từ ngữ trang trọng, tránh từ lóng, thể hiện sự chuyên môn và trách nhiệm.
    8) Nếu `style` có "concise" => ưu tiên ngắn gọn, súc tích, loại bỏ chi tiết thừa, tập trung vào ý chính.
    9) Nếu `style` có "impact" => nhấn mạnh thành tích, kết quả đạt được, sử dụng từ ngữ mạnh mẽ, highlight achievements (chỉ dùng số liệu nếu có trong content), ưu tiên các động từ thể hiện kết quả như "đạt được", "tăng trưởng", "giúp tăng", "improved", "achieved", "boosted".

    --- QUY ƯỚC THEO SECTION (linh hoạt hơn):

    - experience:
    Người dùng có thể nhập nhiều hơn 1 công ty nên không được rút gọn hay bỏ sót công ty nào. Nếu hết 1 công ty thì xuống dòng, không gộp chung.
    Khi viết lại, **phải giữ nguyên và hiển thị rõ chức vụ (vị trí làm việc)** trong câu đầu tiên của mỗi công ty, theo định dạng:
    "<Vị trí> tại <Tên công ty> (<Thời gian làm việc>)".
    Phần mô tả công việc được triển khai lại rõ ràng theo nội dung người dùng nhập.
    Ưu tiên giữ thứ tự logic: Vị trí làm việc (bắt buộc) → Nhiệm vụ chính → Kết quả hoặc thành tựu (nếu có).
    Ví dụ:
        Input: "Công ty ABC (2022–2024), vị trí Backend Developer. Viết API, quản lý database, tối ưu hiệu năng."
        → Output: "Backend Developer tại Công ty ABC (2022–2024). 
        Thiết kế và phát triển REST API, quản lý cơ sở dữ liệu MySQL, tối ưu hiệu năng truy vấn để cải thiện tốc độ phản hồi của hệ thống."

    - projects:
    Người dùng có thể nhập nhiều hơn 1 project nên không được rút gọn hay bỏ sót. Nếu hết 1 project thì xuống dòng, không gộp chung.
    Format chuẩn gồm 1 dòng tiêu đề có dạng:
    <Tên dự án> – <Số người trong nhóm (nếu có)> – <Vị trí làm việc>.
    Sau đó là phần mô tả project linh hoạt 1–4 câu tùy độ dài input, tập trung mô tả công nghệ, vai trò, mục tiêu và kết quả.
    Ví dụ:
        Input: "Hệ thống quản lý kho, nhóm 5 người, tôi làm frontend bằng React, kết nối API, thiết kế giao diện."
        → Output: "Dự án: Hệ thống quản lý kho – Nhóm 5 người – Vị trí Frontend Developer. 
        Phát triển giao diện người dùng bằng React, tích hợp REST API từ backend, đảm bảo trải nghiệm mượt mà cho người dùng và tối ưu hiệu năng hiển thị."

    - education:
    Giữ nguyên tên trường, degree và major với format xếp dọc từ trên xuống dưới với
    <Tên trường> (Năm vào trường - Năm ra trường) - <Degree> - <Major> - <GPA> (nếu có). 
    Không thêm thông tin ngoài nội dung người dùng cung cấp. Loại bỏ các từ thừa, chỉ giữ lại phần quan trọng theo format trên.

    - skills:
    Linh hoạt theo cách người dùng nhập. 
    Nếu người dùng chia theo nhóm (ví dụ: “Programming”, “Tools”, “Soft skills”) thì giữ nguyên cấu trúc nhóm.
    Có thể thêm từ mô tả mức độ nếu người dùng nhập (“thành thạo”, “cơ bản”, “quen thuộc”), nhưng không tự suy diễn.
    Ví dụ:
        Input: "Programming: Python (thành thạo), Java (cơ bản); Tools: Git, Docker"
        → Output: "Programming: Python (thành thạo), Java (cơ bản); Tools: Git, Docker."

    - awards/certificates:
    Nêu ra các giải thưởng với 1 câu mỗi award, giữ nguyên tên giải thưởng và năm nếu có.

    - summary/objective:
    Giới thiệu bản thân mình với 1–3 câu, nêu điểm mạnh và định hướng phù hợp với vị trí, không thêm dữ liệu mới.


    --- OUTPUT (RẤT QUAN TRỌNG):
    - Chỉ trả về **một** JSON object duy nhất KHÔNG có text nào khác.
    - JSON phải tuân schema dưới đây và dùng đúng key name (suggestion, language, section, style_used, edits, length_hint).

    SCHEMA:
    {{
    "language": "vi"|"en",
    "section": "{section}",
    "style_used": "{style}",
    "original": "<nội dung gốc>",
    "suggested": "<nội dung viết lại>"
    }}

    --- MẪU OUTPUT (example):
    {{
    "language": "vi",
    "section": "experience",
    "style_used": "professional",
    "original": "Làm giao diện react, fix bug",
    "suggested": "Phát triển giao diện người dùng bằng React, tối ưu hiệu năng component..."
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
    if not OPENAI_KEY:
        raise RuntimeError("OPENAI_API_KEY not configured")
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    resp = requests.post(OPENAI_CHAT_URL, headers=headers, json=body, timeout=30)
    resp.raise_for_status()
    j = resp.json()
    try:
        return j["choices"][0]["message"]["content"]
    except Exception:
        return resp.text


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

async def match_job(job_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
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
                SELECT c.cv_id, 1 - (c.embedding_vector <=> j.embedding_vector) AS similarity
                FROM embedding_cv c, embedding_jd j
                WHERE j.job_id = $1
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

    return [{"cv_id": str(r["cv_id"]), "similarity": float(r["similarity"])} for r in rows]


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


async def store_recommend_results(batch_id: str, job_id: str, results: List[Dict[str, Any]]) -> None:
    """
    Insert multiple rows into recommend_results for a given batch.
    `results` is a list of dicts with keys: cv_id (str) and similarity (float)
    """
    if not results:
        return
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            for r in results:
                # Use explicit NULL if similarity missing
                score = r.get("similarity")
                await conn.execute(
                    """
                    INSERT INTO recommend_results (batch_id, job_id, cv_id, score)
                    VALUES ($1, $2, $3, $4)
                    """,
                    batch_id,
                    job_id,
                    r.get("cv_id"),
                    score,
                )


async def match_and_store(job_id: str, user_id: str, top_k: int = 5) -> Dict[str, Any]:
    results = await match_job(job_id, top_k=top_k)
    try:
        batch_id = await create_recommend_batch(job_id=job_id, user_id=user_id)
        if batch_id:
            await store_recommend_results(batch_id=batch_id, job_id=job_id, results=results)
    except Exception:
        logger.exception("Failed to persist recommend batch/results")
        batch_id = None

    return {"batch_id": batch_id, "results": results}


