# src/evaluate.py

import os
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROCESSED_DATA = os.path.join(BASE_DIR, "data", "processed", "cicddos2019_processed.csv")
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")

def load_model(model_name):
    model_path = os.path.join(MODEL_DIR, f"{model_name}.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"❌ Model not found: {model_path}")
    print(f"✅ Loaded model: {model_name}")
    return joblib.load(model_path)

def load_data():
    df = pd.read_csv(PROCESSED_DATA)
    df.columns = df.columns.str.strip()  # clean column names
    print(f"✅ Loaded processed dataset: {df.shape}")
    return df

def evaluate(model, df):
    X = df.drop("Label", axis=1)
    y_true = df["Label"]
    y_pred = model.predict(X)

    print("\n📊 Classification Report:")
    print(classification_report(y_true, y_pred))
    print("✅ Accuracy:", round(accuracy_score(y_true, y_pred), 4))
    print("📉 Confusion Matrix:")
    print(confusion_matrix(y_true, y_pred))

def main():
    # Choose which model to test
    model_name = input("Enter model name to evaluate (random_forest_ddos / logistic_regression_ddos): ").strip()
    model = load_model(model_name)
    df = load_data()
    evaluate(model, df)

if __name__ == "__main__":
    main()
