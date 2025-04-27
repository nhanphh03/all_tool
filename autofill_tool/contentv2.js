(async () => {
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // Lấy dữ liệu từ file CSV
  const fetchData = async () => {
    const response = await fetch(chrome.runtime.getURL('data/Data.csv'));
    const text = await response.text();
    const rows = text.split("\n").map(row => row.split(","));
    return rows;
  };

  const data = await fetchData();

  // Hàm điền thông tin vào form
  const autofillForm = async (row) => {
    const formData = {
      7: row[0], // Full name
      1: row[1], // Date of birth
      8: row[2], // Telephone number
      9: row[9], // Driver's license face image name
      10: row[10], // Driver's license back image name
      15: "hotrocuocsong.nhatban@gmail.com" // Email address
    };

    // Điền các giá trị vào các input, radio, checkbox...
    await delay(1000); // Đợi trước khi điền thông tin vào form

    // Q1
    document.querySelector(`[data-item-id="18"]`)?.checked = true; // id="input-58" (Q1)
    document.querySelector(`#input-58`)?.checked = true;

    // Điền vào các trường có thể thay đổi (data-item-id: 7, 1, 8, 9, 10)
    Object.keys(formData).forEach(async (key) => {
      const element = document.querySelector(`[data-item-id="${key}"]`);
      if (element) {
        if (element.type === 'radio') {
          element.checked = true;
          element.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (element.type === 'checkbox') {
          if (!element.disabled) {
            element.checked = true;
            element.dispatchEvent(new Event("change", { bubbles: true }));
          }
        } else if (element.tagName === 'INPUT' && element.type === 'text') {
          element.value = formData[key];
          element.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    });

    // Các trường không thay đổi (data-item-id: 18, 2, 14, 20, 19, 15)
    // Tự động điền vào các trường mặc định
    document.querySelector(`[data-item-id="2"]`)?.value = "ベトナム"; // data-item-id="2" mặc định điền vào "ベトナム"
    document.querySelector(`[data-item-id="14"]`)?.value = "ベトナム"; // data-item-id="14" mặc định điền vào "ベトナム"
    
    // Tự động chọn radio hoặc điền email
    document.querySelector(`#input-106`)?.checked = true; // data-item-id="20" chọn radio
    document.querySelector(`#input-115`)?.checked = true; // data-item-id="19" chọn radio
    document.querySelector(`[data-item-id="15"]`).value = "hotrocuocsong.nhatban@gmail.com"; // Email

    // Chọn một ô trong các input từ 268 tới 424 (auto choose)
    const inputIds = [
      "input-268", "input-272", "input-276", "input-280", "input-284", "input-292",
      "input-296", "input-300", "input-304", "input-308", "input-312", "input-316",
      "input-320", "input-324", "input-328", "input-332", "input-336", "input-340",
      "input-344", "input-348", "input-352", "input-356", "input-360", "input-364",
      "input-368", "input-372", "input-376", "input-380", "input-384", "input-388",
      "input-392", "input-396", "input-400", "input-404", "input-408", "input-412",
      "input-416", "input-420", "input-424"
    ];

    for (let id of inputIds) {
      const inputElement = document.querySelector(`#${id}`);
      if (inputElement && !inputElement.disabled) {
        inputElement.checked = true; // Chọn ô đầu tiên không bị disabled
        break;
      }
    }

    // Upload ảnh từ thư mục assets
    try {
      const imageUrlFace = chrome.runtime.getURL(`assets/${row[9]}`);
      const imageUrlBack = chrome.runtime.getURL(`assets/${row[10]}`);
      const blobFace = await fetch(imageUrlFace).then(res => res.blob());
      const blobBack = await fetch(imageUrlBack).then(res => res.blob());

      const fileFace = new File([blobFace], row[9], { type: "image/jpeg" });
      const fileBack = new File([blobBack], row[10], { type: "image/jpeg" });

      const dtFace = new DataTransfer();
      const dtBack = new DataTransfer();
      dtFace.items.add(fileFace);
      dtBack.items.add(fileBack);

      document.querySelectorAll('input[type="file"][data-item-id="9"]').forEach(input => {
        input.files = dtFace.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });

      document.querySelectorAll('input[type="file"][data-item-id="10"]').forEach(input => {
        input.files = dtBack.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    } catch (err) {
      console.error("Không thể tải ảnh:", err);
    }

    console.log("Đã điền thông tin và tải ảnh!");
  };

  // Hàm xử lý từng bản ghi
  const processCsvData = async () => {
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (row.length >= 12) {
        await autofillForm(row); // Điền form cho bản ghi hiện tại
        await delay(2000); // Đợi 2 giây trước khi chuyển sang bản ghi tiếp theo
      }
    }
    console.log("Hoàn tất việc điền thông tin cho tất cả bản ghi!");
  };

  // Kích hoạt khi bấm nút "Start Fill"
  document.getElementById('start-fill').addEventListener('click', async () => {
    console.log("Bắt đầu điền thông tin...");
    await processCsvData();
  });
})();
