# Модуль 3. Железо и IoT (Wokwi + ESP32 + C++)

Симуляция ESP32 + DHT22, отправка температуры на NestJS API.

Код: папка `esp32/`.

---

## Схема (Wokwi)

| Компонент | Подключение |
|-----------|-------------|
| ESP32 DevKit C v4 | MCU |
| DHT22 DATA/SDA | **GPIO 15** |
| DHT22 VCC | 3V3 |
| DHT22 GND | GND |

Файлы:

- `sketch.ino` — прошивка
- `diagram.json` — схема для Wokwi
- `libraries.txt` — DHT + ArduinoJson

---

## Логика прошивки

1. `setup()`: Serial `115200`, `dht.begin()`, Wi‑Fi `Wokwi-GUEST` (пароль пустой).
2. `loop()` раз в 1 с: `dht.readTemperature()` → если не `isnan` → `sendToServer("Temp", value, "C")`.
3. `sendToServer`: JSON через ArduinoJson, `HTTPClient` POST, `Content-Type: application/json`.
4. Для Render (HTTPS) используется `WiFiClientSecure` + `setInsecure()` (для лабы/симулятора).

Тело запроса совпадает с DTO бекенда:

```json
{ "sensorName": "Temp", "value": 24.5, "unit": "C" }
```

Эндпоинт: `POST /temperature-sensors`.

---

## Как запустить в Wokwi

1. Открой [wokwi.com](https://wokwi.com) → новый проект **ESP32**.
2. Скопируй содержимое `esp32/sketch.ino`, `diagram.json`, `libraries.txt`.
3. В `sketch.ino` замени `SERVER_URL` на свой Render URL, например:
   ```cpp
   const char* SERVER_URL =
       "https://YOUR-APP.onrender.com/temperature-sensors";
   ```
4. Start simulation → смотри Serial Monitor (`115200`).

`localhost` из Wokwi **недоступен**. Нужен публичный URL (Render / ngrok).

---

## Проверка

- На дашборде фронта (`/dashboard-temp`) должны появляться точки с `sensorName: Temp`.
- При температуре `<= -10` (крути слайдер DHT в Wokwi) — SSE-алерт.
