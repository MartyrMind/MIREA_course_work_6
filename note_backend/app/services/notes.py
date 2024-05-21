from markdown_pdf import MarkdownPdf, Section
from sqlalchemy import update
from sqlalchemy.orm import Session

from ..database.models.note import Note
from ..database.models.tag import Tag
from ..database.schemas.notes import ExportNote
from ..database import setup

TABLENAME = setup.Base.metadata.tables['notes']


def get_notes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Note).offset(skip).limit(limit).all()


def create_user_note(db: Session, item: ExportNote, user_id: int):
    tag_ids = db.query(Tag).filter(Tag.id.in_(item.tags)).all()
    del item.tags

    db_note = Note(**item.dict(), owner_id=user_id, tags=tag_ids)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_user_note(db: Session, item: ExportNote):
    note = db.query(Note).get(item.id)
    tag_ids = db.query(Tag).filter(Tag.id.in_(item.tags)).all()
    old_tags = item.tags
    item.tags = tag_ids

    for key, value in item:
        if value:
            setattr(note, key, value)
    db.commit()
    item.tags = old_tags
    return item


def delete_user_note(db: Session, id: str):
    note = db.query(Note).get(id)
    db.delete(note)
    db.commit()


def convert_markdown(db: Session, id: str, username: str):
    # todo: помним, что при такой реализации не очищается
    note = db.query(Note).get(id)
    pdf = MarkdownPdf()
    pdf.add_section(Section(note.markdown))
    pdf.meta["title"] = note.title
    pdf.meta["author"] = username
    file = pdf.save(f"{note.title}.pdf")
    return f"{note.title}.pdf"
