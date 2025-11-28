# DUKE FARM - ระบบจัดการฟาร์มปลาดุก

เว็บแอปพลิเคชันสำหรับการจัดการฟาร์มปลาดุกที่พัฒนาด้วย Next.js และ Tailwind CSS

![DUKE FARM Logo](public/login/duke.png)

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Icons**: React Icons (Feather Icons)
- **Font**: Prompt (สำหรับภาษาไทย)

## 🚀 การติดตั้งและใช้งาน

### ติดตั้ง Dependencies
```bash
npm install
```

### รันในโหมด Development
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### Build สำหรับ Production
```bash
npm run build
npm start
```

## 📁 โครงสร้างโปรเจค

```
duke-fram/
├── public/
│   ├── login/          # รูปภาพสำหรับหน้า Login
│   │   ├── bg.jpg      # Background image
│   │   ├── duke.png    # โลโก้ DUKE
│   │   └── ...
│   └── ...
├── src/
│   └── app/
│       ├── login/          # หน้า Login
│       ├── dashboard/      # หน้า Dashboard หลัก
│       ├── weather/        # หน้าติดตามสภาพอากาศ
│       ├── add-feeding/    # หน้าบันทึกการให้อาหาร
│       ├── statistics/     # หน้าสถิติและการวิเคราะห์
│       ├── layout.tsx      # Layout หลัก
│       ├── page.tsx        # หน้าแรก (Redirect)
│       └── globals.css     # Global CSS
├── tailwind.config.ts      # Tailwind Configuration
└── package.json
```

## 🎨 สี Theme หลัก

- **Primary Green**: `#4ade80` (Emerald-400)
- **Dark Green**: `#1e3a3a` (Custom duke-dark)
- **Light Green**: `#f0fdf4` (Custom duke-light)
- **Background**: `#f9fafb` (Gray-50)

## 📱 หน้าต่างๆ ในแอป

1. **หน้าแรก** (`/`) - Redirect ไปหน้า Login หรือ Dashboard
2. **หน้า Login** (`/login`) - เข้าสู่ระบบ
3. **Dashboard** (`/dashboard`) - แดชบอร์ดหลัก
4. **สภาพอากาศ** (`/weather`) - ติดตามสภาพอากาศ
5. **บันทึกการให้อาหาร** (`/add-feeding`) - ฟอร์มบันทึก
6. **สถิติ** (`/statistics`) - กราฟและการวิเคราะห์

## 🔧 การปรับแต่ง

### เพิ่มข้อมูลฟาร์ม
แก้ไขไฟล์ `src/app/dashboard/page.tsx` เพื่อเปลี่ยนข้อมูลฟาร์ม

### เปลี่ยนโลโก้
แทนที่ไฟล์ `public/login/duke.png` ด้วยโลโก้ใหม่

### ปรับสี Theme
แก้ไขไฟล์ `tailwind.config.ts` ในส่วน `theme.extend.colors`

