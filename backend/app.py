import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify, render_template
from utils.preprocess_input import preprocess_input

app = Flask(__name__)

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "xgboost_ddos.joblib")

# Load the model
if os.path.exists(MODEL_PATH):
    print(f"Loading model from {MODEL_PATH}...")
    model = joblib.load(MODEL_PATH)
else:
    print(f"Warning: Model not found at {MODEL_PATH}. Please move your .joblib file there.")
    model = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        # Get JSON data
        data = request.get_json(force=True)
        
        # Get expected features from the model if available (XGBoost/Sklearn usually store this)
        expected_columns = getattr(model, "feature_names_in_", None)
        
        # Preprocess
        processed_data = preprocess_input(data, expected_columns)

        # Predict
        prediction = model.predict(processed_data)
        prediction_label = "DDoS Attack" if prediction[0] == 1 else "Normal"

        return jsonify({
            "prediction": int(prediction[0]),
            "label": prediction_label
        })

    except Exception as e:
        print(f"API Error: {str(e)}")
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)