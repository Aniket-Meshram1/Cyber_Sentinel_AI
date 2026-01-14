from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from src.data_loader import load_all_data
from src.preprocessing import clean_data, encode_labels, scale_features, balance_data
from src.feature_engineering import select_features
from src.models import get_models
import pandas as pd
import os
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DATA_PATH = os.path.join(BASE_DIR, "data", "raw")
MODEL_PATH = os.path.join(BASE_DIR, "backend", "saved_models")

def train_pipeline():
    # Load and preprocess data
    df = load_all_data(RAW_DATA_PATH)
    df.columns = df.columns.str.strip() 
    df = clean_data(df)
    df = encode_labels(df)

    # Features and labels
    X = df.drop("Label", axis=1)
    y = df["Label"]

    # Balance data
    X, y = balance_data(X, y)

    # Feature selection
    X, selector = select_features(X, y, k=20)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train models
    models = get_models()
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        print(classification_report(y_test, y_pred))

        # Save best model 
        model_file = os.path.join(MODEL_PATH, f"{name}.pkl")
        joblib.dump(model, model_file)
        print(f"{name} saved at {model_file}")

if __name__ == "__main__":
    train_pipeline()


