from pydantic import BaseModel

from .notes import ExportNote


class UserBase(BaseModel):
    login: str


class UserCreate(UserBase):
    password: str
    email: str | None = None


class AuthenticatedUser(UserBase):
    id: int
    access_token: str


class User(AuthenticatedUser):
    notes: list[ExportNote] = []

    class ConfigDict:
        from_attributes = True


class UserInternal(UserBase):
    email: str | None = None


class UserUpdated(UserInternal):
    password: str | None = None
