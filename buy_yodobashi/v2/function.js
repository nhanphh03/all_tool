const { chromium } = require('playwright');
const fs = require('fs').promises;

const delay = ms => new Promise(res => setTimeout(res, ms));

async function createStealthBrowser() {
    return  await chromium.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-automation',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--no-first-run'
        ]
    });
}

async function createBrowserContext(browser, username) {
    let storageState = {};
    let isCookie = false;
    try {
        const cookiesData = await fs.readFile(`cookies/${username}.json`, 'utf-8');
        storageState = JSON.parse(cookiesData);
        console.log(`Đã tải cookies cho ${username} từ cookies/${username}.json`);
        isCookie = true;
    } catch (error) {
        console.log(`Không tìm thấy cookies cho ${username}, sẽ đăng nhập thủ công`, error.message);
    }
    return {
        context: await browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            locale: 'ja',
            timezoneId: 'Asia/Tokyo',
            extraHTTPHeaders: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"'
            },
            permissions: ['geolocation', 'notifications'],
            screen: { width: 1920, height: 1080 },
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            storageState: storageState
        }),
        isCookie: isCookie
    };
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

        // Enhanced navigator properties
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

async function gotoPage(page, url) {
    await page.goto(url, {
        waitUntil: 'domcontentloaded', timeout: 60000
    });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    return page;
}

async function createChildPages(context, product ) {

    try {
        console.log("Khởi tạo trang sản phẩm", product.link, "với số lượng ", product.quantity)
        const page = await context.newPage();
        await setupAntiDetection(page);
        await gotoPage(page, product.link);
        return {
                page: page,
                quantity: product.quantity
            }
    } catch (error) {
        console.error(`Failed to create page for ${product.link}:`, error.message, " \n");
    }
    return null;
}

async function loginDirectHome(page, username, password, context) {
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

            await page.waitForLoadState('networkidle', {timeout: 50000});

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

async function checkLoginLink(page) {
    try {
        const element = await page.locator('a[href="https://order.yodobashi.com/yc/login/index.html?returnUrl=https%3A%2F%2Fwww.yodobashi.com%2Fproduct%2F100000001003891482%2Findex.html"][class="clicklog cl-hdLO2_1"]').count();
        return element > 0; // Trả về true nếu phần tử tồn tại, false nếu không
    } catch (error) {
        console.error('Lỗi khi kiểm tra phần tử login link:', error.message);
        return false;
    }
}

async function configBrowser(product, users, jsonConfig) {
    const pagesMain = [];

    const browser = await createStealthBrowser();

    try {
        for (const user of users) {
            console.log(user);
            if(user.status === 'no'){
                continue;
            }
            console.log(`Tiến hành mua hàng cho user: ${user.username}`, "\n");

            const result = await createBrowserContext(browser, user.username);
            const context = result.context;
            const isCookie = result.isCookie;
            const pageChild = {
                user: user,
                pageProduct: null,
                context: context,
                loginSuccess: false,
            };

            try {
                const pageHome = await context.newPage();
                const pageLogout = await context.newPage();

                if (isCookie) {
                    console.log("Có cookie, vào trang chủ kiểm tra trạng thái cookie !")
                    await gotoPage(pageHome, jsonConfig.homeLink);
                    const isAvailable = await checkLoginLink(pageHome);
                    if(isAvailable){
                        console.log("Cookie không khả dụng, thực hiện đăng nhập lại !");
                    }else{
                        console.log("Cookie khả dụng, thực hiện đăng xuất ra và đăng nhập lại !")
                        await gotoPage(pageLogout, jsonConfig.loginOut);
                        console.log("Đăng xuất thành công! Thực hiện đăng nhập lại ")
                    }
                }
                console.log("Thực hiện đăng nhập cho user: ",  user.username);
                const navigationSuccess = await navigateToPage(pageHome, jsonConfig.loginLink);
                if (navigationSuccess) {
                    const loginSuccess = await loginDirectHome(pageHome, user.username, user.password, context);
                    pageChild.loginSuccess = loginSuccess;
                    if (loginSuccess) {
                        await context.storageState({ path: `cookies/${user.username}.json` });
                        console.log(`✅ Đã lưu cookies cho ${user.username} vào cookies/${user.username}.json`, "\n");
                        console.log("✅ Đăng nhập thành công !\n");
                    }
                }

                await setupAntiDetection(pageHome);
                pageChild.pageProduct = await createChildPages(context, product);
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

        console.log(`⏳ Sẽ chạy sau ${Math.floor(timeUntilTarget / 1000)} giây... \n`);

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

const enterSecurityCode = async (page, cvvCode) => {
    try {
        const cvvInput = await page.$('input[name="creditCard.securityCode"]');
        if (cvvInput) {
            await cvvInput.fill('');

            await cvvInput.fill(cvvCode.toString());
            console.log(`✅ Đã nhập CVV: ${cvvCode}`);

            const inputValue = await cvvInput.inputValue();
            if (inputValue === cvvCode.toString()) {
                console.log("✅ CVV đã được nhập chính xác");
            } else {
                console.log(`⚠️ CVV không khớp. Expected: ${cvvCode}, Got: ${inputValue}\n`);
                await cvvInput.fill('');
                await cvvInput.type(cvvCode.toString(), {delay: 100});
                console.log("🔄 Đã thử nhập CVV lại");
            }
        } else {
            console.log("✅ Không phát hiện ô nhập số CVV");
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

        console.log("✅ Đã nhấn nút '注文を確定する' (Xác nhận đặt hàng)");
        console.log("🌐 URL hiện tại: ", page.url());
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

const proceedToCheckoutStep2 = async (page) => {
    try {
        const selector = '#sc_i_buy';
        await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 50000 }),
            page.click(selector)
        ]);

        console.log("✅ Đã nhấn nút 'Kế tiếp' (Step 2)");
        console.log("🌐 URL hiện tại: ", page.url());
        return true;

    } catch (error) {
        console.error("❌ Không tìm thấy hoặc không thể click 'Kế tiếp' (Step 2):", error.message);
        return false;
    }
};

async function processSingleBrowser(browser, browserIndex) {
    console.log("-------------------------------------------------------------------------");
    const startChild = new Date();
    console.log(`Bắt đầu mua hàng cho tài khoản --- ${browser.user.username}`);

    try {
        const cvv = browser.user.cvv;
        const pageProduct = browser.pageProduct.page;
        const quantityProduct = browser.pageProduct.quantity;

        await addProductToCard(pageProduct, quantityProduct);
        await proceedToCheckoutStep1( pageProduct );
        await proceedToCheckoutStep2( pageProduct );
        await enterSecurityCode(pageProduct, cvv);

        // await confirmOrder(pageProduct);

        console.log("Đặt thành công đơn hàng ! --- ", browser.user.username);
        const endChild = new Date();

        console.log(`Kết thúc mua hàng cho tài khoản --- ${browser.user.username} với tổng thời gian ${(endChild - startChild)/1000}s`);
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

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const errorCount = results.length - successCount;

    console.log(`\n📊 TỔNG KẾT SONG SONG:`);
    console.log(`✅ Thành công: ${successCount}/${results.length}`);
    console.log(`❌ Lỗi: ${errorCount}/${results.length}`);
    console.log(`⏱️ Tổng thời gian: ${totalDuration}s`);

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            const data = result.value;
            console.log(`[${data.browserIndex}] ${data.username}: ${data.success ? '✅' : '❌'} (${data.duration}s)`);
            if (!data.success) {
                console.log(`Error: ${data.error}`);
            }
        } else {
            console.log(`[${index + 1}] Rejected: ${result.reason}`);
        }
    });

    return results.map(r => r.status === 'fulfilled' ? r.value : null);
}

module.exports = {
    configBrowser,
    processAllBrowsersParallel,
    waitUntilTime,
    delay,
    addProductToCard,
    reloadAllPages
};
