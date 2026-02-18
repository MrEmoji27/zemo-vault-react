# ============================================================
# Experiment 2: Study of Python Basic Libraries
#               (Statistics, Math, Numpy, Scipy)
# ============================================================
# Prerequisites:
#   - Python 3.4 or later
#
# Libraries Required:
#   - statistics (built-in, no installation needed)
#   - math       (built-in, no installation needed)
#   - numpy      → pip install numpy
#   - scipy      → pip install scipy
#
# Install all external libraries at once:
#   $ pip install numpy scipy
#
# How to Run:
#   $ python3 Stat_Lib.py
# ============================================================

import statistics
# Input data from user
data=input("Enter data separated by comma:")
data=[int(x) for x in data.split(',')]
# Compute Mean
mean=statistics.mean(data)
# Compute Median
median=statistics.median(data)
# Compute Mode
mode=statistics.mode(data)
# Compute Standard Deviation
std_dev=statistics.stdev(data)
# Compute Variance
variance=statistics.variance(data)
# Output results
print(f"Mean={mean}")
print(f"Median={median}")
print(f"Mode={mode}")
print(f"Standard Deviation={std_dev}")
print(f"Variance={variance}")
