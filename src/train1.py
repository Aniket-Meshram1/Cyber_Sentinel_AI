import os
import json
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from src.model_comparison import evaluate_model, save_comparison_table, plot_bar_chart


# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "cicddos2019_processed.csv")
MODEL_DIR = os.path.join(BASE_DIR, "backend", "saved_models")

os.makedirs(MODEL_DIR, exist_ok=True)

# Load Data
def load_data():
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()
    print(f"Loaded dataset: {df.shape}")
    return df

# Train / Test Split
def split_data(df):
    X = df.drop("Label", axis=1)
    y = df["Label"]
    return train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

# Models
def get_models():
    return {
        "random_forest_ddos": RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1
        ),
        "logistic_regression_ddos": LogisticRegression(
            max_iter=1000,
            n_jobs=-1
        ),
        "xgboost_ddos": XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42
        ),
        "lightgbm_ddos": LGBMClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1
        )
    }

# Save Model + Metadata
def save_model(model, name, feature_names):
    model_path = os.path.join(MODEL_DIR, f"{name}.joblib")
    meta_path = os.path.join(MODEL_DIR, f"{name}_features.json")

    joblib.dump(model, model_path)

    with open(meta_path, "w") as f:
        json.dump(feature_names, f)

    print(f"Saved model: {model_path}")
    print(f"Saved features: {meta_path}")

# Train Pipeline
def train_models(X_train, X_test, y_train, y_test):
    feature_names = list(X_train.columns)
    models = get_models()

    for name, model in models.items():
        print(f"\n Training {name} ...")
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)

        print(f"Accuracy: {acc:.4f}")
        print(classification_report(y_test, y_pred))

        save_model(model, name, feature_names)


# Main
def main():
    df = load_data()
    X_train, X_test, y_train, y_test = split_data(df)
    train_models(X_train, X_test, y_train, y_test)

if __name__ == "__main__":
    main()
