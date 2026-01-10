const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    const url = 'https://careers-hive-malta-prod.vercel.app';
    console.log(`Extracting SEO tags for: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2' });

    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => "Missing Meta Description");
    const h1 = await page.$$eval('h1', els => els.map(e => e.textContent));

    const seoData = {
        url,
        title,
        description,
        h1Texts: h1,
        timestamp: new Date().toISOString()
    };

    console.log('SEO Data Extracted:', seoData);

    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../reports/seo/meta-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(seoData, null, 2));

    await browser.close();
})();
