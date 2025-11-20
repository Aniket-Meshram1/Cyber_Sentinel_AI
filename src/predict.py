# src/predict.py

import os
import pandas as pd
import joblib
from tabulate import tabulate  # make sure to install this: pip install tabulate

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")
PROCESSED_DATA = os.path.join(BASE_DIR, "data", "processed", "cicddos2019_processed.csv")

def load_model(model_name="random_forest_ddos"):
    model_path = os.path.join(MODEL_DIR, f"{model_name}.joblib")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"❌ Model not found: {model_path}")
    print(f"✅ Loaded model: {model_name}")
    return joblib.load(model_path)

def preprocess_input(new_data):
    """
    This function ensures new input data matches the processed training dataset format.
    """
    reference_df = pd.read_csv(PROCESSED_DATA)
    reference_columns = [col for col in reference_df.columns if col != "Label"]

    for col in reference_columns:
        if col not in new_data.columns:
            new_data[col] = 0  # Fill missing columns with 0

    new_data = new_data[reference_columns]
    return new_data

def predict_from_csv(model, csv_path):
    new_data = pd.read_csv(csv_path)
    new_data.columns = new_data.columns.str.strip()

    processed_data = preprocess_input(new_data)

    predictions = model.predict(processed_data)
    new_data["Prediction"] = predictions
    new_data["Prediction_Label"] = new_data["Prediction"].map({0: "Normal", 1: "DDoS Attack"})

    print("\n✅ Predictions Completed!\n")

    # Select a few key columns for display
    display_cols = []
    for col in [" Source IP", " Destination IP", " Protocol", " Flow Duration"]:
        if col.strip() in new_data.columns:
            display_cols.append(col.strip())

    display_cols += ["Prediction_Label"]

    # Prepare table (limit to first 10 rows)
    preview = new_data[display_cols].head(10)
    print(tabulate(preview, headers="keys", tablefmt="fancy_grid", showindex=True))

    # Save results
    output_path = csv_path.replace(".csv", "_with_predictions.csv")
    new_data.to_csv(output_path, index=False)
    print(f"\n💾 Predictions saved to: {output_path}")

def main():
    model_name = input("Enter model name (random_forest_ddos / logistic_regression_ddos): ").strip()
    csv_path = input("Enter path of CSV file to predict: ").strip()

    model = load_model(model_name)
    predict_from_csv(model, csv_path)

if __name__ == "__main__":
    main()
def load_model(model_name="random_forest_ddos"):
    model_path = os.path.join(MODEL_DIR, f"{model_name}.joblib")  # <-- Fix typo here
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"❌ Model not found: {model_path}")
    print(f"✅ Loaded model: {model_name}")
    return joblib.load(model_path)