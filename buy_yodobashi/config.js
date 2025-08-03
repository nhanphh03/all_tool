const path = require('path');

module.exports = {
    url: 'https://logoform.jp/form/9cfD/598244',
    browser: {
        headless: false,
        slowMo: 100,
        timeout: 5000
    },
    paths: {
        csv: path.join(__dirname, 'data', 'data.csv'),
        assets: path.join(__dirname, 'assets')
    },
    delays: {
        afterNavigation: 2000,
        afterFileUpload: 1000,
        afterTextInput: 500,
        beforeSubmit: 2500
    }
};
