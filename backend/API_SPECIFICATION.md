# Attendance System API Specification (v1)

This document defines the communication protocol between the Raspberry Pi Gateways and the Node.js Backend Server.

## Base URL
`http://<server-ip>:<port>`

## Authentication
All write operations require a `gateway_key` in the request body. This key must match a registered gateway in the server's database.

---

## Endpoints

### 1. Server Health Check
**Method:** `GET`  
**Path:** `/health`  
**Description:** Simple heartbeat used by the gateway to update the LCD `SRV:ON/OFF` status.

**Success Response (200 OK):**
```json
{ "status": "OK" }
```

---

### 2. Register Attendance Scan
**Method:** `POST`  
**Path:** `/api/v1/attendance`  
**Description:** Used by gateways to send real-time scan data when online.

**Request Body:**
```json
{
  "gateway_key": "string",
  "uid": "string",
  "event": "arrival | departure | auto",
  "timestamp": "ISO8601 string"
}
```

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "event": "arrival | departure",
  "firstName": "string",
  "lastName": "string"
}
```

**Error Response (401 Unauthorized):**
```json
{ "status": "DENIED", "message": "Unauthorized Gateway" }
```

---

### 3. Batch Attendance Upload
**Method:** `POST`  
**Path:** `/api/v1/attendance/batch`  
**Description:** Used to sync data queued in the local SQLite database after a network outage.

**Request Body:**
```json
{
  "gateway_key": "string",
  "events": [
    {
      "uid": "string",
      "event": "arrival | departure",
      "timestamp": "ISO8601 string"
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "processed": number
}
```

---

### 4. Fetch Attendance Logs
**Method:** `GET`  
**Path:** `/api/v1/logs`  
**Description:** Returns a history of all recorded attendance events.

**Success Response (200 OK):**
```json
[
  {
    "uid": "string",
    "firstName": "string",
    "lastName": "string",
    "type": "arrival | departure",
    "time": "ISO8601 string",
    "gateway": "string",
    "synced_offline": "boolean (optional)"
  }
]
```
