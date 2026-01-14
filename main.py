from src.train1 import load_data, split_data, get_models, save_model
from src.model_comparison import evaluate_model, save_comparison_table, plot_bar_chart
import pandas as pd
import os

def main():
    # 1. Load Processed Data
    # Uses the path defined in src/train1.py (data/processed/cicddos2019_processed.csv)
    try:
        df = load_data()
    except FileNotFoundError:
        print("Error: Processed data not found. Please run the preprocessing script first.")
        return

    # 2. Split Data
    X_train, X_test, y_train, y_test = split_data(df)
    
    # 3. Get Models
    models = get_models()
    feature_names = list(X_train.columns)
    comparison_results = []

    # 4. Train, Evaluate, and Save
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        
        # Save Model
        save_model(model, name, feature_names)
        
        # Evaluate
        metrics = evaluate_model(model, X_test, y_test, name)
        comparison_results.append(metrics)

    # 5. Generate Comparison Reports
    if comparison_results:
        df_results = save_comparison_table(comparison_results)
        plot_bar_chart(df_results, metric="Accuracy")
        plot_bar_chart(df_results, metric="F1-Score")

if __name__ == "__main__":
    main()
