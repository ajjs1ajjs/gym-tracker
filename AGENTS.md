# GymProgress — AGENTS.md

## Контекст проекту / Project Context

GymProgress — це PWA для відстежування тренувань на чистому TypeScript без фреймворків.

## Команди / Commands

| Команда | Опис |
|---------|------|
| `npm run build` | TypeScript компіляція + копіювання асетів + фікс шляхів |
| `npm run clean` | Очищення dist/ |
| `npm run rebuild` | clean + build |
| `npm test` | Запуск Jest тестів |
| `npm run lint` | ESLint перевірка |
| `npm run lint:fix` | Автоматичне виправлення |
| `npm run format` | Prettier форматування |

## Архітектура / Architecture

- `src/` — TypeScript вихідний код
- `dist/` — збірка (генерується)
- JS файли після збірки: `dist/js/*.js`
- Service Worker шукає кеш за шляхом `./js/` (відносно `dist/sw.js`)
- Індекси вправ — числові (`number`), кастомні — `Date.now()` або `"lb_" + Date.now()`

## Важливо / Important

- `decryptLocalData` має присвоювати дані в модульні змінні після дешифрування
- Після змін у `src/` завжди запускати `npm run build` для оновлення `dist/`
- Тести пишуться на JavaScript у `__tests__/`
