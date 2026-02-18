# ============================================================
# Experiment 9: K-Means Clustering
# ============================================================
# Prerequisites:
#   - Python 3.x
#
# Libraries Required:
#   - numpy        → pip install numpy
#   - matplotlib   → pip install matplotlib
#   - scikit-learn → pip install scikit-learn
#
# Install all libraries at once:
#   $ pip install scikit-learn numpy matplotlib
#
# Dataset:
#   - Uses sklearn's make_blobs to generate synthetic data
#     (no external CSV file needed)
#
# How to Run:
#   $ python3 kmeans.py
# ============================================================

#Necessary Libraries
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
#Generate Data
X, _ = make_blobs(n_samples = 300, centers = 4 , cluster_std = 0.60,random_state = 0)
#Plot the data points
plt.scatter(X[:,0],X[:,1])
plt.title("Data Points")
plt.show()
#KMeans clustering
kmeans = KMeans(n_clusters = 4)
kmeans.fit(X)
#Getting the cluster centers and labels
centers = kmeans.cluster_centers_
labels = kmeans.labels_
#Plot the clustered data
plt.scatter(X[:,0],X[:,1],c = labels)
plt.scatter(centers[:,0],centers[:,1],alpha = 0.75,s=200,color = 'red')
plt.title("Clustered Data")
plt.show()
