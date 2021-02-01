const puppeteer = require('puppeteer');
const fs = require('fs');

const url = 'https://www.itemsatis.com/favori-ilanlarim.html';

(async function () {
    const browser = await puppeteer.launch({ headless: true, args: ["--disable-notifications"], ignoreHTTPSErrors: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", interceptedRequest => {

        var dataa = {
            "method": "POST",
            "timeout": 0,
            "headers": {
                "authority": "www.itemsatis.com",
                "pragma": "no-cache",
                "cache-control": "no-cache",
                "sec-ch-ua": "\"Chromium\";v=\"88\", \"Google Chrome\";v=\"88\", \";Not A Brand\";v=\"99\"",
                "accept": "*/*",
                "x-requested-with": "XMLHttpRequest",
                "sec-ch-ua-mobile": "?0",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "origin": "https://www.itemsatis.com",
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "sec-fetch-dest": "empty",
                "referer": "https://www.itemsatis.com/index.php",
                "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6",
                "Cookie": "__cfduid=d053f8fe786e1e331aa49127705cce6391612140412; PHPSESSID=rks7jipckajthju14db4uc6avu"
            },
            "data": "UserName=kazimhas96&Password=hXbtvxUNVOs&csrf_token=29330e87f3e7ab7694eb7d2bbc00754f"
        };
        interceptedRequest.continue(dataa);
    });

    await page.goto(url);
    // await page.screenshot({ path: 'login.png' });

    const UrlsSelector = '.AdvertBox-Main a:nth-child(2)';
    await page.waitForSelector(UrlsSelector, { timeout: 0 });
    const Urls = await page.$$eval(UrlsSelector, Links => Links.map(link => link.href));
    console.log(Urls);
    // Visit each page one by one
    for (let Url of Urls) {

        // open the page
        try {
            await page.goto(Url);
            console.log('opened the page: ', Url);
        } catch (error) {
            console.log(error);
            console.log('failed to open the page: ', Url);
        }

        // get the pathname
        let pagePathname = await page.evaluate(() => location.pathname);
        pagePathname = pagePathname.replace(/\//g, "-");
        console.log('got the pathname:', pagePathname);

        console.log('URL : ', Url);
        // Find price
        const priceSelector = '.postPricesGroup b';
        await page.waitForSelector(priceSelector);
        const price = await page.$eval(priceSelector, priceSelector => priceSelector.innerHTML);
        console.log('Price : ', price);

        // Find images
        const imgSelector = '.item img[src]';
        await page.waitForSelector(imgSelector);
        const imgs = await page.$$eval(imgSelector, imgs => imgs.map(img => img.getAttribute('src')));
        console.log('img : ', imgs);

        // Find base-64 images 

        const base = await page.$(imgSelector);
        const base64 = await base.screenshot({ encoding: "base64" });
        console.log('base64 img : ', 'done ..');

        const items = {
            "Url : ": Url,
            "Price : ": price,
            "imgs : ": imgs,
            "base64 : ": base64
        };

        // Write to itemss.json file

        fs.appendFile("itemss.json", JSON.stringify(items), err => {
            if (err) throw err;
            console.log("File written.");
        });
    }

    await browser.close();
})();

