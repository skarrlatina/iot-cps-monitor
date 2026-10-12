# Модуль 2. Фронтенд (Next.js + Tailwind + Recharts + SSE)

Клиент для мониторинга температуры IoT-датчиков. Код в папке `frontend/`.

---

## Стек

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Recharts (`LineChart`)
- Native `EventSource` для SSE

---

## Структура

```
frontend/
├── app/
│   ├── layout.tsx           # корневой layout + Navbar
│   ├── page.tsx             # Home /
│   ├── globals.css
│   ├── dashboard-temp/
│   │   └── page.tsx         # график + polling + SSE-алерты
│   └── login/
│       └── page.tsx         # демо-форма (disabled)
├── components/
│   └── Navbar.tsx           # Home | Temperature | Login
├── lib/types.ts
└── .env.local               # NEXT_PUBLIC_API_URL
```

---

## Как работает дашборд

1. Каждые 5 с: `fetch(`${NEXT_PUBLIC_API_URL}/temperature-sensors`)`.
2. Данные (до 50) идут в Recharts `LineChart` и в таблицу.
3. Параллельно открывается `EventSource(.../temperature-sensors/alerts)`.
4. При критическом событии (`value <= -10` на бекенде) показывается красный блок с пульсацией.

Порты по умолчанию:

| Сервис | Порт |
|--------|------|
| NestJS backend | 3000 |
| Next.js frontend | 3001 |

---

## Запуск

Два отдельных проекта. Бекенд и фронт запускаются из разных папок.

```bash
# 0) PostgreSQL должен быть запущен, БД iot_monitoring создана
#    (параметры в корневом .env)

# терминал 1 — бекенд (КОРЕНЬ репо, не frontend)
npm install
npm run start:dev
# жди: Application is running on: http://localhost:3000

# терминал 2 — фронт
cd frontend
npm install
npm run dev
# жди: Local: http://localhost:3001
```

Открыть: http://localhost:3001/dashboard-temp

`.env.local` во `frontend/`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Частые ошибки

| Симптом | Причина | Что делать |
|---------|---------|------------|
| `Cannot use JSX` / `Cannot find module '@/lib/types'` при `npm run start:dev` в корне | Nest компилировал `frontend/` | Уже пофикшено: в корневом `tsconfig` есть `include: ["src/**/*"]` и exclude `frontend` |
| `ECONNREFUSED 5432` / TypeORM connection | PostgreSQL не запущен или неверный `.env` | Подними Postgres, проверь `DB_*` |
| Фронт: `Не вдалося завантажити дані` | Бекенд не на :3000 | Сначала запусти Nest |
| Порт 3000 занят | И бекенд, и Next на одном порту | Фронт специально на **3001** |
