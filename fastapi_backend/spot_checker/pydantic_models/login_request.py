from pydantic import BaseModel


class LoginRequest(BaseModel):
    eid: str
    passwordHash: str
