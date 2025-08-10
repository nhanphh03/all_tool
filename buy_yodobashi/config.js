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
