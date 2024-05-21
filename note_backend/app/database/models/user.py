import os
import sys

from sqlalchemy import Column, Integer, String, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship

from ..setup import Base


def get_default_image():
    script_dir = os.path.dirname(sys.argv[0])
    with open(f'/code/app/database/models/default.png', "rb") as image:
        f = image.read()
        b = bytearray(f)
        return b


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)

    login = Column(String, unique=True, index=True)
    password = Column(String)
    email = Column(String, unique=True, index=True, nullable=True)
    photo = Column(LargeBinary, nullable=True, default=get_default_image)

    notes = relationship("Note")
    tags = relationship("Tag")
