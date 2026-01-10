const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const url = 'https://careers-hive-malta-prod.vercel.app';
    console.log(`Auditing LCP for: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2' });

    const lcp = await page.evaluate(() => {
        return new Promise(resolve => {
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                resolve(lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // Fallback if no LCP event fires in 10s
            setTimeout(() => resolve("LCP Timeout"), 10000);
        });
    });

    console.log(`LCP Result: ${lcp}ms`);

    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../reports/performance.json');
    fs.writeFileSync(reportPath, JSON.stringify({ url, lcp, timestamp: new Date().toISOString() }, null, 2));

    await browser.close();
})();
