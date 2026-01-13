import requests

# URL of your Flask API
url = "http://127.0.0.1:5000/predict"

# Sample data (matching the features your model expects)
# Note: You might need to add more features depending on what your model was trained on.
payload = {
    "Flow Duration": 1000,
    "Total Fwd Packets": 10,
    "Total Backward Packets": 5,
    "Total Length of Fwd Packets": 500,
    "Total Length of Bwd Packets": 300
}

print(f"Sending request to {url}...")

try:
    # requests.post with 'json=' automatically sets Content-Type: application/json
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        print("✅ Success! Response:", response.json())
    else:
        print(f"⚠️ Server Error {response.status_code}:", response.text)

except requests.exceptions.ConnectionError:
    print("❌ Could not connect to the server.")
    print("Make sure the Flask app is running! (Run: python app.py)")
except Exception as e:
    print(f"❌ An error occurred: {e}")