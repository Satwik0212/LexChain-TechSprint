from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    id_token: str

class UserResponse(BaseModel):
    uid: str
    uid: str
    email: Optional[str] = None
    provider: Optional[str] = "unknown"
    message: Optional[str] = None
