const fs = require('fs-extra');
const {chromium} = require('playwright');
const config = require('./config');
const {
    configBrowser,
    waitUntilTime,
    delay,
    reloadAllPages,
    addProductToCard,
    proceedToCheckoutStep1,
    proceedToCheckoutStep2,
    placeOrder,
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

        console.log('Data loaded:', {usersCount: users.length, linksCount: links.length});

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
        console.log("\n")

        await (async () => {
            await waitUntilTime(jsonConfig.hourRun, jsonConfig.minuteRun, jsonConfig.secondRun);
            console.log("Chạy code sau khi đủ giờ");
            console.log("\n")
        })();

        const startBuy = new Date();

        for (const browser of pagesMain) {
            console.log("⏳ Bắt đầu mua hàng lúc ", startBuy.toLocaleTimeString('vi-VN'));
            console.log("\n")
            await reloadAllPages(browser.page);
            const cvv = browser.user.cvv;
            console.log(cvv)
            for (const page of browser.page) {
                await addProductToCard( page );
                await delay(1000);
                await proceedToCheckoutStep1( page );
                await delay(1000);
                await proceedToCheckoutStep2( page );
                await delay(1000);
                await enterSecurityCode( page, cvv );
                await delay(1000);
                await placeOrder( page );
                await delay(1000);
                console.log("Đặt thành công đơn hàng !")
                console.log("\n")
                // await proceedWith3DSecure( page );
            }
        }

        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mở tool: ${new Date().getTime() - start.getTime()}ms`);
        console.log("\n")
        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mua hàng: ${new Date().getTime() - startBuy.getTime()}ms`);

    } catch (error) {
        console.error('Main Error:', error.message);
        console.error('Stack trace:', error.stack);
    }
})();

//note 14: nhap xong so cvv khong tu dong bam dat hang