import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
# Step 1: Load the dataset
data = pd.read_csv("study_hours.csv")
X = data[['Study Hours']].values
y = data['Exam Result'].values
# Step 2: Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)
# Step 3: Train logistic regression model
model = LogisticRegression()
model.fit(X_train, y_train)
# Step 4: Predict and evaluate
y_pred = model.predict(X_test)
# Step 5: Print results
print(f"Accuracy: {accuracy_score(y_test, y_pred):.1f}")
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
# Step 6: Plotting decision boundary
X_range = np.linspace(X.min() - 1, X.max() + 1, 300).reshape(-1, 1)
y_prob = model.predict_proba(X_range)[:, 1]
plt.figure(figsize=(8, 6))
plt.scatter(X_train, y_train, color='blue', label='Training Data')
plt.scatter(X_test, y_test, color='green', marker='x', s=100, label='Testing Data')
plt.plot(X_range, y_prob, color='red', linewidth=2, label='Decision Boundary')
plt.xlabel("Study Hours")
plt.ylabel("Exam Result")
plt.title("Logistic Regression - Study Hours vs Exam Result")
plt.legend()
plt.grid(True)
plt.show()
