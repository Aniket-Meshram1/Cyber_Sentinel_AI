import requests
import pandas as pd
import os
import sys

# Configuration
BASE_URL = "http://127.0.0.1:5000/predict"
MODELS = ["xgboost", "lightgbm", "random_forest", "logistic_regression"]

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "data", "processed", "cicddos2019_processed.csv")

DATA_STR = "0.5301273064850545,-0.445433562417894,-0.4122819815042434,-0.4992237321780884,-0.12157008159287032,-0.02633133602454141,-0.2811207052980731,0.14381998248128827,-0.2781686116554371,-0.1707190000355294,-0.3092973951655942,-0.25663879779999516,1.6259526868095155,-0.3311962955336943,1.7938503647126791,1.672118696606984,-0.03330026031690797,-0.12359567608926256,-0.5539630860679697,-0.530441658072312,-0.48637820101814333,-0.03694325985114522,-0.47118833047358216,-0.385698071965026,-0.4486994308875534,-0.4544242174139369,-0.0545601357979758,-0.2756839739299617,-0.16999183457976436,-0.24107156074785732,-0.25121966039038496,-0.056128387264938455,-0.18537982174378762,0.0,0.0,0.0,-0.1051739448773461,-0.028901267624782425,-0.11393564501455193,-0.08211612318125851,-0.5119767942581611,1.451271994842521,1.6784549293508357,1.5976731150412076,1.6780435244823797,-0.051752847981586046,-0.18537982174378762,-0.010937111345450891,1.3592793798295126,-1.0089484753342999,-0.4047361732972544,0.0,-0.010937111345450891,-0.004077562928560374,1.7352315172065167,-0.3092973951655942,1.7938503647126645,-0.1051739448773461,0.0,0.0,0.0,0.0,0.0,0.0,-0.12157008159287032,-0.2811207052980731,-0.02633133602454141,0.14381998248128827,0.49074580496509157,-0.0861057517832292,-0.10689049916085888,-0.35582759552484794,-0.23163607825468924,-0.06151270021961551,-0.23114772763937513,-0.22648367468252595,-0.4723500132685222,-0.2831398965171196,-0.47836898901161595,-0.391075313978903"

def get_payload():
    if not os.path.exists(PROCESSED_DATA_PATH):
        print(f"Error: {PROCESSED_DATA_PATH} not found.")
        sys.exit(1)

    # Load header to get feature names
    df = pd.read_csv(PROCESSED_DATA_PATH, nrows=0)
    feature_names = [col.strip() for col in df.columns if col.strip() != "Label"]

    values = [float(x) for x in DATA_STR.split(",")]
    
    # Remove label if present (the '1' at the end)
    if len(values) == len(feature_names) + 1:
        values = values[:-1]

    return dict(zip(feature_names, values))

def test_models():
    print("Generating payload...")
    payload = get_payload()
    
    print(f"\n{'Model':<25} | {'Prediction':<10} | {'Label':<15}")
    print("-" * 55)

    for model in MODELS:
        try:
            response = requests.post(
                BASE_URL,
                params={"model": model},
                json=payload
            )
            if response.status_code == 200:
                res = response.json()
                print(f"{model:<25} | {res['prediction']:<10} | {res['label']:<15}")
            else:
                print(f"{model:<25} | Error {response.status_code}")
        except Exception as e:
            print(f"{model:<25} | Connection Error (Is backend running?)")

if __name__ == "__main__":
    test_models()