import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler
from imblearn.over_sampling import SMOTE

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Basic cleaning: remove NaNs and infinities."""
    df = df.dropna()
    df = df.replace([float("inf"), -float("inf")], 0)
    return df

def encode_labels(df: pd.DataFrame) -> pd.DataFrame:
    """Encode categorical labels into numeric."""
    if "Label" in df.columns:
        le = LabelEncoder()
        df["Label"] = le.fit_transform(df["Label"])
    return df

def scale_features(X: pd.DataFrame) -> pd.DataFrame:
    """Scale numerical features."""
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled

def balance_data(X, y):
    """Handle imbalance with SMOTE."""
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X, y)
    return X_res, y_res
