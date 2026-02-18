export const thirdYear = {
    "Computer Networks": {
        "exp1": {
            title: "1. Data Link Layer Framing",
            parts: [
                {
                    subtitle: "Character Stuffing",
                    code: `#include <stdio.h>
#include <string.h>

int main()
{
    int i = 0, j = 0, n, pos;
    char a[20], b[50], ch;

    printf("enter string\\n");
    scanf("%s", a);
    n = strlen(a);

    printf("enter position\\n");
    scanf("%d", &pos);

    while (pos > n || pos <= 0)
    {
        printf("invalid position, Enter again : ");
        scanf("%d", &pos);
    }

    printf("enter the character\\n");
    scanf(" %c", &ch);

    b[0] = 'd';
    b[1] = 'l';
    b[2] = 'e';
    b[3] = 's';
    b[4] = 't';
    b[5] = 'x';
    j = 6;

    while (i < n)
    {
        if (i == pos - 1)
        {
            b[j]   = 'd';
            b[j+1] = 'l';
            b[j+2] = 'e';
            b[j+3] = ch;
            b[j+4] = 'd';
            b[j+5] = 'l';
            b[j+6] = 'e';
            j = j + 7;
        }

        if (a[i] == 'd' && a[i+1] == 'l' && a[i+2] == 'e')
        {
            b[j]   = 'd';
            b[j+1] = 'l';
            b[j+2] = 'e';
            j = j + 3;
        }

        b[j] = a[i];
        i++;
        j++;
    }

    b[j]   = 'd';
    b[j+1] = 'l';
    b[j+2] = 'e';
    b[j+3] = 'e';
    b[j+4] = 't';
    b[j+5] = 'x';
    b[j+6] = '\\0';

    printf("\\nframe after stuffing:\\n");
    printf("%s", b);

    return 0;
}`,
                    output: `Enter string:
zemo
Enter position to stuff the character:
3
Enter the character to stuff:
x

String after character stuffing:
ze-dlex-dlemo`
                },
                {
                    subtitle: "Bit Stuffing",
                    code: `#include <stdio.h>
#include <string.h>

int main() {
    char data[100];
    char stuffed_data[200];
    int i, j, count;

    printf("Enter binary data: ");
    scanf("%s", data);

    i = 0; // Index for input data
    j = 0; // Index for stuffed_data
    count = 0; // To count consecutive 1s

    while(data[i] != '\\0') {
        stuffed_data[j] = data[i];
        if(data[i] == '1') {
            count++;
        } else {
            count = 0;
        }

        if(count == 5) {
            j++; // Move to next position
            stuffed_data[j] = '0'; // Stuff a '0'
            count = 0; // Reset the count
        }
        i++;
        j++;
    }
    stuffed_data[j] = '\\0'; // Null terminate the stuffed string

    printf("Original Data: %s\\n", data);
    printf("Stuffed Data:  01111110 %s 01111110\\n", stuffed_data);

    return 0;
}`,
                    output: `Enter binary data: 011011111111111111110110
Original Data: 011011111111111111110110
Stuffed Data:  01111110 01101111101111101111101111100110 01111110`
                }
            ]
        },
        "exp2": {
            title: "2. Cyclic Redundancy Check (CRC)",
            parts: [{
                code: `#include <stdio.h>
#include <math.h>

int gen[4], genl = 4, frl = 8, rem[4];

void calculateCRC(int fr[]);

int main() {
    int i, j, fr[8], dupfr[11], recfr[11], tlen, flag;

    printf("Enter frame: ");
    for(i = 0; i < frl; i++) {
        scanf("%d", &fr[i]);
        dupfr[i] = fr[i];
    }

    printf("Enter generator: ");
    for(i = 0; i < genl; i++) {
        scanf("%d", &gen[i]);
    }

    tlen = frl + genl - 1;
    for(i = frl; i < tlen; i++) {
        dupfr[i] = 0;
    }

    calculateCRC(dupfr);

    for(i = 0; i < frl; i++) {
        recfr[i] = fr[i];
    }

    for(i = frl, j = 1; i < tlen; i++, j++) {
        recfr[i] = rem[j];
    }

    calculateCRC(recfr);

    flag = 0;
    for(i = 0; i < genl; i++) {
        if(rem[i] != 0)
            flag++;
    }

    if(flag == 0) {
        printf("Frame received correctly.\\n");
    } else {
        printf("Error detected in received frame.\\n");
    }

    return 0;
}

void calculateCRC(int fr[]) {
    int k, k1, i, j;
    for(k = 0; k < frl; k++) {
        if(fr[k] == 1) {
            k1 = k;
            for(i = 0, j = k; i < genl; i++, j++) {
                rem[i] = fr[j] ^ gen[i];
            }
            for(i = 0; i < genl; i++) {
                fr[k1] = rem[i];
                k1++;
            }
        }
    }
}`,
                output: `Enter frame: 1 0 1 1 0 0 1 1
Enter generator: 1 0 1 1
Frame received correctly.`
            }]
        },
        "exp3": {
            title: "3. Sliding Window Protocols",
            parts: [
                {
                    subtitle: "Go-Back-N",
                    code: `#include <stdio.h>
int main()
{
    int windowsize, sent = 0, ack, i;
    printf("enter window size\\n");
    scanf("%d", &windowsize);
    while (1)
    {
        for (i = 0; i < windowsize; i++)
        {
            printf("Frame %d has been transmitted.\\n", sent);
            sent++;
            if (sent == windowsize)
                break;
        }
        printf("\\nPlease enter the last Acknowledgement received.\\n");
        scanf("%d", &ack);

        if (ack == windowsize)
            break;
        else
            sent = ack;
    }
    return 0;
}`,
                    output: `enter window size
4
Frame 0 has been transmitted.
Frame 1 has been transmitted.
Frame 2 has been transmitted.
Frame 3 has been transmitted.

Please enter the last Acknowledgement received.
2
Frame 2 has been transmitted.
Frame 3 has been transmitted.
Please enter the last Acknowledgement received.
4`
                },
                {
                    subtitle: "Selective Repeat",
                    code: `#include <stdio.h>

int main()
{
    int w, i, f, frames[50];

    printf("Enter Window Size : ");
    scanf("%d", &w);

    printf("\\nEnter the no. of frames to transmit : ");
    scanf("%d", &f);

    printf("\\nEnter %d frames : ", f);
    for (i = 0; i < f; i++)
    {
        scanf("%d", &frames[i]);
    }

    printf("\\nFrames will be sent in the following manner.\\n");
    printf("After sending %d frames at each stage, the sender gets an acknowledgment from the receiver.\\n\\n", w);

    for (i = 0; i < f; i++)
    {
        printf("%d ", frames[i]);

        if (((i + 1) % w) == 0 || i == (f - 1))
        {
            printf("\\nAcknowledgement of the above frames is received by the sender\\n\\n");
        }
    }

    return 0;
}`,
                    output: `Enter Window Size : 3
Enter the no. of frames to transmit : 5
Enter 5 frames : 10 20 30 40 50

Frames will be sent in the following manner.
After sending 3 frames at each stage, the sender gets an acknowledgment from the receiver.

10 20 30 
Acknowledgement of the above frames is received by the sender

40 50 
Acknowledgement of the above frames is received by the sender`
                }
            ]
        },
        "exp4": {
            title: "4. Dijkstra's Shortest Path Algorithm",
            graphData: [
                [0, 10, 15, 20, 5],
                [10, 0, 20, 25, 23],
                [20, 10, 0, 15, 25],
                [30, 10, 20, 0, 24],
                [15, 25, 35, 41, 0]
            ],
            parts: [{
                code: `#include <stdio.h>
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
}`,
                output: `Enter the number of vertices: 5
Enter the adjacency matrix:
0 10 15 20 5
10 0 20 25 23
20 10 0 15 25
30 10 20 0 24
15 25 35 41 0
Enter the source vertex: 0
Vertex Distance from Source Path
0 	 0 		 0
1 	 10 		 1 <- 0
2 	 15 		 2 <- 0
3 	 20 		 3 <- 0
4 	 5 		 4 <- 0`
            }]
        },
        "exp5": {
            title: "5. Broadcast Tree Program",
            parts: [{
                code: `#include <stdio.h>
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
}`,
                output: `Enter number of nodes: 4
Enter adjacency matrix:
0 1 1 0
1 0 1 1
1 1 0 0
0 1 0 0
Enter starting node: 0
Broadcast Tree:
0 -> 1
0 -> 2
1 -> 3`
            }]
        },
        "exp6": {
            title: "6. Distance Vector Routing Algorithm",
            parts: [{
                code: `#include <stdio.h>

struct node {
    unsigned dist[20];
    unsigned from[20];
} rt[10];

int main()
{
    int dmat[20][20];
    int n, i, j, k, count;

    printf("\\nEnter the number of nodes: ");
    scanf("%d", &n);

    printf("\\nEnter the cost matrix :\\n");
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            scanf("%d", &dmat[i][j]);
            dmat[i][i] = 0;
            rt[i].dist[j] = dmat[i][j];
            rt[i].from[j] = j;
        }
    }

    do {
        count = 0;
        for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                for (k = 0; k < n; k++) {
                    if (rt[i].dist[j] > dmat[i][k] + rt[k].dist[j]) {
                        rt[i].dist[j] = dmat[i][k] + rt[k].dist[j];
                        rt[i].from[j] = k;
                        count++;
                    }
                }
            }
        }
    } while (count != 0);

    for (i = 0; i < n; i++) {
        printf("\\n\\nState value for router %d is \\n", i + 1);
        for (j = 0; j < n; j++) {
            printf("\\t\\nnode %d via %d Distance%d", j + 1, rt[i].from[j] + 1, rt[i].dist[j]);
        }
    }
    printf("\\n\\n");
    return 0;
}`,
                output: `Enter the number of nodes: 4 Enter the cost matrix: 0 1 2 9 4 1 2 0 1 0 9 1 2 0 4 0 2 0 State value for router 1 is node 1 via 1 Distance0 node 2 via 4 Distance4 node 3 via 4 Distance5 node 4 via 4 Distance4 State value for router 2 is node 1 via 4 Distance4 node 2 via 2 Distance0 node 3 via 3 Distance1 node 4 via 4 Distance0 State value for router 3 is node 1 via 4 Distance4 node 2 via 4 Distance0 node 3 via 3 Distance0 node 4 via 4 Distance0 State value for router 4 is node 1 via 1 Distance4 node 2 via 2 Distance0 node 3 via 2 Distance1 node 4 via 4 Distance0`
            }]
        },
        "exp7": {
            title: "7. Data Encryption and Decryption",
            parts: [{
                code: `#include <stdio.h>
#include <ctype.h>

void encrypt(char text[], int key) {
    char ch;
    for (int i = 0; text[i] != '\\0'; ++i) {
        ch = text[i];
        if (isalnum(ch)) {
            if (islower(ch)) {
                ch = (ch - 'a' + key) % 26 + 'a';
            }
            if (isupper(ch)) {
                ch = (ch - 'A' + key) % 26 + 'A';
            }
            if (isdigit(ch)) {
                ch = (ch - '0' + key) % 10 + '0';
            }
        } else {
            printf("Invalid Message\\n");
            return;
        }
        text[i] = ch;
    }
    printf("Encrypted message: %s\\n", text);
}

void decrypt(char text[], int key) {
    char ch;
    for (int i = 0; text[i] != '\\0'; ++i) {
        ch = text[i];
        if (isalnum(ch)) {
            if (islower(ch)) {
                ch = (ch - 'a' - key + 26) % 26 + 'a';
            }
            if (isupper(ch)) {
                ch = (ch - 'A' - key + 26) % 26 + 'A';
            }
            if (isdigit(ch)) {
                ch = (ch - '0' - key + 10) % 10 + '0';
            }
        } else {
            printf("Invalid Message\\n");
            return;
        }
        text[i] = ch;
    }
    printf("Decrypted message: %s\\n", text);
}

int main() {
    char text[500];
    int key = 3;
    
    printf("Enter a message to encrypt/decrypt: ");
    scanf("%s", text);
    
    encrypt(text, key);
    decrypt(text, key);
    
    return 0;
}`,
                output: `Enter a message to encrypt/decrypt: HelloWorld
Encrypted message: KhoorZrug
Decrypted message: HelloWorld`
            }]
        },
        "exp8": {
            title: "8. Leaky Bucket Algorithm",
            parts: [{
                code: `#include <stdio.h>

void main() {
    int arriv;
    printf("enter the no of arrival \\n");
    scanf("%d", &arriv);
    
    int t[arriv];
    int packet[arriv];
    
    printf("enter the times \\n");
    int i;
    
    for (i = 0; i < arriv; i++) {
        printf("enter time t%d:", i + 1);
        scanf("%d", &t[i]);
        printf("enter packet p %d:", i + 1);
        scanf("%d", &packet[i]);
    }
    
    int ps = 20;
    int or = 2;
    int lo = 0;
    int ct = 1;
    
    for (i = 0; i < arriv; i++) {
        
        while (ct < t[i]) {
            printf("at time %d:no new packets arrived:", ct);
            printf("packets send:%d\\n", (lo > or ? or : lo));
            lo = lo - (lo > or ? or : lo);
            ct++;
        }
        
        int tp = packet[i] + lo;
        int psent = (tp > or) ? or : tp;
        lo = tp - psent;
        
        printf("at time %d:\\n", ct);
        printf("packets received:%d\\n", packet[i]);
        printf("packet sent:%d\\n", psent);
        printf("packet left:%d\\n\\n", lo);
        ct++;
    }
    
    while (lo > 0) {
        printf("at time %d :no new packets arrived\\n", ct);
        int psent = (lo > or) ? or : lo;
        lo = lo - psent;
        printf("packet sent:%d\\n", psent);
        printf("packet left:%d\\n\\n", lo);
        ct++;
    }
}`,
                output: `enter the no of arrival 
4
enter the times 
enter time t1:1
enter packet p 1:4
enter time t2:2
enter packet p 2:5
enter time t3:3
enter packet p 3:3
enter time t4:4
enter packet p 4:6
at time 1:
packets received:4
packet sent:2
packet left:2

at time 2:
packets received:5
packet sent:2
packet left:5

at time 3:
packets received:3
packet sent:2
packet left:6

at time 4:
packets received:6
packet sent:2
packet left:10

at time 5 :no new packets arrived
packet sent:2
packet left:8

at time 6 :no new packets arrived
packet sent:2
packet left:6

at time 7 :no new packets arrived
packet sent:2
packet left:4

at time 8 :no new packets arrived
packet sent:2
packet left:2

at time 9 :no new packets arrived
packet sent:2
packet left:0`
            }]
        },
        "exp9": {
            title: "9. Buffer Sorting Techniques",
            parts: [{
                code: `#include <stdio.h>
#include <string.h>
#include <stdlib.h> 

typedef struct {
    char text[4]; 
    int sequence; 
} Frame;

void printFrames(Frame frames[], int n) {
    for (int i = 0; i < n; i++)
        printf("%s:%d\\t", frames[i].text, frames[i].sequence);
}

void shuffle(Frame frames[], int n) {
    for (int i = 0; i < n; i++) {
        int j = rand() % n; 
        Frame temp = frames[i];
        frames[i] = frames[j];
        frames[j] = temp;
    }
}

void sortFrames(Frame frames[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (frames[j].sequence > frames[j + 1].sequence) {
                Frame temp = frames[j];
                frames[j] = frames[j + 1];
                frames[j + 1] = temp;
            }
        }
    }
}

int main() {
    char sentence[100];
    printf("Enter a sentence: ");
    fgets(sentence, sizeof(sentence), stdin);
    
    sentence[strcspn(sentence, "\\n")] = '\\0';
    
    int len = strlen(sentence);
    int frameLen = (len + 2) / 3;
    Frame frames[frameLen];
    
    for (int i = 0; i < frameLen; i++) {
        strncpy(frames[i].text, sentence + i * 3, 3);
        frames[i].text[3] = '\\0'; 
        frames[i].sequence = i + 1; 
    }
    
    printf("\\nOriginal Frames:\\n");
    printFrames(frames, frameLen);
    
    shuffle(frames, frameLen);
    printf("\\nShuffled Frames:\\n");
    printFrames(frames, frameLen);
    
    sortFrames(frames, frameLen);
    printf("\\nSorted Frames:\\n");
    printFrames(frames, frameLen);
    
    return 0;
}`,
                output: `Enter a sentence: HelloWorld

Original Frames:
Hel:1	loW:2	orl:3	d:4	
Shuffled Frames:
orl:3	Hel:1	d:4	loW:2	
Sorted Frames:
Hel:1	loW:2	orl:3	d:4`
            }]
        },
        "exp10": {
            title: "10. Wireshark",
            parts: [{
                code: `// Wireshark is a graphical network protocol analyzer, not a C program.
// Below are the steps to use it.

### What is Wireshark?
Wireshark is a powerful open-source tool used for network troubleshooting, analysis, software and communications protocol development, and education. It captures data packets in real time and displays them in human-readable format.

### How to Use Wireshark:
1.  **Installation:** Download and install Wireshark from the official website (wireshark.org).
2.  **Select an Interface:** Open Wireshark. You will see a list of network interfaces (e.g., 'Ethernet', 'Wi-Fi'). Double-click the interface you want to monitor.
3.  **Packet Capture:** Wireshark will immediately start capturing all packets on that interface. You'll see a real-time list of packets.
4.  **Stop Capture:** Click the red square 'Stop' button in the toolbar when you have captured enough data.
5.  **Analysis & Filters:**
    - The top pane shows a list of all captured packets with summary info.
    - The middle pane shows the protocol details of the selected packet.
    - The bottom pane shows the raw data of the packet in hexadecimal and ASCII.
    - Use the filter bar at the top to find specific packets. For example, type \`http\` to see only HTTP traffic, or \`ip.addr == 8.8.8.8\` to see packets to/from that IP address.`,
                output: "This experiment involves using the Wireshark application. There is no direct code output. Follow the steps in the 'Code' section to perform the experiment."
            }]
        },
        "exp11": {
            title: "11. Nmap (OS Detection)",
            parts: [{
                code: `// Nmap (Network Mapper) is a command-line tool, not a C program.
// Below are the steps to use it for OS detection.

### What is Nmap?
Nmap is a free and open-source utility for network discovery and security auditing. It uses raw IP packets to determine what hosts are available on the network, what services those hosts are offering, what operating systems they are running, and dozens of other characteristics.

### How to run an Nmap scan for OS Detection:
1.  **Installation:** Install Nmap from the official website (nmap.org).
2.  **Open Terminal/Command Prompt:** Nmap is run from the command line.
3.  **Run the Scan:** To detect the operating system of a target, use the \`-O\` flag. You must have administrative/root privileges to perform this scan.
    - **Command:** \`sudo nmap -O <target_ip_or_hostname>\`
    - **Example:** \`sudo nmap -O 192.168.1.1\` or \`sudo nmap -O scanme.nmap.org\`
4.  **Analyze Output:** Nmap will perform a series of tests and provide a report. The OS detection section will give its best guess for the target's operating system, including the vendor, OS family, and version.`,
                output: "This experiment involves using the Nmap command-line tool. There is no direct code output. Follow the steps in the 'Code' section to perform the experiment."
            }]
        },
        "exp12": {
            title: "12. NS2 Simulator",
            parts: [{
                code: `// NS2 (Network Simulator 2) is a discrete event simulator, not a single C program.
// It uses OTcl scripts to define network topologies and traffic.

### What is NS2?
NS2 is a popular open-source simulation tool designed specifically for research in computer communication networks. It provides substantial support for simulating routing, multicast protocols, and IP protocols, such as UDP, TCP, etc.

### Simulating with NS2 (Conceptual Steps):
1.  **Write a TCL Script (.tcl):** You define the entire simulation in a TCL script.
    - Create a simulator object.
    - Define nodes and links (the network topology).
    - Set up traffic agents (e.g., TCP, UDP) and attach them to nodes.
    - Define applications (e.g., FTP for bulk data transfer) over the traffic agents.
    - Schedule events (e.g., when the FTP should start and stop).
    - Define tracing to record packet events to a trace file (.tr).
2.  **Run the Simulation:** Execute the script using the \`ns\` command: \`ns your_script.tcl\`
3.  **Analyze the Trace File:** The trace file contains detailed, line-by-line information about every packet event (enqueue, dequeue, drop, receive). You write scripts (using AWK, Perl, or Python) to parse this file to calculate:
    - Number of packets dropped (due to TCP/UDP, congestion, etc.)
    - Data Rate & Throughput
    - Performance metrics like end-to-end delay.`,
                output: "This experiment involves writing TCL scripts and using the NS2 simulator. There is no direct C code output. The process involves scripting, simulation, and analysis of trace files."
            }]
        }
    },
    "ML": {
        "exp1": {
            title: "1. Understanding Basic Statistics",
            parts: [{
                code: `# Prompt user to enter data
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
print(f"Standard Deviation = {std_deviation}")`,
                output: `$ python3 Stat_Measures.py
Enter numbers separated by commas: 1,2,3,4,4,5,6
Mean = 3.5714285714285716
Median = 4
Mode = [4]
Variance = 2.5306122448979593
Standard Deviation = 1.5907898179514348`
            }]
        },
        "exp2": {
            title: "2. Study of Python Basic Libraries (Statistics, Math, Numpy, Scipy)",
            parts: [
                {
                    subtitle: "Statistics Library",
                    code: `import statistics
# Input data from user
data=input("Enter data separated by comma:")
data=[int(x) for x in data.split(',')]
# Compute Mean
mean=statistics.mean(data)
# Compute Median
median=statistics.median(data)
# Compute Mode
mode=statistics.mode(data)
# Compute Standard Deviation
std_dev=statistics.stdev(data)
# Compute Variance
variance=statistics.variance(data)
# Output results
print(f"Mean={mean}")
print(f"Median={median}")
print(f"Mode={mode}")
print(f"Standard Deviation={std_dev}")
print(f"Variance={variance}")`,
                    output: `$ python3 Stat_Lib.py
Enter data separated by comma:1,2,3,4,4,5,6
Mean=3.5714285714285716
Median=4
Mode=4
Standard Deviation=1.7182493859684491
Variance=2.9523809523809526`
                },
                {
                    subtitle: "Math Library",
                    code: `import math
x=int(input("Enter a number:"))
result1=math.ceil(x)
result2=math.factorial(x)
result3=math.exp(x)
result4=math.sqrt(x)
result5=math.floor(x)
n1=int(input("Enter number1:"))
n2=int(input("Enter number2:"))
result6=math.gcd(n1,n2)
result7=math.pow(n1,n2)
angle=int(input("Enter an angle:"))
a=math.radians(angle)
result8=math.sin(a)
result9=math.cos(a)
result10=math.tan(a)
print(f"Using math.ceil({x}): {result1}")
print(f"Using math.factorial({x}):{result2}")
print(f"Using math.exp({x}):{result3}")
print(f"Using math.sqrt({x}):{result4}")
print(f"Using math.floor({x}):{result5}")
print(f"Using math.gcd({n1},{n2}):{result6}")
print(f"Using math.pow({n1},{n2}):{result7}")
print(f"Using math.sin({angle}):{result8}")
print(f"Using math.cos({angle}):{result9}")
print(f"Using math.tan({angle}):{result10:.15f}")`,
                    output: `$ python3 Math_Lib.py
Enter a number:4
Enter number1:3
Enter number2:2
Enter an angle:1
Using math.ceil(4): 4
Using math.factorial(4):24
Using math.exp(4):54.598150033144236
Using math.sqrt(4):2.0
Using math.floor(4):4
Using math.gcd(3,2):1
Using math.pow(3,2):9.0
Using math.sin(1):0.01745240643728351
Using math.cos(1):0.9998476951563913
Using math.tan(1):0.017455064928218`
                },
                {
                    subtitle: "Numpy Library",
                    code: `import numpy as np
# Get number of rows and columns from user
rows=int(input("Enter number of rows:"))
cols=int(input("Enter number of columns:"))
# Get array elements from user
elements=list(map(float, input(f"Enter {rows*cols} elements separated by spaces:").split()))
# Create an array from user input
user_array=np.array(elements).reshape(rows,cols)
# Create an array of ones and zeros
ones_array=np.ones((rows, cols))
zeros_array=np.zeros((rows, cols))
# Transpose the user array
transposed_array=np.transpose(user_array)
# Reshape the user array
reshaped_array = user_array.reshape(rows * cols)
min_value=np.min(elements)
max_value=np.max(elements)
# Display the results
print("User Array:\\n",user_array)
print("Ones Array:\\n",ones_array)
print("Zeros Array:\\n",zeros_array)
print("Transposed Array:\\n",transposed_array)
print("Reshaped Array (flattened):\\n",reshaped_array)
print("Minimum Value:",min_value)
print("Maximum Value:",max_value)`,
                    output: `$ python3 Numpy_Lib.py
Enter number of rows:2
Enter number of columns:2
Enter 4 elements separated by spaces:1 2 3 4
User Array:
 [[1. 2.]
 [3. 4.]]
Ones Array:
 [[1. 1.]
 [1. 1.]]
Zeros Array:
 [[0. 0.]
 [0. 0.]]
Transposed Array:
 [[1. 3.]
 [2. 4.]]
Reshaped Array (flattened):
 [1. 2. 3. 4.]
Minimum Value: 1.0
Maximum Value: 4.0`
                },
                {
                    subtitle: "Scipy Library",
                    code: `from scipy import linalg
import numpy as np
from scipy import special
from scipy import constants
# Print constants
print("Seconds in a minute:",constants.minute)
print("Seconds in an hour:",constants.hour)
print("Length of an inch in meters:",constants.inch)
print("Volume of a liter in cubic meters:",constants.liter)
# Dynamic input for exponentiation
exp_input = float(input("Enter the exponent for 10^x:"))
print(f"10^{exp_input} =",special.exp10(exp_input))
# Dynamic input for angles in degrees
angle=float(input("Enter an angle for sine and cosine(in degrees):"))
print(f"sin({angle} degrees):",special.sindg(angle))
print(f"cos({angle} degrees):",special.cosdg(angle))
# Dynamic input for matrix
rows = int(input("Enter the number of rows for the matrix:"))
cols = int(input("Enter the number of columns for the matrix:"))
mat = list(map(float, input(f"Enter {rows * cols} elements separated by spaces:").split()))
mat=np.array(mat).reshape((rows, cols))
if rows == cols:
    x = linalg.det(mat)
    print(f'Determinant of the matrix\\n{mat}\\n is: {x}')
else:
    print("Determinant can only be calculated for square matrices.")`,
                    output: `$ python3 Scipy_Lib.py
Seconds in a minute: 60.0
Seconds in an hour: 3600.0
Length of an inch in meters: 0.0254
Volume of a liter in cubic meters: 0.001
Enter the exponent for 10^x:2
10^2.0 = 100.0
Enter an angle for sine and cosine(in degrees):90
sin(90.0 degrees): 1.0
cos(90.0 degrees): -0.0
Enter the number of rows for the matrix:2
Enter the number of columns for the matrix:2
Enter 4 elements separated by spaces:2 3 4 5
Determinant of the matrix
[[2. 3.]
 [4. 5.]]
 is: -2.0000000000000004`
                }
            ]
        },
        "exp3": {
            title: "3. Study of Python Libraries for ML (Pandas and Matplotlib)",
            parts: [
                {
                    subtitle: "Pandas Library",
                    code: `import pandas
df=pandas.read_csv('students.csv')
print(df)
print(df.loc[[0,1]])
print(df.head())
print(df.tail())
print(df.isnull())
print(df.info())`,
                    output: `$ python3 Pandas_Lib.py
   Student_NO     Name Branch Year  Contact_NO
0        1201    Raghu     IT  III        1234
1        1202      Sai     IT  III        1234
2        1203   Sravan     IT  III        1234
3        1204  Karthik     IT  III        1234
4        1205  Gaanesh     IT  III        1234
5        1206   Vamshi     IT  III        1234
6        1207    Shiva     IT  III        1234
7        1208    Racha     IT  III        1234
8        1209      Abu     IT  III        1234
9        1210  Nithish     IT  III        1234`
                },
                {
                    subtitle: "Matplotlib Library",
                    code: `import matplotlib.pyplot as plt
import numpy as np
# Taking user inputs for x and y coordinates
x_input = input("Enter the x coordinates separated by spaces: ")
y_input = input("Enter the y coordinates separated by spaces: ")
# Splitting the input string into a list of strings, then converting them to float
x = np.array([float(i) for i in x_input.split()])
y = np.array([float(i) for i in y_input.split()])
# Checking if the number of x and y coordinates match
if len(x) != len(y):
    print("Error: The number of x and y coordinates must be the same.")
else:
    plt.plot(x, y, marker='o')
    plt.xlabel('X-axis')
    plt.ylabel('Y-axis')
    plt.title('User Input Plot')
    plt.grid(True)
    plt.show()`,
                    output: `$ python3 Matplot_Lib.py
Enter the x coordinates separated by spaces: 3 5 7 8
Enter the y coordinates separated by spaces: 3.2 5.3 8.4 9.3`
                }
            ]
        },
        "exp4": {
            title: "4. Simple Linear Regression",
            parts: [{
                code: `import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error,mean_squared_error,r2_score
#Load the data from the CSV file
data = pd.read_csv('salary_data.csv')
x= data[['age']] # Independent variable
y = data['salary'] # Dependent variable
#Split the data into training and testing sets
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2,random_state=1)
model=LinearRegression()
model.fit(x_train, y_train)
y_pred=model.predict(x_test)
#Model coefficients
print(f"Intercept (a0): {model.intercept_}")
print(f"Slope (a1): {model.coef_}")
r2=r2_score(y_test, y_pred)
#Print evaluation metrics
print (f"R-squared Score: ",r2)
#User input for age
user_age = float(input("Enter age to predict salary: "))
#Predict salary for the given age
predicted_salary = model.predict(pd.DataFrame([[user_age]], columns=['age']))
print (f"The predicted salary for age {user_age} is:",predicted_salary)
plt.scatter (x_test, y_test, color='blue')
plt.plot(x_test, y_pred, color='red', linewidth=2, label='Predicted line')
plt.scatter (user_age, predicted_salary, color='green', s=100, label='User Prediction')
plt.xlabel('Age')
plt.ylabel('Salary')
plt.title('Simple Linear Regression: Age vs Salary')
plt.legend()
plt.show()`,
                output: `$ python3 Linear_Regression.py
Intercept (a0): -1522.5102319235884
Slope (a1): [1470.66848568]
R-squared Score: 0.9899167950543547
Enter age to predict salary: 43
The predicted salary for age 43.0 is: [61716.23465211]`
            }]
        },
        "exp5": {
            title: "5. Multiple Linear Regression for House Price Prediction",
            parts: [{
                code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from matplotlib.ticker import FuncFormatter
data = pd.read_csv('house_data.csv')
X = data.drop('price', axis=1)
y = data['price']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2,random_state=42)
model = LinearRegression().fit(X_train, y_train)
y_pred = model.predict(X_test)
print(f"Mean Squared Error: {mean_squared_error(y_test, y_pred):.2f}")
print(f"R^2 Score: {r2_score(y_test, y_pred):.2f}")
print(f"Model Coefficients: {model.coef_}")
print(f"Model Intercept: {model.intercept_}")
area = float(input("Enter area (sq ft): "))
bedrooms = int(input("Enter number of bedrooms: "))
floors = int(input("Enter number of floors: "))
age = int(input("Enter age of the house: "))
input_data = pd.DataFrame([[area, bedrooms, floors, age]], columns=['area', 'bedrooms', 'floors', 'age'])
input_data_encoded = input_data.reindex(columns=X.columns, fill_value=0)
predicted_price = model.predict(input_data_encoded)
print(f"Predicted price for the house: {predicted_price[0]:,.2f}")
plt.figure(figsize=(12, 8))
plt.scatter(y_test, y_pred, alpha=0.7, label="Predicted Prices", color='blue', marker='o')
plt.plot([0, max(y_test)], [0, max(y_test)], color='red', linestyle='--', label="Prediction Line")
plt.xlabel("Actual Prices")
plt.ylabel("Predicted Prices")
plt.title("Actual vs Predicted House Prices")
formatter = FuncFormatter(lambda x, pos: f'{int(x):,}')
plt.gca().xaxis.set_major_formatter(formatter)
plt.gca().yaxis.set_major_formatter(formatter)
plt.legend()
plt.xlim(0, max(y_test) * 1.1)
plt.ylim(0, max(y_pred) * 1.1)
plt.grid(True)
plt.show()`,
                output: `$ python3 Multiple_Linear_Regression.py
Mean Squared Error: 147133574968.89
R^2 Score: 0.93
Model Coefficients: [ 2518.89168766 198012.87433529 198012.87433529 94458.43828715]
Model Intercept: -818499.8600628739
Enter area (sq ft): 200
Enter number of bedrooms: 3
Enter number of floors: 2
Enter age of the house: 2
Predicted price for the house: 864,259.73`
            }]
        },
        "exp6": {
            title: "6. Decision Tree using sklearn",
            parts: [{
                code: `# Importing required libraries
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report
import matplotlib.pyplot as plt
from sklearn import tree
# Load the Iris dataset
iris = load_iris()
X = iris.data # Features
y = iris.target # Target labels
# Split the dataset into training and testing sets (90% train, 10% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)
# Initialize the Decision Tree classifier with some tuning parameters
clf = DecisionTreeClassifier(max_depth=2, min_samples_split=2, min_samples_leaf=1, random_state=42)
# Fit the classifier on the training data
clf.fit(X_train, y_train)
# Make predictions on the test set
y_pred = clf.predict(X_test)
# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy:.2f}')
# Print classification report
print('Classification Report:')
print(classification_report(y_test, y_pred, target_names=iris.target_names))
# Visualize the Decision Tree
plt.figure(figsize=(10, 8))
tree.plot_tree(clf, filled=True, feature_names=iris.feature_names,class_names=iris.target_names, rounded=True)
plt.title("Decision Tree Visualization")
plt.show()`,
                output: `$ python3 Dtree.py
Accuracy: 1.00
Classification Report:
              precision    recall  f1-score   support

      setosa       1.00      1.00      1.00         6
  versicolor       1.00      1.00      1.00         6
   virginica       1.00      1.00      1.00         3

    accuracy                           1.00        15
   macro avg       1.00      1.00      1.00        15
weighted avg       1.00      1.00      1.00        15`
            }]
        },
        "exp7": {
            title: "7. K-Nearest Neighbor (KNN) Algorithm",
            parts: [{
                code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_iris
import random
data_iris = load_iris()
label_target = data_iris.target_names
print()
print("Sample Data from Iris Dataset")
print("*"*30)
for i in range(10):
    rn = random.randint(0,120)
    print(data_iris.data[rn],"===>",label_target[data_iris.target[rn]])
X = data_iris.data
y = data_iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.3,random_state=1)
print("The Training dataset length: ",len(X_train))
print("The Testing dataset length: ",len(X_test))
try:
    nn = int(input("Enter number of neighbors :"))
    knn = KNeighborsClassifier(nn)
    knn.fit(X_train, y_train)
    # to display the score
    print("The Score is :",knn.score(X_test, y_test))
    # To get test data from the user
    test_data = input("Enter Test Data :").split(",")
    for i in range(len(test_data)):
        test_data[i] = float(test_data[i])
    print()
    v = knn.predict([test_data])
    print("Predicted output is :",label_target[v])
except:
    print("Please supply valid input......")`,
                output: `$ python3 Knn.py
Sample Data from Iris Dataset
******************************
[6.1 2.8 4.  1.3] ===> versicolor
[4.6 3.1 1.5 0.2] ===> setosa
[5.8 2.6 4.  1.2] ===> versicolor
[6.9 3.2 5.7 2.3] ===> virginica
[6.7 3.1 4.7 1.5] ===> versicolor
The Training dataset length:  105
The Testing dataset length:  45
Enter number of neighbors :9
The Score is : 0.9777777777777777
Enter Test Data :5.3,2.2,3.2,1.5
Predicted output is : ['versicolor']`
            }]
        },
        "exp8": {
            title: "8. Logistic Regression",
            parts: [{
                code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
# Step 1: Load the dataset
data = pd.read_csv("study_hours.csv")
X = data[['Study Hours']].values
y = data['Exam Result'].values
# Step 2: Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42)
# Step 3: Train logistic regression model
model = LogisticRegression()
model.fit(X_train, y_train)
# Step 4: Predict and evaluate
y_pred = model.predict(X_test)
# Step 5: Print results
print(f"Accuracy: {accuracy_score(y_test, y_pred):.1f}")
print("\\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("\\nClassification Report:")
print(classification_report(y_test, y_pred))
# Step 6: Plotting decision boundary
X_range = np.linspace(X.min() - 1, X.max() + 1, 300).reshape(-1, 1)
y_prob = model.predict_proba(X_range)[:, 1]
plt.figure(figsize=(8, 6))
plt.scatter(X_train, y_train, color='blue', label='Training Data')
plt.scatter(X_test, y_test, color='green', marker='x', s=100, label='Testing Data')
plt.plot(X_range, y_prob, color='red', linewidth=2, label='Decision Boundary')
plt.xlabel("Study Hours")
plt.ylabel("Exam Result")
plt.title("Logistic Regression - Study Hours vs Exam Result")
plt.legend()
plt.grid(True)
plt.show()`,
                output: `$ python3 Logistic_Regression.py
Accuracy: 1.0

Confusion Matrix:
[[1 0]
 [0 1]]

Classification Report:
              precision    recall  f1-score   support

           0       1.00      1.00      1.00         1
           1       1.00      1.00      1.00         1

    accuracy                           1.00         2
   macro avg       1.00      1.00      1.00         2
weighted avg       1.00      1.00      1.00         2`
            }]
        },
        "exp9": {
            title: "9. K-Means Clustering",
            parts: [{
                code: `#Necessary Libraries
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
plt.show()`,
                output: `$ python3 kmeans.py
(Displays scatter plots showing data points before and after K-Means clustering with 4 clusters)`
            }]
        },
        "exp10": {
            title: "10. Mini Project: Performance Analysis of Classification Algorithms",
            parts: [{
                code: `import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
# Load dataset
iris = load_iris()
X = iris.data
y = iris.target
# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
# Feature scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)
# Define models
models = {
    "Logistic Regression": LogisticRegression(),
    "Decision Tree": DecisionTreeClassifier(),
    "K-Nearest Neighbors": KNeighborsClassifier(),
    "Support Vector Machine": SVC(),
    "Random Forest": RandomForestClassifier()
}
# Train, Predict, and Evaluate
for name, model in models.items():
    print(f"\\nModel: {name}")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("Confusion Matrix:\\n", confusion_matrix(y_test, y_pred))
    print("Classification Report:\\n", classification_report(y_test, y_pred))`,
                output: `$ python3 mini_project.py
Model: Logistic Regression
Accuracy: 1.0
Confusion Matrix:
 [[19  0  0]
 [ 0 13  0]
 [ 0  0 13]]

Model: Decision Tree
Accuracy: 1.0

Model: K-Nearest Neighbors
Accuracy: 1.0

Model: Support Vector Machine
Accuracy: 1.0

Model: Random Forest
Accuracy: 1.0`
            }]
        }
    }
};
