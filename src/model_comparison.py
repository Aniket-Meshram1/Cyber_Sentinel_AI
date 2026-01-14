import os
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

def evaluate_model(model, X_test, y_test, model_name):
    y_pred = model.predict(X_test)

    return {
        "Model": model_name,
        "Accuracy": accuracy_score(y_test, y_pred),
        "Precision": precision_score(y_test, y_pred, zero_division=0),
        "Recall": recall_score(y_test, y_pred, zero_division=0),
        "F1-Score": f1_score(y_test, y_pred, zero_division=0)
    }


def save_comparison_table(results, output_dir="reports"):
    os.makedirs(output_dir, exist_ok=True)

    df = pd.DataFrame(results)
    csv_path = os.path.join(output_dir, "model_comparison.csv")
    df.to_csv(csv_path, index=False)

    print(f"Comparison table saved at: {csv_path}")
    return df


def plot_bar_chart(df, metric="F1-Score", output_dir="reports"):
    os.makedirs(output_dir, exist_ok=True)

    plt.figure(figsize=(8, 5))
    plt.bar(df["Model"], df[metric], color="steelblue")
    plt.title(f"Model Comparison based on {metric}")
    plt.ylabel(metric)
    plt.xlabel("Model")
    plt.xticks(rotation=15)
    plt.tight_layout()

    plot_path = os.path.join(output_dir, f"{metric.lower()}_comparison.png")
    plt.savefig(plot_path)
    plt.close()

    print(f"Bar chart saved at: {plot_path}")
