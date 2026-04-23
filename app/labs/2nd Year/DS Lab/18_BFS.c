#include<stdio.h>

// creating queue data structure using arrays
int queue[10];

// defining pointers of the queue to perform pop and push
int front=0,back=0;

// defining push operation on the queue
void push(int var)
{
    queue[back] = var;
    back++;
}

// defining pop operation on queue
void pop()
{
    queue[front] = 0;
    front++;
}

// creating a visited array to keep the track of visited nodes
int visited[7] = {0};

int main()
{
    int v,n,i,j;
    // adjacenty matrix representing graph
    int graph[10][10];
    printf("Enter the number of vertices: ");
    scanf("%d", &n);
    printf("Enter graph data in matrix form:    \n");
    for (i = 0; i < n; i++)
        for (j = 0; j < n; j++)
            scanf("%d", &graph[i][j]);

    // adding a starting node in the list 
    printf("Enter the starting vertex: ");
    scanf("%d", &v);
    push(v);
    while(front != back)
    {
        int current = queue[front];
        
        // printing current element 
        printf("%d ", current);
        
        // popping the front element from the queue
        pop();
 
        for(int i=0;i < 6;i++)
        {
            // adding non-visited connected nodes of the current node to the queue 
            if((graph[current-1][i] == 1) && (visited[i] == 0))
            {
                visited[i] = 1; // marking visisted
                push(i+1);
            }
        }
    }
    return 0;
}