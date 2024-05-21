from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .database.schemas.users import UserCreate, AuthenticatedUser
from .dependencies import get_db
from .metrics.custom import cpu_percent, cpu_freq_current, ram_used_curr, ram_total
from .routes import users, notes, tags
from .security.schemas import Token
from .security.services import create_access_token
from .services import users as user_service
from .services.users import authenticate_user
from prometheus_fastapi_instrumentator import Instrumentator, metrics
from .database import setup
from .database.schemas.users import User

app = FastAPI()
app.include_router(users.router)
app.include_router(notes.router)
app.include_router(tags.router)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
setup.Base.metadata.create_all(bind=setup.engine)

instrumentator = Instrumentator()
instrumentator.add(metrics.requests())
instrumentator.add(metrics.latency(buckets=(.005, .01, .025, .05, .075, .1, .25, .5, .75, 1.0, 2.5)))
instrumentator.add(metrics.response_size())
# instrumentator.add(total_users())
instrumentator.add(cpu_percent())
instrumentator.add(cpu_freq_current())
instrumentator.add(ram_used_curr())
instrumentator.add(ram_total())

instrumentator.instrument(app).expose(app)


@app.get("/")
def healthcheck():
    return {"message": "Ready to serve"}


@app.post("/login")
def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                           db: Session = Depends(get_db)
                           ) -> Token:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.login})
    return Token(access_token=access_token, token_type="bearer")


@app.post("/register", response_model=AuthenticatedUser)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_login(db, login=user.login)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = user_service.create_user(db=db, user=user)
    user.access_token = create_access_token(data={"sub": user.login})
    return user
