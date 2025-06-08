const { Builder, By, until } = require("selenium-webdriver");

async function runTest() {
  const driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("http://localhost:3000"); // Change this to your app URL

    // 1. Find the "Login" button by exact text and click it
    const loginBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Login')]")),
      10000
    );
    await loginBtn.click();

    // 2. Wait for the AuthDialog to open
    // Adjust selector according to your dialog structure (example assumes a form inside dialog)
    const loginForm = await driver.wait(
      until.elementLocated(By.css("form")), // You might want a more specific selector here
      10000
    );

    // 3. Fill username and password inputs
    // Replace input selectors with actual ones from your AuthDialog form
    const usernameInput = await loginForm.findElement(
      By.css('input[name="email"]')
    );
    await usernameInput.sendKeys("jival38982@claspira.com"); // Replace with your test user

    const passwordInput = await loginForm.findElement(
      By.css('input[name="password"]')
    );
    await passwordInput.sendKeys("Test@123"); // Replace with your test password

    // 4. Debug: print page source before submit
    const pageSource = await driver.getPageSource();
    console.log("=== PAGE SOURCE BEFORE CLICKING SUBMIT BUTTON ===");
    console.log(pageSource);

    // 5. Click the submit button (assumed to be button[type="submit"] inside form)
    const submitBtn = await loginForm.findElement(
      By.css('button[type="submit"]')
    );
    await submitBtn.click();

    // 6. Wait for an element that confirms login success (adjust selector!)
    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Logout')]")),
      10000
    );

    console.log("✅ Login test passed!");
  } catch (err) {
    console.error("❌ Test failed with error:", err);
  } finally {
    await driver.quit();
  }
}

runTest();
