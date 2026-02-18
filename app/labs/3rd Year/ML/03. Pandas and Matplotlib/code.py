import pandas
df=pandas.read_csv('students.csv')
print(df)
print(df.loc[[0,1]])
print(df.head())
print(df.tail())
print(df.isnull())
print(df.info())
