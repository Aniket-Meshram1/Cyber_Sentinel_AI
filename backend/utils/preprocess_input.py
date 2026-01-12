import pandas as pd

def preprocess_input(data, expected_columns=None):
    """
    Preprocesses input data (dict or list of dicts) for prediction.
    Ensures columns match the model's expected features.
    """
    # Convert dictionary to DataFrame
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    elif isinstance(data, list):
        df = pd.DataFrame(data)
    else:
        raise ValueError("Input must be a dictionary or a list of dictionaries.")

    # Clean column names (strip whitespace)
    df.columns = df.columns.str.strip()

    # Align columns with model expectations
    if expected_columns is not None:
        # Add missing columns with 0
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0
        
        # Reorder and select only expected columns
        df = df[expected_columns]
    
    return df