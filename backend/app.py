import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from utils.preprocess_input import preprocess_input

app = Flask(__name__)

# Model Registry
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATHS = {
    "xgboost": os.path.join(BASE_DIR, "saved_models", "xgboost_ddos.joblib"),
    "lightgbm": os.path.join(BASE_DIR, "saved_models", "lightgbm_ddos.joblib"),
    "random_forest": os.path.join(BASE_DIR, "saved_models", "random_forest_ddos.joblib"),
    "logistic_regression": os.path.join(BASE_DIR, "saved_models", "logistic_regression_ddos.joblib")
}

MODELS = {}

for name, path in MODEL_PATHS.items():
    if os.path.exists(path):
        MODELS[name] = joblib.load(path)
        print(f"Loaded {name} model")
    else:
        print(f"Model missing: {path}")

# Health Check
@app.route("/")
def home():
    return jsonify({
        "message": "Cyber Sentinel AI Backend Running",
        "available_models": list(MODELS.keys())
    })

# Helper: Get Model
def get_model(model_name):
    if model_name not in MODELS:
        return None
    return MODELS[model_name]

# Single Record Prediction
@app.route("/predict", methods=["POST"])
def predict():
    try:
        model_name = request.args.get("model", "xgboost")
        model = get_model(model_name)

        if model is None:
            return jsonify({"error": "Invalid model name"}), 400

        # JSON input
        if request.is_json:
            data = request.get_json()
            df = pd.DataFrame([data])
        # form-data input
        elif request.form:
            df = pd.DataFrame([dict(request.form)])
        else:
            return jsonify({"error": "Unsupported content type"}), 415

        df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

        expected_columns = getattr(model, "feature_names_in_", None)
        processed_df = preprocess_input(df, expected_columns)

        prediction = model.predict(processed_df)[0]
        label = "DDoS Attack" if prediction == 1 else "Normal"

        return jsonify({
            "model_used": model_name,
            "prediction": int(prediction),
            "label": label
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# CSV Upload Prediction
@app.route("/predict-csv", methods=["POST"])
def predict_csv():
    try:
        model_name = request.args.get("model", "xgboost")
        model = get_model(model_name)

        if model is None:
            return jsonify({"error": "Invalid model name"}), 400

        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        if not file.filename.endswith(".csv"):
            return jsonify({"error": "Only CSV files allowed"}), 400

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
            "model_used": model_name,
            "total_rows": len(predictions),
            "ddos_detected": ddos_count,
            "normal": len(predictions) - ddos_count,
            "results": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Run App
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
