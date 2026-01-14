import pandas as pd
import numpy as np

def preprocess_input(data, expected_columns=None):

    # ---------------- INPUT HANDLING ----------------
    if isinstance(data, pd.DataFrame):
        df = data.copy()
    elif isinstance(data, dict):
        df = pd.DataFrame([data])
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        raise ValueError("Input must be a dictionary, list of dictionaries, or DataFrame.")

    # Drop label if present
    if "Label" in df.columns:
        df = df.drop(columns=["Label"])

    # Convert to numeric
    df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

    # ---------------- FEATURE ENGINEERING ----------------

    # Volume features
    df["Total_Packets"] = df.get("Total Fwd Packets", 0) + df.get("Total Backward Packets", 0)
    df["Total_Bytes"] = df.get("Total Length of Fwd Packets", 0) + df.get("Total Length of Bwd Packets", 0)

    # Ratio features (DDoS behavior)
    df["Packet_Ratio"] = df.get("Total Fwd Packets", 0) / (df.get("Total Backward Packets", 0) + 1)
    df["Byte_Ratio"] = df.get("Total Length of Fwd Packets", 0) / (df.get("Total Length of Bwd Packets", 0) + 1)

    # Flow intensity
    df["Packets_per_Second"] = df["Total_Packets"] / (df.get("Flow Duration", 0) + 1)

    # ---------------- NORMALIZATION ----------------
    log_features = [
        "Flow Duration",
        "Total_Packets",
        "Total_Bytes"
    ]

    for col in log_features:
        if col in df.columns:
            df[col] = np.log1p(df[col])

    # ---------------- FEATURE ALIGNMENT ----------------
    if expected_columns is not None:
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0
        df = df[expected_columns]

    return df
