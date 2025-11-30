import logging
from utils.openai_proxy_client import send_openai_request_async

logger = logging.getLogger("embedding")


async def summarize_text(text: str, max_tokens: int = 500) -> str:
    """
    Dùng GPT-4.1-nano để tóm tắt nội dung CV hoặc JD.
    Mục tiêu: giữ lại kỹ năng, vị trí, và kinh nghiệm chính.
    """
    prompt = (
        "Bạn là một trợ lý AI chuyên xử lý hồ sơ tuyển dụng.\n"
        "Nhiệm vụ của bạn:\n"
        "1. Tóm tắt nội dung bên dưới, chỉ giữ lại các thông tin liên quan đến:\n"
        "- Kỹ năng (skills)\n"
        "- Vị trí công việc (position)\n"
        "- Kinh nghiệm làm việc hoặc dự án thực tế (experience, projects)\n"
        "2. Loại bỏ thông tin cá nhân, học vấn, chứng chỉ hoặc mô tả không liên quan đến năng lực.\n"
        "3. Dịch phần tóm tắt này sang tiếng Anh, ngắn gọn, rõ ràng, tự nhiên.\n\n"
        f"---\n{text}\n---\n"
        "Chỉ trả về kết quả cuối cùng bằng tiếng Anh, không giải thích gì thêm."
    )

    body = {
        "model": "gpt-4.1-nano",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }

    try:
        resp = await send_openai_request_async("chat/completions", json_body=body, method="POST")
        resp.raise_for_status()
        j = resp.json()
        try:
            summary = j["choices"][0]["message"]["content"].strip()
        except Exception:
            summary = resp.text
        logger.info("Call OpenAI summarize_text API successful")
        return summary
    except httpx.HTTPStatusError as e:
        logger.exception("OpenAI API error during summarize_text: %s", e)
        return text[:500]
    except Exception as e:
        logger.exception("Unexpected error during summarize_text: %s", e)
        return text[:500]


async def create_embedding(text: str):
    """
    Tạo embedding cho đoạn text bằng model text-embedding-3-small.
    Trả về vector dạng list[float].
    """
    body = {"model": "text-embedding-3-small", "input": text}
    try:
        resp = await send_openai_request_async("embeddings", json_body=body, method="POST")
        resp.raise_for_status()
        j = resp.json()
        emb = j["data"][0]["embedding"]
        logger.info("Call OpenAI create_embedding API successful")
        return emb
    except Exception as e:
        logger.exception("OpenAI API error during create_embedding: %s", e)
        raise
