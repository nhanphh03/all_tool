// const fs = require('fs-extra');
// const path = require('path');
// const { chromium } = require('playwright');
// const parse = require('csv-parse/lib/sync');
// const config = require('./config');
//
// const delay = ms => new Promise(res => setTimeout(res, ms));
//
// async function processRow(browser, row, dayLst) {
//     const context = await browser.newContext();
//     const page = await context.newPage();
//     await page.goto(config.url);
//
//     const phoneNumber = '09012345678';
//     const national = 'Vietnam';
//
//     await selectCheckboxByValue(page, '18', '同意する（I agree.）');
//     await fillInputAutoDetect(page, '7', row[0]);
//     await fillInputAutoDetect(page, '1', row[1]);
//     await fillInputAutoDetect(page, '8', phoneNumber);
//     await fillInputAutoDetect(page, '2', national);
//     await fillInputAutoDetect(page, '14', national);
//
//     await selectRadioByValue(page, '20', '非免除国 (NOT countries exempt from foreign license exchange test)');
//     await delay(1500);
//     await selectRadioByValue(page, '22', 'ない(No)');
//
//     for (let i = 0; i < dayLst.length;) {
//         const value = dayLst[i];
//         const success = await selectCheckboxByValueDate(page, '4', value);
//         if (success) {
//             dayLst.splice(i, 1)
//             break;
//         }
//         else dayLst.splice(i, 1);
//     }
//
//     if (row[2] === 'Motorcycle') {
//         await selectRadioByValue(page, '19', 'バイク(Motorcycle)');
//     } else if (row[2] === 'Vehicle') {
//         await selectRadioByValue(page, '19', '自動車(Vehicle)');
//     } else {
//         await selectRadioByValue(page, '19', '原付(Moped)');
//     }
//
//     await uploadFile(path, config, page, '9', row[3]);
//     await uploadFile(path, config, page, '10', row[4]);
//     await fillInputAutoDetect(page, '15', 'hotrocuocsong.nhatban@gmail.com');
//
//     await confirm(page);
//     await delay(2500);
//
//     // await context.close();
// }
//
// async function processInBatches(rows, browser, dayLst, batchSize = 9) {
//     for (let i = 0; i < rows.length; i += batchSize) {
//         const batch = rows.slice(i, i + batchSize);
//
//         const tasks = batch.map(row =>
//             processRow(browser, row, [...dayLst])
//         );
//
//         const results = await Promise.allSettled(tasks);
//
//         results.forEach((result, index) => {
//             const row = batch[index];
//             if (result.status === 'fulfilled') {
//                 console.log(`Thành công: ${row.join(' - ')}`);
//             } else {
//                 console.error(`Lỗi dòng ${row.join(' - ')}: ${result.reason}`);
//             }
//         });
//     }
// }
//
// (async () => {
//     const start = new Date();
//     console.log(`🔄 Bắt đầu lúc: ${start.toLocaleString()}`);
//
//     try {
//         const content = await fs.readFile(config.paths.csv, 'utf8');
//         const rows = parse(content, { trim: true });
//         const dayLst = renderWeekdaysWithTimesPreviousMonth(); // hoặc tháng sau tùy
//
//         const browser = await chromium.launch({
//             headless: config.browser.headless,
//             slowMo: config.browser.slowMo,
//             timeout: 5000
//         });
//
//         await processInBatches(rows, browser, dayLst, 5);
//
//         // await browser.close();
//     } catch (err) {
//         console.error('Lỗi toàn cục:', err.message);
//     }
//
//     const end = new Date();
//     console.log(`Hoàn tất. Thời gian xử lý: ${(end - start) / 1000}s`);
// })();
//
// //Functions used in the code above
// const uploadFile = async (path, config, page, dataItemId, fileName) => {
//     const input = await page.$(`input[type="file"][data-item-id="${dataItemId}"]`);
//     const filePath = path.resolve(config.paths.assets, fileName);
//     await input.setInputFiles(filePath);
//     await page.evaluate((id) => {
//         document.querySelector(`input[type="file"][data-item-id="${id}"]`);
//     }, dataItemId);
//     console.log(`Đã upload file ${fileName} vào data-item-id="${dataItemId}"`);
// };
//
// const selectCheckboxByValue = async (page, dataItemId, value, checked = true) => {
//     const selector = `input[type="checkbox"][data-item-id="${dataItemId}"][value="${value}"]`;
//     try {
//         await page.waitForSelector(selector, { timeout: 2500 });
//         const checkbox = await page.$(selector);
//
//         if (!checkbox) {
//             console.error(`Không tìm thấy checkbox với data-item-id="${dataItemId}" và value="${value}"`);
//             return;
//         }
//
//         const isChecked = await checkbox.isChecked();
//
//         if (isChecked !== checked) {
//             await checkbox.click({ force: true });
//             console.log(`Đã ${checked ? 'check' : 'uncheck'} checkbox với value="${value}" và data-item-id="${dataItemId}"`);
//         } else {
//             console.log(`Checkbox với value="${value}" và data-item-id="${dataItemId}" đã ở trạng thái ${checked ?
//                 'checked' : 'unchecked'}, không cần click.`);
//         }
//     } catch (error) {
//         console.error(`Lỗi khi chọn checkbox: ${error.message}`);
//     }
// };
//
// const selectRadioByValue = async (page, dataItemId, value) => {
//     const selector = `input[type="radio"][data-item-id="${dataItemId}"][value="${value}"]`;
//     try {
//         await page.waitForSelector(selector, { timeout: 2500 });
//         const radio = await page.$(selector);
//
//         console.error(`Đã tìm thấy radio với data-item-id="${dataItemId}" và value="${value}"`);
//         if (!radio) {
//             console.error(`Không tìm thấy radio với data-item-id="${dataItemId}" và value="${value}"`);
//             return;
//         }
//
//         await radio.click({ force: true });
//         console.log(`Đã click radio với value="${value}" và data-item-id="${dataItemId}"`);
//     } catch (error) {
//         console.error(`Lỗi khi chọn radio: ${error.message}`);
//     }
// };
//
// const fillInputAutoDetect = async (page, dataItemId, value) => {
//     const selector = `[data-item-id="${dataItemId}"]`;
//     try {
//         await page.waitForSelector(selector, { timeout: 2500 });
//
//         const tagName = await page.$eval(selector, el => el.tagName.toLowerCase());
//         if (tagName === 'input' || tagName === 'textarea') {
//             await page.fill(selector, value);
//             console.log(`Đã nhập "${value}" vào ${tagName} với data-item-id="${dataItemId}"`);
//         } else {
//             console.error(`Thẻ không hợp lệ: ${tagName}`);
//         }
//     } catch (error) {
//         console.error(`Không thể nhập dữ liệu: ${error.message}`);
//     }
// };
//
// const confirm = async (page) => {
//     const confirmBtn = await page.$('[data-testid="form-detail--to-confirm-button"]');
//     if (confirmBtn) {
//         await confirmBtn.click();
//         console.log("Đã nhấn nút xác nhận");
//     } else {
//         console.error("Không tìm thấy nút xác nhận");
//     }
// };
//
// const submit = async (page) => {
//     const submitBtn = await page.$('[data-testid="form-detail--to-completion-button"]');
//     if (submitBtn) {
//         await submitBtn.click();
//         console.log(" Đã nhấn nút gửi (送信)");
//     } else {
//         console.error("Không tìm thấy nút gửi");
//     }
// };
//
// function renderWeekdaysWithTimesNextMonth() {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth();
//
//     const date = new Date(year, month + 1, 1);
//
//     const results = [];
//     const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
//     const timeSlots = ['1:00PM', '10:00AM'];
//
//     while (date.getMonth() === (month + 1) % 12) {
//         const dayOfWeek = date.getDay();
//
//         if (dayOfWeek >= 1 && dayOfWeek <= 5) {
//             const formattedDate = `${date.getFullYear()}/` +
//                 `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
//                 `${date.getDate().toString().padStart(2, '0')}` +
//                 `（${weekdays[dayOfWeek]}）`;
//
//             timeSlots.forEach(time => {
//                 results.push(`${formattedDate};${time}`);
//             });
//         }
//
//         date.setDate(date.getDate() + 1);
//     }
//
//     return results;
// }
//
// const selectCheckboxByValueDate = async (page, dataItemId, value, checked = true) => {
//     const selector = `input[type="checkbox"][data-item-id="${dataItemId}"][value="${value}"]`;
//     try {
//         await page.waitForSelector(selector, { timeout: 1500 });
//         const checkbox = await page.$(selector);
//
//         if (!checkbox) {
//             console.error(`Không tìm thấy checkbox với data-item-id="${dataItemId}" và value="${value}"`);
//             return false;
//         }
//
//         const isDisabled = await checkbox.evaluate(el => el.disabled);
//         if (isDisabled) {
//             console.log(`Checkbox với value="${value}" đã bị disable. Bỏ qua.`);
//             return false;
//         }
//
//         const isChecked = await checkbox.isChecked();
//         if (isChecked !== checked) {
//             await checkbox.click({ force: true });
//             console.log(`Đã ${checked ? 'check' : 'uncheck'} checkbox với value="${value}"`);
//         } else {
//             console.log(`Checkbox với value="${value}" đã ở trạng thái mong muốn.`);
//         }
//
//         return true;
//     } catch (error) {
//         console.error(`Lỗi khi xử lý checkbox value="${value}": ${error.message}`);
//         return false;
//     }
// };
//
// function renderWeekdaysWithTimesPreviousMonth() {
//     const now = new Date();
//     let year = now.getFullYear();
//     let month = now.getMonth() - 1;
//
//     if (month < 0) {
//         month = 11;
//         year -= 1;
//     }
//
//     const date = new Date(year, month, 1);
//
//     const results = [];
//     const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
//     const timeSlots = ['1:00PM', '10:00AM'];
//
//     while (date.getMonth() === month) {
//         const dayOfWeek = date.getDay();
//
//         if (dayOfWeek >= 1 && dayOfWeek <= 5) {
//             const formattedDate = `${date.getFullYear()}/` +
//                 `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
//                 `${date.getDate().toString().padStart(2, '0')}（${weekdays[dayOfWeek]}）`;
//
//             timeSlots.forEach(time => {
//                 results.push(`${formattedDate};${time}`);
//             });
//         }
//
//         date.setDate(date.getDate() + 1);
//     }
//
//     return results;
// }
//
//
// // 2025-06-13T11:22:10.513Z
// // 2025-06-13T11:22:41.531Z
