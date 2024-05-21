from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from ..setup import Base
from ...utils import generate_uuid


class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, name="id", primary_key=True, default=generate_uuid)

    label = Column(String)

    owner_id = Column(Integer, ForeignKey("users.id"))
