# ============================================================
# Experiment 6: Decision Tree using sklearn
# ============================================================
# Prerequisites:
#   - Python 3.x
#
# Libraries Required:
#   - scikit-learn → pip install scikit-learn
#   - matplotlib   → pip install matplotlib
#
# Install all libraries at once:
#   $ pip install scikit-learn matplotlib
#
# Dataset:
#   - Uses the built-in Iris dataset from sklearn
#     (no external CSV file needed)
#
# How to Run:
#   $ python3 Dtree.py
# ============================================================

# Importing required libraries
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report
import matplotlib.pyplot as plt
from sklearn import tree
# Load the Iris dataset
iris = load_iris()
X = iris.data # Features
y = iris.target # Target labels
# Split the dataset into training and testing sets (90% train, 10% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
# Initialize the Decision Tree classifier with some tuning parameters
clf = DecisionTreeClassifier(max_depth=2, min_samples_split=2, min_samples_leaf=1, random_state=42)
# Fit the classifier on the training data
clf.fit(X_train, y_train)
# Make predictions on the test set
y_pred = clf.predict(X_test)
# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy:.2f}')
# Print classification report
print('Classification Report:')
print(classification_report(y_test, y_pred, target_names=iris.target_names))
# Visualize the Decision Tree
plt.figure(figsize=(10, 8))
tree.plot_tree(clf, filled=True, feature_names=iris.feature_names,class_names=iris.target_names, rounded=True)
plt.title("Decision Tree Visualization")
plt.show()
