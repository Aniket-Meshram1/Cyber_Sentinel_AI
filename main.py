import pandas as pd
import os

# Path to your dataset folder (update if needed)
DATA_PATH = os.path.join("data", "raw")

def load_sample_file():
    # Just pick one CSV file from your dataset folder
    sample_file = os.path.join(DATA_PATH, "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv")  # change to any file you have
    if not os.path.exists(sample_file):
        raise FileNotFoundError(f"File not found: {sample_file}")

    print(f"Loading dataset: {sample_file}")
    df = pd.read_csv(sample_file)

    # Print basic info
    print("\n--- Dataset Info ---")
    print(df.info())
    print("\n--- First 5 Rows ---")
    print(df.head())

    # Print class distribution if 'Label' column exists
    if "Label" in df.columns:
        print("\n--- Class Distribution ---")
        print(df["Label"].value_counts())

    return df

if __name__ == "__main__":
    load_sample_file()
