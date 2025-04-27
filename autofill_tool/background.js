chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ Extension installed.');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('logoform.jp')) {
    chrome.storage.local.get('autoFillEnabled', (data) => {
      if (data.autoFillEnabled) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
      }
    });
  }
});

