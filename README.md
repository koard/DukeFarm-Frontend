# 🐟 DukeFarm Frontend - ระบบจัดการฟาร์มปลาดุก

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

เว็บแอปพลิเคชันสำหรับการจัดการฟาร์มปลาดุกที่พัฒนาด้วย Next.js และ Tailwind CSS พร้อม Smart Caching และ Weather Integration

![DUKE FARM Logo](public/login/duke.png)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Project Structure](#project-structure)
- [Caching Strategy](#caching-strategy)
- [Pages Overview](#pages-overview)
- [Customization](#customization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

DukeFarm Frontend เป็นเว็บแอปพลิเคชันสำหรับเกษตรกรในการจัดการฟาร์มปลาดุกทั้ง 3 ช่วงการเลี้ยง:
- **Nursery Small** (0-30 วัน) - ปลาเล็กมาก อุณหภูมิมีผลมาก
- **Nursery Large** (31-120 วัน) - ปลาขนาดกลาง อุณหภูมิมีผลปานกลาง
- **Market Grower** (121+ วัน) - ปลาขนาดใหญ่ อุณหภูมิมีผลน้อย

### Key Features

- **🔐 LINE Login Authentication** - เข้าสู่ระบบผ่าน LINE OAuth 2.0
- **📊 Smart Dashboard** - แดชบอร์ดแบบ real-time พร้อมข้อมูลสภาพอากาศและแผนการให้อาหาร
- **🌤️ Weather Integration** - ข้อมูลสภาพอากาศแบบเรียลไทม์จาก Backend API
- **💾 Intelligent Caching** - ระบบ cache แบบ TTL เพื่อลด API calls และเพิ่มความเร็ว
- **📱 Responsive Design** - ใช้งานได้ทั้งบนมือถือและคอมพิวเตอร์
- **🎯 Age-Specific Recommendations** - คำแนะนำการให้อาหารตามช่วงอายุปลา

## ✨ Features

### Authentication & User Management
- LINE Login OAuth 2.0 integration
- JWT token-based session management
- Role-based routing (Farmer, Researcher, Admin)
- User profile management with farm location

### Dashboard Features
- **Real-time Weather Display**
  - Current air temperature and conditions
  - Temperature delta from optimal range (28-35°C)
  - Weather condition icons (WMO codes)
  - 7-day forecast preview

- **Feeding Plan**
  - Age-specific feeding recommendations
  - Temperature-based feeding adjustments
  - Percentage-based recommendations (-90% to 0%)
  - Daily feeding schedule with weather integration

- **Farm Statistics**
  - Pond count and farm area
  - Stocking density and fish age
  - Production metrics

### Weather Pages
- **Detailed Weather View**
  - Hourly forecast (next 12-24 hours)
  - 7-day detailed forecast
  - Temperature trends (max/min)
  - Precipitation probability
  - Interactive weather map with farm location

### Smart Caching System
- **Dashboard Cache**: 15-minute TTL
- **Weather Cache**: 30-minute TTL
- **User Profile Cache**: 60-minute TTL
- Automatic cache invalidation on expiry
- Memory-efficient sessionStorage implementation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js App Router Pages                 │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │  Dashboard  │  │   Weather    │  │  Add-Feeding│  │  │
│  │  │   Pages     │  │    Pages     │  │    Pages    │  │  │
│  │  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  │  │
│  └─────────┼─────────────────┼──────────────────┼─────────┘  │
│  ┌─────────▼─────────────────▼──────────────────▼─────────┐  │
│  │              CacheManager (TTL-based)                  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │ Dashboard    │  │   Weather    │  │ User Profile│  │  │
│  │  │ Cache (15m)  │  │ Cache (30m)  │  │ Cache (60m) │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │  │
│  └────────────────────────┬────────────────────────────────┘  │
└───────────────────────────┼────────────────────────────────────┘
                            │ fetch() with JWT token
                            │
                 ┌──────────▼──────────┐
                 │  Backend API        │
                 │  (Express + Prisma) │
                 │  ┌──────────────┐   │
                 │  │  Dashboard   │   │
                 │  │  Services    │   │
                 │  └──────┬───────┘   │
                 │  ┌──────▼───────┐   │
                 │  │   Weather    │   │
                 │  │   Service    │   │
                 │  └──────┬───────┘   │
                 └─────────┼───────────┘
                           │
                    ┌──────▼───────┐
                    │ Open-Meteo   │
                    │ Weather API  │
                    └──────────────┘
```

## 📊 Data Flow

### 1. Authentication Flow
```
User clicks LINE Login
    ↓
Redirect to Backend /api/auth/line/login?role=farmer
    ↓
Backend generates LINE OAuth URL
    ↓
User authenticates with LINE
    ↓
LINE redirects to Backend callback
    ↓
Backend creates/updates user in database
    ↓
Backend generates JWT token
    ↓
Redirect to Frontend /auth/callback?token=...
    ↓
Frontend stores token in localStorage
    ↓
Redirect to appropriate dashboard based on farm type
```

### 2. Dashboard Data Flow (with Caching)
```
User opens Dashboard page
    ↓
Check CacheManager for cached data (TTL: 15 min)
    ├─ Cache HIT & VALID
    │   ↓
    │   Load from cache → Display immediately (FAST!)
    │
    └─ Cache MISS or EXPIRED
        ↓
        Fetch from Backend API
        ↓
        Backend calls Weather Service
        ↓
        Weather Service fetches from Open-Meteo
        ↓
        Backend calculates feeding plan
        ↓
        Backend returns complete dashboard data:
        {
          summary: { weather, location, hourlyForecast },
          feedingPlan: { forecast, recommendations }
        }
        ↓
        Store in CacheManager with TTL
        ↓
        Display on page
```

### 3. Weather Page Flow (Uses Cached Data)
```
User clicks Weather button
    ↓
Navigate to Weather page
    ↓
Load data from CacheManager (same cache as Dashboard)
    ├─ Cache HIT
    │   ↓
    │   Display weather details immediately (NO API CALL!)
    │
    └─ Cache MISS
        ↓
        Show "No data - please return to Dashboard"
        ↓
        User returns to Dashboard to fetch fresh data
```

### 4. Cache Lifecycle
```
Time 00:00 - User opens Dashboard
    ↓ API call to Backend
    ↓ Store in cache (expires at 00:15)
    
Time 00:05 - User refreshes page
    ↓ Cache HIT (still valid)
    ↓ Load from cache (NO API CALL)
    
Time 00:10 - User opens Weather page
    ↓ Cache HIT (still valid)
    ↓ Load from cache (NO API CALL)
    
Time 00:16 - User refreshes Dashboard
    ↓ Cache EXPIRED
    ↓ API call to Backend
    ↓ Store new data in cache (expires at 00:31)
```

### 5. Feeding Recommendation Logic
```
Fish Age (days) + Water Temperature (°C)
    ↓
Determine Farm Type:
├─ 0-30 days → NURSERY_SMALL
│   ├─ Temp < 28°C → High sensitivity (-70% to -90%)
│   └─ Temp > 35°C → High sensitivity (-40% to -80%)
│
├─ 31-120 days → NURSERY_LARGE
│   ├─ Temp < 28°C → Medium sensitivity (-40% to -60%)
│   └─ Temp > 35°C → Medium sensitivity (-20% to -50%)
│
└─ 121+ days → GROWOUT
    ├─ Temp < 28°C → Low sensitivity (-30% to -50%)
    └─ Temp > 35°C → Low sensitivity (-15% to -40%)
    
    ↓
Calculate Daily Adjustment Percentage
    ↓
Generate 7-day Feeding Plan
```

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js** 15 - React framework with App Router
- **React** 19 - UI library
- **TypeScript** 5.9 - Type-safe development

### Styling & UI
- **Tailwind CSS** v4 - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Google Fonts** (Prompt) - Thai language support

### Maps & Geolocation
- **Leaflet** - Interactive map library
- **React Leaflet** - React components for Leaflet
- **OpenStreetMap** - Free map tiles
- **Nominatim** - Geocoding service

### State Management & Data
- **localStorage** - Authentication tokens and user data
- **sessionStorage** - Dashboard and weather cache with TTL
- **Custom CacheManager** - TTL-based cache utility

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 📦 Prerequisites

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Backend API** running (see DukeFarm-Backend README)
- **LINE Developers Account** (for authentication)

## 🚀 Installation

### 1. Clone Repository

```powershell
git clone https://github.com/koard/DukeFarm-Frontend.git
cd DukeFarm-Frontend
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Environment Configuration

Create `.env.local` file in project root:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

# LINE Login (for reference, actual login handled by backend)
NEXT_PUBLIC_LINE_LIFF_ID=your-liff-id
```

### 4. Start Development Server

```powershell
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```powershell
npm run build
npm start
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:4000/api` |
| `NEXT_PUBLIC_LINE_LIFF_ID` | LINE LIFF ID (optional) | `1234567890-abcdefgh` |

### Backend Connection

Ensure Backend API is running before starting Frontend:

```powershell
# Terminal 1: Start Backend
cd ../DukeFarm-Backend
npm run dev

# Terminal 2: Start Frontend
cd ../DukeFarm-Frontend
npm run dev
```

## 🧪 Development

### Development Workflow

1. **Make Changes** - Edit files in `src/app/`
2. **Auto Reload** - Next.js hot reloads automatically
3. **Test** - Check functionality in browser
4. **Check Errors** - Monitor terminal for errors

### Common Development Tasks

**Clear Cache:**
```javascript
// In browser console
sessionStorage.clear()
localStorage.clear()
```

**Check Cached Data:**
```javascript
// In browser console
console.log(sessionStorage.getItem('nurserySmallDashboard'))
```

**Test Without Cache:**
```javascript
// Temporarily disable cache by commenting out in page.tsx
// const cachedData = CacheManager.get<DashboardData>(DASHBOARD_CACHE_KEY);
```

## 📁 Project Structure

```
DukeFarm-Frontend/
├── public/
│   ├── login/                      # Login page assets
│   │   ├── bg.jpg                  # Background image
│   │   ├── duke.png                # DUKE logo
│   │   └── line-login.png          # LINE login button
│   ├── nursery-large/              # Nursery large icons
│   └── register-farmer/            # Farmer registration icons
├── src/
│   ├── app/
│   │   ├── page.tsx                # Root page (routing logic)
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx        # LINE auth callback handler
│   │   │
│   │   ├── nursery-small/          # Nursery Small (0-30 days)
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── weather-small/
│   │   │   │   └── page.tsx        # Weather detail page
│   │   │   └── feeding-small/
│   │   │       └── page.tsx        # Feeding record page
│   │   │
│   │   ├── nursery-large/          # Nursery Large (31-120 days)
│   │   │   ├── page.tsx            # Dashboard
│   │   │   └── weather-large/
│   │   │       └── page.tsx        # Weather detail page
│   │   │
│   │   ├── market-grower/          # Market Grower (121+ days)
│   │   │   ├── page.tsx            # Dashboard
│   │   │   └── weather-market/
│   │   │       └── page.tsx        # Weather detail page
│   │   │
│   │   ├── register-farmer/        # Farmer registration
│   │   │   └── page.tsx
│   │   │
│   │   ├── register-researcher/    # Researcher registration
│   │   │   └── page.tsx
│   │   │
│   │   └── weather/                # Legacy weather page
│   │       └── page.tsx
│   │
│   ├── components/                 # Reusable components
│   │   ├── common/                 # Common UI components
│   │   ├── layout/                 # Layout components
│   │   ├── dashboard/              # Dashboard widgets
│   │   └── ...
│   │
│   ├── hooks/
│   │   └── useLineUser.ts          # LINE user hook
│   │
│   ├── utils/
│   │   └── cache.ts                # CacheManager with TTL
│   │
│   └── assets/                     # Static assets
│
├── .env.local                      # Environment variables
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS config
├── tsconfig.json                   # TypeScript config
├── postcss.config.mjs              # PostCSS config
└── package.json                    # Dependencies & scripts
```

## 💾 Caching Strategy

### CacheManager Implementation

Located in `src/utils/cache.ts`, the CacheManager provides TTL-based caching:

```typescript
// Cache configuration
export const CACHE_TTL = {
  DASHBOARD: 15 * 60 * 1000,      // 15 minutes
  WEATHER: 30 * 60 * 1000,         // 30 minutes
  USER_PROFILE: 60 * 60 * 1000,    // 1 hour
  STATIC: 24 * 60 * 60 * 1000      // 24 hours
} as const;

// Usage
CacheManager.set('key', data, CACHE_TTL.DASHBOARD);
const cachedData = CacheManager.get<DataType>('key');
```

### Cache Keys

- `nurserySmallDashboard` - Nursery Small dashboard data
- `nurseryLargeDashboard` - Nursery Large dashboard data
- `marketGrowerDashboard` - Market Grower dashboard data

### Cache Behavior

**Dashboard Pages:**
1. Check cache on page load
2. If cache hit and valid → Display immediately
3. If cache miss or expired → Fetch from API → Store with TTL

**Weather Pages:**
1. Load from same cache as dashboard
2. No direct API calls
3. If cache miss → Prompt user to return to dashboard

### Benefits

- ⚡ **Performance**: Instant page loads with cached data
- 🔄 **Data Freshness**: Automatic refresh after TTL expires
- 💰 **Cost Efficiency**: Reduced API calls to weather service
- 🎯 **Consistency**: Weather page always shows same data as dashboard

## 📱 Pages Overview

### Main Pages

1. **Root Page** (`/`) 
   - Routing logic based on authentication and farm type
   - Redirects to appropriate dashboard

2. **LINE Auth Callback** (`/auth/callback`)
   - Handles LINE OAuth callback
   - Stores JWT token in localStorage
   - Redirects based on user role and registration status

3. **Farmer Registration** (`/register-farmer`)
   - Farm details form
   - GPS location picker with Leaflet map
   - Pond count and farm area input

### Dashboard Pages (by Farm Type)

4. **Nursery Small Dashboard** (`/nursery-small`)
   - For fish aged 0-30 days
   - High temperature sensitivity display
   - Weather overview card
   - 7-day feeding plan
   - Quick action buttons

5. **Nursery Large Dashboard** (`/nursery-large`)
   - For fish aged 31-120 days
   - Medium temperature sensitivity
   - Similar layout to Nursery Small

6. **Market Grower Dashboard** (`/market-grower`)
   - For fish aged 121+ days
   - Low temperature sensitivity
   - Mature fish management features

### Weather Detail Pages

7. **Nursery Small Weather** (`/nursery-small/weather-small`)
   - Hourly forecast (next 12 hours)
   - 7-day detailed forecast
   - Interactive map with farm location
   - Temperature trends

8. **Nursery Large Weather** (`/nursery-large/weather-large`)
   - Same features as Nursery Small weather

9. **Market Grower Weather** (`/market-grower/weather-market`)
   - Same features with market grower context

### Feeding Pages

10. **Nursery Small Feeding** (`/nursery-small/feeding-small`)
    - Feeding record form
    - Feed type selection
    - Amount calculation helper

## 🎨 Theme Colors

- **Primary Green**: `#4ade80` (Emerald-400)
- **Dark Green**: `#1e3a3a` (Custom duke-dark)
- **Light Green**: `#f0fdf4` (Custom duke-light)
- **Background**: `#f9fafb` (Gray-50)
- **Text**: `#1f2937` (Gray-800)
- **Accent**: `#10b981` (Emerald-500)

## 🔧 Customization

### Change Cache TTL

Edit `src/utils/cache.ts`:

```typescript
export const CACHE_TTL = {
  DASHBOARD: 10 * 60 * 1000,  // Change to 10 minutes
  WEATHER: 20 * 60 * 1000,     // Change to 20 minutes
} as const;
```

### Change Logo

Replace `public/login/duke.png` with your logo

### Customize Theme Colors

Edit `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      'duke-dark': '#1e3a3a',
      'duke-light': '#f0fdf4',
      'custom-color': '#your-color',
    }
  }
}
```

### Add New Page

1. Create folder in `src/app/your-page/`
2. Create `page.tsx` file
3. Use layout components from `src/components/layout/`

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```powershell
   git add .
   git commit -m "feat: ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [Vercel Dashboard](https://vercel.com/new)
   - Import repository from GitHub
   - Auto-detected as Next.js project

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy**
   - Vercel will auto-build and deploy
   - Get production URL: `https://your-app.vercel.app`

### Deploy to Other Platforms

Compatible with any Next.js hosting:
- **Netlify** - Build: `npm run build`, Publish: `.next`
- **Cloudflare Pages** - Next.js support
- **AWS Amplify** - Full-stack hosting
- **DigitalOcean App Platform** - Container deployment

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow TypeScript best practices** and maintain type safety
3. **Write descriptive commit messages** (Conventional Commits format)
4. **Update documentation** for significant changes
5. **Test thoroughly** on multiple screen sizes
6. **Run lint check**: `npm run lint` (must pass)

### Code Style

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Tailwind CSS utility classes
- Implement responsive design (mobile-first)
- Add loading states and error handling
- Use CacheManager for API data caching

### Commit Message Format

```
type(scope): subject

Examples:
- feat(dashboard): add weather icon display
- fix(cache): resolve TTL expiration issue
- docs(readme): update installation guide
```

## 📄 License

This project is proprietary software developed for **Betagro & Kasetsart University**.

**© 2025 DukeFarm. All rights reserved.**

## 📞 Support

For questions, issues, or feature requests:

- **GitHub Issues**: [koard/DukeFarm-Frontend/issues](https://github.com/koard/DukeFarm-Frontend/issues)
- **Backend Documentation**: [DukeFarm-Backend README](../DukeFarm-Backend/README.md)
- **Project Team**: Betagro & Kasetsart University Research Collaboration

---

**Built with ❤️ for sustainable aquaculture in Thailand**

