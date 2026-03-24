# FCSPLANNER

> A minimalist, AI-driven study planner for Forsyth County high school students — especially those in AP courses.

FCSPLANNER takes your assignments, deadlines, and difficulty ratings and automatically generates a prioritized daily study schedule around your available hours. Everything stays on your device.

---

## Features

- **Smart Scheduling** — Priority algorithm weighs deadline proximity and difficulty to build a realistic daily plan
- **Difficulty Scaling** — Ratings 1–10 directly influence how much study time gets allocated
- **Dynamic Rescheduling** — Mark blocks as missed and the schedule auto-adjusts to catch up
- **At-Risk Flagging** — Assignments that can't fit before their deadline are prominently flagged
- **Local-First** — All data stored with AsyncStorage; zero cloud dependency
- **Minimalist UI** — Clean iOS-first interface built for focus, not clutter

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Expo Go on a physical device

### Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/fcsplanner.git
cd fcsplanner
npm install
npx expo start
```

Then press `i` for iOS simulator or scan the QR code with Expo Go.

### Run Tests

```bash
npm test
```

---

**Priority Tiers:**

| Score | Label |
|---|---|
| ≥ 0.8 | 🔴 Critical |
| ≥ 0.55 | 🟠 High |
| ≥ 0.3 | 🔵 Medium |
| < 0.3 | 🟢 Low |

---


MIT
