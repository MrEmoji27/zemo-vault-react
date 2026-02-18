# ============================================================
# Experiment 3: Study of Python Libraries for ML
#               (Pandas and Matplotlib)
# ============================================================
# Prerequisites:
#   - Python 3.x
#
# Libraries Required:
#   - pandas     → pip install pandas
#   - matplotlib → pip install matplotlib
#
# Install all libraries at once:
#   $ pip install pandas matplotlib
#
# CSV File Required:
#   - students.csv (must be in the same directory)
#   - Download: https://studyglance.in/labprograms/r22ml/students.csv
#   - Format:
#       Student_NO,Name,Branch,Year,Contact_NO
#       1201,Raghu,IT,III,1234
#       ...
#
# How to Run:
#   $ python3 Pandas_Lib.py
# ============================================================

import pandas
df=pandas.read_csv('students.csv')
print(df)
print(df.loc[[0,1]])
print(df.head())
print(df.tail())
print(df.isnull())
print(df.info())
