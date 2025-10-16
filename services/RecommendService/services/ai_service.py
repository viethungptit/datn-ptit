import os
import json
import requests
import logging
import re
from typing import List, Dict, Any
from utils.lang_utils import detect_language

logger = logging.getLogger("ai_service")

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
- styles: {styles}       

--- NGUYÊN TẮC CHUNG (bắt buộc):
1) KHÔNG BAO GIỜ BỔ SUNG THÔNG TIN HOẶC SỐ LIỆU KHÔNG CÓ TRONG `content`. Nếu không có con số/chi tiết, viết chung chung, trung tính.
2) Giữ nguyên tên riêng, công ty, dates nếu đã xuất hiện trong `content`.
3) Nếu language == "auto", hãy detect ngôn ngữ chính từ `content`. Nếu không rõ, mặc định "en".
4) Nếu language == "vi" hoặc "en", TRẢ LỜI HOÀN TOÀN bằng ngôn ngữ đó (không lẫn).
5) Bắt đầu câu bằng động từ hành động (action verb): ví dụ "Phát triển", "Thiết kế", "Triển khai", "Led", "Implemented".
6) Dùng active voice; tone tùy theo `styles`.
7) Nếu `styles` có "professional" => ưu tiên văn phong chuyên nghiệp, lịch sự, dùng từ ngữ trang trọng, tránh từ lóng, thể hiện sự chuyên môn và trách nhiệm.
8) Nếu `styles` có "concise" => ưu tiên ngắn gọn, súc tích, loại bỏ chi tiết thừa, tập trung vào ý chính.
9) Nếu `styles` có "impact" => nhấn mạnh thành tích, kết quả đạt được, sử dụng từ ngữ mạnh mẽ, highlight achievements (chỉ dùng số liệu nếu có trong content), ưu tiên các động từ thể hiện kết quả như "đạt được", "tăng trưởng", "giúp tăng", "improved", "achieved", "boosted".

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

- awards:
  Nêu ra các giải thưởng với 1 câu mỗi award, giữ nguyên tên giải thưởng và năm nếu có.

- summary/objective:
  Giới thiệu bản thân mình với 1–3 câu, nêu điểm mạnh và định hướng phù hợp với vị trí, không thêm dữ liệu mới.


--- OUTPUT (RẤT QUAN TRỌNG):
- Chỉ trả về **một** JSON object duy nhất KHÔNG có text nào khác.
- JSON phải tuân schema dưới đây và dùng đúng key name (suggestion, language, section, style_used, recommend_replace, edits, length_hint).

SCHEMA (EXACT):
{{
"suggestion": "<string>",
"language": "vi" | "en",
"section": "{section}",
"style_used": {styles},
"recommend_replace": true|false,
"edits": [
    {{ "original": "<...>", "suggested": "<...>" }}
],
"length_hint": "short" | "medium" | "long"
}}

--- QUY TẮC CHI TIẾT CHO 'edits':
- Nếu suggestion thay thế toàn bộ content -> edits = [{{ "original": full content, "suggested": suggestion }}]
- Nếu chỉ chỉnh 1–3 chỗ -> liệt kê tối đa 3 edits (original substring và suggested replacement)
- Nếu content rỗng -> suggestion tạo 1 đoạn trung tính dựa trên position và styles, edits = [{{ "original": "", "suggested": suggestion }}]

--- TRƯỜNG HỢP ĐẶC BIỆT:
- Nếu content chứa nhiều ngôn ngữ, nếu input.language != "auto" ưu tiên dùng input.language.
- KHÔNG thêm markdown, tag hay chú thích trong suggestion. Trả plain text.

--- MẪU OUTPUT (example):
{{
"suggestion": "Phát triển giao diện người dùng bằng React, tối ưu hiệu năng component, phối hợp với backend để tích hợp REST API.",
"language": "vi",
"section": "experience",
"style_used": "professional",
"recommend_replace": true,
"edits": [
    {{ "original": "Làm giao diện react, fix bug", "suggested": "Phát triển giao diện người dùng bằng React, tối ưu hiệu năng component..." }}
],
"length_hint": "short"
}}
"""

def generate_prompt(language: str, position: str, section: str, content: str, styles: List[str]) -> str:
    """
    Hàm này dùng để điền các giá trị đầu vào vào PROMPT_TEMPLATE.
    Đảm bảo nội dung được truyền vào an toàn, tránh lỗi định dạng.
    Trả về chuỗi prompt hoàn chỉnh để gửi cho AI.
    """
    # styles là giá trị đơn, truyền trực tiếp
    styles_repr = json.dumps([styles], ensure_ascii=False) if styles else json.dumps(["professional"], ensure_ascii=False)
    # Escape triple quotes in content if any
    safe_content = content.replace('"""', '\"\"\"')
    return PROMPT_TEMPLATE.format(
        language=language,
        position=position,
        section=section,
        content=safe_content,
        styles=styles_repr
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
    """
    Hàm này gọi API của OpenAI Chat Completion để sinh ra kết quả dựa trên prompt.
    Truyền riêng system prompt và user prompt.
    Trả về kết quả text từ response của OpenAI.
    """
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

def simulated_response(language: str, position: str, section: str, content: str, styles: List[str]) -> Dict[str, Any]:
    """
    Hàm này trả về kết quả giả lập (simulated) dạng JSON để phát triển frontend khi không có API key.
    Tạo suggestion đơn giản, thêm động từ hành động, xây dựng edits list.
    """
    # Detect language fallback
    lang = language if language in ("en", "vi") else detect_language(content)
    # Very simple simulated rewrite
    if not content.strip():
        if lang == "vi":
            suggestion = f"{position} có khả năng thực hiện các nhiệm vụ liên quan tới {position.lower()} với hiệu quả và tinh thần học hỏi."
        else:
            suggestion = f"{position} with proven ability to perform related tasks effectively and a strong willingness to learn."
    else:
        # naive "improvement"
        if lang == "vi":
            suggestion = content.strip()
            # add action verb if missing (simple heuristic)
            if not any(content.strip().lower().startswith(v) for v in ["phát triển", "thiết kế", "triển khai", "quản lý", "xây dựng"]):
                suggestion = "Phát triển " + suggestion
        else:
            suggestion = content.strip()
            if not any(content.strip().lower().startswith(v) for v in ["develop", "design", "implement", "manage", "build"]):
                suggestion = "Develop " + suggestion

    # Build edits: try to find a short sentence to show edit
    edits = []
    first_line = content.strip().splitlines()[0] if content.strip() else ""
    if first_line:
        edits.append({
            "original": first_line,
            "suggested": (suggestion if len(first_line) < len(suggestion) else suggestion),
            "reason": "Polish wording and start with action verb."
        })
    else:
        edits.append({"original": "", "suggested": suggestion, "reason": "Generate starter text for this section."})

    ai_result = {
        "suggestion": suggestion,
        "language": lang,
        "section": section,
        "style_used": [styles] if styles else ["professional"],
        "recommend_replace": True if len(suggestion) > 0 else False,
        "edits": edits[:3],
        "length_hint": "short"
    }
    return ai_result

def suggest_cv_content(language: str, position: str, section: str, content: str, styles: List[str]) -> Dict[str, Any]:
    """
    Hàm tổng hợp, được gọi từ main.py:
    - Tạo prompt từ đầu vào
    - Gọi OpenAI với system prompt và user prompt tách biệt
    - Parse kết quả trả về thành dict theo schema; fallback nếu lỗi
    Trả về kết quả gợi ý cho nội dung CV.
    """
    system_prompt = "Bạn là một trợ lý viết CV chuyên nghiệp, chính xác và không thêm thông tin không có trong đầu vào. Luôn trả về đúng một JSON object duy nhất theo schema đã cho, không thêm text nào khác."
    user_prompt = generate_prompt(language, position, section, content, styles)
    response_text = None
    if OPENAI_KEY:
        try:
            logger.info("Calling OpenAI API")
            response_text = call_openai_api(system_prompt, user_prompt, model="gpt-4.1-nano")
        except Exception as e:
            logger.exception("OpenAI API call failed: %s", e)
            response_text = None

    if response_text is None:
        logger.info("Using simulated fallback response")
        return simulated_response(language, position, section, content, styles)

    try:
        ai_json = parse_model_json(response_text)
        required_keys = {"suggestion", "language", "section", "style_used", "recommend_replace", "edits", "length_hint"}
        if not required_keys.issubset(set(ai_json.keys())):
            logger.warning("AI response JSON missing required keys; filling fallback fields")
            ai_json.setdefault("suggestion", "")
            ai_json.setdefault("language", language)
            ai_json.setdefault("section", section)
            ai_json.setdefault("style_used", [styles] if styles else ["professional"])
            ai_json.setdefault("recommend_replace", False)
            ai_json.setdefault("edits", [{"original": content, "suggested": ai_json.get("suggestion", "")}])
            ai_json.setdefault("length_hint", "short")
        return ai_json
    except Exception as e:
        logger.exception("Failed to parse model JSON: %s", e)
        fallback_text = ""
        if response_text and isinstance(response_text, str):
            fallback_text = response_text.strip().replace("\n", " ")[:400]
        else:
            fallback_text = "Unable to generate suggestion at this time."
        ai_result = {
            "suggestion": fallback_text,
            "language": language,
            "section": section,
            "style_used": styles[:1] if styles else ["professional"],
            "recommend_replace": False,
            "edits": [{"original": content, "suggested": fallback_text}],
            "length_hint": "short"
        }
        return ai_result
