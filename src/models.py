from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.neural_network import MLPClassifier

def get_models():
    """Return a dictionary of ML models."""
    models = {
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),
        "LogisticRegression": LogisticRegression(max_iter=1000),
        "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric="logloss"),
        "MLP": MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500)
    }
    return models
