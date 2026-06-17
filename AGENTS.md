# GymProgress — AGENTS.md

## Контекст проекту / Project Context

GymProgress — PWA для тренувань. TypeScript + Vite. Білд ~74ms.

## Команди / Commands

| Команда | Опис |
|---------|------|
| `npm run dev` | Vite dev server з HMR |
| `npm start` | Vite dev server |
| `npm run build` | Vite build + SW кеш |
| `npm run preview` | Serve dist/ |
| `npm run clean` | Очищення dist/ |
| `npm test` | Jest (63 тести) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npx cypress run` | E2E (19 тестів) |

## Архітектура

- `src/` — TS код, бандлиться Vite
- `dist/` — збірка (Vite)
- `src/plates.ts` — калькулятор млинців
- `src/renderers/` — renderers/heatmap.ts
- `src/locales/` — i18n (525 ключів)
- `src/i18n.ts` — `t('key')`
- Vite plugin копіює sw.js, manifest.json, style.css, images/

## Important

- Build: `npm run build`
- Dev: `npm start` (Vite HMR)
- Tests: `npm test` (Jest 63) + `npx cypress run` (E2E 19)
- Синтаксис i18n: `t('toast.saved')`, HTML: `data-i18n="nav.exercises"`
- Для нової мови: створити `src/locales/{lang}.ts`, додати `loadLocale()` в main.ts
- `generate-sw-cache.js` — SW precache з dist/
