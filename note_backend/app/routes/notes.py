from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from ..database.schemas.notes import ExportNote
from ..database.schemas.users import User
from ..dependencies import get_db
from ..services.users import get_current_user
from ..services.notes import create_user_note, delete_user_note, update_user_note, convert_markdown

router = APIRouter(
    prefix="/notes",
    tags=["notes"],
)


@router.get("", response_model=List[ExportNote])
def get_notes_for_user(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user.notes


@router.post("", response_model=ExportNote)
def handle_create_user_note(new_note: ExportNote,
                            current_user: Annotated[User, Depends(get_current_user)],
                            db: Session = Depends(get_db)):
    user_id = current_user.id
    return create_user_note(db, new_note, user_id)


@router.delete("")
def handle_delete_user_note(note_id: str,
                            current_user: Annotated[User, Depends(get_current_user)],
                            db: Session = Depends(get_db)):
    delete_user_note(db, note_id)
    return 'OK'


@router.put("", response_model=ExportNote)
def handle_update_user_note(note: ExportNote,
                            current_user: Annotated[User, Depends(get_current_user)],
                            db: Session = Depends(get_db)):
    return update_user_note(db, note)


@router.get("/{note_id}/pdf")
def handle_convert_markdown(note_id: str,
                            current_user: Annotated[User, Depends(get_current_user)],
                            db: Session = Depends(get_db)):
    return FileResponse(convert_markdown(db, note_id, current_user.login))
