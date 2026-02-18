# ============================================================
# Experiment 1: Understanding Basic Statistics
# ============================================================
# Prerequisites:
#   - Python 3.4 or later
#
# Libraries Required:
#   - None (uses only built-in Python functions)
#
# How to Run:
#   $ python3 Stat_Measures.py
# ============================================================

# Prompt user to enter data
user_input = input("Enter numbers separated by commas: ")
# Convert the input string to a list of integers
numbers = [int(num) for num in user_input.split(',')]
# Calculate the number of elements
count = len(numbers)
# Calculate the mean (average)
sum_of_numbers = sum(numbers)
mean_value = sum_of_numbers / count
# Sort the list for median calculation
sorted_numbers = sorted(numbers)
# Calculate the median
if count % 2 == 0:
    median_value = (sorted_numbers[count // 2 - 1] + sorted_numbers[count // 2]) / 2
else:
    median_value = sorted_numbers[count // 2]
# Calculate the mode
frequency_dict = {}
highest_frequency = 0
for num in numbers:
    if num in frequency_dict:
        frequency_dict[num] += 1
    else:
        frequency_dict[num] = 1
    if frequency_dict[num] > highest_frequency:
        highest_frequency = frequency_dict[num]
# Get all numbers with the highest frequency
modes = [num for num, freq in frequency_dict.items() if freq == highest_frequency]
# Calculate variance
squared_diff_sum = sum((num - mean_value) ** 2 for num in numbers)
variance_value = squared_diff_sum / count
# Calculate standard deviation
std_deviation = variance_value ** 0.5
# Display results
print(f"Mean = {mean_value}")
print(f"Median = {median_value}")
print(f"Mode = {modes if len(modes) < count else 'No mode (all values are unique)'}")
print(f"Variance = {variance_value}")
print(f"Standard Deviation = {std_deviation}")
