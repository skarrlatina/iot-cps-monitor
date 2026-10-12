#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <DHT.h>

// --- Hardware ---
#define DHT_PIN 15
#define DHT_TYPE DHT22

// --- Wi-Fi (Wokwi guest network, no password) ---
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// --- Backend API ---
// Render: https://YOUR-APP.onrender.com/temperature-sensors
// Local via Wokwi usually needs a public URL (Render / ngrok), not localhost
const char* SERVER_URL =
    "https://YOUR-APP.onrender.com/temperature-sensors";

DHT dht(DHT_PIN, DHT_TYPE);

void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
}

void sendToServer(String sensorName, float value, String unit) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skip POST");
    return;
  }

  // JSON body expected by NestJS CreateTemperatureSensorDto
  JsonDocument doc;
  doc["sensorName"] = sensorName;
  doc["value"] = value;
  doc["unit"] = unit;

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  WiFiClientSecure client;
  // Wokwi / lab: skip certificate verification for Render HTTPS
  client.setInsecure();

  if (!http.begin(client, SERVER_URL)) {
    Serial.println("HTTP begin failed");
    return;
  }

  http.addHeader("Content-Type", "application/json");

  Serial.print("POST ");
  Serial.println(SERVER_URL);
  Serial.print("Body: ");
  Serial.println(payload);

  int statusCode = http.POST(payload);
  Serial.print("HTTP status: ");
  Serial.println(statusCode);

  if (statusCode > 0) {
    Serial.println(http.getString());
  } else {
    Serial.printf("POST failed: %s\n", http.errorToString(statusCode).c_str());
  }

  http.end();
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println();
  Serial.println("ESP32 + DHT22 -> NestJS temperature API");

  dht.begin();
  connectWiFi();
}

void loop() {
  float temperature = dht.readTemperature();  // Celsius

  if (isnan(temperature)) {
    Serial.println("Failed to read temperature from DHT22");
  } else {
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" C");
    sendToServer("Temp", temperature, "C");
  }

  delay(1000);
}
