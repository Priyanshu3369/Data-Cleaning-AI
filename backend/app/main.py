from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import upload , clean , preview , summary

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(upload.router)
app.include_router(clean.router)
app.include_router(preview.router)
app.include_router(summary.router)
