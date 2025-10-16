from pydantic import BaseModel
from typing import List

class CurrentUser(BaseModel):
    user_id: str
    roles: List[str]
