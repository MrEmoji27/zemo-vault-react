# Input Graph
graph = {
    'A' : ['B','C'],
    'B' : ['A','C','D'],
    'C' : ['A','B','E'],
    'D' : ['B','E'],
    'E' : ['C','D']
}

# Set used to store visited nodes.
visitedNodes = list()

# function
def dfs(visitedNodes, graph, node):
    if node not in visitedNodes:
        print (node,end=" ")
        visitedNodes.append(node)
        for neighbour in graph[node]:
            dfs(visitedNodes, graph, neighbour)

# Driver Code
snode = input("Enter Starting Node(A, B, C, D, or E) :").upper()

# calling bfs function
print("RESULT :")
print("-"*20)
dfs(visitedNodes, graph, snode)
