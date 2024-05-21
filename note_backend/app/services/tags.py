from typing import List

from sqlalchemy import update
from sqlalchemy.orm import Session

from ..database.models.tag import Tag
from ..database.schemas.tags import TagCreate
from ..database import setup

TABLENAME = setup.Base.metadata.tables['tags']


def get_tags(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tag).offset(skip).limit(limit).all()


def create_user_tag(db: Session, item: TagCreate, user_id: int):
    db_tag = Tag(**item.dict(), owner_id=user_id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def update_user_tag(db: Session, item: TagCreate):
    tag = db.query(Tag).get(item.id)
    for key, value in item:
        setattr(tag, key, value)
    db.commit()
    return item


def delete_user_tag(db: Session, tag_id: str):
    tag = db.query(Tag).get(tag_id)
    db.delete(tag)
    db.commit()
