
import { delay, fetchData, selectRadio, fillTextInput, fillFileInput } from './utils.js';

(async () => {
  const data = await fetchData();
  if (data.length === 0) return console.error("Không có dữ liệu để xử lý");

  for (const row of data) {
    await delay(6000);
    const [cell1, cell2, cell3, cell4, cell5] = row;

    // Các câu hỏi
    if (!(await selectRadio("18", "input-58", "同意する（I agree.）"))) break;
    if (!(await fillTextInput("7", cell1))) break;
    if (!(await fillTextInput("1", cell2))) break;
    if (!(await fillTextInput("8", cell3))) break;
    if (!(await fillTextInput("2", "ベトナム"))) break;
    if (!(await fillTextInput("14", "ベトナム"))) break;
    if (!(await selectRadio("20", "input-106", "非免除国 (NOT countries exempt from foreign license exchange test)"))) break;
    await delay(1500);
    if (!(await selectRadio("22", "input-256", "ない(No)"))) break;
    if (!(await selectCheckboxByDataItemId())) break;
    if (!(await selectRadio("19", "input-115", "自動車(Vehicle)"))) break;
    if (!(await fillFileInput("9", cell4))) break;
    if (!(await fillFileInput("10", cell5))) break;
    if (!(await fillTextInput("15", "hotrocuocsong.nhatban@gmail.com"))) break;

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
    const backBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.innerText.includes("最初の画面に戻る"));
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
