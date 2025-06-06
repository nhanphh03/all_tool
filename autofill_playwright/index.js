const fs = require('fs-extra');
const path = require('path');
const { chromium } = require('playwright');
const parse = require('csv-parse/lib/sync');
const config = require('./config');

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  const content = await fs.readFile(config.paths.csv, 'utf8');
  const rows = parse(content, { trim: true });

  const browser = await chromium.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    timeout: config.browser.timeout
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(config.url);
  let totalRuns = 0;

  for (const row of rows) {
    if (row.length < 4) continue;
    const [file1, file2, text1, text2] = row;

    console.log(`Dòng ${totalRuns + 1}: Đang xử lý...`);
    await delay(3000);

    await page.locator('input[type="radio"][data-item-id="4"]').nth(0).check();
    console.log('Đã chọn radio data-item-id="4"');

    const uploadFile = async (dataItemId, fileName) => {
      const input = await page.$(`input[type="file"][data-item-id="${dataItemId}"]`);
      const filePath = path.resolve(config.paths.assets, fileName);
      await input.setInputFiles(filePath);
      await page.evaluate((id) => {
        const el = document.querySelector(`input[type="file"][data-item-id="${id}"]`);
        if (el) el.style.border = '2px solid red';
      }, dataItemId);
      console.log(`📎 Đã upload file ${fileName} vào data-item-id="${dataItemId}"`);
    };

    await uploadFile("6", file1);
    await uploadFile("8", file2);

    await page.locator('input[type="radio"][data-item-id="37"]').nth(0).check();
    console.log('Đã chọn radio data-item-id="37"');

    const fillInput = async (dataItemId, value) => {
      const input = await page.$(`input[type="text"][data-item-id="${dataItemId}"]`);
      await input.fill(value);
      await page.evaluate((id) => {
        const el = document.querySelector(`input[type="text"][data-item-id="${id}"]`);
        if (el) el.style.border = '2px solid red';
      }, dataItemId);
      console.log(`Đã nhập "${value}" vào data-item-id="${dataItemId}"`);
    };

    await delay(1000);
    await fillInput("35", text1);
    await fillInput("1", text2);

    await delay(config.delays.beforeSubmit);
    const confirmBtn = await page.$('[data-testid="form-detail--to-confirm-button"]');
    if (confirmBtn) {
      await confirmBtn.click();
      console.log("Đã nhấn nút xác nhận");
    } else {
      console.error("Không tìm thấy nút xác nhận");
      break;
    }

    await delay(2000);
    const backBtn = await page.locator('button', { hasText: "最初の画面に戻る" }).first();
    if (await backBtn.count()) {
      await backBtn.click();
      console.log("Đã quay lại để tiếp tục dòng tiếp theo");
    } else {
      console.error("Không tìm thấy nút quay lại");
      break;
    }

    totalRuns++;
  }

  console.log(`Hoàn tất: ${totalRuns} dòng đã được gửi`);
  await browser.close();
})();
