import pandas as pd

def preprocess_input(data, expected_columns=None):

    # ---------------- CASE 1: DataFrame ----------------
    if isinstance(data, pd.DataFrame):
        df = data.copy()

    # ---------------- CASE 2: Dictionary ----------------
    elif isinstance(data, dict):
        df = pd.DataFrame([data])

    # ---------------- CASE 3: List of dictionaries ----------------
    elif isinstance(data, list):
        df = pd.DataFrame(data)

    else:
        raise ValueError("Input must be a dictionary, list of dictionaries, or DataFrame.")

    # Drop label column if present
    if "Label" in df.columns:
        df = df.drop(columns=["Label"])

    # Convert all values to numeric
    df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

    # Align columns with trained model
    if expected_columns is not None:
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0
        df = df[expected_columns]

    return df
