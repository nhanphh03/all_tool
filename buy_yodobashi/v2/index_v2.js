const fs = require('fs-extra');
const config = require('./config');
const {
    configBrowser,
    waitUntilTime,
    reloadAllPages,
    processAllBrowsersParallel
} = require("./function");


(async () => {
    try {
        const start = new Date();
        const data = await fs.readFile(config.paths.json, 'utf8');
        const jsonData = JSON.parse(data);

        const users = jsonData.users || [];
        const links = jsonData.linkList || [];
        const jsonConfig = jsonData.config || {};

        console.log('Dữ liệu chuẩn bị mua hàng :', {usersCount: users.length, linksCount: links.length});

        const pagesMain = await configBrowser(links, users, jsonConfig);
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

        let results = await processAllBrowsersParallel(pagesMain);

        const successResults = results.filter(r => r && r.success);
        const failedResults = results.filter(r => r && !r.success);

        console.log(`\n🎯 FINAL SUMMARY:`);
        console.log(`Total processed: ${results.length}`);
        console.log(`Successful orders: ${successResults.length}`);
        console.log(`Failed orders: ${failedResults.length}`);

        if (failedResults.length > 0) {
            console.log(`\n❌ Failed accounts:`);
            failedResults.forEach(result => {
                console.log(`- ${result.username}: ${result.error}`);
            });
        }

        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mở tool: ${(new Date().getTime() - start.getTime())/1000}ms \n`);
        console.log(`⏳ Tổng thời gian từ lúc bắt đầu mua hàng: ${(new Date().getTime() - startBuy.getTime())/1000}ms \n`);

    } catch (error) {
        console.error('Main Error:', error.message);
        console.error('Stack trace:', error.stack);
    }
})();

