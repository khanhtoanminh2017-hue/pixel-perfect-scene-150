# Triển khai Hành trình về miền ký ức lên GitHub Pages

Repo: `khanhtoanminh2017-hue/pixel-perfect-scene-150`

## Cách triển khai

1. Merge nhánh triển khai vào `main` sau khi kiểm tra mục **Checks** của pull request.
2. Trong GitHub, vào **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Nếu GitHub không cho bật Pages do kho mã nguồn riêng tư, cần cân nhắc chuyển kho sang public (công khai mã nguồn) hoặc sử dụng một dịch vụ hosting phù hợp. Chỉ chủ sở hữu quyết định việc này.
4. Vào tab **Actions**, chọn workflow **GitHub Pages – Hành trình về miền ký ức** và chạy lại nếu cần.
5. Trang dự kiến: `https://khanhtoanminh2017-hue.github.io/pixel-perfect-scene-150/` (chỉ hoạt động sau khi triển khai thành công).

## Build ở máy tính

Yêu cầu: Bun cài đặt sẵn.

```sh
bun install --frozen-lockfile
bun run build:pages
```

Đầu ra trong thư mục `dist/`. Bản build dùng hash routing: `/#/doi` và `/#/ca-nhan`, để GitHub Pages mở được các trang mà không phải cấu hình rewrite.

## Lưu ý

- Có 2 lượt chơi miễn phí, đếm bằng localStorage của trình duyệt. Đây **không phải** giới hạn trên máy chủ, người dùng có thể xóa dữ liệu trình duyệt để dùng lại.
- Chưa có đăng nhập Google, chưa có thanh toán hay cấp quyền bản đầy đủ, chưa kiểm nghiệm cơ chế bán hàng.
- Bản dùng thử chưa được xác nhận là có thể sử dụng ngoại tuyến.
- Nên kiểm duyệt toàn bộ câu hỏi SGK trước khi bán hoặc chia sẻ rộng rãi.
