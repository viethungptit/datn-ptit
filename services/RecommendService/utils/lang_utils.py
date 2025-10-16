
from langdetect import detect, DetectorFactory
import logging

DetectorFactory.seed = 0  # deterministic

logger = logging.getLogger("lang_utils")

def detect_language(text: str) -> str:
    """
    Detect language code: returns 'vi' for Vietnamese or 'en' for English.
    Falls back to 'en' on error.
    """
    try:
        if not text or not text.strip():
            return "en"
        lang = detect(text)
        # langdetect returns codes like 'vi', 'en', etc.
        if lang.startswith("vi"):
            return "vi"
        if lang.startswith("en"):
            return "en"
        # default fallback
        return "en"
    except Exception as e:
        logger.exception("Language detection failed: %s", e)
        return "en"
