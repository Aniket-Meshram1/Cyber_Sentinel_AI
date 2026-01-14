import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from utils.preprocess_input import preprocess_input

app = Flask(__name__)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "xgboost_ddos.joblib")

# Load model
if os.path.exists(MODEL_PATH):
    print(f"Loading model from {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
else:
    model = None
    print("Model not found")

@app.route("/")
def home():
    return "Cyber Sentinel AI Backend is Running!"

# ---------------- SINGLE PREDICTION ----------------
@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415

        data = request.get_json()
        df = pd.DataFrame([data])

        df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

        expected_columns = getattr(model, "feature_names_in_", None)
        processed = preprocess_input(df, expected_columns)

        pred = model.predict(processed)[0]
        label = "DDoS Attack" if pred == 1 else "Normal"

        return jsonify({
            "prediction": int(pred),
            "label": label
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------- CSV UPLOAD ----------------
@app.route("/predict-csv", methods=["POST"])
def predict_csv():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files supported"}), 400

    try:
        df = pd.read_csv(file)

        expected_columns = getattr(model, "feature_names_in_", None)
        processed_df = preprocess_input(df, expected_columns)

        predictions = model.predict(processed_df)

        results = []
        ddos_count = 0

        for i, pred in enumerate(predictions):
            label = "DDoS Attack" if pred == 1 else "Normal"
            if pred == 1:
                ddos_count += 1

            results.append({
                "row": i + 1,
                "prediction": int(pred),
                "label": label
            })

        return jsonify({
            "total_rows": len(predictions),
            "ddos_detected": ddos_count,
            "normal": len(predictions) - ddos_count,
            "results": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
