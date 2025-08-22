const path = require('path');

module.exports = {
    url: 'https://order.yodobashi.com/yc/login/index.html',
    browser: {
        headless: false,
        slowMo: 100,
        timeout: 5000
    },
    paths: {
        json: path.join(__dirname, 'data.json')
    },
    delays: {
        afterNavigation: 2000,
        afterFileUpload: 1000,
        afterTextInput: 500,
        beforeSubmit: 2500
    }
};



// const { chromium } = require('playwright');
// const fs = require('fs').promises;
//
// const delay = ms => new Promise(res => setTimeout(res, ms));
//
// async function createStealthBrowser() {
//     return await chromium.launch({
//         // Để Playwright tự động tìm Chromium được cài đặt
//         // hoặc sử dụng đường dẫn cụ thể nếu cần: executablePath: '/path/to/chromium',
//         headless: false,
//         args: [
//             // Disable automation indicators
//             '--disable-blink-features=AutomationControlled',
//             '--disable-automation',
//             '--no-first-run',
//             '--no-service-autorun',
//             '--password-store=basic',
//
//             // Performance và memory
//             '--disable-background-timer-throttling',
//             '--disable-backgrounding-occluded-windows',
//             '--disable-renderer-backgrounding',
//             '--disable-dev-shm-usage',
//             '--disable-ipc-flooding-protection',
//             '--disable-features=TranslateUI,BlinkGenPropertyTrees',
//
//             // Security và permissions
//             '--no-sandbox',
//             '--disable-setuid-sandbox',
//             '--disable-web-security',
//             '--disable-features=VizDisplayCompositor',
//
//             // Extensions và plugins
//             '--disable-extensions-except=',
//             '--disable-extensions',
//             '--disable-plugins-discovery',
//             '--disable-default-apps',
//
//             // Media và graphics
//             '--disable-gpu-sandbox',
//             '--enable-webgl',
//             '--enable-accelerated-2d-canvas',
//             '--enable-accelerated-video-decode',
//             '--enable-gpu-rasterization',
//
//             // Network
//             '--aggressive-cache-discard',
//             '--disable-background-networking',
//             '--disable-sync',
//
//             // Other stealth options
//             '--disable-client-side-phishing-detection',
//             '--disable-component-extensions-with-background-pages',
//             '--disable-hang-monitor',
//             '--disable-prompt-on-repost',
//             '--disable-domain-reliability',
//             '--disable-component-update',
//             '--no-pings',
//             '--no-proxy-server',
//
//             // Window appearance
//             '--window-size=1920,1080',
//             '--window-position=0,0',
//             '--start-maximized'
//         ]
//     });
// }
//
// async function createBrowserContext(browser, username) {
//     let storageState = {};
//     let isCookie = false;
//     try {
//         const cookiesData = await fs.readFile(`cookies/${username}.json`, 'utf-8');
//         storageState = JSON.parse(cookiesData);
//         console.log(`Đã tải cookies cho ${username} từ cookies/${username}.json`);
//         isCookie = true;
//     } catch (error) {
//         console.log(`Không tìm thấy cookies cho ${username}, sẽ đăng nhập thủ công`, error.message);
//     }
//
//     const fingerprints = {
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
//         viewport: { width: 1920, height: 1080 },
//         screen: { width: 1920, height: 1080 },
//         deviceScaleFactor: 1,
//         platform: 'Win32',
//         languages: ['en-US', 'en'],
//         timezone: 'America/New_York'
//     };
//
//     return {
//         context: await browser.newContext({
//             userAgent: fingerprints.userAgent,
//             viewport: fingerprints.viewport,
//             locale: 'en-US',
//             timezoneId: fingerprints.timezone,
//             extraHTTPHeaders: {
//                 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
//                 'Accept-Language': 'en-US,en;q=0.9',
//                 'Accept-Encoding': 'gzip, deflate, br, zstd',
//                 'Cache-Control': 'max-age=0',
//                 'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
//                 'sec-ch-ua-mobile': '?0',
//                 'sec-ch-ua-platform': '"Windows"',
//                 'sec-ch-ua-platform-version': '"15.0.0"',
//                 'sec-ch-ua-arch': '"x86"',
//                 'sec-ch-ua-bitness': '"64"',
//                 'sec-ch-ua-model': '""',
//                 'Upgrade-Insecure-Requests': '1',
//                 'User-Agent': fingerprints.userAgent,
//                 'Sec-Fetch-Dest': 'document',
//                 'Sec-Fetch-Mode': 'navigate',
//                 'Sec-Fetch-Site': 'none',
//                 'Sec-Fetch-User': '?1'
//             },
//             permissions: ['geolocation', 'notifications', 'camera', 'microphone'],
//             geolocation: { longitude: -74.006, latitude: 40.7128 }, // New York
//             screen: fingerprints.screen,
//             deviceScaleFactor: fingerprints.deviceScaleFactor,
//             isMobile: false,
//             hasTouch: false,
//             colorScheme: 'light',
//             reducedMotion: 'no-preference',
//             forcedColors: 'none',
//             storageState: storageState,
//             ignoreHTTPSErrors: true,
//             javaScriptEnabled: true,
//             acceptDownloads: true
//         }),
//         isCookie: isCookie
//     };
// }
//
// async function setupAntiDetection(page) {
//     // Inject stealth scripts before page loads
//     await page.addInitScript(() => {
//         // Remove webdriver property
//         Object.defineProperty(navigator, 'webdriver', {
//             get: () => undefined,
//         });
//
//         // Mock chrome object
//         window.chrome = {
//             app: {
//                 isInstalled: false,
//                 InstallState: {
//                     DISABLED: 'disabled',
//                     INSTALLED: 'installed',
//                     NOT_INSTALLED: 'not_installed'
//                 },
//                 RunningState: {
//                     CANNOT_RUN: 'cannot_run',
//                     READY_TO_RUN: 'ready_to_run',
//                     RUNNING: 'running'
//                 }
//             },
//             runtime: {
//                 onConnect: null,
//                 onMessage: null,
//                 onStartup: null,
//                 onInstalled: null,
//                 onSuspend: null,
//                 onSuspendCanceled: null,
//                 onUpdateAvailable: null,
//                 onBrowserUpdateAvailable: null,
//                 onRestartRequired: null,
//                 onConnectExternal: null,
//                 onMessageExternal: null,
//                 id: 'chrome-extension://boadgeojelhgndaghljhdicfkmllpafd'
//             },
//             csi: () => {},
//             loadTimes: () => ({
//                 commitLoadTime: Date.now() / 1000 - Math.random(),
//                 connectionInfo: 'http/1.1',
//                 finishDocumentLoadTime: Date.now() / 1000 - Math.random(),
//                 finishLoadTime: Date.now() / 1000 - Math.random(),
//                 firstPaintAfterLoadTime: Date.now() / 1000 - Math.random(),
//                 firstPaintTime: Date.now() / 1000 - Math.random(),
//                 navigationType: 'Other',
//                 npnNegotiatedProtocol: 'http/1.1',
//                 requestTime: Date.now() / 1000 - Math.random(),
//                 startLoadTime: Date.now() / 1000 - Math.random(),
//                 wasAlternateProtocolAvailable: false,
//                 wasFetchedViaSpdy: false,
//                 wasNpnNegotiated: false
//             })
//         };
//
//         // Enhanced navigator properties
//         Object.defineProperty(navigator, 'languages', {
//             get: () => ['en-US', 'en'],
//         });
//
//         Object.defineProperty(navigator, 'platform', {
//             get: () => 'Win32',
//         });
//
//         Object.defineProperty(navigator, 'hardwareConcurrency', {
//             get: () => 8,
//         });
//
//         Object.defineProperty(navigator, 'deviceMemory', {
//             get: () => 8,
//         });
//
//         Object.defineProperty(navigator, 'connection', {
//             get: () => ({
//                 downlink: 10,
//                 effectiveType: '4g',
//                 rtt: 50,
//                 saveData: false
//             }),
//         });
//
//         // Mock plugins realistically
//         Object.defineProperty(navigator, 'plugins', {
//             get: () => {
//                 const pluginArray = [
//                     {
//                         0: {type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format"},
//                         description: "Portable Document Format",
//                         filename: "internal-pdf-viewer",
//                         length: 1,
//                         name: "Chrome PDF Plugin"
//                     },
//                     {
//                         0: {type: "application/pdf", suffixes: "pdf", description: ""},
//                         description: "",
//                         filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
//                         length: 1,
//                         name: "Chrome PDF Viewer"
//                     }
//                 ];
//                 pluginArray.refresh = () => {};
//                 return pluginArray;
//             },
//         });
//
//         // Mock permissions
//         const originalQuery = navigator.permissions.query;
//         navigator.permissions.query = (parameters) => (
//             parameters.name === 'notifications' ?
//                 Promise.resolve({ state: Notification.permission }) :
//                 originalQuery(parameters)
//         );
//
//         // Add realistic screen properties
//         Object.defineProperty(screen, 'availWidth', {
//             get: () => 1920,
//         });
//         Object.defineProperty(screen, 'availHeight', {
//             get: () => 1040,
//         });
//         Object.defineProperty(screen, 'width', {
//             get: () => 1920,
//         });
//         Object.defineProperty(screen, 'height', {
//             get: () => 1080,
//         });
//         Object.defineProperty(screen, 'colorDepth', {
//             get: () => 24,
//         });
//
//         // Mock WebGL fingerprint
//         const getParameter = WebGLRenderingContext.prototype.getParameter;
//         WebGLRenderingContext.prototype.getParameter = function(parameter) {
//             if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
//                 return 'Intel Inc.';
//             }
//             if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
//                 return 'Intel Iris OpenGL Engine';
//             }
//             return getParameter.call(this, parameter);
//         };
//
//         // Add activity tracking
//         let lastActivity = Date.now();
//         ['mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup', 'click', 'scroll', 'touchstart'].forEach(eventType => {
//             document.addEventListener(eventType, () => {
//                 lastActivity = Date.now();
//                 window.lastActivity = lastActivity;
//             }, true);
//         });
//
//         // Randomize mouse movement patterns
//         let mouseX = Math.random() * window.innerWidth;
//         let mouseY = Math.random() * window.innerHeight;
//         document.addEventListener('mousemove', (e) => {
//             mouseX = e.clientX;
//             mouseY = e.clientY;
//         });
//
//         // Add realistic date/time handling
//         const originalDate = Date;
//         Date = class extends originalDate {
//             constructor(...args) {
//                 if (args.length === 0) {
//                     super();
//                 } else {
//                     super(...args);
//                 }
//             }
//
//             static now() {
//                 return originalDate.now();
//             }
//         };
//     });
//
//     // Set realistic viewport with slight variations
//     await page.setViewportSize({
//         width: 1920 + Math.floor(Math.random() * 10 - 5),
//         height: 1080 + Math.floor(Math.random() * 10 - 5)
//     });
//
//     // Set timeouts
//     page.setDefaultTimeout(60000);
//     page.setDefaultNavigationTimeout(90000);
//
//     // Add request/response interceptors for additional stealth
//     await page.route('**/*', async (route, request) => {
//         const headers = {
//             ...request.headers(),
//             'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
//             'Accept-Language': 'en-US,en;q=0.9',
//             'Cache-Control': 'max-age=0'
//         };
//
//         // Remove automation-related headers
//         delete headers['x-playwright'];
//         delete headers['x-automation'];
//
//         await route.continue({ headers });
//     });
// }
//
// async function navigateToPage(page, url, maxRetries = 3) {
//     let retryCount = 0;
//
//     while (retryCount < maxRetries) {
//         try {
//             // Random delay before navigation
//             await delay(2000 + Math.random() * 3000);
//
//             // Simulate human-like mouse movement before navigation
//             await page.mouse.move(
//                 Math.random() * 1920,
//                 Math.random() * 1080,
//                 { steps: 10 + Math.floor(Math.random() * 10) }
//             );
//
//             await page.goto(url, {
//                 waitUntil: 'networkidle',
//                 timeout: 90000
//             });
//
//             // Simulate human behavior after page load
//             await delay(1000 + Math.random() * 2000);
//
//             // Random scroll to simulate reading
//             await page.evaluate(() => {
//                 const scrollAmount = Math.random() * 300;
//                 window.scrollTo({
//                     top: scrollAmount,
//                     behavior: 'smooth'
//                 });
//             });
//
//             await delay(500 + Math.random() * 1000);
//
//             // Random mouse movement
//             for (let i = 0; i < 3 + Math.random() * 3; i++) {
//                 await page.mouse.move(
//                     Math.random() * 1920,
//                     Math.random() * 1080,
//                     { steps: 5 + Math.floor(Math.random() * 10) }
//                 );
//                 await delay(200 + Math.random() * 300);
//             }
//
//             console.log(`Successfully navigated to ${url}`);
//             return true;
//
//         } catch (error) {
//             retryCount++;
//             console.log(`Retry ${retryCount}/${maxRetries} for ${url}`);
//             console.log("Error:", error.message);
//
//             if (retryCount >= maxRetries) {
//                 console.error(`Failed to navigate to ${url} after ${maxRetries} retries:`, error.message);
//                 return false;
//             }
//
//             // Exponential backoff with jitter
//             const baseDelay = Math.pow(2, retryCount) * 2000;
//             const jitter = Math.random() * 2000;
//             await delay(baseDelay + jitter);
//         }
//     }
//
//     return false;
// }
//
// async function gotoPage(page, url) {
//     await page.goto(url, {
//         waitUntil: 'networkidle',
//         timeout: 90000
//     });
//
//     await page.mouse.move(
//         Math.random() * 1920,
//         Math.random() * 1080,
//         { steps: 10 }
//     );
//
//     return page;
// }
//
// async function configBrowser(product, users, jsonConfig) {
//     const pagesMain = [];
//     const browser = await createStealthBrowser();
//
//     try {
//         for (const user of users) {
//             console.log(user);
//             if (user.status === 'no') {
//                 continue;
//             }
//             console.log(`Tiến hành mua hàng cho user: ${user.username}`);
//
//             const result = await createBrowserContext(browser, user.username);
//             const context = result.context;
//             const isCookie = result.isCookie;
//
//             const pageChild = {
//                 user: user,
//                 pageProduct: null,
//                 context: context,
//                 loginSuccess: false,
//             };
//
//             const page = await context.newPage();
//             await setupAntiDetection(page);
//
//             // Add page to results
//             pagesMain.push(pageChild);
//         }
//
//     } catch (error) {
//         console.error(`Failed to configure browser:`, error.message);
//         throw error;
//     }
//
//     return pagesMain;
// }
//
// module.exports = {
//     configBrowser,
//     gotoPage,
//     navigateToPage
// };
