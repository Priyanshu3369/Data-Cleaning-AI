import pandas as pd
import os

def clean_csv(filename: str) -> str:
    upload_path = os.path.join("app/uploads", filename)
    cleaned_path = os.path.join("app/cleaned", f"cleaned_{filename}")

    df = pd.read_csv(upload_path)

    # Remove duplicates
    df = df.drop_duplicates()

    # Handle missing values
    for col in df.columns:
        if df[col].dtype == 'object':
            mode_val = df[col].mode()[0] if not df[col].mode().empty else ""
            df[col] = df[col].fillna(mode_val)
        else:
            mean_val = df[col].mean()
            df[col] = df[col].fillna(mean_val)

    df.to_csv(cleaned_path, index=False)
    return cleaned_path
