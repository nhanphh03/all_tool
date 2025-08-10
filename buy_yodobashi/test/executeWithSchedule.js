// // Hàm chờ đến một thời điểm cụ thể
// function waitUntilTime(targetHour, targetMinute = 0, targetSecond = 0) {
//     return new Promise((resolve) => {
//         function checkTime() {
//             const now = new Date();
//             const target = new Date();
//
//             // Set target time for today
//             target.setHours(targetHour, targetMinute, targetSecond, 0);
//
//             // If target time has passed today, set for tomorrow
//             if (now > target) {
//                 target.setDate(target.getDate() + 1);
//             }
//
//             const timeUntilTarget = target.getTime() - now.getTime();
//
//             console.log(`Current time: ${now.toLocaleTimeString('vi-VN')}`);
//             console.log(`Target time: ${target.toLocaleTimeString('vi-VN')}`);
//             console.log(`Waiting ${Math.round(timeUntilTarget / 1000)} seconds until execution...`);
//
//             if (timeUntilTarget <= 1000) {
//                 console.log(`🎯 Time reached! Executing at: ${new Date().toLocaleTimeString('vi-VN')}`);
//                 resolve();
//             } else {
//                 // Check every minute, or every 30 seconds if less than 2 minutes remaining
//                 const checkInterval = timeUntilTarget < 2 * 60 * 1000 ? 30000 : 60000;
//                 setTimeout(checkTime, checkInterval);
//             }
//         }
//
//         checkTime();
//     });
// }
//
// // Hàm chờ với countdown chi tiết
// function waitUntilTimeWithCountdown(targetHour, targetMinute = 0) {
//     return new Promise((resolve) => {
//         const target = new Date();
//         target.setHours(targetHour, targetMinute, 0, 0);
//
//         // If target time has passed today, set for tomorrow
//         const now = new Date();
//         if (now > target) {
//             target.setDate(target.getDate() + 1);
//         }
//
//         console.log(`⏰ Scheduled execution time: ${target.toLocaleString('vi-VN')}`);
//
//         function updateCountdown() {
//             const now = new Date();
//             const timeLeft = target.getTime() - now.getTime();
//
//             if (timeLeft <= 0) {
//                 console.log(`🚀 Executing now at: ${now.toLocaleTimeString('vi-VN')}`);
//                 resolve();
//                 return;
//             }
//
//             const hours = Math.floor(timeLeft / (1000 * 60 * 60));
//             const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
//             const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
//
//             // Clear previous line and show countdown
//             process.stdout.write(`\r⏳ Countdown: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} remaining`);
//
//             setTimeout(updateCountdown, 1000);
//         }
//
//         updateCountdown();
//     });
// }
//
// // Main execution với schedule
// async function executeWithSchedule() {
//     try {
//         const fs = require('fs-extra');
//         const {chromium} = require('playwright');
//         const config = require('./config');
//         const {configBrowser} = require("./function");
//
//         const start = new Date();
//         const data = await fs.readFile(config.paths.json, 'utf8');
//         const jsonData = JSON.parse(data);
//
//         const users = jsonData.users || [];
//         const links = jsonData.linkList || [];
//         const jsonConfig = jsonData.config || {};
//
//         console.log('Data loaded:', { usersCount: users.length, linksCount: links.length});
//
//         const browser = await chromium.launch({
//             headless: false,
//             slowMo: config.browser.slowMo,
//             args: [
//                 '--disable-blink-features=AutomationControlled',
//                 '--disable-web-security',
//                 '--disable-features=VizDisplayCompositor',
//                 '--no-first-run',
//                 '--no-default-browser-check',
//                 '--disable-extensions',
//                 '--disable-plugins',
//                 '--disable-default-apps',
//                 '--start-maximized'
//             ]
//         });
//
//         // Sử dụng hàm đã tách
//         const pagesMain = await configBrowser(links, users, browser, jsonConfig);
//
//         console.log('Browser configuration completed');
//         console.log('Page 1', pagesMain[0].page);
//         console.log('Page 2', pagesMain[1].page);
//
//         // ==================== CHỜ ĐẾN 9:00 ====================
//         console.log('\n🕘 Waiting until 9:00 AM to continue execution...');
//
//         // Chọn một trong các cách sau:
//
//         // CÁCH 1: Chờ đến 9:00 với log đơn giản
//         await waitUntilTime(9, 0); // 9:00:00
//
//         // CÁCH 2: Chờ đến 9:00 với countdown chi tiết (uncomment để dùng)
//         // await waitUntilTimeWithCountdown(9, 0);
//
//         // CÁCH 3: Chờ đến thời gian cụ thể khác (ví dụ: 9:30)
//         // await waitUntilTime(9, 30); // 9:30:00
//
//         // ==================== CODE THỰC THI SAU 9:00 ====================
//         console.log('\n🎉 Starting scheduled execution...');
//
//         // Đây là nơi bạn đặt code cần thực thi sau 9:00
//         for (const userResult of pagesMain) {
//             if (userResult.loginSuccess) {
//                 console.log(`Processing pages for user: ${userResult.user.username}`);
//
//                 for (const [index, page] of userResult.page.entries()) {
//                     try {
//                         console.log(`Executing actions on page ${index + 1}...`);
//
//                         // VÍ DỤ: Thực hiện các hành động trên page
//                         await page.waitForLoadState('networkidle', { timeout: 10000 });
//
//                         // Thêm các actions cần thiết ở đây
//                         // await page.click('button');
//                         // await page.fill('input', 'value');
//                         // await page.screenshot({path: `screenshot-${index}.png`});
//
//                         console.log(`✅ Completed actions on page ${index + 1}`);
//
//                     } catch (error) {
//                         console.error(`❌ Error on page ${index + 1}:`, error.message);
//                     }
//                 }
//             }
//         }
//
//         console.log(`\n🏁 Total execution time: ${new Date().getTime() - start.getTime()}ms`);
//
//     } catch (error) {
//         console.error('❌ Main Error:', error.message);
//         console.error('Stack trace:', error.stack);
//     }
// }
//
// // Chạy main function
// executeWithSchedule();
//
// // BONUS: Nếu muốn schedule chạy hàng ngày vào 9:00
// function scheduleDaily() {
//     const now = new Date();
//     const target = new Date();
//     target.setHours(9, 0, 0, 0);
//
//     // If 9:00 AM has passed today, schedule for tomorrow
//     if (now > target) {
//         target.setDate(target.getDate() + 1);
//     }
//
//     const timeUntilTarget = target.getTime() - now.getTime();
//
//     console.log(`📅 Scheduling daily execution at 9:00 AM`);
//     console.log(`⏰ Next execution: ${target.toLocaleString('vi-VN')}`);
//
//     setTimeout(() => {
//         executeWithSchedule();
//
//         // Schedule again for tomorrow
//         setInterval(executeWithSchedule, 24 * 60 * 60 * 1000);
//     }, timeUntilTarget);
// }
//
// // Uncomment dòng dưới nếu muốn chạy hàng ngày
// // scheduleDaily();
//
// module.exports = {
//     waitUntilTime,
//     waitUntilTimeWithCountdown,
//     executeWithSchedule,
//     scheduleDaily
// };