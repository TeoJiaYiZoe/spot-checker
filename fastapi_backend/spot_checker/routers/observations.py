import json
import os
import hashlib
from jose import jwt, JWTError
from datetime import timedelta, datetime, timezone
from typing import List, Optional, Annotated
from fastapi.staticfiles import StaticFiles

from fastapi.responses import JSONResponse
from fastapi import (
    FastAPI,
    HTTPException,
    status,
    UploadFile,
    File,
    Response,
    Form,
    Cookie,
    Depends,APIRouter
)
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from .auth import get_current_user
from pydantic_models.login_request import LoginRequest

router = APIRouter(
    prefix="/observations",
    tags=["Observations"],
)
user_dependency = Annotated[dict, Depends(get_current_user)]
router.mount("/images", StaticFiles(directory="./images"), name="images")


USER_DATA_FILE = os.path.join("fixtures", "employees.json")
PERSONALIZED_LIST_FILE = os.path.join("fixtures", "personalized_eatery_list.json")
EATERY_OBSERVATIONS_FILE = os.path.join("fixtures", "eatery_observations.json")
IMAGES_FOLDER = os.path.join(os.getcwd(), "images")


@router.get("/get-check-check-list/{employee_id}", status_code=status.HTTP_200_OK)
async def get_personalised_list(employee_id: str, access_token: Optional[str] = Cookie(None)):

    if not access_token:
        raise HTTPException(status_code=401, detail="Token is missing in cookies")

    user = await get_current_user(access_token)
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    try:
        with open(PERSONALIZED_LIST_FILE, "r") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personalized list data file error",
        )

    try:
        personalized_list = data[employee_id]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No personalized list found for employee {employee_id}",
        )

    num_records = len(personalized_list)
    return {"num_records": num_records, "personalized_list": personalized_list}



@router.post("/add-observation/{license_no}", status_code=status.HTTP_201_CREATED)
async def add_observation(
    license_no: str,
    eid: str = Form(...),
    spotchecker_name: Optional[str] = Form(None),
    observation: Optional[str] = Form(None),
    offenses: Optional[str] = Form(None),
    photo_evidence: UploadFile = File(None), access_token: Optional[str] = Cookie(None)
):
    if not access_token:
        raise HTTPException(status_code=401, detail="Token is missing in cookies")

    user = await get_current_user(access_token)
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    offenses_list = offenses.split(",") if offenses else []
    try:
        with open(EATERY_OBSERVATIONS_FILE, "r") as f:
            observations_data = json.load(f)
    except FileNotFoundError:
        observations_data = {}
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Eatery Observations data file error",
        )

    photo_filename = None
    if photo_evidence:
        if photo_evidence.content_type not in ["image/png", "image/jpeg"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only PNG or JPG allowed.",
            )

        # Add photo to images folder
        os.makedirs(IMAGES_FOLDER, exist_ok=True)
        if photo_evidence and photo_evidence.filename:
            photo_extension = photo_evidence.filename.split(".")[-1]
            photo_filename = f"{license_no}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{photo_extension}"
        else:
            raise ValueError("No photo evidence was provided or filename is missing")

        file_path = os.path.join(IMAGES_FOLDER, photo_filename)

        with open(file_path, "wb") as file:
            content = await photo_evidence.read()
            file.write(content)

    new_observation = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "eid": eid,
        "spotchecker_name": spotchecker_name,
        "observation": observation,
        "offenses": offenses_list,
        "photo_evidence": photo_filename,
    }

    # Add new observation in eatery_observations
    if license_no in observations_data:
        observations_data[license_no].append(new_observation)
    else:
        observations_data[license_no] = [new_observation]

    with open(EATERY_OBSERVATIONS_FILE, "w") as f:
        json.dump(observations_data, f, indent=4)

    try:
        with open(PERSONALIZED_LIST_FILE, "r") as f:
            personalized_eatery_list = json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personalized Eatery List data file not found",
        )
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Personalized Eatery List data file error",
        )

    updated = False
    for employee_eateries in personalized_eatery_list.values():
        for eatery in employee_eateries:
            if eatery["license_no"] == license_no:
                eatery["last_checked_date"] = datetime.now().strftime("%d-%b-%Y")
                eatery["last_check_by_eid"] = eid
                eatery["last_check_by_name"] = spotchecker_name
                updated = True
                break
        if updated:
            break

    # Update personalized_eatery_list
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"License number {license_no} not found in the personalized eatery list.",
        )

    with open(PERSONALIZED_LIST_FILE, "w") as f:
        json.dump(personalized_eatery_list, f, indent=4)

    return {"message": "Observation added successfully", "data": new_observation}


@router.get("/get-observations/{license_no}", status_code=status.HTTP_200_OK)
async def get_observations(license_no: str, access_token: Optional[str] = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Token is missing in cookies")

    user = await get_current_user(access_token)
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    
    try:
        with open(EATERY_OBSERVATIONS_FILE, "r") as f:
            observations_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Observations data file error",
        )

    try:
        observations = observations_data[license_no]
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No observations found for license number {license_no}",
        )

    return {"eatery observations": observations}
