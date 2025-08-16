const config = require("./config");
const { chromium } = require('playwright');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function createStealthBrowser() {

    return await chromium.launch({
        headless: false,
        slowMo: config.browser.slowMo,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-features=VizDisplayCompositor',
            '--disable-automation',
            '--exclude-switches=enable-automation',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-hang-monitor',
            '--disable-popup-blocking',
            '--disable-prompt-on-repost',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--no-first-run',
            '--no-service-autorun',
            '--password-store=basic',
            '--use-mock-keychain',
            '--no-default-browser-check',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor',
            '--disable-gpu-sandbox',

            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            '--window-size=1920,1080'
        ]
    });

}

async function createBrowserContext(browser) {
    return await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: {width: 1920, height: 1080},
        locale: 'en-US',
        timezoneId: 'America/New_York',

        extraHTTPHeaders: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        },

        permissions: ['geolocation', 'notifications'],

        screen: {width: 1920, height: 1080},
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
    });
}

async function setupAntiDetection(page) {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });

        window.chrome = {
            runtime: {},
            app: {}
        };

        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );

        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                {
                    0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin},
                    description: "Portable Document Format",
                    filename: "internal-pdf-viewer",
                    length: 1,
                    name: "Chrome PDF Plugin"
                },
                {
                    0: {type: "application/pdf", suffixes: "pdf", description: "", enabledPlugin: Plugin},
                    description: "",
                    filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
                    length: 1,
                    name: "Chrome PDF Viewer"
                },
                {
                    0: {type: "application/x-nacl", suffixes: "", description: "Native Client Executable", enabledPlugin: Plugin},
                    1: {type: "application/x-pnacl", suffixes: "", description: "Portable Native Client Executable", enabledPlugin: Plugin},
                    description: "",
                    filename: "internal-nacl-plugin",
                    length: 2,
                    name: "Native Client"
                }
            ],
        });

        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en', 'vi'],
        });

        Object.defineProperty(navigator, 'platform', {
            get: () => 'Win32',
        });

        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => 8,
        });

        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => 8,
        });

        Object.defineProperty(navigator, 'connection', {
            get: () => ({
                effectiveType: '4g',
                rtt: 100,
                downlink: 2.0
            }),
        });

        ['mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                window.lastActivity = Date.now();
            });
        });

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
    });

    await page.setViewportSize({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 1080 + Math.floor(Math.random() * 100)
    });

    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
}

async function navigateToPage(page, url, maxRetries = 3) {
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            await delay(1000 + Math.random() * 2000);

            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });

            await page.mouse.move(
                Math.random() * 1920,
                Math.random() * 1080
            );

            await page.waitForLoadState('networkidle', { timeout: 30000 });

            await page.evaluate(() => {
                window.scrollTo(0, Math.random() * 200);
            });

            await delay(500 + Math.random() * 1000);

            return true;
        } catch (error) {
            retryCount++;
            console.log(`Retry ${retryCount}/${maxRetries} for ${url}`);
            console.log("Error:", error.message, "\n");

            if (retryCount >= maxRetries) {
                console.error(`Failed to open ${url} after ${maxRetries} retries:`, error.message);
                return false;
            }

            // Exponential backoff với random jitter
            const baseDelay = Math.pow(2, retryCount) * 1000;
            const jitter = Math.random() * 1000;
            await delay(baseDelay + jitter);
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

async function configBrowser(links, users, jsonConfig) {
    const pagesMain = [];

    const browser = await createStealthBrowser();

    try {
        for (const user of users) {
            console.log(`Tiến hành mua hàng cho user: ${user.username}`, "\n");

            await delay(2000 + Math.random() * 3000);

            const context = await createBrowserContext(browser);
            const pageChild = {
                user: user,
                page: [],
                context: context,
                loginSuccess: false,
                pageCart: null
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
                console.log("");
                pagesMain.push(pageChild);
            }
        }

    } catch (error) {
        console.error(`Failed to configure browser:`, error.message);
        console.log("\n");
        throw error;
    }

    return pagesMain;
}

function waitUntilTime(targetHour, targetMinute = 0, targetSecond = 0) {
    return new Promise((resolve) => {
        const now = new Date();
        const target = new Date();

        target.setHours(targetHour, targetMinute, targetSecond, 0);

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

        setTimeout(() => {
            console.log(`✅ Đến giờ hẹn: ${new Date().toLocaleTimeString('vi-VN')}`, "\n");
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

        console.log(`✅ Đã nhập số lượng: ${quantity}`);

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
        console.log("🌐 URL hiện tại:", page.url());
        return true;

    } catch (error) {
        console.error("❌ Không tìm thấy hoặc không thể click 'Tiến hành thanh toán' (Step 1):", error.message);
        console.log("\n")
        return false;
    }
};

const proceedToCheckout = async (page) => {
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
            await cvvInput.fill('');

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
const confirmOrder = async (page) => {
    try {
        const selector = 'a.btnRed.js_c_order.js_c_filterBtn';
        await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 50000 }),
            page.click(selector)
        ]);

        console.log("✅ Đã nhấn nút '注文を確定する' (Xác nhận đặt hàng)\n");
        console.log("🌐 URL hiện tại: ", page.url(), "\n");
        return true;

    } catch (error) {
        console.error("❌ Không tìm thấy hoặc không thể click '注文を確定する':", error.message, "\n");
        return false;
    }
};


const reloadAllPages = async (pages) => {
    console.log("Thực hiện reload tất cả các trang\n")
    pages.forEach((page) => {
        page.reload();
    })
}

async function processSingleBrowser(browser, browserIndex) {
    console.log("-------------------------------------------------------------------------");
    const startChild = new Date();
    console.log(`[Browser ${browserIndex + 1}] Bắt đầu mua hàng cho tài khoản --- ${browser.user.username}`);

    try {
        const cvv = browser.user.cvv;

        for (const { page, quantity } of browser.page) {
            await addProductToCard(page, quantity);
        }

        const page = browser.pageCart;
        console.log(`[Browser ${browserIndex + 1}] Reload lại giỏ hàng`);
        await page.reload();

        await proceedToCheckoutStep1(page);
        await proceedToCheckout(page);
        await enterSecurityCode(page, cvv);
        await confirmOrder(page);

        console.log(`[Browser ${browserIndex + 1}] Đặt thành công đơn hàng !`);
        const endChild = new Date();
        console.log(`[Browser ${browserIndex + 1}] Kết thúc mua hàng cho tài khoản --- ${browser.user.username} với tổng thời gian ${(endChild - startChild)/1000}s`);
        console.log("--------------------------------------------------------------------------");

        return {
            success: true,
            username: browser.user.username,
            duration: (endChild - startChild) / 1000,
            browserIndex: browserIndex + 1
        };

    } catch (error) {
        const endChild = new Date();
        console.error(`[Browser ${browserIndex + 1}] Lỗi khi xử lý tài khoản ${browser.user.username}:`, error.message);
        console.log("--------------------------------------------------------------------------");

        return {
            success: false,
            username: browser.user.username,
            error: error.message,
            duration: (endChild - startChild) / 1000,
            browserIndex: browserIndex + 1
        };
    }
}

async function processAllBrowsersParallel(pagesMain) {
    console.log(`🚀 Bắt đầu xử lý ${pagesMain.length} browsers song song...`);
    const startTime = new Date();

    const browserPromises = pagesMain.map((browser, index) =>
        processSingleBrowser(browser, index)
    );

    const results = await Promise.allSettled(browserPromises);

    const endTime = new Date();
    const totalDuration = (endTime - startTime) / 1000;

    // Thống kê kết quả
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const errorCount = results.length - successCount;

    console.log(`\n📊 TỔNG KẾT SONG SONG:`);
    console.log(`✅ Thành công: ${successCount}/${results.length}`);
    console.log(`❌ Lỗi: ${errorCount}/${results.length}`);
    console.log(`⏱️ Tổng thời gian: ${totalDuration}s`);

    // Chi tiết từng kết quả
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const data = result.value;
            console.log(`[${data.browserIndex}] ${data.username}: ${data.success ? '✅' : '❌'} (${data.duration}s)`);
            if (!data.success) {
                console.log(`    Error: ${data.error}`);
            }
        } else {
            console.log(`[${index + 1}] Rejected: ${result.reason}`);
        }
    });

    return results.map(r => r.status === 'fulfilled' ? r.value : null);
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
    processAllBrowsersParallel,
    waitUntilTime,
    delay,
    addProductToCard,
    proceedWith3DSecure,
    reloadAllPages
};
