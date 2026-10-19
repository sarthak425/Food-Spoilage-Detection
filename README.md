# Spoil AI — Food Intelligence Control System

> **Academic AI-Based Multi-Model Food Spoilage Detection Platform (Images + Sensor Data)**  
> **Phase 1 (Foundation & Auth) & Phase 2 (Sensor Ingestion & Real-Time Monitoring) Complete**

---

## 1. Project Overview

**Spoil AI** is a real-time food quality and spoilage monitoring platform combining:
- **Environmental Sensor Telemetry**: Temperature (°C), Relative Humidity (%), Volatile Organic Gases (MQ135 VOC/ADC), Food Weight (HX711 g), and Ambient Light (Lux).
- **Virtual Sensor Simulator**: Reproduces realistic chamber conditions without physical hardware (Normal storage, Warming conditions, High humidity, Spoilage surge).
- **Spring Boot 3.3 Backend**: Ingestion pipeline, JWT authentication, threshold alerts, actuator state automation, and STOMP WebSocket broadcasting.
- **MySQL 8.0 Database**: Persistent storage for telemetry time-series, alerts, device records, and food batch metadata.
- **React + TypeScript + Vite Dashboard**: High-resolution dark navy dashboard with Recharts live trends, gauge meters, virtual actuator controls, and alert stream.
- **Hardware Extensibility**: ESP32 REST API ingestion ready for plug-and-play physical sensors without application redesign.

---

## 2. Monorepo Structure

```text
spoil-ai/
├── frontend/                     # React 18, TypeScript, Vite, Tailwind CSS, Recharts
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, Glassmorphic UI components
│   │   ├── contexts/             # AuthContext, WebSocketContext (STOMP/SockJS)
│   │   ├── pages/                # Dashboard, LiveSensors, SensorSimulator, Samples, Actuators, Alerts, Devices
│   │   ├── services/             # Axios API client
│   │   └── types/                # TypeScript interface definitions
│   └── package.json
│
├── backend/                      # Java 21/25, Spring Boot 3.3.4, Spring Security, JPA, STOMP
│   ├── src/main/java/com/spoilai/
│   │   ├── config/               # SecurityConfig, WebSocketConfig, DataInitializer
│   │   ├── controller/           # Auth, Devices, Sensors, Simulator, Samples, Actuators, Dashboard
│   │   ├── dto/                  # Request/Response payloads
│   │   ├── entity/               # User, Device, FoodSample, SensorReading, Alert, ActuatorEvent
│   │   ├── repository/           # Spring Data JPA Repositories
│   │   ├── security/             # JWT utils, AuthTokenFilter, UserDetails
│   │   ├── service/              # SensorService, SimulatorService, AlertService, ActuatorService
│   │   └── websocket/            # WebSocketSensorPublisher
│   ├── src/main/resources/       # application.yml, application-dev.yml
│   └── pom.xml
│
├── ai-service/                   # Python 3.12, FastAPI, YOLOv8 & PyTorch architecture
│   ├── app/
│   │   └── main.py               # /health, /models/status, /predict/image, /predict/sensor, /predict/fusion
│   ├── requirements.txt
│   └── Dockerfile
│
├── simulator/                    # Standalone virtual ESP32 hardware simulator
│   └── simulate_esp32.py
│
├── database/                     # Database schema and seed data
│   ├── schema.sql
│   └── seed.sql
│
├── docker-compose.yml
├── .env.example
├── .env
└── README.md
```

---

## 3. Quick Start — Running Locally

### Prerequisites
- **Java 21+** (JDK 21 or 25 installed)
- **Node.js** (v18+ or v24 installed)
- **MySQL 8.0** (running locally on port 3306) or Docker

---

### Step 1: Configure Database

1. Open your MySQL client / MySQL Workbench and execute `database/schema.sql` and `database/seed.sql`:
   ```sql
   source d:/mca/project/spoil-ai/database/schema.sql;
   source d:/mca/project/spoil-ai/database/seed.sql;
   ```
2. In `spoil-ai/.env`, ensure `DB_PASSWORD` matches your local MySQL root password.

> **Zero-Config Dev Fallback**:  
> To test without configuring MySQL right away, you can run Spring Boot with the included `dev` profile:  
> `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` (uses in-memory H2 MySQL mode with auto-seeding).

---

### Step 2: Start Spring Boot Backend

```powershell
cd d:\mca\project\spoil-ai\backend
.\mvnw.cmd spring-boot:run
```
- **Backend API**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **STOMP WebSocket**: `ws://localhost:8080/ws-sensor`

---

### Step 3: Start React Frontend

In a second terminal:
```powershell
cd d:\mca\project\spoil-ai\frontend
npm run dev
```
- **Frontend Dashboard**: `http://localhost:5173`

---

### Step 4: Access the Dashboard

1. Navigate to **`http://localhost:5173`** in your browser.
2. Sign in with the seeded credentials:
   - **Username**: `admin`
   - **Password**: `admin123`  
   *(or `researcher` / `user123`)*
3. Go to **Virtual Simulator** in the sidebar:
   - Click **`START SIMULATION`**.
   - Watch the live telemetry streaming on the dashboard with real-time Recharts updates!
   - Toggle scenarios: **Normal storage**, **Warming conditions**, **High temperature and humidity**, or **Severe spoilage surge**.

---

## 4. Testing APIs via cURL / PowerShell

### User Authentication
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Ingest Sensor Reading (ESP32 REST format)
```bash
curl -X POST http://localhost:8080/api/sensors/readings \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32_STATION_ALPHA",
    "foodSampleId": 1,
    "source": "REAL_ESP32",
    "temperatureC": 26.5,
    "humidityPercent": 62.0,
    "gas": {
      "sensor": "MQ135",
      "value": 345,
      "unit": "RAW_ADC",
      "calibrated": false
    },
    "weightGrams": 498.0,
    "lightLux": 115
  }'
```

### Start Virtual Simulator
```bash
curl -X POST http://localhost:8080/api/simulator/start \
  -H "Content-Type: application/json" \
  -d '{"scenario": "WARMING", "intervalMs": 3000, "foodSampleId": 1}'
```

### Switch Simulation Scenario
```bash
curl -X POST http://localhost:8080/api/simulator/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario": "SPOILAGE_PRONE"}'
```

### Retrieve Real-Time Summary
```bash
curl http://localhost:8080/api/dashboard/summary
```

---

## 5. Standalone ESP32 Hardware Simulator Script

You can also run the Python simulator from the terminal:
```powershell
cd d:\mca\project\spoil-ai\simulator
python simulate_esp32.py --url http://localhost:8080 --scenario WARMING --interval 3.0
```

---

## 6. Running with Docker Compose

To run MySQL, Spring Boot backend, FastAPI AI service, and React frontend with a single command:
```powershell
cd d:\mca\project\spoil-ai
docker compose up --build -d
```
All containers will auto-configure and link together.
