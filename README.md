# Hướng Dẫn Kích Hoạt Windows Pro & Microsoft Office (Mọi Phiên Bản)

Tài liệu này hướng dẫn chi tiết các bước cài đặt bộ ứng dụng văn phòng Microsoft Office và kích hoạt bản quyền Windows/Office nhanh chóng, an toàn.

---

## 📋 Quy Trình Thực Hiện Nhanh

```mermaid
graph TD
    A[Bước 1: Cài đặt Office] --> B[Bước 2: Chạy file Active]
    B -->|Chạy bình thường| C[Bước 3: Chọn số từ 1 đến 3]
    B -->|Bị lỗi chữ / Không chạy| D[Sửa lỗi bằng Notepad++]
    D -->|Lưu file| B
    C --> E[Hệ thống tự động kích hoạt]
    E --> F[Hoàn thành thành công]
```

---

## 🛠️ Các Bước Cài Đặt Và Kích Hoạt

### Bước 1: Cài đặt Microsoft Office
* Mở thư mục cài đặt của bạn.
* Khởi chạy **một trong hai** file: `Office365Setup` hoặc `OfficeSetup` để bắt đầu quá trình cài đặt tự động.

<img width="762" height="210" alt="Snapzy_2026-05-23_21-08-29_617" src="https://github.com/user-attachments/assets/79c17316-a483-4238-827d-7d32cb46ed7a" />

### Bước 2: Chạy công cụ kích hoạt
* Click đúp chuột (hoặc nhấn chuột phải chọn *Run as administrator*) vào file **Active**.
* **Lưu ý:** Nếu file báo lỗi, không hiển thị menu hoặc tắt đột ngột, vui lòng bỏ qua bước này và xem ngay phần **[⚠️ Xử lý sự cố khi file Active bị lỗi](#-xu-ly-su-co-khi-file-active-bi-loi)** ở bên dưới.

### Bước 3: Lựa chọn phương thức kích hoạt
Khi màn hình công cụ xuất hiện, bạn nhấn phím số trên bàn phím tương ứng với nhu cầu của mình:
* **Phím 1:** Chỉ kích hoạt Windows.
* **Phím 2:** Chỉ kích hoạt Office.
* **Phím 3:** Kích hoạt cả Windows và Office (Khuyên dùng).

<img width="619" height="516" alt="Snapzy_clipboard_31738A68-4FCA-4E22-8038-70F50B20CACA" src="https://github.com/user-attachments/assets/16680f57-b86e-4b78-b6d7-2075ee8e5448" />
<img width="607" height="513" alt="Snapzy_clipboard_EB817A4D-7B90-4146-B320-7F3C8E2C845E" src="https://github.com/user-attachments/assets/466deac7-83e5-45b6-a11f-837964611902" />

### Bước 4: Hoàn thành
* Chờ đợi trong giây lát để hệ thống tự động cập nhật dữ liệu.
* Khi màn hình hiển thị thông báo thành công (như hình dưới), bạn có thể tắt công cụ và sử dụng phần mềm bình thường.

<img width="768" height="356" alt="Snapzy_2026-05-23_21-17-20_798" src="https://github.com/user-attachments/assets/758bf840-b9b2-4900-a7d1-73337d048311" />

🎉 *Chúc bạn thực hiện thành công!*

---

## ⚠️ Xử Lý Sự Cố Khi File Active Bị Lỗi

Nếu file kích hoạt hiển thị sai ký tự hoặc không thể chạy do lỗi định dạng dòng (EOL) giữa các hệ điều hành, hãy xử lý theo các bước sau:

1. **Tải công cụ hỗ trợ:** Truy cập trang chủ [Notepad++ Downloads](https://notepad-plus-plus.org) để tải và cài đặt phiên bản mới nhất của phần mềm Notepad++.
2. **Mở file chỉnh sửa:** Click chuột phải vào file **Active** -> Chọn **Edit with Notepad++**.
   <img width="669" height="487" alt="Snapzy_clipboard_EAA4D3B9-2980-44A6-886D-55DC2FBB49C6" src="https://github.com/user-attachments/assets/4303aa1a-da9f-440d-8464-28f4fc3aa9a9" />
3. **Chuyển đổi định dạng dòng:** 
   * Trên thanh menu của Notepad++, chọn tab **Edit**.
   * Di chuột vào mục **EOL Conversion**.
   * Tích chọn **Windows (CR LF)**.
   <img width="1020" height="768" alt="Snapzy_clipboard_9697388E-7A9A-41D9-9270-180788ACAF67" src="https://github.com/user-attachments/assets/4b82ceff-d761-45bc-9085-b9a69b70ad1e" />
4. **Lưu và chạy lại:** Nhấn tổ hợp phím `Ctrl + S` để lưu lại file. Sau đó quay lại làm tiếp từ **[Bước 2](#bước-2-chạy-công-cụ-kích-hoạt)**.
