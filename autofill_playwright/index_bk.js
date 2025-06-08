// const fs = require('fs-extra');
// const path = require('path');
// const {chromium} = require('playwright');
// const parse = require('csv-parse/lib/sync');
// const config = require('./config');
//
// const delay = ms => new Promise(res => setTimeout(res, ms));
//
// const uploadFile = async (page, dataItemId, fileName) => {
//   const input = await page.$(`input[type="file"][data-item-id="${dataItemId}"]`);
//   const filePath = path.resolve(config.paths.assets, fileName);
//   await input.setInputFiles(filePath);
//   await page.evaluate((id) => {
//     document.querySelector(`input[type="file"][data-item-id="${id}"]`);
//   }, dataItemId);
//   console.log(`Đã upload file ${fileName} vào data-item-id="${dataItemId}"`);
// };
//
// const selectRadioByValue = async (page, dataItemId, value) => {
//   const selector = `input[type="radio"][data-item-id="${dataItemId}"][value="${value}"]`;
//   try {
//     await page.waitForSelector(selector, { timeout: 5000 });
//     const radio = await page.$(selector);
//
//     console.error(`Đã tìm thấy radio với data-item-id="${dataItemId}" và value="${value}"`);
//     if (!radio) {
//       console.error(`Không tìm thấy radio với data-item-id="${dataItemId}" và value="${value}"`);
//       return;
//     }
//
//     await radio.click({ force: true }); // dùng force để bỏ qua overlay
//     console.log(`Đã click radio với value="${value}" và data-item-id="${dataItemId}"`);
//   } catch (error) {
//     console.error(`Lỗi khi chọn radio: ${error.message}`);
//   }
// };
//
//
// const fillInput = async (page, dataItemId, value) => {
//   const selector = `input[type="text"][data-item-id="${dataItemId}"]`;
//
//   try {
//     await page.waitForSelector(selector, { timeout: 3000 });
//     await page.fill(selector, value);
//     console.log(`Đã nhập "${value}" vào data-item-id="${dataItemId}"`);
//   } catch (error) {
//     console.error(`Không thể nhập dữ liệu: ${error.message}`);
//   }
// };
//
// const confirm = async (page) => {
//   const confirmBtn = await page.$('[data-testid="form-detail--to-confirm-button"]');
//   if (confirmBtn) {
//     await confirmBtn.click();
//     console.log("Đã nhấn nút xác nhận");
//   } else {
//     console.error("Không tìm thấy nút xác nhận");
//   }
// };
//
//
//
//
// (async () => {
//   const content = await fs.readFile(config.paths.csv, 'utf8');
//   const rows = parse(content, { trim: true });
//
//   const browser = await chromium.launch({
//     headless: config.browser.headless,
//     slowMo: config.browser.slowMo,
//     timeout: config.browser.timeout
//   });
//
//   const pages = [];
//
//   for (const row of rows) {
//     const context = await browser.newContext();
//     const page = await context.newPage();
//     await page.goto(config.url);
//     pages.push({ page, row });
//   }
//
//   for (const { page, row } of pages) {
//
//     //Q1:
//     await selectRadioByValue(page, '18', '同意する（I agree.）');
//     await selectRadioByValue(page, '4', '穴が空いている');
//     await uploadFile(page, '8', row[1]);
//     await uploadFile(page, '8', row[1])
//     await selectRadioByValue(page, '37', '住所')
//     await fillInput(page, '35', row[0]);
//     console.log(`✔ Đã xử lý dòng: ${row[0]} - ${row[1]}`);
//   }
//
//   console.log(`Hoàn tất: ${rows.length} dòng đã được gửi`);
//   // await browser.close();
// })();