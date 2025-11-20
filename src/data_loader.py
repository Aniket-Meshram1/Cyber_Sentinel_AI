import pandas as pd
import os

def load_csv(file_path: str) -> pd.DataFrame:
    """Loads a CSV file into a pandas DataFrame."""
    return pd.read_csv(file_path)

def load_all_data(raw_data_path: str) -> pd.DataFrame:
    """Load and combine all CSV files in the raw dataset folder."""
    dfs = []
    for file in os.listdir(raw_data_path):
        if file.endswith(".csv"):
            file_path = os.path.join(raw_data_path, file)
            print(f"Loading {file} ...")
            dfs.append(pd.read_csv(file_path))
    combined_df = pd.concat(dfs, ignore_index=True)
    print(f"Combined dataset shape: {combined_df.shape}")
    return combined_df
