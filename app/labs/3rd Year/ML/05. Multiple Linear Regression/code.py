# ============================================================
# Experiment 5: Multiple Linear Regression
#               (House Price Prediction)
# ============================================================
# Prerequisites:
#   - Python 3.x
#
# Libraries Required:
#   - pandas       → pip install pandas
#   - numpy        → pip install numpy
#   - matplotlib   → pip install matplotlib
#   - scikit-learn → pip install scikit-learn
#
# Install all libraries at once:
#   $ pip install scikit-learn pandas numpy matplotlib
#
# CSV File Required:
#   - house_data.csv (must be in the same directory)
#   - Download: https://studyglance.in/labprograms/r22ml/house_data.csv
#   - Format:
#       price,area,bedrooms,floors,age
#       4500000,1500,3,2,5
#       7000000,2500,4,3,4
#       ...
#
# How to Run:
#   $ python3 Multiple_Linear_Regression.py
# ============================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from matplotlib.ticker import FuncFormatter
data = pd.read_csv('house_data.csv')
X = data.drop('price', axis=1)
y = data['price']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,random_state=42)
model = LinearRegression().fit(X_train, y_train)
y_pred = model.predict(X_test)
print(f"Mean Squared Error: {mean_squared_error(y_test, y_pred):.2f}")
print(f"R^2 Score: {r2_score(y_test, y_pred):.2f}")
print(f"Model Coefficients: {model.coef_}")
print(f"Model Intercept: {model.intercept_}")
area = float(input("Enter area (sq ft): "))
bedrooms = int(input("Enter number of bedrooms: "))
floors = int(input("Enter number of floors: "))
age = int(input("Enter age of the house: "))
input_data = pd.DataFrame([[area, bedrooms, floors, age]], columns=['area', 'bedrooms', 'floors', 'age'])
input_data_encoded = input_data.reindex(columns=X.columns, fill_value=0)
predicted_price = model.predict(input_data_encoded)
print(f"Predicted price for the house: {predicted_price[0]:,.2f}")
plt.figure(figsize=(12, 8))
plt.scatter(y_test, y_pred, alpha=0.7, label="Predicted Prices", color='blue', marker='o')
plt.plot([0, max(y_test)], [0, max(y_test)], color='red', linestyle='--', label="Prediction Line")
plt.xlabel("Actual Prices")
plt.ylabel("Predicted Prices")
plt.title("Actual vs Predicted House Prices")
formatter = FuncFormatter(lambda x, pos: f'{int(x):,}')
plt.gca().xaxis.set_major_formatter(formatter)
plt.gca().yaxis.set_major_formatter(formatter)
plt.legend()
plt.xlim(0, max(y_test) * 1.1)
plt.ylim(0, max(y_pred) * 1.1)
plt.grid(True)
plt.show()
