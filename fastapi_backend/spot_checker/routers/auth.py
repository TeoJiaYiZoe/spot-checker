import json
import os
from jose import jwt, JWTError
from datetime import timedelta, datetime, timezone
from typing import Optional


from fastapi.responses import JSONResponse
from fastapi import (
    HTTPException,
    status,
    Response,
    Cookie,
    APIRouter
)
from pydantic_models.login_request import LoginRequest

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = "secret"  # Replace it with your SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


USER_DATA_FILE = os.path.join("fixtures", "employees.json")
PERSONALIZED_LIST_FILE = os.path.join("fixtures", "personalized_eatery_list.json")
EATERY_OBSERVATIONS_FILE = os.path.join("fixtures", "eatery_observations.json")
IMAGES_FOLDER = os.path.join(os.getcwd(), "images")


def authenticate_user(eid: str, password: str):
    try:
        # Load user data from the JSON file
        with open(USER_DATA_FILE, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User data file error",
        )

    # Check for 'employees' key in the JSON data
    if "employees" not in data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid user data structure",
        )

    employees = data["employees"]
    user = next((emp for emp in employees if emp["eid"] ==eid), None)
    if not user:
        return False

    if user["password_hash"] == password:
        return user
    return False  


def create_access_token(data: dict, expires_delta:timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(access_token: Optional[str] = Cookie(None)):
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

   
async def get_current_user(token: str): 
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        eid: str = payload.get('sub')
        name: int = payload.get('name')

        if eid is None or name is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Could not validate user.')
        return {"eid": eid, "name": name}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user.')

@router.post("/login", status_code=status.HTTP_200_OK)
def authenticate_login(request: LoginRequest, response: Response):
    user = authenticate_user(request.eid,request.passwordHash)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect eid or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate an access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["eid"], "name": user["name"]},
        expires_delta=access_token_expires,
    )

    # Set the access token as an HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="strict",  # In production, use 'strict'
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    print(access_token)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "eid": user["eid"],
        "name": user["name"],
    }

@router.get("/api/access-token")
async def access_token(access_token: Optional[str] = Cookie(None)):
    print(access_token)
    if not access_token:
        raise HTTPException(status_code=401, detail="Access token missing")

    payload = verify_access_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")

    eid = payload.get("sub")
    name = payload.get("name")
    if not eid or not name:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    return JSONResponse(content={"user": {"eid": eid, "name": name}})

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Successfully logged out"}
