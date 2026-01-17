#include <stdio.h>
#include <stdlib.h>

#define MAX 100

typedef struct {
    int data[MAX];
    int front, rear;
} Queue;

void initQueue(Queue *q) {
    q->front = q->rear = -1;
}

int isEmpty(Queue *q) {
    return q->front == -1;
}

void enqueue(Queue *q, int val) {
    if (q->rear == MAX - 1) return;
    if (q->front == -1) q->front = 0;
    q->data[++q->rear] = val;
}

int dequeue(Queue *q) {
    if (isEmpty(q)) return -1;
    int val = q->data[q->front];
    if (q->front == q->rear) q->front = q->rear = -1;
    else q->front++;
    return val;
}

void bfs(int graph[MAX][MAX], int n, int start, int parent[]) {
    int visited[MAX] = {0};
    Queue q;
    initQueue(&q);
    visited[start] = 1;
    enqueue(&q, start);
    parent[start] = -1;

    while (!isEmpty(&q)) {
        int u = dequeue(&q);
        for (int v = 0; v < n; v++) {
            if (graph[u][v] && !visited[v]) {
                visited[v] = 1;
                parent[v] = u;
                enqueue(&q, v);
            }
        }
    }
}

void printBroadcastTree(int parent[], int n) {
    printf("Broadcast Tree:\\n");
    for (int i = 0; i < n; i++) {
        if (parent[i] != -1) {
            printf("%d -> %d\\n", parent[i], i);
        }
    }
}

int main() {
    int n, graph[MAX][MAX];
    printf("Enter number of nodes: ");
    scanf("%d", &n);

    printf("Enter adjacency matrix:\\n");
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            scanf("%d", &graph[i][j]);
        }
    }

    int start;
    printf("Enter starting node: ");
    scanf("%d", &start);

    int parent[MAX];
    bfs(graph, n, start, parent);
    printBroadcastTree(parent, n);

    return 0;
}
