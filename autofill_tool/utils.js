export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const fetchData = async () => {
  try {
    const response = await fetch(chrome.runtime.getURL('data/Data.csv'));
    if (!response.ok) throw new Error("Không thể tải file CSV.");
    const text = await response.text();
    return text.split("\n").map(row => row.split(",").map(cell => cell.trim()));
  } catch (error) {
    console.error("Lỗi khi tải hoặc xử lý file CSV:", error);
    return [];
  }
};

export const selectRadio = async (dataItemId, targetId, targetValue) => {
  const radios = document.querySelectorAll(`input[type="radio"][data-item-id="${dataItemId}"]`);
  if (!radios.length) return logWarning(`Không tìm thấy radio nào với data-item-id="${dataItemId}"`);
  const targetRadio = Array.from(radios).find(radio => radio.id === targetId) || 
                      Array.from(radios).find(radio => radio.value === targetValue);
  if (targetRadio) {
    targetRadio.checked = true;
    targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`Đã chọn radio id="${targetRadio.id}" value="${targetRadio.value}"`);
    return true;
  }
  return logWarning(`Không tìm thấy radio phù hợp với id="${targetId}" hoặc value="${targetValue}"`);
};

export const fillTextInput = async (dataItemId, text) => {
  const input = document.querySelector(`input[type="text"][data-item-id="${dataItemId}"]`);
  if (!input) return logWarning(`Không tìm thấy input text với data-item-id="${dataItemId}"`);
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`Đã điền "${text}" vào input data-item-id="${dataItemId}"`);
  return true;
};

export const fillFileInput = async (dataItemId, path) => {
  const input = document.querySelector(`input[type="file"][data-item-id="${dataItemId}"]`);
  if (!input) return logWarning(`Không tìm thấy input file với data-item-id="${dataItemId}"`);
  try {
    const imageUrl = path.startsWith('chrome-extension://') ? path : chrome.runtime.getURL(path);
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    const fileName = path.split('/').pop() || "upload-file";
    const file = new File([blob], fileName, { type: blob.type });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`Đã upload file "${fileName}" vào input data-item-id="${dataItemId}"`);
    return true;
  } catch (err) {
    console.error(`Không thể tải ảnh từ ${path}:`, err);
    return false;
  }
};

const logWarning = (message) => {
  console.warn(message);
  return false;
};
