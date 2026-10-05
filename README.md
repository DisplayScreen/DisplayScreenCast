# SmartScreen — Centralized Event Display System

**SmartScreen** is a modern, production-grade centralized event display control system where one administrator controls content shown simultaneously on unlimited physical screens (TVs, stage projectors, LED walls, laptops) with realtime synchronization.

---

## ⚡ Core Concept

The application has only two primary routes:

* **`/display`** → The presentation URL opened on all venue TVs, projectors, or screens. Contains **no admin UI**. Automatically synchronizes through realtime listeners.
* **`/admin`** → The administrator operations console. Operates all scenes, timers, announcements, assets, schedules, and emergency alerts.

### Zero-Friction Screen Setup
* **NO screen IDs**
* **NO device registration or pairing**
* **NO manual device configuration**
* Any device opening `/display` automatically receives the active event broadcast.

---

## 🚀 Key Features

### 1. Public Presentation Screen (`/display`)
* **Zero UI Clutter**: Clean presentation surface designed for 16:9 and 4:3 physical displays.
* **Continuous Realtime Sync**: Instant scene switching via Firestore & local mesh synchronization.
* **Offline Resilience**: Automatically caches the active scene in `localStorage`. If network drops, it keeps playing smoothly without displaying audience-facing error screens.
* **Screen Wake Lock**: Activates the Screen Wake Lock API to prevent venue TVs and laptops from going to sleep or triggering screensavers.
* **Authoritative Local Timer**: Synchronized to authoritative server timestamps. Renders continuous local frame ticks without writing to Firestore every second.
* **Live Emergency Overlay & Blackout**: Immediate full-screen takeover during venue alerts or stage transitions.

### 2. Admin Operations Console (`/admin`)
* **Live Physical Screen Simulator**: 16:9 TV and 4:3 Projector previews mirroring exact client output.
* **1-Click Quick Broadcast Bar**: Instant tactile buttons for *Welcome*, *Rules*, *Timer*, *Sponsors*, *Announcement*, *Break*, *Results*, *Clear Screen (Blackout)*, and *Emergency Broadcast*.
* **Presentation Mode**: Live operator deck with *Previous*, *Next*, *Auto-Play Slideshow*, and *Re-Broadcast*.
* **Visual Drag-and-Drop Scene Designer**:
  - Elements: Text, Image, Video, Timer, Dynamic QR Code, Logo, Shape/Card, Divider, Leaderboard Widget, Regulation Cards.
  - Controls: Position ($X$, $Y$), Dimensions ($W$, $H$), Typography, Weight, Alignment, Opacity, Colors, Borders, Radius, Shadows, Blur, and Layer Z-Index ordering.
* **Pre-Built Template Library**:
  - Welcome Scene
  - Hackathon / Tournament Rules
  - Live Countdown Arena
  - Event Announcement Card
  - Intermission & Networking
  - Tournament Leaderboard & Results
  - Sponsor & Partner Showcase
  - Thank You & Closing
  - Custom Blank Canvas
* **Authoritative Timer Console**:
  - Countdown & Stopwatch modes
  - Start, Pause, Resume, Reset
  - Rapid delta adjustments: $+1\text{m}$, $+5\text{m}$, $-1\text{m}$, $-5\text{m}$
  - Duration presets: $5\text{m}$, $10\text{m}$, $15\text{m}$, $30\text{m}$, $45\text{m}$, $60\text{m}$, or custom minutes.
* **Announcement Queue**:
  - Stage notices in advance
  - Reorder announcements with priority tags (*Urgent*, *Notice*, *Info*)
  - 1-click broadcast as a top ticker across all connected physical displays
* **Event Schedule Timeline**:
  - Chronological schedule (e.g. 09:00 Welcome, 09:30 Rules, 10:00 Timer, 12:30 Break, 16:00 Results)
  - Auto-trigger toggle to automatically switch scenes when the clock matches the scheduled time
* **Centralized Asset Library**:
  - Upload images, videos, logos, backgrounds
  - Supports Firebase Storage and automatic local previews
  - Search, filter by category, copy URLs, and instant scene insertion
* **Brand Kit**:
  - Event logo, Primary/Secondary colors, Default dark background, Preferred typography, Sponsor logo roster
* **Dynamic QR Code Generator**:
  - Built-in presets for Wi-Fi credentials, Live Schedule, Google Forms / Feedback, and Registration URLs
* **Display Telemetry & Health**:
  - Anonymous presence heartbeat tracking (< 40s expiration)
  - Realtime connected screen count and active resolution viewports
* **Emergency Override System**:
  - High-visibility safety broadcast with preset disaster/evacuation alerts, confirmation safeguards, and 1-click restoration of the previous scene.

---

## 🛠 Tech Stack

* **Framework**: Next.js 16 (App Router, Turbopack)
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **QR Codes**: `qrcode.react` (SVG)
* **Backend State**: Firebase Firestore & Firebase Storage
* **Local Fallback**: Browser `BroadcastChannel` + `localStorage` mesh

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
* Launch `/admin` to control the event.
* Launch `/display` in one or multiple windows/screens to see instantaneous synchronization.

### 3. Production Build
```bash
npm run build
npm start
```

---

## ☁️ Firebase Configuration

SmartScreen runs immediately out-of-the-box using local realtime mesh sync.

To connect your own Firebase project for multi-device sync across different networks:

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Firebase Storage**.
3. Create a `.env.local` file using `.env.example`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Alternatively, open `/admin` and click the **Settings** icon in the header to enter your Firebase project credentials directly in the UI.

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage
```

---

## 📐 Architecture & Data Model

* `/events/current`: Authoritative active event state, active scene ID, timer timestamps, brand kit, and emergency broadcast flags.
* `/scenes/{sceneId}`: Scene documents containing layers, styles, and elements.
* `/announcements/{id}`: Queued announcements.
* `/schedule/{id}`: Event schedule items with time triggers.
* `/assets/{id}`: Uploaded asset metadata.
* `/displayPresence/{sessionId}`: Anonymous display heartbeat records.
