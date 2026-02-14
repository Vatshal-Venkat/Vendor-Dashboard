from pydantic import BaseModel
from typing import Optional


class SupplierCreate(BaseModel):
    name: str
    country: Optional[str] = None
    industry: Optional[str] = None


class SupplierResponse(BaseModel):
    id: int
    name: str
    country: Optional[str]
    industry: Optional[str]

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    password: str
    role: Optional[str] = "VIEWER"



class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True
