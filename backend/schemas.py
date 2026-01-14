REQUIRED_FEATURES = [
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets"
]

def validate_input(data):
    missing = [f for f in REQUIRED_FEATURES if f not in data]
    return missing
