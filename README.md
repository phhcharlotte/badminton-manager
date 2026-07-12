# BadmintonHub — Frontend

Ứng dụng React + TypeScript cho hệ thống đặt sân cầu lông: duyệt sân công khai kiểu sàn thương mại điện tử, đặt sân lẻ hoặc đăng ký gói cố định dài hạn, thanh toán qua mã QR, real-time theo dõi khung giờ, và khu vực quản trị cho Admin/Quản lý.

**Công nghệ:** React, TypeScript, Vite, Zustand, MUI (Material UI), Axios, Socket.IO Client, Day.js.

---

## 1. Cài đặt

```bash
npm install
npm install socket.io-client
```

Tạo file biến môi trường theo môi trường (Vite tự chọn đúng file theo `mode`):

**`.env.development`**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

VITE_BANK_ID=vietcombank
VITE_BANK_ACCOUNT_NO=0123456789
VITE_BANK_ACCOUNT_NAME=BADMINTONHUB
```

> `VITE_BANK_ID` dùng mã ngân hàng viết thường không dấu theo chuẩn VietQR (`vietcombank`, `mbbank`, `techcombank`, `acb`, `vietinbank`...). `VITE_BANK_ACCOUNT_NAME` nên viết **IN HOA KHÔNG DẤU** để hiển thị đúng trên app ngân hàng khi quét mã.

Chạy dev:

```bash
npm run dev
```

---

## 2. Luồng người dùng chính (quan trọng nhất)

Trang **Đặt sân chính là trang chủ** — không bắt đăng nhập ngay từ đầu, giống mô hình sàn thương mại điện tử:

```
1. Khách vào web
   → Thấy NGAY danh sách sân (không cần đăng nhập)

2. Click vào 1 sân
   → Xem lịch trống/đã đặt của BẤT KỲ ngày nào (calendar + lưới giờ)
   → Vẫn KHÔNG cần đăng nhập ở bước này

3. Chọn giờ xong, bấm "Tiếp tục"
   → Nếu CHƯA đăng nhập: hiện popup đăng nhập/đăng ký ngay tại chỗ
     (không rời trang, không mất lựa chọn sân/giờ đã chọn)
   → Đăng nhập/đăng ký xong, popup tự đóng, tự chuyển sang bước thanh toán

4. Bước thanh toán
   → Hệ thống tạo đơn (giữ chỗ khung giờ ngay lúc này qua BE transaction)
   → Hiện mã QR chuyển khoản (VietQR), số tiền + nội dung tự điền sẵn
   → Khách bấm "Tôi đã thanh toán" → chuyển sang trang Lịch sử đặt sân

5. Trang Lịch sử đặt sân
   → Xem đơn vừa tạo: sân số mấy, loại sân (cố định/vãng lai),
     giá (gói cố định thì đã nhân đúng số buổi), thời gian, trạng thái
     (Chờ xác nhận / Đã xác nhận / Hoàn thành / Đã huỷ)
```

Cơ chế kỹ thuật đứng sau: state của luồng đặt sân (`selectedCourt`, `selectedDate`, `selectedSlots`...) nằm trong **`bookingFlowStore`** (Zustand, độc lập với việc component nào đang render), nên khi `isAuthenticated` chuyển từ `false` → `true` ngay giữa luồng, `App.tsx` tự chuyển giao diện sang app đã đăng nhập mà **không mất bất kỳ lựa chọn nào** của khách.

---

## 3. Vai trò & trang tương ứng

| Trang                                      | Khách (chưa đăng nhập)    | Customer | Manager | Admin |
| ------------------------------------------ | ------------------------- | -------- | ------- | ----- |
| Danh sách sân + xem lịch                   | ✅                        | ✅       | ✅      | ✅    |
| Đặt sân / đăng ký gói cố định              | Cần đăng nhập ở bước cuối | ✅       | —       | —     |
| Lịch sử đặt sân                            | —                         | ✅       | —       | —     |
| Tổng quan (Dashboard)                      | —                         | —        | ✅      | ✅    |
| Quản lý đặt sân (xác nhận/huỷ)             | —                         | —        | ✅      | ✅    |
| Kế toán / Doanh thu                        | —                         | —        | ✅      | ✅    |
| Quản lý sân (CRUD)                         | —                         | —        | —       | ✅    |
| Quản lý người dùng / tạo tài khoản Quản lý | —                         | —        | —       | ✅    |
| Hồ sơ cá nhân                              | —                         | ✅       | ✅      | ✅    |

Phân quyền hiển thị menu **tập trung tại 1 file duy nhất**: `src/routes/routes.config.tsx` (`PAGE_ROLES`) — `Sidebar` và bộ điều hướng trong `App.tsx` đều đọc từ đây, sửa quyền chỉ cần sửa đúng 1 chỗ.

---

## 4. Cấu trúc thư mục chính

```
src/
  apis/                     # axiosClient + các hàm gọi API (auth, court, booking, revenue, public)
  lib/socket.ts             # kết nối/ngắt Socket.IO
  store/                    # zustand stores
    authStore.ts             # đăng nhập/đăng ký/hồ sơ/token
    courtStore.ts            # danh sách sân
    bookingStore.ts          # đặt sân, lịch sử, real-time upsert
    bookingFlowStore.ts       # state luồng đặt sân công khai (sống qua bước đăng nhập)
  hooks/
    useBookingSocketEvents.ts # lắng nghe booking:new / booking:updated toàn cục
    useNotification.ts
  components/
    auth/LoginPromptDialog.tsx  # popup đăng nhập/đăng ký, dùng cho khách + trang chủ
    auth/ProtectedRoute.tsx
    shared/Sidebar.tsx, MobileNavbar.tsx, NotificationSnackbar.tsx
  pages/
    PublicBookingLanding.tsx    # layout công khai (header + BookingFlowPage)
    BookingFlowPage.tsx          # điều phối 3 bước đặt sân công khai
    booking-flow/
      CourtsCatalogView.tsx       # Bước 1: danh sách sân
      CourtDetailView.tsx          # Bước 2: lịch trống + chọn giờ + chặn đăng nhập
      PaymentView.tsx               # Bước 3: tạo đơn + QR thanh toán
    DashboardPage.tsx, HistoryPage.tsx, ManageBookingsPage.tsx,
    ManageCourtsPage.tsx, ManageUsersPage.tsx, RevenuePage.tsx, ProfilePage.tsx
  routes/routes.config.tsx    # NGUỒN DUY NHẤT: PAGE_ROLES, NAV_ITEMS, PAGE_TITLES
  config/payment.ts            # sinh URL mã QR VietQR
  types/                         # Booking, Courts, User...
  App.tsx
```

---

## 5. Xác thực (tóm tắt cơ chế)

- **Access token**: lưu trong biến JS (memory) qua `tokenStore.ts`, **không** dùng `localStorage` (tránh XSS).
- **Refresh token**: BE tự set qua **httpOnly cookie**, FE không đụng vào trực tiếp.
- `axiosClient.ts` tự gắn `Authorization: Bearer <token>` khi có token, tự gọi `/auth/refresh-token` khi gặp 401 rồi retry request — người dùng không cảm nhận được việc này.
- F5 / mở tab mới: `authStore.initAuth()` tự gọi refresh lúc app khởi động để khôi phục phiên.
- Guest (chưa đăng nhập) gọi API vẫn hoạt động bình thường với các endpoint công khai (danh sách sân, lịch trống) vì `axiosClient` chỉ gắn header khi có token, không bắt buộc phải có.

---

## 6. Real-time (Socket.IO)

- Kết nối được thiết lập (`connectSocket()`) ngay sau khi đăng nhập/đăng ký/khôi phục phiên thành công; ngắt (`disconnectSocket()`) khi đăng xuất.
- Khách **chưa đăng nhập không kết nối được socket** (BE yêu cầu access token khi handshake) — khi đang ở `CourtDetailView`, nếu chưa đăng nhập, phần cập nhật khung giờ vẫn hoạt động bình thường qua REST polling khi đổi ngày/sân, chỉ không có push tức thời — điều này chấp nhận được vì tính đúng đắn cuối cùng luôn do BE transaction quyết định lúc đặt.
- `useBookingSocketEvents(isAuthenticated)` gắn 1 lần ở `App.tsx`, tự cập nhật `bookingStore` khi có sự kiện `booking:new` / `booking:updated` — mọi trang đọc từ store sẽ tự re-render, không cần tự poll lại API.

---

## 7. Thanh toán QR

`src/config/payment.ts` sinh URL ảnh QR theo chuẩn **VietQR** (dịch vụ công khai, miễn phí, không cần đăng ký API key):

```typescript
buildVietQrUrl(amount, note);
// → https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount=...&addInfo=...
```

Số tiền và nội dung chuyển khoản được điền sẵn trong mã QR — khách chỉ cần mở app ngân hàng quét là tự động khớp thông tin. Đây là xác nhận thanh toán **thủ công** (khách tự bấm "Tôi đã thanh toán", nhân viên đối chiếu sao kê và xác nhận đơn trong `ManageBookingsPage`) — chưa tích hợp cổng thanh toán tự động đối soát; nếu cần tự động hoá, sẽ phải tích hợp thêm webhook từ một cổng thanh toán/ngân hàng hỗ trợ (ví dụ SePay, Casso...).

---

## 8. Lệnh hữu ích

```bash
npm run dev       # chạy dev server (Vite)
npm run build     # build production
npm run preview   # xem thử bản build
```

---

## 9. Việc cần cấu hình lại theo dự án thật

- [ ] Điền đúng tài khoản ngân hàng thật vào `.env` (mục 1)
- [ ] Đảm bảo `TIME_SLOTS` ở FE (`src/types/Booking`) khớp **chính xác từng phần tử** với `TIME_SLOTS` ở BE (`src/config/timeSlots.ts`)
- [ ] `VITE_API_URL` / `VITE_SOCKET_URL` trỏ đúng domain BE khi deploy production
- [ ] Nếu đổi chính sách giảm giá gói cố định, chỉ cần sửa `FIXED_DURATION_OPTIONS` ở BE — FE tự lấy qua API, không cần sửa gì
