from fastapi.staticfiles import StaticFiles

from fastapi import FastAPI
from routers import auth, observations
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(auth.router)
app.include_router(observations.router)
origins = [
    "http://127.0.0.1:5173",  # Frontend URL
    "http://localhost:5173",  # Alternate localhost frontend URL
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/images", StaticFiles(directory="./images"), name="images")
