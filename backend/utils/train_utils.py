import pandas as pd
from sklearn.model_selection import train_test_split
from utils.preprocess_input import preprocess_input

def load_and_prepare_data(csv_path):
    df = pd.read_csv(csv_path)

    X = df.drop(columns=["Label"])
    y = df["Label"]

    # Apply SAME feature engineering as inference
    X_processed = preprocess_input(X)

    return train_test_split(
        X_processed, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )
