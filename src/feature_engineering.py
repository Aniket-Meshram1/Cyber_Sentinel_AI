from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.decomposition import PCA

def select_features(X, y, k=20):
    """Select top k features based on ANOVA F-value."""
    selector = SelectKBest(f_classif, k=k)
    X_new = selector.fit_transform(X, y)
    return X_new, selector

def apply_pca(X, n_components=10):
    """Apply PCA for dimensionality reduction."""
    pca = PCA(n_components=n_components)
    X_pca = pca.fit_transform(X)
    return X_pca, pca
