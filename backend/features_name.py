import joblib

model = joblib.load("saved_models/random_forest_ddos.joblib")
print(model.feature_names_in_)