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
