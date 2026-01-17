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
  }
};
