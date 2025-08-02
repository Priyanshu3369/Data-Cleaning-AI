from fastapi import APIRouter
from pydantic import BaseModel
from app.services.cleaning import clean_csv
import os
router = APIRouter()

class CleanRequest(BaseModel):
    filename: str

@router.post("/clean_data")
def clean_data(req: CleanRequest):
    cleaned_path = clean_csv(req.filename)
    return {"message": "Data cleaned", "cleaned_filename": os.path.basename(cleaned_path)}
