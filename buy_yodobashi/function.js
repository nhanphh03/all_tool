const delay = ms => new Promise(res => setTimeout(res, ms));

// Hàm tạo context với cấu hình browser
async function createBrowserContext(browser) {
    return await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
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
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );

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
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            await page.waitForLoadState('networkidle', { timeout: 30000 });
            console.log(`Successfully opened: ${url}`);
            return true;
        } catch (error) {
            retryCount++;
            console.log(`Retry ${retryCount}/${maxRetries} for ${url}`);

            if (retryCount >= maxRetries) {
                console.error(`Failed to open ${url} after ${maxRetries} retries:`, error.message);
                return false;
            }
            await delay(2000);
        }
    }
    return false;
}
// Hàm tạo các trang con cho links
async function createChildPages(context, links) {
    const pagesChildren = [];

    for (const item of links) {
        try {
            const page = await context.newPage();
            await setupAntiDetection(page);

            // Không cần await ở đây nếu muốn load song song
            page.goto(item.child).catch(err => {
                console.error(`Failed to navigate to ${item.child}:`, err.message);
            });

            pagesChildren.push(page);
        } catch (error) {
            console.error(`Failed to create page for ${item.child}:`, error.message);
        }
    }

    return pagesChildren;
}
// Hàm đăng nhập
async function loginDirectHome(page, username, password) {
    const userNameDOM = `[id="memberId"]`;
    const passwordDOM = `[id="password"]`;

    try {
        await page.waitForSelector(userNameDOM, { timeout: 10000 });
        await page.waitForSelector(passwordDOM, { timeout: 2500 });

        // Điền thông tin đăng nhập
        await page.fill(userNameDOM, username);
        await page.fill(passwordDOM, password);
        console.log(`✅ Đã nhập username và password cho: ${username}`);

        // Tìm và click nút đăng nhập
        const btnLoginDOM = await page.$('[id="js_i_login0"]');
        if (btnLoginDOM) {
            await btnLoginDOM.click();
            console.log("✅ Đã nhấn nút đăng nhập");

            // Chờ điều hướng sau khi đăng nhập
            await page.waitForLoadState('networkidle', { timeout: 30000 });
            return true;
        } else {
            console.error("Không tìm thấy nút đăng nhập");
            return false;
        }

    } catch (error) {
        console.error(`Lỗi khi đăng nhập cho ${username}:`, error.message);
        return false;
    }
}
// Hàm chính để cấu hình browser và tạo pages
async function configBrowser(links, users, browser, jsonConfig) {
    const pagesMain = [];

    try {
        for (const user of users) {
            console.log(`Tiến hành mua hàng cho user: ${user.username}`);

            // Tạo context cho user
            const context = await createBrowserContext(browser);

            // Tạo object để lưu thông tin user và pages
            const pageChild = {
                user: user,
                page: [],
                context: context,
                loginSuccess: false
            };

            try {
                // Tạo trang home
                const pageHome = await context.newPage();
                await setupAntiDetection(pageHome);

                // Điều hướng đến trang login
                const navigationSuccess = await navigateToPage(pageHome, jsonConfig.loginLink);

                if (navigationSuccess) {
                    // Thực hiện đăng nhập
                    console.log(`Thực hiện đăng nhập cho user: ${user.username}`);
                    // const loginSuccess = await loginDirectHome(pageHome, user.username, user.password);
                    // pageChild.loginSuccess = loginSuccess;
                    //
                    // if (loginSuccess) {
                        // Tạo các trang con cho links
                        const pagesChildren = await createChildPages(context, links);
                        pageChild.page = pagesChildren;
                    // }
                }

                pagesMain.push(pageChild);

            } catch (userError) {
                console.error(`Error processing user ${user.username}:`, userError.message);
                // Vẫn push pageChild để theo dõi user nào bị lỗi
                pagesMain.push(pageChild);
            }
        }

    }
    catch (error) {
        console.error(`Failed to configure browser:`, error.message);
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

        // Chỉ cần setTimeout một lần là đủ
        setTimeout(() => {
            console.log(`✅ Đến giờ hẹn: ${new Date().toLocaleTimeString('vi-VN')}`);
            resolve();
        }, timeUntilTarget);
    });
}
const addProductToCard = async (quantity = 1, page) =>{

    //todo change quantity product
    const addToCartBtn = await page.$('#js_m_submitRelated');

    if (addToCartBtn) {
        await addToCartBtn.click();

        console.log("✅ Đã nhấn nút 'Thêm vào giỏ hàng'");
        await page.waitForTimeout(1000);
    } else {
        console.error("Không tìm thấy nút 'Thêm vào giỏ hàng'");
    }
}
const proceedToCheckoutStep1 = async ( page ) =>{
    const checkoutBtn = await page.$('a[href="/yc/shoppingcart/index.html?next=true"]');
    if (checkoutBtn) {
        await checkoutBtn.click();
        console.log("✅ Đã nhấn nút 'Tiến hành thanh toán'");

        // Chờ xử lý
        await page.waitForTimeout(5000);
        return true;

    } else {
        console.error("❌ Không tìm thấy nút 'Tiến hành thanh toán'");
    }
}
const proceedToCheckoutStep2 = async ( page ) =>{
    const nextBtn = await page.$('#sc_i_buy');
    if (nextBtn) {
        await nextBtn.click();
        console.log("✅ Đã  nhấn nút 'Kế tiếp'");

        // Chờ xử lý
        await page.waitForTimeout(5000);
        return true;

    } else {
        console.error("❌ Không tìm thấy nút 'Tiến hành thanh toán'");
    }
}
const enterSecurityCode = async (page, cvvCode) => {
    try {
        const cvvInput = await page.$('input[name="creditCard.securityCode"]');
        if (cvvInput) {
            await cvvInput.fill(''); // Clear

            await cvvInput.fill(cvvCode.toString());
            console.log(`✅ Đã nhập CVV: ${cvvCode}`);

            const inputValue = await cvvInput.inputValue();
            if (inputValue === cvvCode.toString()) {
                console.log("✅ CVV đã được nhập chính xác");
            } else {
                console.log(`⚠️ CVV không khớp. Expected: ${cvvCode}, Got: ${inputValue}`);
                await cvvInput.fill('');
                await cvvInput.type(cvvCode.toString(), { delay: 100 });
                console.log("🔄 Đã thử nhập CVV lại");
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
            const btn = await page.$(selector);
            if (btn && await btn.isVisible()) {
                await btn.click();
                console.log("✅ Đã nhấn nút 'Đặt hàng của bạn'");

                // Chờ xử lý
                await page.waitForTimeout(5000);
                console.log(`📍 Order completed. URL: ${page.url()}`);

                return true;
            }
        }

        console.error("❌ Không tìm thấy nút đặt hàng");
        return false;

    } catch (error) {
        console.error("❌ Lỗi:", error.message);
        return false;
    }
}
const reloadAllPages = async (pages) => {
    pages.forEach((page) => {
        page.reload();
    })
}
const proceedWith3DSecure = async (page) => {
    try {
        const secureBtn = await page.$('#threedsecureExplain_Ok');
        if (secureBtn) {
            await secureBtn.click();
            console.log("✅ Đã nhấn nút 3D Secure");

            // Chờ xử lý
            await page.waitForTimeout(5000);
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
}

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