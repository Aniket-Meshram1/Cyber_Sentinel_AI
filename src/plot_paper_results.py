import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Settings for research paper quality plots
plt.rcParams.update({
    'font.size': 12,
    'font.family': 'serif',
    'figure.dpi': 300
})

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_PATH = os.path.join(BASE_DIR, "reports", "model_comparison.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "reports", "figures")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def plot_comparison_for_paper():
    if not os.path.exists(REPORT_PATH):
        print(f"Error: {REPORT_PATH} not found. Run main.py first.")
        return

    df = pd.read_csv(REPORT_PATH)
    
    # Melt the dataframe for Seaborn (Format: Model | Metric | Score)
    df_melted = df.melt(id_vars="Model", var_name="Metric", value_name="Score")

    # 1. Create a Zoomed-In Bar Chart
    plt.figure(figsize=(10, 6))
    
    # Create bar plot
    ax = sns.barplot(data=df_melted, x="Metric", y="Score", hue="Model", palette="viridis")
    
    # ZOOM IN: Find the lowest score to set the bottom limit intelligently
    min_score = df_melted["Score"].min()
    lower_limit = max(0, min_score - 0.002) # Start slightly below the lowest score
    
    plt.ylim(lower_limit, 1.0005) # Zoom in on the top range
    plt.title("Model Performance Comparison (Zoomed View)", fontweight='bold')
    plt.ylabel("Score")
    plt.xlabel("Evaluation Metric")
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left', title="Models")
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # Add value labels on top of bars
    for container in ax.containers:
        ax.bar_label(container, fmt='%.4f', padding=3, fontsize=8, rotation=90)

    plt.tight_layout()
    
    # Save
    save_path = os.path.join(OUTPUT_DIR, "model_comparison_paper.png")
    plt.savefig(save_path)
    print(f"✅ Saved high-res plot to: {save_path}")
    plt.show()

    # 2. Generate LaTeX Table (Optional for Paper)
    latex_code = df.to_latex(index=False, float_format="%.4f")
    with open(os.path.join(OUTPUT_DIR, "results_table.tex"), "w") as f:
        f.write(latex_code)
    print(f"✅ Saved LaTeX table to: {os.path.join(OUTPUT_DIR, 'results_table.tex')}")

if __name__ == "__main__":
    plot_comparison_for_paper()