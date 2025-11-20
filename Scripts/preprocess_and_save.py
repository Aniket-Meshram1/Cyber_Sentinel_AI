import os
import pandas as pd
from src.data_loader import load_all_data
from src.preprocessing import clean_data, encode_labels, scale_features

RAW_DATA_PATH = os.path.join("data", "raw")
PROCESSED_DATA_PATH = os.path.join("data", "processed")

os.makedirs(PROCESSED_DATA_PATH, exist_ok=True)

def preprocess_and_save():
    # Load all raw data
    df = load_all_data(RAW_DATA_PATH)
    df.columns = df.columns.str.strip()  # <-- Add this line

    # Clean data
    df = clean_data(df)

    # Encode labels
    df = encode_labels(df)

    # Separate features & labels
    X = df.drop("Label", axis=1)
    y = df["Label"]

    # Drop non-numeric columns
    non_numeric = X.select_dtypes(include=["object"]).columns
    X = X.drop(non_numeric, axis=1)

    # Scale features
    X_scaled = scale_features(X)

    # Recombine
    df_processed = pd.DataFrame(X_scaled, columns=X.columns)
    df_processed["Label"] = y.values

    # Save processed dataset
    output_file = os.path.join(PROCESSED_DATA_PATH, "cicddos2019_processed.csv")
    df_processed.to_csv(output_file, index=False)

    print(f"✅ Processed dataset saved at {output_file}")
    print(f"Shape: {df_processed.shape}")

if __name__ == "__main__":
    preprocess_and_save()
