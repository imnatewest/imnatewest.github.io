const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('http://localhost:5173');
        // Wait for boot sequence and 1s idle timeout
        await new Promise(r => setTimeout(r, 4500));
        const errText = await page.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('div'));
            const errDiv = divs.find(d => d.style.color === 'red');
            return errDiv ? errDiv.innerText : null;
        });
        if (errText) console.log("ERROR TRACE:", errText);
        else console.log("NO ERROR FOUND");
        await browser.close();
    } catch (e) {
        console.log("PUPPETEER EXCEPTION:", e);
    }
})();
