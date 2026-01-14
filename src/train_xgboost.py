import os
import pandas as pd
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "cicddos2019_processed.csv")
MODEL_DIR = os.path.join(BASE_DIR, "backend", "saved_models")

os.makedirs(MODEL_DIR, exist_ok=True)

def train_xgboost():
    print(" Loading processed dataset...")
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    # Features and label
    X = df.drop("Label", axis=1)
    y = df["Label"]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("🚀 Training XGBoost model...")

    model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="logloss",
        use_label_encoder=False,
        random_state=42
    )

    model.fit(X_train, y_train)

    # Prediction
    y_pred = model.predict(X_test)

    # Evaluation
    print("\n Classification Report (XGBoost):")
    print(classification_report(y_test, y_pred))

    accuracy = accuracy_score(y_test, y_pred)
    print("Accuracy:", round(accuracy, 4))

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save model
    model_path = os.path.join(MODEL_DIR, "xgboost_ddos.joblib")
    joblib.dump(model, model_path)

    print(f"\n💾 XGBoost model saved at: {model_path}")

if __name__ == "__main__":
    train_xgboost()
