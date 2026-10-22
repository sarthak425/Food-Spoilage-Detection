"""
Spoil AI — Standalone Virtual ESP32 Sensor Simulator
Simulates real ESP32 hardware broadcasting environmental sensor measurements
(DHT22 Temperature & Humidity, MQ135 Gas Sensor, HX711 Weight, Light Lux)
via HTTP REST ingestion.
"""

import argparse
import datetime
import json
import random
import time
import urllib.request
import urllib.error

SCENARIOS = {
    "NORMAL": {
        "temp_base": 22.0,
        "humidity_base": 55.0,
        "gas_base": 310.0,
        "weight_base": 500.0,
        "light_base": 120.0,
        "temp_drift": 0.3,
        "gas_drift": 4.0,
    },
    "WARMING": {
        "temp_base": 29.0,
        "humidity_base": 68.0,
        "gas_base": 380.0,
        "weight_base": 485.0,
        "light_base": 140.0,
        "temp_drift": 0.6,
        "gas_drift": 7.0,
    },
    "HIGH_HUMIDITY": {
        "temp_base": 26.5,
        "humidity_base": 88.0,
        "gas_base": 420.0,
        "weight_base": 475.0,
        "light_base": 90.0,
        "temp_drift": 0.4,
        "gas_drift": 9.0,
    },
    "SPOILAGE_PRONE": {
        "temp_base": 34.0,
        "humidity_base": 92.0,
        "gas_base": 530.0,
        "weight_base": 440.0,
        "light_base": 180.0,
        "temp_drift": 0.8,
        "gas_drift": 15.0,
    }
}

def run_simulator(backend_url, device_id, device_key, food_sample_id, source, scenario_name, interval_sec, max_readings):
    scenario = SCENARIOS.get(scenario_name.upper(), SCENARIOS["NORMAL"])
    print(f"==================================================")
    print(f"[INFO] Spoil AI Hardware ESP32 & Sensor Node Ingestion")
    print(f"Target Endpoint : {backend_url}/api/sensors/readings")
    print(f"Device ID       : {device_id}")
    print(f"Telemetry Source: {source}")
    print(f"Food Sample ID  : {food_sample_id}")
    print(f"Scenario        : {scenario_name}")
    print(f"Interval        : {interval_sec}s")
    print(f"==================================================")

    temp = scenario["temp_base"]
    hum = scenario["humidity_base"]
    gas = scenario["gas_base"]
    weight = scenario["weight_base"]
    light = scenario["light_base"]

    count = 0
    endpoint = f"{backend_url.rstrip('/')}/api/sensors/readings"

    while max_readings is None or count < max_readings:
        # Subtle random fluctuations
        temp = round(temp + (random.random() - 0.48) * scenario["temp_drift"], 1)
        hum = round(min(99.0, max(20.0, hum + (random.random() - 0.48) * 0.7)), 1)
        gas = round(max(50.0, gas + (random.random() - 0.45) * scenario["gas_drift"]), 1)
        weight = round(max(10.0, weight - (random.random() * 0.05)), 1)
        light = round(max(0.0, light + (random.random() - 0.5) * 4.0), 1)

        payload = {
            "deviceId": device_id,
            "foodSampleId": food_sample_id,
            "source": source.upper(),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "temperatureC": temp,
            "humidityPercent": hum,
            "gas": {
                "sensor": "MQ135",
                "value": gas,
                "unit": "RAW_ADC",
                "calibrated": False
            },
            "weightGrams": weight,
            "lightLux": light
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "SpoilAI-ESP32-Firmware/2.4",
            "X-Device-Id": device_id,
            "X-Device-Key": device_key
        }
        req = urllib.request.Request(endpoint, data=data_bytes, headers=headers)

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                status = response.getcode()
                count += 1
                print(f"[{count:04d}] Authenticated telemetry sent ({device_id}): Temp={temp}°C | Humidity={hum}% | Gas={gas} ADC | W={weight}g -> HTTP {status}")
        except urllib.error.HTTPError as e:
            print(f"[AUTH ERROR] Ingestion rejected HTTP {e.code}: {e.reason}")
        except urllib.error.URLError as e:
            print(f"[WARN] Connection failed to {endpoint}: {e.reason}")
        except Exception as e:
            print(f"[ERROR] Failed: {e}")

        time.sleep(interval_sec)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Spoil AI Hardware ESP32 & Virtual Sensor Simulator")
    parser.add_argument("--url", default="http://localhost:8080", help="Spring Boot Backend URL")
    parser.add_argument("--device", default="ESP32_STATION_ALPHA", help="Device Identifier (e.g. ESP32_STATION_ALPHA or VIRTUAL_SENSOR_01)")
    parser.add_argument("--key", default=None, help="Device API Key (defaults to device pre-shared key)")
    parser.add_argument("--sample", type=int, default=1, help="Food Sample ID")
    parser.add_argument("--source", default="REAL", choices=["REAL", "SIMULATED"], help="Reading source indicator")
    parser.add_argument("--scenario", default="NORMAL", choices=["NORMAL", "WARMING", "HIGH_HUMIDITY", "SPOILAGE_PRONE"])
    parser.add_argument("--interval", type=float, default=3.0, help="Sampling interval in seconds")
    parser.add_argument("--count", type=int, default=None, help="Max readings to send (default: unlimited)")
    args = parser.parse_args()

    # Pre-shared keys initialized in DataInitializer
    default_keys = {
        "VIRTUAL_SENSOR_01": "virtual_node_secret_key",
        "ESP32_STATION_ALPHA": "esp32_secret_alpha_key"
    }
    key = args.key or default_keys.get(args.device, "esp32_secret_alpha_key")

    def run_wrapper():
        run_simulator(args.url, args.device, key, args.sample, args.source, args.scenario, args.interval, args.count)

    run_wrapper()
