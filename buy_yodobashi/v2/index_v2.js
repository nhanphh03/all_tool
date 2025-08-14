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
        console.log(pagesMain)

        console.log('⏳ Bắt đầu hẹn giờ chạy chương trình \n');

        await (async () => {
            await waitUntilTime(jsonConfig.hourRun, jsonConfig.minuteRun, jsonConfig.secondRun);
            console.log("Chạy code sau khi đủ giờ \n");
        })();

        const startBuy = new Date();

        console.log("⏳ Bắt đầu mua hàng lúc ", startBuy.toLocaleTimeString('vi-VN') , " \n");

        const allPages = pagesMain.flatMap(browser =>
            browser.page.map(p => p.page)
        );
        await reloadAllPages(allPages);


        for (const browser of pagesMain) {
            console.log("-------------------------------------------------------------------------")
            const startChild = new Date();
            console.log("Bắt đầu mua hàng cho tài khoản --- ", browser.user.username)
            const cvv = browser.user.cvv;
            for (const { page, quantity } of browser.page) {
                await addProductToCard( page, quantity );
            }
            const page = null;
            // await proceedToCheckoutStep1( page );
            // await delay(1000);
            // await proceedToCheckoutStep2( page );
            // await delay(1000);
            // await enterSecurityCode( page, cvv );
            // await delay(1000);
            // await placeOrder( page );
            // await delay(1000);
            console.log("Đặt thành công đơn hàng !")
            // await proceedWith3DSecure( page );


            const endChild = new Date();
            console.log("Kết thúc mua hàng cho tài khoản --- ", browser.user.username, " tổng thời gian ", endChild - startChild);
            console.log("--------------------------------------------------------------------------")
        }

        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mở tool: ${new Date().getTime() - start.getTime()}ms \n`);
        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mua hàng: ${new Date().getTime() - startBuy.getTime()}ms \n`);

    } catch (error) {
        console.error('Main Error:', error.message);
        console.error('Stack trace:', error.stack);
    }
})();

