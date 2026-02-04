from src.train1 import load_data, split_data, get_models, save_model
from src.model_comparison import evaluate_model, save_comparison_table, plot_bar_chart
from src.evaluation_plots import plot_roc_auc, plot_confusion_matrix

import os

def main():

    # Ensure output directories exist
    os.makedirs("reports", exist_ok=True)
    os.makedirs("plots", exist_ok=True)

    # Load processed data
    try:
        df = load_data()
    except FileNotFoundError:
        print("Processed data not found. Run preprocessing first.")
        return

    # Split data
    X_train, X_test, y_train, y_test = split_data(df)

    # Load models
    models = get_models()
    feature_names = list(X_train.columns)
    comparison_results = []

    # Train, Evaluate, Save
    for name, model in models.items():
        print(f"\n Training {name}...")

        model.fit(X_train, y_train)

        # Save trained model + metadata
        save_model(model, name, feature_names)

        # Evaluation metrics
        metrics = evaluate_model(model, X_test, y_test, name)
        comparison_results.append(metrics)

        # ROC–AUC Curve
        plot_roc_auc(model, X_test, y_test, model_name=name)

        # Confusion Matrix
        plot_confusion_matrix(model, X_test, y_test, model_name=name)

    # Comparison table + plots
    if comparison_results:
        df_results = save_comparison_table(comparison_results)

        print("\n Model Comparison Summary")
        print(df_results)

        plot_bar_chart(df_results, metric="Accuracy")
        plot_bar_chart(df_results, metric="F1-Score")

    print("\n Training & Evaluation Pipeline Completed Successfully")

if __name__ == "__main__":
    main()
