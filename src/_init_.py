import pandas as pd

# Load one of your raw files
df = pd.read_csv("data/raw/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv")

# Take 100 random rows for testing
df_sample = df.sample(100, random_state=42)

# Save sample file
df_sample.to_csv("data/raw/sample_test.csv", index=False)

print("✅ Sample test data saved at data/raw/sample_test.csv")
