import base64
import logging
from typing import Annotated

from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from fastapi import Depends, FastAPI, HTTPException, status, UploadFile
from ..database.models.user import User
from ..database.schemas.users import UserCreate, UserUpdated
from ..dependencies import get_db
from ..security.schemas import TokenData
from ..security.services import get_password_hash, verify_password
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
SECRET_KEY = "f7dad9d509d60c905ecbbafc0ac185f59f4cb7c568fac371ac0bc90d54516f89"
ALGORITHM = "HS256"
logger = logging.getLogger(__name__)


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_login(db: Session, login: str):
    return db.query(User).filter(User.login == login).first()


def create_user(db: Session, user: UserCreate):
    user.password = get_password_hash(user.password)
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, info: UserUpdated):
    user = db.query(User).get(user_id)
    if info.password:
        user.password = get_password_hash(info.password)
    if info.email:
        user.email = info.email
    db.commit()
    return user


def update_user_photo(db: Session, file: UploadFile, user_id: int):
    user = db.query(User).get(user_id)
    try:
        content = file.file.read()
        user.photo = content
        db.commit()
    except Exception as e:
        logger.warning(e)
    finally:
        return user


def get_encoded_user_photo(db: Session, user_id: int):
    user = db.query(User).get(user_id)
    photo = user.photo or b''
    encoded_image = base64.b64encode(user.photo)
    return encoded_image


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_login(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)],
                     db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user_by_login(db, login=token_data.username)
    if user is None:
        raise credentials_exception
    return user
