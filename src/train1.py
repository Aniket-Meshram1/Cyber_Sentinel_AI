# src/train.py

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
PROCESSED_DATA = os.path.join(BASE_DIR, "data", "processed", "cicddos2019_processed.csv")
MODEL_DIR = os.path.join(BASE_DIR, "backend", "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

def load_processed_data():
    df = pd.read_csv(PROCESSED_DATA)
    df.columns = df.columns.str.strip()  # clean column names
    print(f"✅ Loaded processed data: {df.shape}")
    return df

def split_data(df):
    X = df.drop("Label", axis=1)
    y = df["Label"]
    return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

def train_random_forest(X_train, y_train):
    print("🌲 Training Random Forest...")
    model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    return model

def train_logistic_regression(X_train, y_train):
    print("⚙️ Training Logistic Regression...")
    model = LogisticRegression(max_iter=500, random_state=42)
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    print("📊 Classification Report:")
    print(classification_report(y_test, y_pred))
    print("✅ Accuracy:", round(accuracy_score(y_test, y_pred), 3))
    print("📉 Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

def save_model(model, name):
    path = os.path.join(MODEL_DIR, f"{name}.joblib")
    joblib.dump(model, path)
    print(f"💾 Saved model: {path}")

def main():
    df = load_processed_data()
    X_train, X_test, y_train, y_test = split_data(df)

    # Train models
    rf_model = train_random_forest(X_train, y_train)
    evaluate_model(rf_model, X_test, y_test)
    save_model(rf_model, "random_forest_ddos")

    lr_model = train_logistic_regression(X_train, y_train)
    evaluate_model(lr_model, X_test, y_test)
    save_model(lr_model, "logistic_regression_ddos")

if __name__ == "__main__":
    main()
