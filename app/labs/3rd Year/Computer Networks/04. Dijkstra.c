#include <stdio.h>
#include <limits.h>
#define MAX 100

void dijkstra(int graph[MAX][MAX], int numVertices, int src) {
    int dist[MAX];
    int visited[MAX];
    int parent[MAX];

    for (int i = 0; i < numVertices; i++) {
        dist[i] = INT_MAX;
        visited[i] = 0;
        parent[i] = -1;
    }

    dist[src] = 0;

    for (int count = 0; count < numVertices - 1; count++) {
        int u = -1;
        int min = INT_MAX;

        for (int v = 0; v < numVertices; v++) {
            if (!visited[v] && dist[v] <= min) {
                min = dist[v];
                u = v;
            }
        }
        
        if (u == -1) break;

        visited[u] = 1;

        for (int v = 0; v < numVertices; v++) {
            if (!visited[v] && graph[u][v] && dist[u] != INT_MAX
                && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
                parent[v] = u;
            }
        }
    }

    printf("Vertex \tDistance from Source \tPath\\n");
    for (int i = 0; i < numVertices; i++) {
        printf("\\n%d \t\t %d \t\t", i, dist[i]);
        
        int j = i;
        while (j != -1) {
            printf("%d ", j);
            j = parent[j];
            if (j != -1) {
                printf("<- ");
            }
        }
    }
    printf("\\n");
}

int main() {
    int numVertices;
    printf("Enter the number of vertices: ");
    scanf("%d", &numVertices);

    int graph[MAX][MAX];
    printf("Enter the adjacency matrix:\\n");
    for (int i = 0; i < numVertices; i++) {
        for (int j = 0; j < numVertices; j++) {
            scanf("%d", &graph[i][j]);
        }
    }

    int src;
    printf("Enter the source vertex: ");
    scanf("%d", &src);

    if (src < 0 || src >= numVertices) {
        printf("Invalid source vertex.\\n");
        return 1;
    }

    dijkstra(graph, numVertices, src);
    return 0;
}
