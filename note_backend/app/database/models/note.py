import datetime
from typing import List

from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, DateTime
from sqlalchemy.orm import relationship, Mapped

from .tag import Tag
from ..setup import Base
from ...utils import generate_uuid

notes_to_tags = Table(
    "notes_to_tags",
    Base.metadata,
    Column("notes", ForeignKey("notes.id")),
    Column("tags", ForeignKey("tags.id")),
)


class Note(Base):
    __tablename__ = "notes"

    id = Column(String, name="id", primary_key=True, default=generate_uuid)
    owner_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String)
    markdown = Column(String)

    tags: Mapped[List[Tag]] = relationship(secondary=notes_to_tags)

    views = Column(Integer, default=0)
    is_favourite = Column(Boolean, default=False)
    last_visited = Column(DateTime, default=datetime.datetime.now())

