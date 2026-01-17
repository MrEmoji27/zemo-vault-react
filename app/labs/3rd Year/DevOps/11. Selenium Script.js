// This script uses Selenium to open Google and perform a search.

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

runTest();
