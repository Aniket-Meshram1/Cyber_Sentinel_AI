import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(BASE_DIR, "saved_models")

DEFAULT_MODEL = "xgboost"

ALLOWED_MODELS = [
    "xgboost",
    "lightgbm",
    "random_forest",
    "logistic_regression"
]

DEBUG = os.getenv("DEBUG", "True") == "True"
