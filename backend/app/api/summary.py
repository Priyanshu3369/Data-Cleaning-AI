from fastapi import APIRouter
from app.services.summary import get_data_summary

router = APIRouter()



@router.post("/get_summary/{filename}")
def get_summary(filename: str):
    summary = get_data_summary(filename)
    return summary
