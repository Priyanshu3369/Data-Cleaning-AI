from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse
import pandas as pd
import os

router = APIRouter()

CLEANED_DIR = "app/cleaned"

@router.get("/preview_cleaned/{filename}")
def preview_cleaned(filename: str):
    file_path = os.path.join(CLEANED_DIR, filename)
    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "File not found"})

    df = pd.read_csv(file_path)
    return {"columns": df.columns.tolist(), "rows": df.head(10).to_dict(orient="records")}

@router.get("/download_cleaned/{filename}")
def download_cleaned(filename: str):
    file_path = os.path.join(CLEANED_DIR, filename)
    if not os.path.exists(file_path):
        return JSONResponse(status_code=404, content={"error": "File not found"})
    
    return FileResponse(path=file_path, filename=filename, media_type='text/csv')
