# 🏸 BadmintonHub – Hệ thống đặt sân cầu lông

Ứng dụng đặt sân cầu lông đầy đủ tính năng, xây dựng bằng **React + TypeScript + MUI + SCSS + Zustand**.

---

## 📦 Tech Stack

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 18 | UI Framework |
| TypeScript | 5 | Type safety |
| MUI (Material UI) | 5 | Component library |
| MUI X Date Pickers | 6 | Calendar / DatePicker |
| Zustand | 4 | State management |
| SCSS (Sass) | 1.64 | Styling |
| Day.js | 1.11 | Xử lý ngày giờ |
| React Scripts | 5 | CRA build tool |

---

## 🚀 Cài đặt & Chạy

```bash
# 1. Di chuyển vào thư mục project
cd badminton-booking

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm start
```

Mở trình duyệt tại **http://localhost:3000**

---

## 🔑 Tài khoản demo

| Vai trò | Username | Mật khẩu |
|---|---|---|
| 👑 Quản lý (Admin) | `admin` | `admin123` |
| 🧑‍💼 Nhân viên (Staff) | `staff1` | `staff123` |
| 🙋 Khách hàng (User) | `user1` | `user123` |
| 🙋 Khách hàng 2 | `user2` | `user123` |

---

## 🗂️ Cấu trúc thư mục

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Route guard theo role
│   └── shared/
│       ├── Sidebar.tsx             # Sidebar navigation (desktop + mobile)
│       ├── MobileNavbar.tsx        # Top navbar trên mobile
│       └── NotificationSnackbar.tsx # Toast notification
│
├── data/
│   └── mockData.ts                 # Dữ liệu mẫu ban đầu
│
├── hooks/
│   └── useNotification.ts          # Hook quản lý snackbar
│
├── pages/
│   ├── LoginPage.tsx               # Trang đăng nhập
│   ├── DashboardPage.tsx           # Tổng quan (Admin/Staff)
│   ├── CourtsPage.tsx              # Danh sách sân
│   ├── BookingPage.tsx             # Đặt sân (3 bước)
│   ├── HistoryPage.tsx             # Lịch sử đặt sân (User)
│   ├── ManageBookingsPage.tsx      # Quản lý đặt sân (Admin/Staff)
│   ├── ManageCourtsPage.tsx        # Quản lý sân (Admin)
│   ├── ManageUsersPage.tsx         # Quản lý người dùng (Admin)
│   └── ProfilePage.tsx             # Hồ sơ cá nhân
│
├── store/
│   ├── authStore.ts                # Zustand: Auth + User management
│   ├── courtStore.ts               # Zustand: Court management
│   └── bookingStore.ts             # Zustand: Booking management
│
├── styles/
│   └── main.scss                   # Global styles, variables, responsive
│
├── types/
│   └── index.ts                    # TypeScript interfaces & types
│
├── utils/
│   └── helpers.ts                  # Utility functions
│
├── App.tsx                         # Root component + routing
└── index.tsx                       # Entry point
```

---

## ✨ Tính năng

### 👑 Admin
- ✅ Dashboard tổng quan: thống kê, doanh thu, tình trạng sân
- ✅ Quản lý đặt sân: xác nhận / huỷ / hoàn thành
- ✅ Quản lý sân: thêm, sửa, xoá, điều chỉnh giá, bật/tắt sân
- ✅ Quản lý người dùng: tạo tài khoản staff/user, khoá/mở TK
- ✅ Xem hồ sơ cá nhân, đổi mật khẩu

### 🧑‍💼 Nhân viên (Staff)
- ✅ Dashboard tổng quan
- ✅ Quản lý đặt sân: xác nhận / huỷ / hoàn thành
- ✅ Xem danh sách sân
- ✅ Xem hồ sơ cá nhân, đổi mật khẩu

### 🙋 Khách hàng (User)
- ✅ Đặt sân theo 3 bước: chọn sân → chọn ngày + khung giờ → xác nhận
- ✅ Filter sân theo loại (cố định / vãng lai)
- ✅ Calendar chọn ngày (tối đa 30 ngày tới)
- ✅ Hiển thị khung giờ trực quan: còn trống (xanh) / đã đặt (tối) / đã qua (xám) / đang chọn (xanh đậm)
- ✅ Tính tiền tự động theo số giờ × đơn giá
- ✅ Lịch sử đặt sân: xem trạng thái, huỷ lịch chờ xác nhận
- ✅ Hồ sơ cá nhân: xem thống kê, sửa thông tin, đổi mật khẩu

### 🌐 Chung
- ✅ Phân quyền chặt chẽ (ProtectedRoute)
- ✅ Responsive mobile (sidebar overlay, mobile navbar)
- ✅ Persist state (localStorage via Zustand persist)
- ✅ Toast notifications
- ✅ Badge số lượng chờ xác nhận trên sidebar

---

## 💡 Giải thích giá sân

| Loại | Giá mẫu | Mô tả |
|---|---|---|
| ⭐ Cố định | 50.000đ/giờ | Khách đặt lịch cố định hàng tuần, giá ưu đãi |
| 🎯 Vãng lai | 100.000đ/giờ | Đặt từng lần, linh hoạt, giá thông thường |

Giá có thể điều chỉnh tự do bởi Admin trong phần **Quản lý sân → Sửa giá**.

---

## 📱 Responsive

- **Desktop (> 768px)**: Sidebar cố định bên trái, nội dung chiếm phần còn lại
- **Mobile (≤ 768px)**: Sidebar ẩn, mở bằng nút menu trên top bar

---

## 🏗️ Build production

```bash
npm run build
```

Output tại thư mục `build/`, có thể deploy lên Nginx, Vercel, Netlify, v.v.
