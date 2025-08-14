const delay = ms => new Promise(res => setTimeout(res, ms));
// Hàm tạo context với cấu hình browser
async function createBrowserContext(browser) {
    return await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: {width: 1920, height: 1080},
        extraHTTPHeaders: {
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Cache-Control': 'max-age=0',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
        }
    });
}
// Hàm thiết lập anti-detection cho page
async function setupAntiDetection(page) {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        window.chrome = {
            runtime: {}
        };

        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (parameters.name === 'notifications' ? Promise.resolve({state: Notification.permission}) : originalQuery(parameters));

        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5].map(() => 'Plugin'),
        });
    });

    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
}
// Hàm điều hướng đến trang với retry logic
async function navigateToPage(page, url, maxRetries = 3) {
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            await page.goto(url, {
                waitUntil: 'domcontentloaded', timeout: 60000
            });
            await page.waitForLoadState('networkidle', {timeout: 30000});
            return true;
        } catch (error) {
            retryCount++;
            console.log(`Retry ${retryCount}/${maxRetries} for ${url}`);
            console.log("\n")

            if (retryCount >= maxRetries) {
                console.error(`Failed to open ${url} after ${maxRetries} retries:`, error.message);
                console.log("\n")
                return false;
            }
            await delay(2000);
        }
    }
    return false;
}

async function gotoPageCard(page, url) {
    await page.goto(url, {
        waitUntil: 'domcontentloaded', timeout: 60000
    });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    return page;
}
async function createChildPages(context, links) {
    const pagesChildren = [];

    for (const item of links) {
        try {
            const page = await context.newPage();
            await setupAntiDetection(page);

            page.goto(item.child).catch(err => {
                console.error(`Failed to navigate to ${item.child}:`, err.message, " \n");
            });

            pagesChildren.push(
                {
                    page: page,
                    quantity: item.quantity
                }
            );
        } catch (error) {
            console.error(`Failed to create page for ${item.child}:`, error.message, " \n");
        }
    }
    return pagesChildren;
}
async function loginDirectHome(page, username, password) {
    const userNameDOM = `[id="memberId"]`;
    const passwordDOM = `[id="password"]`;

    try {
        await page.waitForSelector(userNameDOM, {timeout: 10000});
        await page.waitForSelector(passwordDOM, {timeout: 2500});

        await page.fill(userNameDOM, username);
        await page.fill(passwordDOM, password);
        console.log(`✅ Đã nhập username và password cho: ${username}`, "\n");

        const btnLoginDOM = await page.$('[id="js_i_login0"]');
        if (btnLoginDOM) {
            await btnLoginDOM.click();
            console.log("✅ Đăng nhập thành công !", "\n");

            await page.waitForLoadState('networkidle', {timeout: 30000});
            return true;
        } else {
            console.error("Không tìm thấy nút đăng nhập\n");
            return false;
        }

    } catch (error) {
        console.error(`Lỗi khi đăng nhập cho ${username}:`, error.message);
        return false;
    }
}
async function configBrowser(links, users, browser, jsonConfig) {
    const pagesMain = [];

    try {
        for (const user of users) {
            console.log(`Tiến hành mua hàng cho user: ${user.username}`, "\n");
            const context = await createBrowserContext(browser);
            const pageChild = {
                user: user, page: [], context: context, loginSuccess: false, pageCart: null
            };

            try {
                const pageHome = await context.newPage();
                await setupAntiDetection(pageHome);

                const pageCart = await context.newPage();
                await setupAntiDetection(pageCart);

                const navigationSuccess = await navigateToPage(pageHome, jsonConfig.loginLink);
                if (navigationSuccess) {
                    console.log(`Thực hiện đăng nhập cho user: ${user.username}`, "\n");
                    const loginSuccess = await loginDirectHome(pageHome, user.username, user.password);
                    pageChild.loginSuccess = loginSuccess;
                    if (loginSuccess) {
                        pageChild.page = await createChildPages(context, links);
                        pageChild.pageCart = await gotoPageCard(pageCart, jsonConfig.cardLink);
                    }
                }

                pagesMain.push(pageChild);
            } catch (userError) {
                console.error(`Error processing user ${user.username}:`, userError.message, "\n");
                console.log("")
                pagesMain.push(pageChild);
            }
        }

    } catch (error) {
        console.error(`Failed to configure browser:`, error.message);
        console.log("\n")
        throw error; // Re-throw để main function xử lý
    }

    return pagesMain;
}
function waitUntilTime(targetHour, targetMinute = 0, targetSecond = 0) {
    return new Promise((resolve) => {
        const now = new Date();
        const target = new Date();

        // Set giờ mục tiêu cho hôm nay
        target.setHours(targetHour, targetMinute, targetSecond, 0);

        // Nếu đã qua giờ này hôm nay → hẹn cho ngày mai
        if (now >= target) {
            target.setDate(target.getDate() + 1);
        }

        const timeUntilTarget = target.getTime() - now.getTime();

        console.log(`Giờ hiện tại: ${now.toLocaleTimeString('vi-VN')}`);
        console.log(`Giờ hẹn chạy: ${target.toLocaleTimeString('vi-VN')}`);

        // console.log(`Giờ hiện tại: ${now.toLocaleTimeString('ja-JP')}`);
        // console.log(`Giờ hẹn chạy: ${target.toLocaleTimeString('ja-JP')}`);

        console.log(`⏳ Sẽ chạy sau ${Math.floor(timeUntilTarget / 1000)} giây...`);
        console.log("\n")

        // Chỉ cần setTimeout một lần là đủ
        setTimeout(() => {
            console.log(`✅ Đến giờ hẹn: ${new Date().toLocaleTimeString('vi-VN')}`);
            console.log("\n")
            resolve();
        }, timeUntilTarget);
    });
}
const addProductToCard = async (page, quantity) => {
    try {
        await page.waitForSelector('#qtySel', { state: 'visible', timeout: 5000 });

        await page.selectOption('#qtySel', String(quantity));
        await page.evaluate((qty) => {
            document.querySelector('#qtyText').value = qty;
            document.querySelector('#qtyTextNew').value = qty;
        }, quantity);

        console.log(`✅ Đã chọn số lượng: ${quantity}`);

        await page.waitForSelector('#js_m_submitRelated', { state: 'visible', timeout: 5000 });
        await page.click('#js_m_submitRelated');

        console.log("✅ Đã thêm ", quantity, " sản phẩm vào giỏ hàng");

    } catch (error) {
        console.error("❌ Lỗi khi thêm vào giỏ hàng:", error);
    }
};


const proceedToCheckoutStep1 = async (page) => {
    try {
        const selector = 'a[href="/yc/shoppingcart/index.html?next=true"]';
        await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            page.click(selector)
        ]);

        console.log("✅ Đã nhấn nút 'Tiến hành thanh toán' (Step 1)");
        console.log("\n")
        console.log("🌐 URL hiện tại:", page.url());
        console.log("\n")
        return true;

    } catch (error) {
        console.error("❌ Không tìm thấy hoặc không thể click 'Tiến hành thanh toán' (Step 1):", error.message);
        console.log("\n")
        return false;
    }
};
const proceedToCheckoutStep2 = async (page) => {
    try {
        const selector = '#sc_i_buy';
        await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 50000 }),
            page.click(selector)
        ]);

        console.log("✅ Đã nhấn nút 'Kế tiếp' (Step 2) \n");
        console.log("🌐 URL hiện tại: ", page.url(), "\n");
        return true;

    } catch (error) {
        console.error("❌ Không tìm thấy hoặc không thể click 'Kế tiếp' (Step 2):", error.message, "\n");
        return false;
    }
};
const enterSecurityCode = async (page, cvvCode) => {
    try {
        const cvvInput = await page.$('input[name="creditCard.securityCode"]');
        if (cvvInput) {
            await cvvInput.fill(''); // Clear

            await cvvInput.fill(cvvCode.toString());
            console.log(`✅ Đã nhập CVV: ${cvvCode}`);

            const inputValue = await cvvInput.inputValue();
            if (inputValue === cvvCode.toString()) {
                console.log("✅ CVV đã được nhập chính xác\n");
            } else {
                console.log(`⚠️ CVV không khớp. Expected: ${cvvCode}, Got: ${inputValue}\n`);
                await cvvInput.fill('');
                await cvvInput.type(cvvCode.toString(), {delay: 100});
                console.log("🔄 Đã thử nhập CVV lại\n");
            }
        } else {
            console.log("✅ CVV validation passed");
        }

        return true;
    } catch (error) {
        console.error("❌ Lỗi khi nhập CVV:", error.message);
        return false;
    }
}
const placeOrder = async (page) => {
    try {
        const selectors = [
            'a.js_c_order',
            'a:has-text("注文を確定する")',
            'a.btnRed.js_c_order',
            'a[href="javascript:void(0)"].btnRed',
            'a.js_c_filterBtn[style*="width: 230px"]'
        ];

        for (const selector of selectors) {
            if (await page.$(selector)) {
                await page.waitForSelector(selector, { state: 'visible', timeout: 50000 });
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
                    page.click(selector)
                ]);

                console.log("✅ Đã nhấn nút 'Đặt hàng của bạn'");
                console.log("\n")
                console.log(`📍 Order completed. URL: ${page.url()}`);
                return true;
            }
        }
        console.error("❌ Không tìm thấy nút đặt hàng");
        console.log("\n")
        return false;

    } catch (error) {
        console.error("❌ Lỗi khi đặt hàng:", error.message);
        console.log("\n")
        return false;
    }
};
const reloadAllPages = async (pages) => {
    console.log("Thực hiện reload tất cả các trang\n")
    pages.forEach((page) => {
        page.reload();
    })
}
const proceedWith3DSecure = async (page) => {
    try {
        const selector = '#threedsecureExplain_Ok';
        if (await page.$(selector)) {
            await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
                page.click(selector)
            ]);

            console.log("✅ Đã nhấn nút 3D Secure\n");
            console.log(`📍 3D Secure processed. URL: ${page.url()}`);
            return true;
        } else {
            console.error("❌ Không tìm thấy nút 3D Secure");
            return false;
        }
    } catch (error) {
        console.error("❌ Lỗi khi xử lý 3D Secure:", error.message);
        return false;
    }
};

module.exports = {
    configBrowser,
    waitUntilTime,
    delay,
    addProductToCard,
    proceedToCheckoutStep1,
    proceedToCheckoutStep2,
    placeOrder,
    proceedWith3DSecure,
    enterSecurityCode,
    reloadAllPages
};