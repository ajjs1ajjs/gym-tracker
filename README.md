# 💪 GymProgress — Трекер тренувань / Workout Tracker

[![PWA](https://img.shields.io/badge/PWA-Ready-red.svg)](https://ajjs1ajjs.github.io/gym-tracker/)
[![Version](https://img.shields.io/badge/version-3.0.0--premium-gold.svg)](https://github.com/ajjs1ajjs/gym-tracker/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🇺🇀 Українська

**GymProgress** — потужний, приватний та повністю безкоштовний Progressive Web App (PWA) для відстежування тренувань. Жодних підписок, жодної реклами, 100% серверлес архітектура.

### 🌟 Ключові особливості

- **Детальне логування** — вага, повтори, автоматичний 1RM
- **Графіки прогресії** — візуалізація силового прогресу (Chart.js)
- **Smart Timer** — автоматичний запуск таймера відпочинку після підходу
- **Wake Lock API** — екран не гасне під час тренування
- **Трекер ваги тіла** — динамічний графік змін
- **Калькулятор млинців** — розрахунок дисків для штанги
- **Калькулятор 1RM** — одноповторний максимум та відсотки
- **Калькулятор калорій та БЖУ** — норма на основі Mifflin-St Jeor
- **Трекер води** — денна норма споживання
- **Heatmap активності** — календар тренувань у стилі GitHub
- **Плани тренувань** — створюйте власні плани
- **Cloud Sync** — синхронізація через GitHub Gist
- **AES-256-GCM шифрування** — захист даних
- **Експорт JSON / CSV / Apple Health**
- **100% Offline** — працює без інтернету
- **Дві теми** — темна (neon) та світла

### 📁 Структура проекту

```
gym-tracker/
├── src/                 # Вихідний код TypeScript
│   ├── main.ts          # Вхідна точка, event delegation
│   ├── exercises.ts     # Бібліотека вправ (дані)
│   ├── data.ts          # Стан програми, localStorage
│   ├── ui.ts            # Рендеринг та UI-логіка
│   ├── utils.ts         # Допоміжні функції
│   ├── timer.ts         # Таймер відпочинку
│   ├── logbook.ts       # Журнал тренувань
│   ├── sync.ts          # GitHub Gist синхронізація
│   ├── stats.ts         # Вага тіла, вода, калорії
│   └── global.d.ts      # Типи для зовнішніх бібліотек
├── __tests__/           # Jest тести
├── images/              # Зображення вправ
├── dist/                # Збірка (генерується)
├── index.html           # Головна сторінка
├── style.css            # Дизайн-система
├── sw.js                # Service Worker
├── manifest.json        # PWA конфігурація
├── tsconfig.json        # Налаштування TypeScript
└── package.json         # Залежності та скрипти
```

### 🔧 Команди

```bash
npm install          # Встановити залежності
npm run build        # Зібрати проект
npm test             # Запустити тести
npm run lint         # Перевірка коду
npm run lint:fix     # Автоматичне виправлення
npm run format       # Форматування Prettier
```

---

## 🇬🇧 English

**GymProgress** is a powerful, private, and completely free Progressive Web App (PWA) for tracking your workouts. No subscriptions, no ads, 100% serverless architecture.

### 🌟 Key Features

- **Detailed logging** — weight, reps, automatic 1RM calculation
- **Progression charts** — visualize your strength progress (Chart.js)
- **Smart Timer** — auto-start rest timer after each set
- **Wake Lock API** — screen stays on during workouts
- **Body weight tracker** — dynamic trend chart
- **Plate calculator** — barbell plate distribution calculator
- **1RM calculator** — one-rep max with percentage table
- **Calorie & Macro calculator** — based on Mifflin-St Jeor formula
- **Water tracker** — daily hydration goal
- **Activity heatmap** — GitHub-style workout calendar
- **Workout plans** — create and manage custom plans
- **Cloud Sync** — via GitHub Gist
- **AES-256-GCM encryption** — data protection
- **Export JSON / CSV / Apple Health**
- **100% Offline** — works without internet
- **Two themes** — dark neon & light

### 📁 Project Structure

```
gym-tracker/
├── src/                 # TypeScript source code
│   ├── main.ts          # Entry point, event delegation
│   ├── exercises.ts     # Exercise library (data)
│   ├── data.ts          # App state, localStorage
│   ├── ui.ts            # Rendering & UI logic
│   ├── utils.ts         # Helper functions
│   ├── timer.ts         # Rest timer
│   ├── logbook.ts       # Workout logbook
│   ├── sync.ts          # GitHub Gist sync
│   ├── stats.ts         # Body weight, water, calories
│   └── global.d.ts      # External library types
├── __tests__/           # Jest tests
├── images/              # Exercise images
├── dist/                # Build output (generated)
├── index.html           # Main page
├── style.css            # Design system
├── sw.js                # Service Worker
├── manifest.json        # PWA config
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies & scripts
```

### 🔧 Commands

```bash
npm install          # Install dependencies
npm run build        # Build the project
npm test             # Run tests
npm run lint         # Lint code
npm run lint:fix     # Auto-fix lint issues
npm run format       # Prettier formatting
```

---

### 📝 Ліцензія / License

MIT License. Дивіться [LICENSE](./LICENSE) для деталей / See [LICENSE](./LICENSE) for details.

---

💪 **Тренуйтеся розумніше, а не важче! / Train smarter, not harder!**
