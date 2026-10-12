# GitHub → Render / Vercel

## Что в репо (монорепо)

| Путь | Деплой |
|------|--------|
| корень (`src/`, NestJS) | **Render** (Web Service + PostgreSQL) |
| `frontend/` | **Vercel** (Root Directory = `frontend`) |
| `esp32/` | только для Wokwi, на сервер не едет |

Секреты только в Environment Variables панели хостинга, не в git.

---

## Render (бекенд)

**Build:** `npm install && npm run build`  
**Start:** `npm run start:prod`

Env vars:

```
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_NAME=...
```

`PORT` Render выставляет сам.

---

## Vercel (фронт)

- Root Directory: `frontend`
- Build: `npm run build` / Output: Next default
- Env: `NEXT_PUBLIC_API_URL=https://YOUR-API.onrender.com`
