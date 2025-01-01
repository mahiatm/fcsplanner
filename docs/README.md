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

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native (Expo managed) |
| Language | TypeScript |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Persistence | AsyncStorage |
| Testing | Jest + ts-jest |

---

## Project Structure

```
fcsplanner/
├── App.tsx                          # Root component
├── app/
│   ├── AppNavigator.tsx             # Navigation tree
│   ├── context/
│   │   └── AppContext.tsx           # Global state + actions
│   ├── components/
│   │   ├── common/
│   │   │   └── ToastProvider.tsx    # Animated banner alerts
│   │   └── assignment/
│   │       ├── AssignmentCard.tsx   # Task card with priority bar
│   │       ├── DifficultyIndicator.tsx
│   │       └── StudyBlockCard.tsx  # Scheduled block with actions
│   ├── screens/
│   │   ├── landing/LandingScreen.tsx
│   │   ├── input/InputScreen.tsx   # Add/edit assignment
│   │   ├── schedule/
│   │   │   ├── ScheduleScreen.tsx  # Dashboard / today's plan
│   │   │   └── AssignmentsScreen.tsx
│   │   └── settings/SettingsScreen.tsx
│   ├── services/
│   │   ├── PlanningEngine/
│   │   │   ├── PriorityCalculator.ts  # Scoring algorithm
│   │   │   └── Scheduler.ts           # Time-slot allocation
│   │   ├── data/
│   │   │   ├── DataModels.ts
│   │   │   └── LocalDBManager.ts
│   │   └── feedback/
│   │       └── AlertService.ts
│   └── styles/
│       └── theme.ts                 # Colors, typography, spacing
├── tests/
│   ├── unit/PriorityCalculator.test.ts
│   └── integration/ScheduleIntegration.test.ts
├── config/
│   └── constants.ts
└── docs/
    ├── architecture.md
    └── README.md
```

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

## Scheduling Algorithm

The core algorithm runs entirely client-side in TypeScript.

**Priority Score Formula:**

```
score = (deadline_proximity × 0.6) + (difficulty_normalized × 0.4)
```

- `deadline_proximity` — inverse of hours remaining, capped at 1.0 (within 1 week)
- `difficulty_normalized` — `difficulty_rating / 10`

Assignments are sorted by score descending, then time-sliced into the user's available study blocks (defined per day-of-week). A 21-day lookahead window is used. If an assignment cannot be fully scheduled before its deadline, it is flagged as **At Risk**.

**Priority Tiers:**

| Score | Label |
|---|---|
| ≥ 0.8 | 🔴 Critical |
| ≥ 0.55 | 🟠 High |
| ≥ 0.3 | 🔵 Medium |
| < 0.3 | 🟢 Low |

---

## Data Model

```
User ──< Assignment ──< StudyBlock
User ──< Availability
```

All entities are stored locally as JSON via AsyncStorage. See `app/services/data/DataModels.ts` for full type definitions.

---

## Color Palette

| Name | Hex | Usage |
|---|---|---|
| Background | `#FFFFFF` | Main canvas |
| Primary Text | `#1A1A1A` | Headings, body |
| Secondary Text | `#6B7280` | Captions, hints |
| Accent (FCS Blue) | `#007AFF` | CTAs, active states |
| Warning (Amber) | `#FF9500` | At-risk flags |
| Success (Emerald) | `#34C759` | Completions |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push and open a PR

---

## License

MIT
