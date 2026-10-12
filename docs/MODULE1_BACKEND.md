# Модуль 1. Бекенд (NestJS + PostgreSQL + SSE)

Документация к IoT-мониторингу температуры киберфизических устройств.

---

## 1. Что это вообще

Бекенд принимает показания датчиков температуры, кладёт их в PostgreSQL и при критическом холоде (`value <= -10`) шлёт алерт клиентам через **Server-Sent Events (SSE)** — односторонний поток с сервера в браузер/фронт без WebSocket.

Стек:

| Часть | Технология |
|--------|------------|
| API | NestJS (TypeScript, strict) |
| БД | PostgreSQL + TypeORM |
| Валидация | class-validator + class-transformer |
| Конфиг | ConfigModule + `.env` |
| Алерты | RxJS `Subject` → `@Sse('alerts')` |

---

## 2. Структура проекта

```
src/
├── main.ts                              # старт, CORS, ValidationPipe
├── app.module.ts                        # Config + TypeORM + модуль датчиков
└── temperature-sensors/
    ├── entities/
    │   └── temperature-sensor.entity.ts # таблица temperature-sensors
    ├── dto/
    │   └── create-temperature-sensor.dto.ts
    ├── temperature-alerts.service.ts    # Subject + проверка порога
    ├── temperature-sensors.service.ts   # create / findLatest
    ├── temperature-sensors.controller.ts# POST, GET, SSE
    └── temperature-sensors.module.ts
```

---

## 3. Как данные текут (жизненный цикл запроса)

```
Клиент (POST JSON)
        │
        ▼
Controller  ──► ValidationPipe (DTO)
        │
        ▼
TemperatureSensorsService.create()
        │
        ├──► TypeORM save() → PostgreSQL
        │
        └──► TemperatureAlertsService.checkAndEmitAlert()
                    │
                    └── value <= -10 ?
                              │ да
                              ▼
                     Subject.next(MessageEvent)
                              │
                              ▼
              SSE-клиенты на GET /temperature-sensors/alerts
```

Обычный `GET /temperature-sensors` БД читает и отдаёт JSON. SSE — отдельный долгий HTTP-канал: клиент слушает, сервер пушит, когда появился критический замер.

---

## 4. Сущность `TemperatureSensor`

Таблица: `temperature-sensors`

| Поле | Тип | Смысл |
|------|-----|--------|
| `id` | UUID (PK) | первичный ключ |
| `sensorName` | varchar(200) | имя/идентификатор датчика |
| `value` | double precision | температура |
| `unit` | varchar(20) | единица (`C`, `F`, …) |
| `timestamp` | timestamptz, default NOW() | время замера (можно передать с клиента) |
| `createdAt` | timestamptz (CreateDateColumn) | когда запись появилась в БД |

`createdAt` используется для сортировки «последние 50».

---

## 5. DTO и валидация

`CreateTemperatureSensorDto`:

- `sensorName` — `@IsString`, `@IsNotEmpty`
- `value` — `@IsNumber`, `@IsNotEmpty`
- `unit` — `@IsString`, `@IsNotEmpty`
- `timestamp` — `@IsOptional` (если нет — сработает default в БД)

В `main.ts` глобально висит `ValidationPipe` с `whitelist` / `forbidNonWhitelisted` / `transform`: лишние поля режутся, кривой JSON → 400.

Пример тела:

```json
{
  "sensorName": "sensor-fridge-01",
  "value": -15.5,
  "unit": "C"
}
```

---

## 6. Подключение к PostgreSQL

В `app.module.ts` — `TypeOrmModule.forRootAsync` + `ConfigService`.

Переменные в `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=iot_monitoring
PORT=3000
```

SSL:

- `localhost` / `127.0.0.1` → без SSL (локальная БД);
- иначе (Render и т.п.) → `ssl: { rejectUnauthorized: false }`.

`synchronize: true` — схема подтягивается из entity (для учёбы ок; в проде обычно миграции).

---

## 7. API

Базовый URL: `http://localhost:3000`

### `POST /temperature-sensors`

Создаёт запись, при `value <= -10` эмитит SSE-алерт.

**Ответ:** сохранённая сущность (с `id`, `createdAt`, …).

### `GET /temperature-sensors`

Последние **50** записей, `ORDER BY createdAt DESC`.

### `GET /temperature-sensors/alerts` (SSE)

Долгоживущий поток `text/event-stream`. Пока клиент подключён, при каждом критическом `POST` прилетает событие вида:

```json
{
  "type": "critical_temperature",
  "message": "Critical temperature detected on sensor \"...\"",
  "sensorId": "...",
  "sensorName": "...",
  "value": -15,
  "unit": "C",
  "timestamp": "...",
  "createdAt": "..."
}
```

Порог зашит в `TemperatureAlertsService`: `CRITICAL_TEMPERATURE = -10`.

---

## 8. Как работает SSE (коротко и по делу)

1. В сервисе алертов живёт один `Subject<MessageEvent>`.
2. `@Sse('alerts')` отдаёт `subject.asObservable()` — Nest сам держит соединение.
3. После `save()` вызывается `checkAndEmitAlert(saved)`.
4. Если условие выполнено → `subject.next({ data: {...} })`.
5. Все открытые SSE-клиенты получают это событие.

Это **не** опрос каждые N секунд: сервер пушит только когда есть критический замер.  
Важно: `Subject` в памяти процесса — после рестарта сервера старые подписчики отвалятся, историю алертов он не хранит (только живой поток).

Подписка из браузера:

```js
const es = new EventSource('http://localhost:3000/temperature-sensors/alerts');
es.onmessage = (e) => console.log(JSON.parse(e.data));
```

Или curl:

```bash
curl -N http://localhost:3000/temperature-sensors/alerts
```

---

## 9. CORS

В `main.ts`:

```ts
app.enableCors({
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

Чтобы внешний фронт (другой порт/домен) мог бить в API и открывать SSE.

---

## 10. Запуск

```bash
# 1) PostgreSQL (вариант через Docker)
docker compose up -d

# 2) бекенд из КОРНЯ репо (не из frontend/)
npm install
npm run start:dev
```

Если видишь `Unable to connect to the database` / `ECONNREFUSED` — Postgres не слушает `:5432`.  
Если видишь кучу `Cannot use JSX` из `frontend/` — ты на старом tsconfig; в корне должен быть `include: ["src/**/*"]`.

Проверка руками:

```bash
# обычная температура — алерта не будет
curl -X POST http://localhost:3000/temperature-sensors \
  -H "Content-Type: application/json" \
  -d "{\"sensorName\":\"s1\",\"value\":22,\"unit\":\"C\"}"

# критическая — алерт улетит в открытый SSE
curl -X POST http://localhost:3000/temperature-sensors \
  -H "Content-Type: application/json" \
  -d "{\"sensorName\":\"s1\",\"value\":-15,\"unit\":\"C\"}"

curl http://localhost:3000/temperature-sensors
```

---

## 11. Роли файлов (чтобы не путаться)

| Файл | Роль |
|------|------|
| `entity` | как выглядит строка в БД |
| `dto` | что разрешено принять снаружи |
| `temperature-sensors.service` | бизнес: сохранить + дернуть проверку алерта |
| `temperature-alerts.service` | только поток алертов (RxJS) |
| `controller` | HTTP: POST / GET / SSE |
| `module` | склеивает entity + services + controller |
| `app.module` | БД + env + импорт модуля датчиков |
| `main.ts` | listen, CORS, валидация |

---

*Модуль 1 — бекенд. Фронт подключается к REST и к `/temperature-sensors/alerts`.*
