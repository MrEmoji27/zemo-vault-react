export const devOps = {
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

// ### 2. Create the Dockerfile
// // In the same folder, create a file named 'Dockerfile' (no extension)
FROM node:18-alpine
WORKDIR /app
COPY app.js .
CMD ["node", "app.js"]

// ### 3. Build and Run the Container
// // Open your terminal in the folder and run:

// // Build the image
> docker build -t my-node-app .

// // Run the container, mapping port 8080 on your machine to port 3000 in the container
> docker run -p 8080:3000 my-node-app`,
      output: "After running the 'docker run' command, open your web browser and navigate to http://localhost:8080. You should see the message 'Hello from inside a Docker container!'."
    }]
  },
  "exp8": {
    title: "8. Integrate Kubernetes and Docker",
    parts: [{
      code: `// Kubernetes is a container orchestration platform. It manages containers created by Docker.

// ### 1. Create a Deployment Configuration (deployment.yaml)
// // This file tells Kubernetes how to run your container.
// // It uses the image 'my-node-app' we built in Ex. 7.

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

// ### 2. Apply the Deployment
// // Prerequisite: A running Kubernetes cluster (like Minikube or Docker Desktop's Kubernetes).
> kubectl apply -f deployment.yaml

// ### 3. Check the Status
// // See the pods (running instances of your app)
> kubectl get pods`,
      output: "After running 'kubectl apply', the command 'kubectl get pods' should show 3 pods with names like 'my-node-app-deployment-...' in 'Running' status."
    }]
  },
  "exp9": {
    title: "9. Automate Running Containerized App with Kubernetes",
    parts: [{
      code: `// This experiment exposes the app from Ex. 8 to be accessible.

// ### 1. Create a Service Configuration (service.yaml)
// // A Service provides a stable network endpoint for your pods.

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

// ### 2. Apply the Service
> kubectl apply -f service.yaml

// ### 3. Access the Application
// // If using Minikube, run this command to get the URL:
> minikube service my-node-app-service

// // This will automatically open the URL in your browser. Kubernetes handles routing traffic to one of the 3 running pods.`,
      output: "After running the 'minikube service' command, your browser will open and display the 'Hello from inside a Docker container!' message, served by Kubernetes."
    }]
  },
  "exp10": {
    title: "10. Install and Explore Selenium",
    parts: [{
      code: `// Selenium is a tool for automating web browsers.

// ### 1. Selenium WebDriver
This is the core of Selenium. It's a library you use in a programming language (like JavaScript, Python, Java) to write scripts that control a browser.

// ### 2. Language Bindings
You need to install the Selenium library for your chosen language.
// For JavaScript (Node.js)
> npm install selenium-webdriver

// ### 3. Browser Driver
Selenium needs a specific driver to control a browser. For Chrome, you need ChromeDriver.
- Download ChromeDriver from its official website.
- Make sure the downloaded 'chromedriver' executable is in your system's PATH.

// ### Exploration:
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
};
