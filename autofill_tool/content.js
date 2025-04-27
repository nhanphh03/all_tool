(async () => {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    const imageUrl = chrome.runtime.getURL("assets/IMG_2764.JPEG");
  
    for (let i = 1; i <= 3; i++) {
      console.log(`Lần thực hiện ${i}`);
  
      const formData = {
        4: "段差ができている",
        37: "住所"
      };
  
      const formDataText = {
        1: "Viet Nam",
        35: "HAf fffff",
        39: "Nội dung điền vào input có data-item-id='1'"
      };
  
      await delay(1000);
  
      // Chọn radio
      document.querySelectorAll('input[type="radio"][data-item-id]').forEach(radio => {
        const id = radio.dataset.itemId;
        if (formData[id] && radio.value === formData[id]) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
          console.log(`Radio [${id}] đã chọn`);
        }
      });
  
      await delay(1000);
  
      // Điền input text
      document.querySelectorAll('input[type="text"][data-item-id]').forEach(input => {
        const id = input.dataset.itemId;
        if (formDataText[id]) {
          input.value = formDataText[id];
          input.dispatchEvent(new Event("input", { bubbles: true }));
          console.log(`Input [${id}] = "${formDataText[id]}"`);
        }
      });
  
      // Upload ảnh
      try {
        const blob = await fetch(imageUrl).then(res => res.blob());
        const file = new File([blob], "IMG_2764.JPEG", { type: "image/jpeg" });
        const dt = new DataTransfer();
        dt.items.add(file);
  
        document.querySelectorAll('input[type="file"][accept*="image"]').forEach(input => {
          input.files = dt.files;
          input.dispatchEvent(new Event("change", { bubbles: true }));
          console.log("Ảnh đã được upload");
        });
      } catch (err) {
        console.error("Không thể tải ảnh:", err);
      }
  
      await delay(1500);
  
      // Nhấn nút xác nhận
      const confirmBtn = document.querySelector('[data-testid="form-detail--to-confirm-button"]');
      if (confirmBtn) {
        confirmBtn.click();
        console.log("Đã nhấn nút xác nhận");
      } else {
        console.error("Không tìm thấy nút xác nhận");
        break;
      }
  
      await delay(4000);
  
      // Nhấn nút "Trở lại màn hình đầu tiên"
      const backBtn = Array.from(document.querySelectorAll('button')).find(btn =>
        btn.innerText.includes("最初の画面に戻る")
      );
  
      if (backBtn) {
        backBtn.click();
        console.log("Quay lại màn hình đầu tiên");
      } else {
        console.error("Không tìm thấy nút '最初の画面に戻る'");
        break;
      }
  
      await delay(4000);
    }
  
    console.log("Đã hoàn tất 3 lần gửi form!");
  })();
  