
const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
        await page.goto('https://www.adda.io/login', { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (e) { }

    // Cookie Banner
    try {
        const acceptBtn = await page.$('#acceptbutton');
        if (acceptBtn) await acceptBtn.click();
    } catch (e) { }

    // Sign In Click
    try {
        const signInBtn = await page.evaluateHandle(() => {
            return Array.from(document.querySelectorAll('button, a'))
                .find(b => ['sign in', 'login'].includes(b.innerText.trim().toLowerCase()));
        });
        if (signInBtn.asElement()) {
            console.log('Clicking Sign In...');
            await signInBtn.click();
            await new Promise(r => setTimeout(r, 4000));
        }
    } catch (e) { }

    // Dump Inputs Concise
    const inputNames = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input')).map(i => `${i.name} [${i.type}]`);
    });
    console.log('--- FINAL INPUTS ---');
    console.log(inputNames.join('\n'));

    // Cookies
    const cookies = await page.cookies();
    console.log('--- COOKIES ---');
    console.log(cookies.map(c => c.name).join(', '));

    await browser.close();
})();
