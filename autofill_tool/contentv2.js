const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchData = async () => {
  try {
    const response = await fetch(chrome.runtime.getURL('data/DataTest.csv'));
    if (!response.ok) throw new Error("Không thể tải file CSV.");
    const text = await response.text();
    return text.split("\n").map(row => row.split(",").map(cell => cell.trim()));
  } catch (error) {
    console.error("Lỗi khi tải hoặc xử lý file CSV:", error);
    return [];
  }
};

const selectRadio = async (dataItemId, targetId, targetValue) => {
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

const fillTextInput = async (dataItemId, text) => {
  const input = document.querySelector(`input[type="text"][data-item-id="${dataItemId}"]`);
  if (!input) return logWarning(`Không tìm thấy input text với data-item-id="${dataItemId}"`);

  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  console.log(`Đã điền "${text}" vào input data-item-id="${dataItemId}"`);
  return true;
};

const fillFileInput = async (dataItemId, path) => {
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


(async () => {
  const data = await fetchData();
  if (data.length === 0) return console.error("Không có dữ liệu để xử lý");

  for (const row of data) {
    await delay(6000);
    const [cell1, cell2, cell3, cell4, cell5] = row;

    // Q1
    await selectRadio("18", "input-58", "同意する（I agree.）");
    // Q2
    await fillTextInput("7", cell1);
    // Q3
    await fillTextInput("1", cell2);
    // Q4
    await fillTextInput("8", cell3);
    // Q5
    await fillTextInput("2", "ベトナム");
    // Q6
    await fillTextInput("14", "ベトナム");
    // Q7
    await selectRadio("20", "input-106",
        "非免除国 (NOT countries exempt from foreign license exchange test)");
    await delay(1500);
    // Q8
    await selectRadio("22", "input-256", "ない(No)");
    // Q10
    // todo
    // Q11
    await selectRadio("19", "input-115", "自動車(Vehicle)");
    // Q12
    await fillFileInput("9", cell4);
    // Q13
    await fillFileInput("10", cell5);
    // Q14
    await fillTextInput("15", "hotrocuocsong.nhatban@gmail.com");

    // Submit
    await delay(2500);
    const confirmBtn = document.querySelector('[data-testid="form-detail--to-confirm-button"]');
    if (confirmBtn) {
      confirmBtn.click();
      console.log("Đã nhấn nút xác nhận");
    } else {
      console.error("Không tìm thấy nút xác nhận");
      break;
    }
    // Back button
    await delay(2000);
    const backBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.innerText.includes("最初の画面に戻る"));
    if (backBtn) {
      backBtn.click();
      console.error("Quay lại màn hình đầu tiên");
    } else {
      console.error("Không tìm thấy nút '最初の画面に戻る'");
      break;
    }
  }

  console.log(`Đã hoàn tất ${data.length} lần gửi form!`);
})();
