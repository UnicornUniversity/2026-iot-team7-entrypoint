# Attendance System API Specification (v1)

This document defines the REST API for the Attendance System, covering communication between hardware Gateways and the NestJS Backend, as well as the Web Management interface.

## Base URL
`http://<server-ip>:<port>/api/v1`

## Authentication

### 1. Gateway Authentication
Hardware endpoints require a valid `gateway_key` in the JSON request body.
- Verified against the `Devices` table.
- Handled by `GatewayGuard`.

### 2. User Authentication
Management endpoints require a **JWT Bearer Token** in the `Authorization` header.
- Obtained via the `/auth/login` endpoint.
- Handled by `JwtAuthGuard` and `RolesGuard`.

---

## Endpoints

### I. System & Auth

#### 1. Server Health Check
**Method:** `GET`  
**Path:** `/health` (Note: Global prefix excluded for this endpoint)  
**Description:** Simple heartbeat used by gateways to update LCD status.  
**Auth:** None

**Success Response (200 OK):**
```json
{ "status": "OK" }
```

#### 2. User Login
**Method:** `POST`  
**Path:** `/auth/login`  
**Description:** Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "username": "<string>",
  "password": "<string>"
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "<string>"
}
```

---

#### 1. Register Attendance Scan
**Method:** `POST`  
**Path:** `/attendance`  
**Description:** Real-time scan data from gateways.  
**Auth:** Gateway Key

**Request Body:**
```json
{
  "gateway_key": "<string>",
  "uid": "<string>",
  "event": "arrival | departure | auto",
  "timestamp": "<ISO8601 string>"
}
```

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "event": "arrival | departure",
  "firstName": "<string>",
  "lastName": "<string>"
}
```

#### 2. Batch Attendance Upload
**Method:** `POST`  
**Path:** `/attendance/batch`  
**Description:** Syncs offline queued data.  
**Auth:** Gateway Key

**Request Body:**
```json
{
  "gateway_key": "<string>",
  "events": [
    {
      "uid": "<string>",
      "event": "arrival | departure",
      "timestamp": "<ISO8601 string>"
    }
  ]
}
```

**Success Response (200 OK):**
```json
{
  "status": "OK",
  "processed": <number>
}
```

---

### III. Management Interface (Web)

#### 1. User Management
**Path:** `/users`  
**Roles:** `admin` (CRUD), `user` (Self-Password change)

- `GET /users`: List users (paginated: `limit`, `offset`).
- `POST /users`: Create user.
- `GET /users/:id`: Get user details.
- `GET /users/card/:cardID`: Lookup user by RFID.
- `PATCH /users/:id`: Update user profile.
- `DELETE /users/:id`: Soft-delete user.
- `PATCH /users/me/password`: Change own password (requires `currentPassword`, `newPassword`).

#### 2. Device Management
**Path:** `/devices`  
**Roles:** `admin`

- `GET /devices`: List hardware gateways (paginated).
- `POST /devices`: Register device (auto-generates `key`).
- `GET /devices/:id`: Get device details.
- `PATCH /devices/:id`: Update device.
- `DELETE /devices/:id`: Unregister device.

#### 3. Attendance Records (Human View)
**Path:** `/records`  
**Roles:** `admin` (All), `user` (Self-only)

- `GET /records`: Filtered list of all scans (paginated).
  - Params: `limit`, `offset`, `userId`, `dateFrom`, `dateTo`, `type`.
- `GET /records/my`: Filtered list of current user's scans.
- `POST /records`: Manual record entry (Admin).
- `PATCH /records/:id`: Correct existing record.
- `DELETE /records/:id`: Soft-delete record.
