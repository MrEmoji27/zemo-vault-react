# jug1 and jug2 contain the value
jug1, jug2, goal = 4, 3, 2

# Initialize a 2D list for visited states
# The list will have dimensions (jug1+1) x (jug2+1) to cover all possible states
visited = [[False for _ in range(jug2 + 1)] for _ in range(jug1 + 1)]

def waterJug(vol1, vol2):
    # Check if we reached the goal state
    if (vol1 == goal and vol2 == 0) or (vol2 == goal and vol1 == 0):
        print(vol1,"\t", vol2)
        print("Solution Found")
        return True
    
    # If this state has been visited, return False
    if visited[vol1][vol2]:
        return False
    
    # Mark this state as visited
    visited[vol1][vol2] = True
    
    # Print the current state
    print(vol1,"\t", vol2)
    
    # Try all possible moves:
    return (
        waterJug(0, vol2) or  # Empty jug1
        waterJug(vol1, 0) or  # Empty jug2
        waterJug(jug1, vol2) or  # Fill jug1
        waterJug(vol1, jug2) or  # Fill jug2
        waterJug(vol1 + min(vol2, (jug1 - vol1)), vol2 - min(vol2, (jug1 - vol1))) or  # Pour water from jug2 to jug1
        waterJug(vol1 - min(vol1, (jug2 - vol2)), vol2 + min(vol1, (jug2 - vol2)))  # Pour water from jug1 to jug2
    )

print("Steps: ")
print("Jug1 \t Jug2 ")
print("----- \t ------")
waterJug(0, 0)
