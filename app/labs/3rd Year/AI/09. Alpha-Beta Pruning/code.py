"""
Alpha Beta Pruning :
-------------------
depth (int): Current depth in the game tree.
node_index (int): Index of the current node in the values array.
maximizing_player (bool): True if the current player is maximizing, False otherwise.
values (list): List of leaf node values.
alpha (float): Best value for the maximizing player.
beta (float): Best value for the minimizing player.
Returns:
    int: The optimal value for the current player.
"""

import math

def alpha_beta_pruning(depth, node_index, maximizing_player, values, alpha, beta):
    # Base case: leaf node
    if depth == 0 or node_index >= len(values):
        return values[node_index]
    
    if maximizing_player:
        max_eval = -math.inf
        for i in range(2):  # Each node has two children
            eval = alpha_beta_pruning(depth - 1, node_index * 2 + i, False, values, alpha, beta)
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break  # Beta cutoff
        return max_eval
    else:
        min_eval = math.inf
        for i in range(2):  # Each node has two children
            eval = alpha_beta_pruning(depth - 1, node_index * 2 + i, True, values, alpha, beta)
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break  # Alpha cutoff
        return min_eval

# Example usage
if __name__ == "__main__":
    # Leaf node values for a complete binary tree
    values = [3, 5, 6, 9, 1, 2, 0, -1]
    depth = 3  # Height of the tree
    optimal_value = alpha_beta_pruning(depth, 0, True, values, -math.inf, math.inf)
    print(f"The optimal value is: {optimal_value}")
