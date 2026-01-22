import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    roc_curve,
    auc,
    confusion_matrix,
    RocCurveDisplay
)

# Output directory
PLOTS_DIR = os.path.join("results", "plots")
os.makedirs(PLOTS_DIR, exist_ok=True)


def plot_roc_auc(model, X_test, y_test, model_name):
    """
    Save ROC-AUC curve
    """
    y_proba = model.predict_proba(X_test)[:, 1]

    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.4f}")
    plt.plot([0, 1], [0, 1], linestyle="--", color="gray")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"ROC-AUC Curve ({model_name})")
    plt.legend(loc="lower right")

    path = os.path.join(PLOTS_DIR, f"roc_auc_{model_name}.png")
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()

    return roc_auc


def plot_confusion_matrix(model, X_test, y_test, model_name):
    """
    Save Confusion Matrix plot
    """
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)

    plt.figure(figsize=(5, 4))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=["Normal", "DDoS"],
        yticklabels=["Normal", "DDoS"]
    )

    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title(f"Confusion Matrix ({model_name})")

    path = os.path.join(PLOTS_DIR, f"confusion_matrix_{model_name}.png")
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close()
