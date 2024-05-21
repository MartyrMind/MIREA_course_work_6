import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from ..database.schemas.users import User, UserInternal, UserUpdated
from ..database.schemas.notes import Note, ExportNote
from ..dependencies import get_db
from ..services import users as user_service
from ..services import notes as note_service
from ..services.users import get_current_user, get_user, update_user, update_user_photo, get_encoded_user_photo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("", response_model=UserInternal)
def handle_get_internal_user(current_user: Annotated[User, Depends(get_current_user)],
                             db: Session = Depends(get_db)):
    return get_user(db, current_user.id)


@router.put("")
def handle_update_user(updated_user: UserUpdated,
                       current_user: Annotated[User, Depends(get_current_user)],
                       db: Session = Depends(get_db)):
    return update_user(db, current_user.id, updated_user)


@router.put("/image")
def handle_update_user_photo(current_user: Annotated[User, Depends(get_current_user)],
                             db: Session = Depends(get_db),
                             file: UploadFile = File(...)):
    update_user_photo(db, file, current_user.id)
    return 'OK'


@router.get("/image")
def handle_get_user_photo(current_user: Annotated[User, Depends(get_current_user)],
                          db: Session = Depends(get_db)):
    return get_encoded_user_photo(db, current_user.id)
