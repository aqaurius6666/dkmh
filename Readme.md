# Yêu cầu
1. Cài đặt NodeJs [Installation](https://nodejs.org/en/download/)

# Trước khi chạy
1. Tạo cho mình file .env từ .env.template, lưu ý `MSSV` và `PASSWORD`.
2. Với trường `TARGET_COURSES`, cần điền vào danh sách các mã lớp học phần muốn đăng ký, cách nhau bởi dấu `"."`. Với lớp học phần có lớp thực hành, nhập theo định dạng sau `<mã môn>-<lớp thực hành>`. Ví dụ INT3020 1 có 2 lớp thực hành 1 và 2, muốn đăng kí lớp 1, thì mã lớp học phần cần điền là `INT3020 1-1`. Với lớp học phần không có lớp thực hành, giữ nguyên mã lớp học phần. Ví dụ PES1050 1, thì điền là `PES1050 1`. Khi đó, ta có ví dụ về `TARGET_COURSES=PES1050 1.INT3020 1-1` .
3. `yarn` để cài dependencies.
# Run
1. yarn start:tool

# Lưu ý
1. Để dừng chạy `Control + C` (MacOS), `Ctrl + C` (Ubuntu), Window không biết vì chưa xài window bao giờ


