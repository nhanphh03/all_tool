const fs = require('fs-extra');
const path = require('path');
const {chromium} = require('playwright');
const parse = require('csv-parse/lib/sync');
const config = require('./config');
const {renderWeekdaysWithTimesPreviousMonth, selectCheckboxByValueDate, submit, uploadFile,
    selectCheckboxByValue, fillInputAutoDetect, selectRadioByValue, confirm} = require("./function");

const delay = ms => new Promise(res => setTimeout(res, ms));

const phoneNumber = '07045633348';
const national = 'ベトナム';

// (async () => {
//
//     const dayLst = renderWeekdaysWithTimesPreviousMonth();
//
//     for (const value of dayLst) {
//         const success = await selectCheckboxByValueDate(null, '4', value);
//         if (success) {
//             console.log(`Đã chọn thành công checkbox đầu tiên với value="${value}"`);
//             break;
//         }
//     }
// })();

(async () => {
    const content = await fs.readFile(config.paths.csv, 'utf8');
    const rows = parse(content, { trim: true });
    const dayLst = renderWeekdaysWithTimesPreviousMonth();

    const browser = await chromium.launch({
        headless: config.browser.headless,
        slowMo: config.browser.slowMo,
        timeout: config.browser.timeout
    });

    const pages = [];

    for (const row of rows) {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(config.url);
        pages.push({ page, row });
    }

    for (const { page, row } of pages) {
        console.log(`${row[0]} - ${row[1]} - ${row[2]} - ${row[3]} - ${row[4]}`);
        
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
        for (const value of dayLst) {
            const success = await selectCheckboxByValueDate(null, '4', value);
            if (success) {
                console.log(`Đã chọn thành công checkbox đầu tiên với value="${value}"`);
                break;
            }
        }

        //Q11:
        if (row[2] === 'Motorcycle'){
            await selectRadioByValue(page, '19', 'バイク(Motorcycle)');
        }else if (row[2] === 'Vehicle') {
            await selectRadioByValue(page, '19', '自動車(Vehicle)');
        } else {
            await selectRadioByValue(page, '19', '原付(Moped)');
        }

        //Q12:
        await uploadFile(page, '9', row[0]);

        //Q13:
        await uploadFile(page, '10', row[0]);

        //Q14:
        await fillInputAutoDetect(page, '15', 'hotrocuocsong.nhatban@gmail.com');

        // Submit step 1:
        await confirm(page);

        await delay(2500);

        // Submit step 2:
        await submit(page);

    }
    console.log(`Hoàn tất: ${rows.length} dòng đã được gửi`);
})();


