import os
import joblib
from config import MODEL_DIR, ALLOWED_MODELS

MODELS = {}

def load_models():
    for model_name in ALLOWED_MODELS:
        path = os.path.join(MODEL_DIR, f"{model_name}_ddos.joblib")
        if os.path.exists(path):
            MODELS[model_name] = joblib.load(path)
            print(f"Loaded {model_name}")
        else:
            print(f"Missing model: {path}")

def get_model(name):
    return MODELS.get(name)
