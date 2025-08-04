import pandas as pd
import os
from sklearn.ensemble import IsolationForest

def get_data_summary(filename: str):
    upload_path = os.path.join("app/cleaned", filename)
    df = pd.read_csv(upload_path)

    # Null count
    nulls = df.isnull().sum()
    null_summary = [{"column": col, "nulls": int(nulls[col])} for col in df.columns if nulls[col] > 0]

    # Duplicate count
    duplicate_count = int(df.duplicated().sum())

    # Outlier detection (numerical only)
    outlier_summary = []
    numeric_cols = df.select_dtypes(include='number').columns
    for col in numeric_cols:
        try:
            model = IsolationForest(contamination=0.05, random_state=42)
            preds = model.fit_predict(df[[col]].dropna())
            outliers = (preds == -1).sum()
            if outliers > 0:
                outlier_summary.append({"column": col, "outliers": int(outliers)})
        except:
            continue

    return {
        "nulls": null_summary,
        "outliers": outlier_summary,
        "duplicates": duplicate_count,
        "total_rows": len(df)
    }
