# ============================================================
# Experiment 10: Mini Project - Performance Analysis of
#                Classification Algorithms on Iris Dataset
# ============================================================
# Prerequisites:
#   - Python 3.x
#
# Libraries Required:
#   - numpy        → pip install numpy
#   - pandas       → pip install pandas
#   - scikit-learn → pip install scikit-learn
#
# Install all libraries at once:
#   $ pip install scikit-learn numpy pandas
#
# Dataset:
#   - Uses the built-in Iris dataset from sklearn
#     (no external CSV file needed)
#
# Models Used:
#   - Logistic Regression
#   - Decision Tree
#   - K-Nearest Neighbors
#   - Support Vector Machine (SVM)
#   - Random Forest
#
# How to Run:
#   $ python3 mini_project.py
# ============================================================

import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
# Load dataset
iris = load_iris()
X = iris.data
y = iris.target
# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
# Feature scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
# Define models
models = {
    "Logistic Regression": LogisticRegression(),
    "Decision Tree": DecisionTreeClassifier(),
    "K-Nearest Neighbors": KNeighborsClassifier(),
    "Support Vector Machine": SVC(),
    "Random Forest": RandomForestClassifier()
}
# Train, Predict, and Evaluate
for name, model in models.items():
    print(f"\nModel: {name}")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
    print("Classification Report:\n", classification_report(y_test, y_pred))
