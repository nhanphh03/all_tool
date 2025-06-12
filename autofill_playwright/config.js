const path = require('path');

module.exports = {
    url: 'file:///home/nhanph/Project/Tool/test.html',
    // url: 'https://logoform.jp/form/AwVT/495909',
    // url: 'https://logoform.jp/form/6fa7/dourokanri',
    browser: {
        headless: false,
        slowMo: 100,
        timeout: 30000
    },
    paths: {
        csv: path.join(__dirname, 'data', 'data2.csv'),
        assets: path.join(__dirname, 'assets')
    },
    delays: {
        afterNavigation: 2000,
        afterFileUpload: 1000,
        afterTextInput: 500,
        beforeSubmit: 2500
    }
};
