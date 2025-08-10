const fs = require('fs-extra');
const {chromium} = require('playwright');
const config = require('./config');
const {configBrowser,
    waitUntilTime,
    delay,
    reloadAllPages,
    addProductToCard,
    proceedToCheckoutStep1,
    proceedToCheckoutStep2,
    placeOrder,
    proceedWith3DSecure,
    enterSecurityCode
} = require("./function");

(async () => {
    try {
        const start = new Date();
        const data = await fs.readFile(config.paths.json, 'utf8');
        const jsonData = JSON.parse(data);

        const users = jsonData.users || [];
        const links = jsonData.linkList || [];
        const jsonConfig = jsonData.config || {};

        console.log('Data loaded:', { usersCount: users.length, linksCount: links.length});

        const browser = await chromium.launch({
            headless: false,
            slowMo: config.browser.slowMo,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-default-apps',
                '--start-maximized'
            ]
        });

        // Sử dụng hàm đã tách
        const pagesMain = await configBrowser(links, users, browser, jsonConfig);

        console.log('⏳ Bắt đầu hẹn giờ chạy chương trình');

        await (async () => {
            await waitUntilTime(jsonConfig.hourRun, jsonConfig.minuteRun, jsonConfig.secondRun);
            console.log("Chạy code sau khi đủ giờ");
        })();

        const startBuy = new Date();

        for(const browser of pagesMain) {
            console.log("⏳ Bắt đầu mua hàng lúc ", startBuy.toLocaleTimeString('vi-VN'));
            console.log(browser.page)
            await reloadAllPages(browser.page);
            for (const page of browser.page){
                // await addProductToCard(1, page);
                // await proceedToCheckoutStep1( page);
                // await proceedToCheckoutStep2( page);
                // await enterSecurityCode( page, 222 );
                // await placeOrder( page );
                // await proceedWith3DSecure( page );
            }
        }

        // console.log(`Successfully processed: ${pagesMain.filter(p => p.loginSuccess).length}/${pagesMain.length} users`);
        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mở tool: ${new Date().getTime() - start.getTime()}ms`);
        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mua hàng: ${new Date().getTime() - startBuy.getTime()}ms`);

    } catch (error) {
        console.error('Main Error:', error.message);
        console.error('Stack trace:', error.stack);
    }
})();