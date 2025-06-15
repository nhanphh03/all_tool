// const fs = require('fs-extra');
// const path = require('path');
// const {chromium} = require('playwright');
// const parse = require('csv-parse/lib/sync');
// const config = require('./config');
//
// const delay = ms => new Promise(res => setTimeout(res, ms));
//
// const phoneNumber = '07045633348';
// const national = 'ベトナム';
//
// const uploadFile = async (page, dataItemId, fileName) => {
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
//         await page.waitForSelector(selector, { timeout: 5000 });
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
//         await page.waitForSelector(selector, { timeout: 5000 });
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
//         await page.waitForSelector(selector, { timeout: 3000 });
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
//         const confirmBtn = await page.$('[data-testid="form-detail--to-confirm-button"]');
//         if (confirmBtn) {
//             await confirmBtn.click();
//             console.log("Đã nhấn nút xác nhận");
//         } else {
//             console.error("Không tìm thấy nút xác nhận");
//         }
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
// function renderWeekdaysWithTimes() {
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
// const dayLst = renderWeekdaysWithTimes();
//
// console.log(dayLst);
//
// (async () => {
//     const content = await fs.readFile(config.paths.csv, 'utf8');
//     const rows = parse(content, { trim: true });
//
//     const browser = await chromium.launch({
//         headless: config.browser.headless,
//         slowMo: config.browser.slowMo,
//         timeout: config.browser.timeout
//     });
//
//     const pages = [];
//
//     for (const row of rows) {
//         const context = await browser.newContext();
//         const page = await context.newPage();
//         await page.goto(config.url);
//         pages.push({ page, row });
//     }
//
//     for (const { page, row } of pages) {
//         console.log(`${row[0]} - ${row[1]} - ${row[2]} - ${row[3]} - ${row[4]}`);
//         //Q1:
//         await selectCheckboxByValue(page, '18', '同意する（I agree.）');
//         //Q2:
//         await fillInputAutoDetect(page, '7', row[0]);
//         //Q3:
//         await fillInputAutoDetect(page, '1', row[1]);
//         //Q4:
//         await fillInputAutoDetect(page, '8', phoneNumber);
//         //Q5:
//         await fillInputAutoDetect(page, '2', national);
//         //Q6:
//         await fillInputAutoDetect(page, '14', national);
//         //Q7:
//         await selectRadioByValue(page, '20', '非免除国 (NOT countries exempt from foreign license exchange test)');
//         await delay(1500);
//         //Q8:
//         await selectRadioByValue(page, '22', 'ない(No)');
//         //Q10:
//         // await autoFillDateReserve();
//         //Q11:
//         if (row[2] === 'Motorcycle'){
//             await selectRadioByValue(page, '19', 'バイク(Motorcycle)');
//         }else if (row[2] === 'Vehicle') {
//             await selectRadioByValue(page, '19', '自動車(Vehicle)');
//         } else {
//             await selectRadioByValue(page, '19', '原付(Moped)');
//         }
//         //Q12:
//         // await uploadFile(page, '9', row[0]);
//         console.log( row[3]);
//         //Q13:
//         console.log( row[4]);
//         // await uploadFile(page, '10', row[0]);
//         //Q14:
//         await fillInputAutoDetect(page, '15', 'hotrocuocsong.nhatban@gmail.com');
//
//         // Submit step 1:
//         await confirm(page);
//         await delay(2500);
//         // Submit step 2:
//         await submit(page);
//
//         // sent no wait
//     }
//
//     console.log(`Hoàn tất: ${rows.length} dòng đã được gửi`);
// })();
//
//
//
// //--------------------------------------------------
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
// const selectCheckboxByValue = async (page, dataItemId, value, checked = true) => {
//     const selector = `input[type="checkbox"][data-item-id="${dataItemId}"][value="${value}"]`;
//     console.log(selector)
//     // try {
//     //     await page.waitForSelector(selector, { timeout: 5000 });
//     //     const checkbox = await page.$(selector);
//     //
//     //     if (!checkbox) {
//     //         console.error(`Không tìm thấy checkbox với data-item-id="${dataItemId}" và value="${value}"`);
//     //         return false;
//     //     }
//     //
//     //     const isDisabled = await checkbox.evaluate(el => el.disabled);
//     //     if (isDisabled) {
//     //         console.log(`Checkbox với value="${value}" đã bị disable. Bỏ qua.`);
//     //         return false;
//     //     }
//     //
//     //     const isChecked = await checkbox.isChecked();
//     //     if (isChecked !== checked) {
//     //         await checkbox.click({ force: true });
//     //         console.log(`Đã ${checked ? 'check' : 'uncheck'} checkbox với value="${value}"`);
//     //     } else {
//     //         console.log(`Checkbox với value="${value}" đã ở trạng thái mong muốn.`);
//     //     }
//     //
//     //     return true;
//     // } catch (error) {
//     //     console.error(`Lỗi khi xử lý checkbox value="${value}": ${error.message}`);
//     //     return false;
//     // }
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
//         if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Chỉ lấy thứ 2 - 6
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
// const dayLst = renderWeekdaysWithTimesPreviousMonth();
// console.log(dayLst);
//
//
// (async () => {
//
//     const dayLst = renderWeekdaysWithTimesPreviousMonth();
//
//     for (const value of dayLst) {
//         const success = await selectCheckboxByValue(null, '4', value);
//         if (success) {
//             console.log(`Đã chọn thành công checkbox đầu tiên với value="${value}"`);
//             break;
//         }
//     }
// })();
