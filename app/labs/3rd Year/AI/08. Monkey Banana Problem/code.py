def monkey_banana_problem():
    # Initial state
    initial_state = ('Far-Chair', 'Chair-Not-Under-Banana', 'Off-Chair', 'Empty')
    # (Monkey's Location, Monkey's Position on Chair, Chair's Location, Monkey's Status)
    
    print(f"\n Initial state is {initial_state}")
    
    goal_state = ('Near-Chair', 'Chair-Under-Banana', 'On-Chair', 'Holding')
    # The goal state when the monkey has the banana
    
    # Possible actions and their effects
    actions = {
        "Move to Chair": lambda state: ('Near-Chair', state[1], state[2], state[3]) if state[0] != 'Near-Chair' else None,
        "Push Chair under Banana": lambda state: ('Near-Chair', 'Chair-Under-Banana', state[2], state[3]) if state[0] == 'Near-Chair' and state[1] != 'Chair-Under-Banana' else None,
        "Climb Chair": lambda state: ('Near-Chair', 'Chair-Under-Banana', 'On-Chair', state[3]) if state[0] == 'Near-Chair' and state[1] == 'Chair-Under-Banana' and state[2] != 'On-Chair' else None,
        "Grasp Banana": lambda state: ('Near-Chair', 'Chair-Under-Banana', 'On-Chair', 'Holding') if state[0] == 'Near-Chair' and state[1] == 'Chair-Under-Banana' and state[2] == 'On-Chair' and state[3] !='Holding' else None
    }
    
    # BFS to explore states
    from collections import deque
    dq = deque([(initial_state, [])])  # Each element is (current_state, actions_taken)
    visited = set()
    
    while dq:
        current_state, actions_taken = dq.popleft()
        
        # Check if we've reached the goal
        if current_state == goal_state:
            print("\nSolution Found!")
            print("Actions to achieve goal:")
            for action in actions_taken:
                print(action)
            print(f"Final State: {current_state}")
            return
        
        # Mark the current state as visited
        if current_state in visited:
            continue
        visited.add(current_state)
        
        # Try all possible actions
        for action_name, action_func in actions.items():
            next_state = action_func(current_state)
            if next_state and (next_state not in visited):
                dq.append((next_state, actions_taken + [f"Action: {action_name}, Resulting State: {next_state}"]))
    
    print("No solution found.")

# Run the program
monkey_banana_problem()
