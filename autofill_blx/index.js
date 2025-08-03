const fs = require('fs-extra');
const path = require('path');
const { chromium } = require('playwright');
const parse = require('csv-parse/lib/sync');
const config = require('./config');

const delay = ms => new Promise(res => setTimeout(res, ms));

const phoneNumber = '07045633348';
const national = 'ベトナム';

(async () => {
    const start = new Date();
    const content = await fs.readFile(config.paths.csv, 'utf8');
    const rows = parse(content, { trim: true });
    let dayLst = [];

    const browser = await chromium.launch({
        headless: config.browser.headless,
        slowMo: config.browser.slowMo,
        timeout: 5000
    });

    const pages = [];

    for (const row of rows) {
        try{
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto(config.url);
            pages.push({ page, row });
        }catch (err) {
            console.error(`Lỗi khi xử lý dòng: ${row.join(' - ')}\nChi tiết: ${err.message}`);
        }
    }

    for (const { page, row } of pages) {
        console.log(`${row[0]} - ${row[1]} - ${row[2]} - ${row[3]} - ${row[4]}`);
        try {

            //Q1:
            await selectCheckboxByValue(page, '18', '同意する（I agree.）');

            //Q2:
            await fillInputAutoDetect(page, '7', row[0]);

            //Q3:
            await fillInputAutoDetect(page, '1', row[1]);

            //Q4:
            await fillInputAutoDetect(page, '8', phoneNumber);

            //Q5:
            await fillInputAutoDetect(page, '2', national);

            //Q6:
            await fillInputAutoDetect(page, '14', national);

            //Q7:
            await selectRadioByValue(page, '20', '非免除国 (NOT countries exempt from foreign license exchange test)');
            await delay(1500);

            //Q8:
            await selectRadioByValue(page, '22', 'ない(No)');

            //Q10:
            if (dayLst.length === 0) {
                dayLst = await getAvailableDayList(page);
                console.log('Danh sách ngày hợp lệ:', dayLst);
            }

            for (let i = 0; i < dayLst.length;) {
                const value = dayLst[i];
                const success = await selectCheckboxByValueDate(page, '4', value);
                if (success) {
                    console.log(`Đã chọn thành công checkbox đầu tiên với value="${value}"`);
                    dayLst.splice(i, 1);
                    break;
                } else {
                    console.log(`Đã xóa value="${value}"`);
                    dayLst.splice(i, 1);
                }
            }

            //Q11:
            if (row[2] === 'Motorcycle') {
                await selectRadioByValue(page, '19', 'バイク(Motorcycle)');
            } else if (row[2] === 'Vehicle') {
                await selectRadioByValue(page, '19', '自動車(Vehicle)');
            } else {
                await selectRadioByValue(page, '19', '原付(Moped)');
            }

            //Q12:
            await uploadFile(path, config, page, '9', row[3]);

            //Q13:
            await uploadFile(path, config, page, '10', row[4]);

            //Q14:
            await fillInputAutoDetect(page, '15', 'hotrocuocsong.nhatban@gmail.com');

            // Submit step 1:
            await confirm(page);

            await delay(2500);

            try{
                // Submit step 2:
                await submit(page);
                page.once('dialog', async (dialog) => {
                    console.log("Có alert hiển thị:", dialog.message());
                    await dialog.accept(); // đóng alert
                    console.log("Đã tắt alert");
                    // Sau khi alert đóng, quay lại bước 1
                    await backStep1(page);

                    for (let i = 0; i < dayLst.length;) {
                        const value = dayLst[i];
                        const success = await selectCheckboxByValueDate(page, '4', value);
                        if (success) {
                            console.log(`Quay lại step 1 và chọn lại ngày với value="${value}"`);
                            dayLst.splice(i, 1);
                            break;
                        } else {
                            console.log(`Đã xóa value="${value}"`);
                            dayLst.splice(i, 1);
                        }
                    }
                });
            }catch (e) {
                console.log("Gửi form không thành công !", e)
            }

        } catch (err) {
            console.error(`Lỗi khi xử lý dòng: ${row.join(' - ')}\nChi tiết: ${err.message}`);

        }

    }
    const end = new Date();
    console.log("Tổng thời gian chạy chương trình ", (end - start)/6000);
    console.log(`Hoàn tất: ${rows.length} dòng đã được gửi`);
})();

//--------------------------------------------------------------------------------------------------

//Functions used in the code above

async function getAvailableDayList(page) {
    return await page.$$eval(
        'input[type="checkbox"][data-item-id="4"]:not(:disabled)',
        inputs => inputs.map(input => input.value)
    );
}

const uploadFile = async (path, config, page, dataItemId, fileName) => {
    const input = await page.$(`input[type="file"][data-item-id="${dataItemId}"]`);
    const filePath = path.resolve(config.paths.assets, fileName);
    await input.setInputFiles(filePath);
    await page.evaluate((id) => {
        document.querySelector(`input[type="file"][data-item-id="${id}"]`);
    }, dataItemId);
    console.log(`Đã upload file ${fileName} vào data-item-id="${dataItemId}"`);
};

const selectCheckboxByValue = async (page, dataItemId, value, checked = true) => {
    const selector = `input[type="checkbox"][data-item-id="${dataItemId}"][value="${value}"]`;
    try {
        await page.waitForSelector(selector, { timeout: 2500 });
        const checkbox = await page.$(selector);

        if (!checkbox) {
            console.error(`Không tìm thấy checkbox với data-item-id="${dataItemId}" và value="${value}"`);
            return;
        }

        const isChecked = await checkbox.isChecked();

        if (isChecked !== checked) {
            await checkbox.click({ force: true });
            console.log(`Đã ${checked ? 'check' : 'uncheck'} checkbox với value="${value}" và data-item-id="${dataItemId}"`);
        } else {
            console.log(`Checkbox với value="${value}" và data-item-id="${dataItemId}" đã ở trạng thái ${checked ?
                'checked' : 'unchecked'}, không cần click.`);
        }
    } catch (error) {
        console.error(`Lỗi khi chọn checkbox: ${error.message}`);
    }
};

const selectRadioByValue = async (page, dataItemId, value) => {
    const selector = `input[type="radio"][data-item-id="${dataItemId}"][value="${value}"]`;
    try {
        await page.waitForSelector(selector, { timeout: 2500 });
        const radio = await page.$(selector);

        console.error(`Đã tìm thấy radio với data-item-id="${dataItemId}" và value="${value}"`);
        if (!radio) {
            console.error(`Không tìm thấy radio với data-item-id="${dataItemId}" và value="${value}"`);
            return;
        }

        await radio.click({ force: true });
        console.log(`Đã click radio với value="${value}" và data-item-id="${dataItemId}"`);
    } catch (error) {
        console.error(`Lỗi khi chọn radio: ${error.message}`);
    }
};

const fillInputAutoDetect = async (page, dataItemId, value) => {
    const selector = `[data-item-id="${dataItemId}"]`;
    try {
        await page.waitForSelector(selector, { timeout: 2500 });

        const tagName = await page.$eval(selector, el => el.tagName.toLowerCase());
        if (tagName === 'input' || tagName === 'textarea') {
            await page.fill(selector, value);
            console.log(`Đã nhập "${value}" vào ${tagName} với data-item-id="${dataItemId}"`);
        } else {
            console.error(`Thẻ không hợp lệ: ${tagName}`);
        }
    } catch (error) {
        console.error(`Không thể nhập dữ liệu: ${error.message}`);
    }
};

const confirm = async (page) => {
    const confirmBtn = await page.$('[data-testid="form-detail--to-confirm-button"]');
    if (confirmBtn) {
        await confirmBtn.click();
        console.log("Đã nhấn nút xác nhận");
    } else {
        console.error("Không tìm thấy nút xác nhận");
    }
};

const submit = async (page) => {
    const submitBtn = await page.$('[data-testid="form-detail--to-completion-button"]');
    if (submitBtn) {
        await submitBtn.click();
        console.log(" Đã nhấn nút gửi (送信)");
    } else {
        console.error("Không tìm thấy nút gửi");
    }
};

const backStep1 = async (page) => {
    const buttons = await page.$$('button');

    for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent.trim());

        if (text.includes("1つ前の画面に戻る")) {
            await button.click();
            console.log("Đã nhấn nút quay lại (1つ前の画面に戻る)");
            return;
        }
    }

    console.error("Không tìm thấy nút quay lại");
};

const isPrintButtonVisible = async (page) => {
    const locator = page.locator('button:has-text("入力内容を印刷する")');
    const isVisible = await locator.isVisible();

    if (isVisible) {
        console.log("Gửi form thành công");
        console.log("Nút in đang hiển thị trên giao diện");
    } else {
        console.log("Nút in KHÔNG hiển thị trên giao diện");
    }

    return isVisible;
};

const selectCheckboxByValueDate = async (page, dataItemId, value, checked = true) => {
    const selector = `input[type="checkbox"][data-item-id="${dataItemId}"][value="${value}"]`;
    try {
        await page.waitForSelector(selector, { timeout: 1500 });
        const checkbox = await page.$(selector);

        if (!checkbox) {
            console.error(`Không tìm thấy checkbox với data-item-id="${dataItemId}" và value="${value}"`);
            return false;
        }

        const isDisabled = await checkbox.evaluate(el => el.disabled);
        if (isDisabled) {
            console.log(`Checkbox với value="${value}" đã bị disable. Bỏ qua.`);
            return false;
        }

        const isChecked = await checkbox.isChecked();
        if (isChecked !== checked) {
            await checkbox.click({ force: true });
            console.log(`Đã ${checked ? 'check' : 'uncheck'} checkbox với value="${value}"`);
        } else {
            console.log(`Checkbox với value="${value}" đã ở trạng thái mong muốn.`);
        }

        return true;
    } catch (error) {
        console.error(`Lỗi khi xử lý checkbox value="${value}": ${error.message}`);
        return false;
    }
};
