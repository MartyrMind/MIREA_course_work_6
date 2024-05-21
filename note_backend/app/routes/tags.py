from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.schemas.users import User
from ..database.schemas.tags import TagCreate
from ..dependencies import get_db
from ..services.tags import create_user_tag, delete_user_tag, update_user_tag
from ..services.users import get_current_user

router = APIRouter(
    prefix="/tags",
    tags=["tags"],
)


@router.get("", response_model=List[TagCreate])
def get_tags(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user.tags


@router.post("", response_model=List[TagCreate])
def handle_create_user_tag(new_tag: TagCreate,
                           current_user: Annotated[User, Depends(get_current_user)],
                           db: Session = Depends(get_db)):
    user_id = current_user.id
    return [create_user_tag(db, new_tag, user_id)]


@router.delete("")
def handle_delete_user_tag(tag_id: str,
                           current_user: Annotated[User, Depends(get_current_user)],
                           db: Session = Depends(get_db)):
    try:
        delete_user_tag(db, tag_id)
    except Exception as e:
        return 'ERROR'
    return 'OK'


@router.put("", response_model=TagCreate)
def handle_update_user_tag(note: TagCreate,
                            current_user: Annotated[User, Depends(get_current_user)],
                            db: Session = Depends(get_db)):
    return update_user_tag(db, note)
