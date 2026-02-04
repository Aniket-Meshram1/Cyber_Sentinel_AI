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

from src.model_comparison import (
    evaluate_model,
    save_comparison_table,
    plot_bar_chart
)

from src.evaluation_plots import (
    plot_roc_auc,
    plot_confusion_matrix
)

# ================= PATHS =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(
    BASE_DIR, "data", "processed", "cicddos2019_processed.csv"
)

MODEL_DIR = os.path.join(BASE_DIR, "backend", "saved_models")
REPORT_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

# ================= LOAD DATA =================
def load_data():
    df = pd.read_csv(DATA_PATH)
    df.columns = df.columns.str.strip()
    print(f"Loaded dataset: {df.shape}")
    return df

# ================= SPLIT DATA =================
def split_data(df):
    X = df.drop("Label", axis=1)
    y = df["Label"]

    return train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

# ================= MODELS =================
def get_models():
    return {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            n_jobs=-1
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42
        ),
        "LightGBM": LGBMClassifier(
            n_estimators=200,
            random_state=42,
            n_jobs=-1
        )
    }

# ================= SAVE MODEL + METADATA =================
def save_model(model, name, feature_names):
    safe_name = name.lower().replace(" ", "_")

    model_path = os.path.join(MODEL_DIR, f"{safe_name}_ddos.joblib")
    meta_path = os.path.join(MODEL_DIR, f"{safe_name}_features.json")

    joblib.dump(model, model_path)

    with open(meta_path, "w") as f:
        json.dump(feature_names, f, indent=2)

    print(f"Saved model → {model_path}")
    print(f"Saved features → {meta_path}")

# ================= TRAIN + EVALUATE =================
def train_models(X_train, X_test, y_train, y_test):
    feature_names = list(X_train.columns)
    models = get_models()

    comparison_results = []

    for name, model in models.items():
        print(f"\n================ {name} =================")

        model.fit(X_train, y_train)

        # ---------- Evaluation ----------
        metrics = evaluate_model(
            model,
            X_test,
            y_test,
            model_name=name
        )
        comparison_results.append(metrics)

        # ---------- Save model ----------
        save_model(model, name, feature_names)

        # ---------- Confusion Matrix ----------
        plot_confusion_matrix(
            model,
            X_test,
            y_test,
            model_name=name,
            save_dir=REPORT_DIR
        )

        # ---------- ROC–AUC ----------
        plot_roc_auc(
            model,
            X_test,
            y_test,
            model_name=name,
            save_dir=REPORT_DIR
        )

    # ================= COMPARISON TABLE =================
    comparison_df = save_comparison_table(
        comparison_results,
        save_dir=REPORT_DIR
    )

    # ================= BAR CHARTS =================
    plot_bar_chart(comparison_df, metric="Accuracy", save_dir=REPORT_DIR)
    plot_bar_chart(comparison_df, metric="F1-Score", save_dir=REPORT_DIR)
    plot_bar_chart(comparison_df, metric="ROC-AUC", save_dir=REPORT_DIR)

# ================= MAIN =================
def main():
    df = load_data()
    X_train, X_test, y_train, y_test = split_data(df)
    train_models(X_train, X_test, y_train, y_test)

if __name__ == "__main__":
    main()
