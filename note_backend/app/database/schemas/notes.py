from datetime import datetime

from pydantic import BaseModel
from pydantic.v1 import validator

from app.database.schemas.tags import Tag


class NoteBase(BaseModel):
    title: str | None = None
    markdown: str | None = None
    tags: list[Tag | str] | None = []

    class ConfigDict:
        from_attributes = True


class ExportNote(NoteBase):
    id: str | None = None
    views: int = 0
    is_favourite: bool = False
    last_visited: datetime = datetime.now()


class Note(ExportNote):
    owner_id: int
