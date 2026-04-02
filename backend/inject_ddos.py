import requests
import time
import json
import subprocess
import sys

API_URL = "http://127.0.0.1:5000/api/predict?model=random_forest"

print("Fetching known malicious payload from generate_payload.py...")

try:
    # Run your existing payload generator to get the exact ML features for an attack
    result = subprocess.run([sys.executable, 'generate_payload.py'], capture_output=True, text=True)
    payload = json.loads(result.stdout)
    
    # Add dummy IP metadata so the dashboard table has data to display
    payload["Source IP"] = "192.168.1.105"
    payload["Destination IP"] = "10.0.0.50"
    payload["Protocol"] = 6 # TCP
    
    print("Payload acquired! Injecting DDoS alerts to the backend...")
    print("Press Ctrl+C to stop.")
    
    # Spam the backend with the known DDoS attack signature
    count = 1
    while True:
        response = requests.post(API_URL, json=payload)
        if response.status_code == 200:
            res_data = response.json()
            print(f"[{count}] Alert Sent! Prediction: {res_data.get('label')}")
        else:
            print(f"Failed to inject: {response.status_code}")
        
        count += 1
        time.sleep(0.5) # Send 2 alerts per second to fill up the dashboard

except json.JSONDecodeError:
    print("Error: Could not parse JSON from generate_payload.py. Output was:")
    print(result.stdout)
except KeyboardInterrupt:
    print("\n Injection stopped safely.")