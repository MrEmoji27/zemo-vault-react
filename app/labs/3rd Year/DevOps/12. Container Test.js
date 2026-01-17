// This Selenium script tests the containerized app from Ex. 7 & 9.

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

runContainerTest();
