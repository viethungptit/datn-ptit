from pydantic import BaseModel
from typing import List, Optional

class CVRequest(BaseModel):
    language: Optional[str] = "auto"
    position: str
    section: str
    content: str
    styles: str = "professional"
