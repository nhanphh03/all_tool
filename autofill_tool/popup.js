document.getElementById('startFill').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab.url.includes('logoform.jp')) {
    await chrome.storage.local.set({ autoFillEnabled: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    alert("Đã bắt đầu Auto Fill trên logoform.jp!");
  } else {
    alert("Trang hiện tại không phải logoform.jp!");
  }
});

document.getElementById('stopFill').addEventListener('click', async () => {
  await chrome.storage.local.set({ autoFillEnabled: false });
  alert("Đã dừng Auto Fill.");
});
