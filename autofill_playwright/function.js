export const uploadFile = async (page, dataItemId, fileName) => {
    const input = await page.$(`input[type="file"][data-item-id="${dataItemId}"]`);
    const filePath = path.resolve(config.paths.assets, fileName);
    await input.setInputFiles(filePath);
    await page.evaluate((id) => {
        document.querySelector(`input[type="file"][data-item-id="${id}"]`);
    }, dataItemId);
    console.log(`Đã upload file ${fileName} vào data-item-id="${dataItemId}"`);
};

export const selectCheckboxByValue = async (page, dataItemId, value, checked = true) => {
    const selector = `input[type="checkbox"][data-item-id="${dataItemId}"][value="${value}"]`;
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
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

export const selectRadioByValue = async (page, dataItemId, value) => {
    const selector = `input[type="radio"][data-item-id="${dataItemId}"][value="${value}"]`;
    try {
        await page.waitForSelector(selector, { timeout: 5000 });
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

export const fillInputAutoDetect = async (page, dataItemId, value) => {
    const selector = `[data-item-id="${dataItemId}"]`;
    try {
        await page.waitForSelector(selector, { timeout: 3000 });

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

export const confirm = async (page) => {
    const confirmBtn = await page.$('[data-testid="form-detail--to-confirm-button"]');
    if (confirmBtn) {
        await confirmBtn.click();
        console.log("Đã nhấn nút xác nhận");
    } else {
        console.error("Không tìm thấy nút xác nhận");
    }
};

export const submit = async (page) => {
    const submitBtn = await page.$('[data-testid="form-detail--to-completion-button"]');
    if (submitBtn) {
        await submitBtn.click();
        console.log(" Đã nhấn nút gửi (送信)");
    } else {
        console.error("Không tìm thấy nút gửi");
    }
};

export function renderWeekdaysWithTimesNextMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const date = new Date(year, month + 1, 1);

    const results = [];
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const timeSlots = ['1:00PM', '10:00AM'];

    while (date.getMonth() === (month + 1) % 12) {
        const dayOfWeek = date.getDay();

        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const formattedDate = `${date.getFullYear()}/` +
                `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
                `${date.getDate().toString().padStart(2, '0')}` +
                `（${weekdays[dayOfWeek]}）`;

            timeSlots.forEach(time => {
                results.push(`${formattedDate};${time}`);
            });
        }

        date.setDate(date.getDate() + 1);
    }

    return results;
}

export const selectCheckboxByValueDate = async (page, dataItemId, value, checked = true) => {
    const selector = `input[type="checkbox"][data-item-id="${dataItemId}"][value="${value}"]`;
    console.log(selector)
    // try {
    //     await page.waitForSelector(selector, { timeout: 5000 });
    //     const checkbox = await page.$(selector);
    //
    //     if (!checkbox) {
    //         console.error(`Không tìm thấy checkbox với data-item-id="${dataItemId}" và value="${value}"`);
    //         return false;
    //     }
    //
    //     const isDisabled = await checkbox.evaluate(el => el.disabled);
    //     if (isDisabled) {
    //         console.log(`Checkbox với value="${value}" đã bị disable. Bỏ qua.`);
    //         return false;
    //     }
    //
    //     const isChecked = await checkbox.isChecked();
    //     if (isChecked !== checked) {
    //         await checkbox.click({ force: true });
    //         console.log(`Đã ${checked ? 'check' : 'uncheck'} checkbox với value="${value}"`);
    //     } else {
    //         console.log(`Checkbox với value="${value}" đã ở trạng thái mong muốn.`);
    //     }
    //
    //     return true;
    // } catch (error) {
    //     console.error(`Lỗi khi xử lý checkbox value="${value}": ${error.message}`);
    //     return false;
    // }
};

export function renderWeekdaysWithTimesPreviousMonth() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() - 1;

    if (month < 0) {
        month = 11;
        year -= 1;
    }

    const date = new Date(year, month, 1);

    const results = [];
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const timeSlots = ['1:00PM', '10:00AM'];

    while (date.getMonth() === month) {
        const dayOfWeek = date.getDay();

        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Chỉ lấy thứ 2 - 6
            const formattedDate = `${date.getFullYear()}/` +
                `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
                `${date.getDate().toString().padStart(2, '0')}（${weekdays[dayOfWeek]}）`;

            timeSlots.forEach(time => {
                results.push(`${formattedDate};${time}`);
            });
        }

        date.setDate(date.getDate() + 1);
    }

    return results;
}
