# src/visualize_results.py

import pandas as pd
import matplotlib.pyplot as plt
import os

# Path to your predicted file
predicted_file = os.path.join("data", "raw", "sample_test_with_predictions.csv")

# Load predictions
df = pd.read_csv(predicted_file)

# Check column name (make sure it matches your predict.py output)
if "Prediction" not in df.columns:
    raise ValueError("❌ No 'Prediction' column found! Run predict.py first.")

# Count the occurrences of each class
counts = df["Prediction"].value_counts()

# 1️⃣ Bar Chart — Attack vs Benign
plt.figure(figsize=(6, 4))
counts.plot(kind="bar")
plt.title("DDoS Attack vs Benign Traffic Predictions")
plt.xlabel("Class (0 = Benign, 1 = Attack)")
plt.ylabel("Number of Records")
plt.grid(axis="y")
plt.tight_layout()
plt.show()

# 2️⃣ Pie Chart — Attack vs Benign
plt.figure(figsize=(5, 5))
counts.plot(kind="pie", autopct='%1.1f%%', startangle=90)
plt.title("Prediction Distribution")
plt.ylabel("")  # Hide y-label
plt.show()

