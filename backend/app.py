import os
import joblib
import logging
import pandas as pd
from flask import Flask, request, jsonify
from utils.preprocess_input import preprocess_input

# -------------------- APP SETUP --------------------
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "saved_models")
LOG_DIR = os.path.join(BASE_DIR, "logs")

os.makedirs(LOG_DIR, exist_ok=True)

# -------------------- LOGGING --------------------
logging.basicConfig(
    filename=os.path.join(LOG_DIR, "app.log"),
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# -------------------- INPUT SCHEMA --------------------
REQUIRED_FEATURES = [
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets"
]

def validate_input(data: dict):
    return [f for f in REQUIRED_FEATURES if f not in data]

# -------------------- MODEL REGISTRY --------------------
MODEL_PATHS = {
    "xgboost": "xgboost_ddos.joblib",
    "lightgbm": "lightgbm_ddos.joblib",
    "random_forest": "random_forest_ddos.joblib",
    "logistic_regression": "logistic_regression_ddos.joblib"
}

MODELS = {}

for name, file in MODEL_PATHS.items():
    path = os.path.join(MODEL_DIR, file)
    if os.path.exists(path):
        MODELS[name] = joblib.load(path)
        logging.info(f"Loaded model: {name}")
    else:
        logging.warning(f"Model missing: {path}")

# -------------------- HEALTH CHECK --------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Cyber Sentinel AI Backend Running",
        "available_models": list(MODELS.keys())
    })

# -------------------- MODEL METADATA (RESEARCH) --------------------
@app.route("/models", methods=["GET"])
def model_metadata():
    metadata = {}
    for name, model in MODELS.items():
        metadata[name] = {
            "algorithm": model.__class__.__name__,
            "features": len(getattr(model, "feature_names_in_", []))
        }
    return jsonify(metadata)

# -------------------- HELPER --------------------
def get_model(name):
    return MODELS.get(name)

# -------------------- SINGLE RECORD PREDICTION --------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        model_name = request.args.get("model", "xgboost")
        model = get_model(model_name)

        if model is None:
            return jsonify({"error": "Invalid model name"}), 400

        if request.is_json:
            data = request.get_json()
        elif request.form:
            data = dict(request.form)
        else:
            return jsonify({"error": "Unsupported content type"}), 415

        missing = validate_input(data)
        if missing:
            return jsonify({"error": f"Missing features: {missing}"}), 400

        df = pd.DataFrame([data])
        df = df.apply(pd.to_numeric, errors="coerce").fillna(0)

        processed = preprocess_input(df, getattr(model, "feature_names_in_", None))
        prediction = int(model.predict(processed)[0])

        label = "DDoS Attack" if prediction == 1 else "Normal"

        logging.info(f"Prediction | Model={model_name} | Result={label}")

        return jsonify({
            "model_used": model_name,
            "prediction": prediction,
            "label": label
        })

    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": "Prediction failed"}), 500

# -------------------- CSV BATCH PREDICTION --------------------
@app.route("/predict-csv", methods=["POST"])
def predict_csv():
    try:
        model_name = request.args.get("model", "xgboost")
        model = get_model(model_name)

        if model is None:
            return jsonify({"error": "Invalid model name"}), 400

        if "file" not in request.files:
            return jsonify({"error": "CSV file missing"}), 400

        file = request.files["file"]
        if not file.filename.endswith(".csv"):
            return jsonify({"error": "Only CSV files allowed"}), 400

        df = pd.read_csv(file)
        processed = preprocess_input(df, getattr(model, "feature_names_in_", None))

        predictions = model.predict(processed)

        ddos_count = int((predictions == 1).sum())
        normal_count = int((predictions == 0).sum())

        results = [
            {
                "row": i + 1,
                "prediction": int(pred),
                "label": "DDoS Attack" if pred == 1 else "Normal"
            }
            for i, pred in enumerate(predictions)
        ]

        logging.info(
            f"Batch Prediction | Model={model_name} | Total={len(predictions)} | DDoS={ddos_count}"
        )

        return jsonify({
            "model_used": model_name,
            "total_rows": len(predictions),
            "ddos_detected": ddos_count,
            "normal": normal_count,
            "results": results
        })

    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": "CSV prediction failed"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
