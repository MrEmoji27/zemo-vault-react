export const labData = {
  "1st Year": {
    "PPL Lab": {},
    "Python": {}
  },
  "2nd Year": {
    "Java": {},
    "DSA": {},
    "OS": {},
    "DBMS": {}
  },
  "3rd Year": {
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

    printf("Enter string:\\n");
    scanf("%s", a);

    n = strlen(a);

    printf("Enter position to stuff the character:\\n");
    scanf("%d", &pos);

    if (pos > n || pos <= 0)
    {
        printf("Invalid position.\\n");
        return 1; // Exit if position is invalid
    }

    printf("Enter the character to stuff:\\n");
    scanf(" %c", &ch);

    // Copy characters before the stuffing position
    for(i = 0; i < pos - 1; i++) {
        b[j++] = a[i];
    }

    // Add the stuffing sequence
    b[j++] = 'd';
    b[j++] = 'l';
    b[j++] = 'e';
    b[j++] = ch;
    b[j++] = 'd';
    b[j++] = 'l';
    b[j++] = 'e';

    // Copy the rest of the string
    for(i = pos - 1; i < n; i++) {
        b[j++] = a[i];
    }

    b[j] = '\\0';

    printf("\\nString after character stuffing:\\n");
    printf("%s\\n", b);

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

int main() {
    int w, f, i, ack[50], frames[50];

    printf("Enter window size: ");
    scanf("%d", &w);

    printf("Enter number of frames to transmit: ");
    scanf("%d", &f);

    printf("Enter %d frames: ", f);
    for (i = 0; i < f; i++)
        scanf("%d", &frames[i]);

    for (i = 0; i < f; i++)
        ack[i] = 0;

    printf("\\n--- Transmission using Selective Repeat ARQ ---\\n");

    i = 0;
    while (i < f) {
        int j;
        printf("\\nSender: Sending frames in window -> ");
        for (j = i; j < i + w && j < f; j++) {
            if (ack[j] == 0)
                printf("%d ", frames[j]);
        }
        printf("\\n");

        for (j = i; j < i + w && j < f; j++) {
            if (ack[j] == 0) {
                int response;
                printf("Receiver: Did you receive frame %d? (1=Yes, 0=No): ", frames[j]);
                scanf("%d", &response);
                if (response == 1) {
                    printf("Acknowledgement sent for frame %d\\n", frames[j]);
                    ack[j] = 1;
                } else {
                    printf("Frame %d lost, will be retransmitted\\n", frames[j]);
                }
            }
        }

        while (i < f && ack[i] == 1) {
            i++;
        }
    }

    printf("\\nAll frames transmitted successfully!\\n");
    return 0;
}`,
            output: `Enter window size: 3
Enter number of frames to transmit: 5
Enter 5 frames: 10 20 30 40 50

--- Transmission using Selective Repeat ARQ ---

Sender: Sending frames in window -> 10 20 30 
Receiver: Did you receive frame 10? (1=Yes, 0=No): 1
Acknowledgement sent for frame 10
Receiver: Did you receive frame 20? (1=Yes, 0=No): 0
Frame 20 lost, will be retransmitted
Receiver: Did you receive frame 30? (1=Yes, 0=No): 1
Acknowledgement sent for frame 30

Sender: Sending frames in window -> 20 40 
Receiver: Did you receive frame 20? (1=Yes, 0=No): 1
Acknowledgement sent for frame 20
Receiver: Did you receive frame 40? (1=Yes, 0=No): 1
Acknowledgement sent for frame 40

Sender: Sending frames in window -> 50 
Receiver: Did you receive frame 50? (1=Yes, 0=No): 1
Acknowledgement sent for frame 50

All frames transmitted successfully!`
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

    printf("Vertex \tDistance from Source \tPath\n");
    for (int i = 0; i < numVertices; i++) {
        printf("\n%d \t\t %d \t\t", i, dist[i]);
        
        int j = i;
        while (j != -1) {
            printf("%d ", j);
            j = parent[j];
            if (j != -1) {
                printf("<- ");
            }
        }
    }
    printf("\n");
}

int main() {
    int numVertices;
    printf("Enter the number of vertices: ");
    scanf("%d", &numVertices);

    int graph[MAX][MAX];
    printf("Enter the adjacency matrix:\n");
    for (int i = 0; i < numVertices; i++) {
        for (int j = 0; j < numVertices; j++) {
            scanf("%d", &graph[i][j]);
        }
    }

    int src;
    printf("Enter the source vertex: ");
    scanf("%d", &src);

    if (src < 0 || src >= numVertices) {
        printf("Invalid source vertex.\n");
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

    printf("\nEnter the number of nodes: ");
    scanf("%d", &n);

    printf("\nEnter the cost matrix :\n");
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
        printf("\n\nState value for router %d is \n", i + 1);
        for (j = 0; j < n; j++) {
            printf("\t\nnode %d via %d Distance%d", j + 1, rt[i].from[j] + 1, rt[i].dist[j]);
        }
    }
    printf("\n\n");
    return 0;
}`,
          output: `Enter the number of nodes: 4 Enter the cost matrix: 0 1 2 9 4 1 2 0 1 0 9 1 2 0 4 0 2 0 State value for router 1 is node 1 via 1 Distance0 node 2 via 4 Distance4 node 3 via 4 Distance5 node 4 via 4 Distance4 State value for router 2 is node 1 via 4 Distance4 node 2 via 2 Distance0 node 3 via 3 Distance1 node 4 via 4 Distance0 State value for router 3 is node 1 via 4 Distance4 node 2 via 4 Distance0 node 3 via 3 Distance0 node 4 via 4 Distance0 State value for router 4 is node 1 via 1 Distance4 node 2 via 2 Distance0 node 3 via 2 Distance1 node 4 via 4 Distance0`
        }]
      },
      "exp6": {
        title: "7. Data Encryption and Decryption",
        parts: [{
          code: `#include<stdio.h>

int main() {
    char message[100], ch;
    int i, key;
    printf("Enter a message to encrypt: ");
    gets(message);
    printf("Enter key (1-25): ");
    scanf("%d", &key);

    // Encryption
    for(i = 0; message[i] != '\\0'; ++i){
        ch = message[i];
        if(ch >= 'a' && ch <= 'z'){
            ch = ch + key;
            if(ch > 'z') ch = ch - 'z' + 'a' - 1;
            message[i] = ch;
        }
        else if(ch >= 'A' && ch <= 'Z'){
            ch = ch + key;
            if(ch > 'Z') ch = ch - 'Z' + 'A' - 1;
            message[i] = ch;
        }
    }
    printf("Encrypted message: %s\\n", message);

    // Decryption
    for(i = 0; message[i] != '\\0'; ++i){
        ch = message[i];
        if(ch >= 'a' && ch <= 'z'){
            ch = ch - key;
            if(ch < 'a') ch = ch + 'z' - 'a' + 1;
            message[i] = ch;
        }
        else if(ch >= 'A' && ch <= 'Z'){
            ch = ch - key;
            if(ch < 'A') ch = ch + 'Z' - 'A' + 1;
            message[i] = ch;
        }
    }
    printf("Decrypted message: %s\\n", message);
    return 0;
}`,
          output: `Enter a message to encrypt: HelloWorld
Enter key (1-25): 4
Encrypted message: LippsAsvph
Decrypted message: HelloWorld`
        }]
      },
      "exp7": {
        title: "8. Leaky Bucket Algorithm",
        parts: [{
          code: `#include<stdio.h>

int main() {
    int bucket_size, output_rate;
    int packets_rem = 0, i, n;
    int packets[10];

    printf("Enter bucket size: ");
    scanf("%d", &bucket_size);
    printf("Enter output rate: ");
    scanf("%d", &output_rate);
    printf("Enter number of incoming packets: ");
    scanf("%d", &n);
    printf("Enter incoming packet sizes:\\n");
    for(i = 0; i < n; i++) scanf("%d", &packets[i]);

    printf("\\nTime\\tPkt Size\\tPkt Rcvd\\tPkt Sent\\tPkt Rem\\n");
    printf("----------------------------------------------------------\\n");

    for(i = 0; i < n; i++) {
        printf("%d\\t%d\\t\\t", i + 1, packets[i]);
        if ((packets[i] + packets_rem) > bucket_size) {
            printf("Dropped\\t\\t");
        } else {
            packets_rem += packets[i];
            printf("%d\\t\\t", packets_rem);
        }
        int sent = (packets_rem < output_rate) ? packets_rem : output_rate;
        printf("%d\\t\\t", sent);
        packets_rem -= sent;
        printf("%d\\n", packets_rem);
    }
    return 0;
}`,
          output: `Enter bucket size: 10
Enter output rate: 2
Enter number of incoming packets: 4
Enter incoming packet sizes:
4 5 3 6

Time  Pkt Size  Pkt Rcvd  Pkt Sent  Pkt Rem
----------------------------------------------------------
1     4         4         2         2
2     5         7         2         5
3     3         8         2         6
4     6         Dropped   2         4`
        }]
      },
      "exp8": {
        title: "9. Buffer Sorting Techniques",
        parts: [{
          code: `#include <stdio.h>

void bubble_sort(int buffer[], int n) {
    int i, j, temp;
    for (i = 0; i < n - 1; i++) {
        for (j = 0; j < n - i - 1; j++) {
            if (buffer[j] > buffer[j + 1]) {
                temp = buffer[j];
                buffer[j] = buffer[j + 1];
                buffer[j + 1] = temp;
            }
        }
    }
}

int main() {
    int buffer[100], n, i;
    printf("Enter number of packets in buffer (max 100): ");
    scanf("%d", &n);
    printf("Enter packet priorities (as integers):\\n");
    for (i = 0; i < n; i++) scanf("%d", &buffer[i]);

    bubble_sort(buffer, n);

    printf("Sorted buffer (by priority):\\n");
    for (i = 0; i < n; i++) printf("%d ", buffer[i]);
    printf("\\n");

    return 0;
}`,
          output: `Enter number of packets in buffer (max 100): 6
Enter packet priorities (as integers):
5 2 8 1 9 4
Sorted buffer (by priority):
1 2 4 5 8 9`
        }]
      },
      "exp9": {
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
      "exp10": {
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
      "exp11": {
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
    "DevOps": {
      "exp1": {
        title: "1. Simple User Registration Form",
        parts: [{
          code: `// This is an instructional guide, not runnable code.

### Objective:
Create a basic HTML page with a form for event registration.

### Steps:
1.  **Create an HTML file:** Name it 'index.html'.
2.  **Add basic HTML structure:** Include <html>, <head>, and <body> tags.
3.  **Create a <form> element:** Inside the body, this will contain your input fields.
4.  **Add input fields:**
    - A text input for 'Name' (<input type="text">).
    - An email input for 'Email' (<input type="email">).
    - A dropdown for 'Event' (<select> with <option> elements).
    - A submit button (<input type="submit">).
5.  **Use <label> tags:** Associate labels with each input for good practice.
6.  **(Optional) Add JavaScript:** Write a script to show an alert when the form is submitted, preventing the page from reloading.`,
          output: "The final result should be an HTML page that displays a functional registration form in the browser."
        }]
      },
      "exp2": {
        title: "2. Explore Git and GitHub Commands",
        parts: [{
          code: `// This is a guide to common Git and GitHub commands.

### 1. Initializing a Repository
// Create a new local repository
> git init

// Clone an existing repository from GitHub
> git clone <repository_url>

### 2. Staging and Committing
// Add a file to the staging area
> git add <file_name>

// Add all changed files to the staging area
> git add .

// Commit the staged files with a message
> git commit -m "Your commit message"

### 3. Branching and Merging
// Create a new branch
> git branch <branch_name>

// Switch to a branch
> git checkout <branch_name>

// Create and switch to a new branch in one command
> git checkout -b <new_branch_name>

// Merge a branch into your current branch
> git merge <branch_name>

### 4. Syncing with GitHub
// Add a remote repository (like GitHub)
> git remote add origin <repository_url>

// Push your committed changes to the remote repository
> git push origin <branch_name>

// Pull changes from the remote repository
> git pull origin <branch_name>`,
          output: "These are command-line instructions. Run them in your terminal within a project directory where you have Git installed."
        }]
      },
      "exp3": {
        title: "3. Source Code Management on GitHub",
        parts: [{
          code: `// This experiment uses the code from Exercise 1.

### Steps:
1.  **Create a GitHub Repository:**
    - Go to GitHub.com and create a new public repository. Let's call it 'event-registration-app'.

2.  **Initialize Git Locally:**
    - Create a folder on your computer.
    - Save the HTML code from Exercise 1 as 'index.html' inside this folder.
    - Open your terminal in this folder and run:
      > git init

3.  **First Commit:**
    - Add and commit the file:
      > git add index.html
      > git commit -m "Initial commit: Add registration form"

4.  **Connect to GitHub and Push:**
    - Link your local repo to GitHub and push the code:
      > git remote add origin <your_repository_url>
      > git push -u origin master

5.  **Create a Feature Branch:**
    - Let's add a new feature (e.g., a phone number field).
      > git checkout -b add-phone-field

6.  **Modify and Commit on the New Branch:**
    - Edit 'index.html' to add the phone number field.
    - Commit the change:
      > git add index.html
      > git commit -m "Feat: Add phone number input"

7.  **Push the Branch and Create a Pull Request:**
    - Push the new branch to GitHub:
      > git push origin add-phone-field
    - Go to your repository on GitHub. You will see a prompt to create a Pull Request. Create it.

8.  **Merge the Pull Request:**
    - On the GitHub page for the Pull Request, click 'Merge pull request'.`,
          output: "Follow these steps to practice a full source code management cycle using Git and GitHub with the code from the first experiment."
        }]
      },
      "exp4": {
        title: "4. Jenkins Installation and Setup",
        parts: [{
          code: `// Jenkins is a CI/CD automation server.

### Installation using Docker (Recommended for beginners):
1.  **Prerequisite:** Install Docker on your machine.
2.  **Run Jenkins Container:** Open your terminal and run the following command:
    > docker run -p 8080:8080 -p 50000:50000 --name jenkins-server -d jenkins/jenkins:lts

3.  **Get Initial Admin Password:** Jenkins will generate a password. To view it, run:
    > docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword

4.  **Setup Wizard:**
    - Open your browser and go to http://localhost:8080.
    - Paste the password you retrieved.
    - Click 'Install suggested plugins'.
    - Create your first admin user.

### Exploring the Environment:
- **Dashboard:** The main page where you see your projects (jobs).
- **Manage Jenkins:** The section for configuring system settings, plugins, and security.
- **New Item:** Where you create a new project or pipeline.
- **Build History:** Shows the status of past builds for a job.`,
          output: "Follow these instructions to install and set up a local Jenkins server. The primary way to interact with Jenkins is through its web interface at http://localhost:8080."
        }]
      },
      "exp5": {
        title: "5. Continuous Integration with Jenkins",
        parts: [{
          code: `// This experiment demonstrates a simple CI pipeline.

### Prerequisites:
- A Jenkins server (from Ex. 4).
- A GitHub repository with a simple project (like the one from Ex. 3).

### Steps:
1.  **Create a New Job:**
    - In Jenkins, click 'New Item'.
    - Enter a name (e.g., 'my-first-pipeline').
    - Select 'Pipeline' and click OK.

2.  **Configure the Pipeline:**
    - Scroll down to the 'Pipeline' section.
    - For 'Definition', select 'Pipeline script'.
    - Paste the following simple script into the text area:

    pipeline {
        agent any
        stages {
            stage('Build') {
                steps {
                    echo 'Building the application...'
                    // In a real project, you'd run build commands here
                    // e.g., sh 'npm install'
                }
            }
            stage('Test') {
                steps {
                    echo 'Running tests...'
                    // In a real project, you'd run test commands here
                    // e.g., sh 'npm test'
                }
            }
        }
    }

3.  **Run the Pipeline:**
    - Click 'Save'.
    - On the job's page, click 'Build Now'.

4.  **Check the Output:**
    - A new build will appear in the 'Build History'.
    - Click on it, then click 'Console Output' to see the 'echo' messages from your pipeline stages.`,
          output: "This is a configuration guide. After running the build in Jenkins, the 'Console Output' for the build will show the text from the 'echo' commands, indicating a successful pipeline run."
        }]
      },
      "exp6": {
        title: "6. Explore Docker Commands",
        parts: [{
          code: `// Docker is a platform for developing, shipping, and running applications in containers.

### 1. Managing Images
// List all Docker images on your machine
> docker images

// Pull an image from Docker Hub (e.g., the lightweight Alpine Linux)
> docker pull alpine

// Remove a Docker image
> docker rmi alpine

### 2. Running Containers
// Run a container from an image and get an interactive terminal
> docker run -it alpine sh

// Run a container in the background (detached mode)
> docker run -d --name my-nginx nginx

### 3. Managing Containers
// List all running containers
> docker ps

// List all containers (running and stopped)
> docker ps -a

// Stop a running container
> docker stop my-nginx

// Remove a stopped container
> docker rm my-nginx

### 4. Viewing Logs
// View the logs of a running container
> docker logs my-nginx`,
          output: "These are command-line instructions. Run them in your terminal after installing Docker to manage images and containers."
        }]
      },
      "exp7": {
        title: "7. Develop a Simple Containerized Application",
        parts: [{
          code: `// This experiment containerizes a simple Node.js web server.

### 1. Create the Application (app.js)
// Save this code in a file named 'app.js'
const http = require('http');
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello from inside a Docker container!\\n');
});

server.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}/\`);
});

### 2. Create the Dockerfile
// In the same folder, create a file named 'Dockerfile' (no extension)
FROM node:18-alpine
WORKDIR /app
COPY app.js .
CMD ["node", "app.js"]

### 3. Build and Run the Container
// Open your terminal in the folder and run:

// Build the image
> docker build -t my-node-app .

// Run the container, mapping port 8080 on your machine to port 3000 in the container
> docker run -p 8080:3000 my-node-app`,
          output: "After running the 'docker run' command, open your web browser and navigate to http://localhost:8080. You should see the message 'Hello from inside a Docker container!'."
        }]
      },
      "exp8": {
        title: "8. Integrate Kubernetes and Docker",
        parts: [{
          code: `// Kubernetes is a container orchestration platform. It manages containers created by Docker.

### 1. Create a Deployment Configuration (deployment.yaml)
// This file tells Kubernetes how to run your container.
// It uses the image 'my-node-app' we built in Ex. 7.

apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-node-app-deployment
spec:
  replicas: 3 # Run 3 instances of our app
  selector:
    matchLabels:
      app: my-node-app
  template:
    metadata:
      labels:
        app: my-node-app
    spec:
      containers:
      - name: my-node-app-container
        image: my-node-app
        ports:
        - containerPort: 3000

### 2. Apply the Deployment
// Prerequisite: A running Kubernetes cluster (like Minikube or Docker Desktop's Kubernetes).
> kubectl apply -f deployment.yaml

### 3. Check the Status
// See the pods (running instances of your app)
> kubectl get pods`,
          output: "After running 'kubectl apply', the command 'kubectl get pods' should show 3 pods with names like 'my-node-app-deployment-...' in 'Running' status."
        }]
      },
      "exp9": {
        title: "9. Automate Running Containerized App with Kubernetes",
        parts: [{
          code: `// This experiment exposes the app from Ex. 8 to be accessible.

### 1. Create a Service Configuration (service.yaml)
// A Service provides a stable network endpoint for your pods.

apiVersion: v1
kind: Service
metadata:
  name: my-node-app-service
spec:
  selector:
    app: my-node-app
  ports:
    - protocol: TCP
      port: 80 # The port the service is available on
      targetPort: 3000 # The port the container is listening on
  type: NodePort # Exposes the service on the node's IP at a static port

### 2. Apply the Service
> kubectl apply -f service.yaml

### 3. Access the Application
// If using Minikube, run this command to get the URL:
> minikube service my-node-app-service

// This will automatically open the URL in your browser. Kubernetes handles routing traffic to one of the 3 running pods.`,
          output: "After running the 'minikube service' command, your browser will open and display the 'Hello from inside a Docker container!' message, served by Kubernetes."
        }]
      },
      "exp10": {
        title: "10. Install and Explore Selenium",
        parts: [{
          code: `// Selenium is a tool for automating web browsers.

### 1. Selenium WebDriver
This is the core of Selenium. It's a library you use in a programming language (like JavaScript, Python, Java) to write scripts that control a browser.

### 2. Language Bindings
You need to install the Selenium library for your chosen language.
// For JavaScript (Node.js)
> npm install selenium-webdriver

### 3. Browser Driver
Selenium needs a specific driver to control a browser. For Chrome, you need ChromeDriver.
- Download ChromeDriver from its official website.
- Make sure the downloaded 'chromedriver' executable is in your system's PATH.

### Exploration:
- The primary way to use Selenium is by writing code.
- You can write scripts to:
  - Open a URL.
  - Find HTML elements (by ID, class, etc.).
  - Click buttons and links.
  - Type text into input fields.
  - Assert that certain text or elements are present on the page.`,
          output: "Installation is verified by successfully running a simple test script, like the one in the next experiment, without errors."
        }]
      },
      "exp11": {
        title: "11. Simple Program in JavaScript with Selenium",
        parts: [{
          code: `// This script uses Selenium to open Google and perform a search.

// Save this as 'test.js'
const { Builder, By, Key, until } = require('selenium-webdriver');

async function runTest() {
  // Create a new WebDriver instance for Chrome
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // 1. Open Google
    await driver.get('https://www.google.com');

    // 2. Find the search box, type 'Selenium WebDriver', and press Enter
    await driver.findElement(By.name('q')).sendKeys('Selenium WebDriver', Key.RETURN);

    // 3. Wait until the title of the page includes the search term
    await driver.wait(until.titleContains('Selenium WebDriver'), 10000);

    console.log('Test Passed: Page title is correct.');

  } finally {
    // Close the browser
    await driver.quit();
  }
}

runTest();`,
          output: "Run this script from your terminal using 'node test.js'. A Chrome browser window will open, perform the search, and then close. The console will print 'Test Passed: Page title is correct.' if successful."
        }]
      },
      "exp12": {
        title: "12. Develop Test Cases for Containerized App",
        parts: [{
          code: `// This Selenium script tests the containerized app from Ex. 7 & 9.

// Save as 'container_test.js'
const { Builder, By, until } = require('selenium-webdriver');

async function runContainerTest() {
  // Make sure your Kubernetes service is running first!
  // Get the URL from 'minikube service my-node-app-service --url'
  const appUrl = 'http://<your-minikube-ip>:<port>'; // Replace with your actual URL

  let driver = await new Builder().forBrowser('chrome').build();
  try {
    // 1. Navigate to the application URL
    await driver.get(appUrl);

    // 2. Find the body of the page
    let body = await driver.findElement(By.tagName('body'));

    // 3. Get the text content
    let bodyText = await body.getText();

    // 4. Assert that the text is correct
    if (bodyText.includes('Hello from inside a Docker container!')) {
      console.log('Test Passed: Correct message found on the page.');
    } else {
      console.error('Test Failed: Message not found.');
    }

  } finally {
    await driver.quit();
  }
}

runContainerTest();`,
          output: "First, get your app's URL from minikube. Then, replace the placeholder in the script and run it using 'node container_test.js'. The console will print a 'Test Passed' message if it can access the app and find the correct text."
        }]
      }
    }
  }
};
