# 💪 GymProgress — Трекер тренувань / Workout Tracker

[![PWA](https://img.shields.io/badge/PWA-Ready-red.svg)](https://ajjs1ajjs.github.io/gym-tracker/)
[![Version](https://img.shields.io/badge/version-3.0.0--premium-gold.svg)](https://github.com/ajjs1ajjs/gym-tracker/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Приватний, безкоштовний PWA для відстеження тренувань. Без підписок, без реклами,
100% serverless — усі дані залишаються у вашому браузері.

> A private, free, serverless PWA for tracking workouts. No subscriptions, no ads —
> all data stays in your browser.

---

## 🌟 Можливості / Features

| | |
|---|---|
| 🇺🇦 | 🇬🇧 |
| Детальне логування: вага, повтори, авто-1RM | Detailed logging: weight, reps, auto 1RM |
| Графіки прогресії (Chart.js) | Progression charts (Chart.js) |
| Smart Timer — авто-таймер відпочинку | Smart Timer — auto rest timer |
| Wake Lock — екран не гасне | Wake Lock — screen stays on |
| Трекер ваги тіла | Body weight tracker |
| Калькулятор млинців / 1RM | Plate / 1RM calculator |
| Калькулятор калорій та БЖУ (Mifflin-St Jeor) | Calorie & macro calculator |
| Трекер води | Water tracker |
| Heatmap активності у стилі GitHub | GitHub-style activity heatmap |
| Плани тренувань | Custom workout plans |
| Cloud Sync через GitHub Gist | Cloud Sync via GitHub Gist |
| AES-256-GCM шифрування | AES-256-GCM encryption |
| Експорт JSON / CSV / Apple Health | Export JSON / CSV / Apple Health |
| 100% офлайн | 100% offline |
| Темна / світла теми | Dark / light themes |

---

## 📁 Структура / Project Structure

```
gym-tracker/
├── src/
│   ├── main.ts              # Вхідна точка, event delegation / entry point
│   ├── exercises.ts         # Бібліотека вправ (дані) / exercise library
│   ├── data.ts              # Стан, localStorage, шифрування / state & storage
│   ├── ui.ts                # Рендеринг та UI-логіка / rendering & UI
│   ├── sync.ts              # GitHub Gist синхронізація, експорт / sync & export
│   ├── stats.ts             # Вага тіла, вода, калорії / body, water, calories
│   ├── logbook.ts           # Журнал тренувань / workout logbook
│   ├── timer.ts             # Таймер відпочинку / rest timer
│   ├── plates.ts            # Калькулятор млинців і 1RM / plate & 1RM calc
│   ├── utils.ts             # Допоміжні функції, крипто / helpers & crypto
│   ├── i18n.ts              # Локалізація / i18n engine
│   ├── types.ts             # Спільні типи / shared types
│   ├── global.d.ts          # Типи зовнішніх бібліотек / external lib types
│   ├── locales/uk.ts        # Переклади (525 ключів) / translations
│   └── renderers/heatmap.ts # Рендер heatmap / heatmap renderer
├── __tests__/               # Jest (63 тести)
├── cypress/                 # E2E (19 тестів)
├── images/                  # Зображення вправ / exercise images
├── index.html               # Головна сторінка / main page
├── style.css                # Дизайн-система / design system
├── sw.js                    # Service Worker
└── manifest.json            # PWA конфігурація / config
```

---

## 🔧 Команди / Commands

```bash
npm install          # Встановити залежності / install deps
npm start            # Vite dev server (HMR)
npm run build        # Зібрати проект + SW кеш / build + SW cache
npm run preview      # Перегляд dist/ / serve dist/
npm test             # Jest тести
npm run lint         # ESLint
npm run format       # Prettier
npx cypress run      # E2E тести / E2E tests
```

---

## 📝 Ліцензія / License

MIT — див. [LICENSE](LICENSE) / see [LICENSE](LICENSE).

💪 **Тренуйтеся розумніше, а не важче! / Train smarter, not harder!**
