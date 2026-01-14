import os
import joblib
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "processed", "cicddos2019_processed.csv")
MODEL_DIR = os.path.join(BASE_DIR, "..", "backend", "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "lightgbm_ddos.joblib")

os.makedirs(MODEL_DIR, exist_ok=True)

# Training Function
def train_lightgbm():
    print("Loading processed dataset...")
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()

    # Separate features & target
    X = df.drop("Label", axis=1)
    y = df["Label"]

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("🚀 Training LightGBM model...")

    model = lgb.LGBMClassifier(
        objective="binary",
        boosting_type="gbdt",
        n_estimators=300,
        learning_rate=0.05,
        num_leaves=31,
        max_depth=-1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)

    print("\n Classification Report (LightGBM):")
    print(classification_report(y_test, y_pred))

    acc = accuracy_score(y_test, y_pred)
    print("Accuracy:", acc)

    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save Model
    joblib.dump(model, MODEL_PATH)
    print(f"💾 LightGBM model saved at: {MODEL_PATH}")


if __name__ == "__main__":
    train_lightgbm()
