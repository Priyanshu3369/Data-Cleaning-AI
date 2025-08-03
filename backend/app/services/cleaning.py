import pandas as pd
import os
from sklearn.ensemble import IsolationForest

def remove_outliers_iqr(df: pd.DataFrame) -> pd.DataFrame:
    numeric_cols = df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR
        df = df[(df[col] >= lower) & (df[col] <= upper)]
    return df

def remove_outliers_isolation_forest(df: pd.DataFrame) -> pd.DataFrame:
    numeric_df = df.select_dtypes(include=['number']).dropna()
    if numeric_df.shape[0] < 10:
        return df  # not enough data to apply model

    clf = IsolationForest(contamination=0.05, random_state=42)
    preds = clf.fit_predict(numeric_df)
    mask = preds != -1  # keep only inliers
    df = df.loc[numeric_df.index[mask]]
    return df

def clean_csv(filename: str) -> str:
    upload_path = os.path.join("app/uploads", filename)
    cleaned_path = os.path.join("app/cleaned", f"cleaned_{filename}")

    df = pd.read_csv(upload_path)

    # 1. Remove duplicates
    df = df.drop_duplicates()

    # 2. Handle missing values
    for col in df.columns:
        if df[col].dtype == 'object':
            mode_val = df[col].mode()[0] if not df[col].mode().empty else ""
            df[col] = df[col].fillna(mode_val)
        else:
            mean_val = df[col].mean()
            df[col] = df[col].fillna(mean_val)

    # 3. Remove outliers using IQR
    df = remove_outliers_iqr(df)

    # 4. Further refine using Isolation Forest
    df = remove_outliers_isolation_forest(df)

    df.to_csv(cleaned_path, index=False)
    return cleaned_path
