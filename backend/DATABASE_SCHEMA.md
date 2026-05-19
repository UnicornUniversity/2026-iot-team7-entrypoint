# Attendance System Database Schema

This document describes the PostgreSQL data model used by the NestJS backend and TypeORM.

## Entities

### 1. User (`users`)
Stores employee and administrator information. Supports soft-deletion and audit tracking.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `username` | string | Unique, Not Null | Login name. |
| `hashedPassword` | string | Not Null | Bcrypt hashed password (hidden from standard select). |
| `firstName` | string | Not Null | User's first name. |
| `lastName` | string | Not Null | User's last name. |
| `isActive` | boolean | Default: `true` | Account status. |
| `role` | enum | `admin`, `user` | System permissions. |
| `cardID` | string | Nullable, Indexed | Unique RFID/NFC tag UID. |
| `createdAt` | timestamp | Not Null | Auto-set on creation. |
| `updatedAt` | timestamp | Not Null | Updated on every change. |
| `deletedAt` | timestamp | Nullable | Soft-delete flag. |
| `updatedBy` | ManyToOne | -> `User` | User who last modified/deleted this profile. |

---

### 2. Device (`devices`)
Registers hardware gateways (Raspberry Pi terminals).

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `name` | string | Not Null | Human-readable name (e.g., "Main Entrance"). |
| `location` | string | Not Null | Physical location (e.g., "Building A"). |
| `description` | string | Nullable | Additional notes. |
| `key` | string | Unique, Not Null | Secure random key for gateway authentication. |

---

### 3. Attendance (`attendance`)
Records every interaction with the terminals, including manual entries and offline syncs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `user` | ManyToOne | -> `User` (Nullable) | Associated user. Null if card is unknown. |
| `cardID` | string | Nullable | The raw card UID used for the scan. |
| `device` | ManyToOne | -> `Device` (Nullable) | Gateway used. Null for manual entries. |
| `type` | enum | `arrival`, `departure` | Direction of the event. |
| `state` | enum | `online`, `offline`, `manual` | Source: Real-time, Sync, or UI Correction. |
| `timestamp` | timestamp | Not Null | Actual time of the event. |
| `updatedBy` | ManyToOne | -> `User` (Nullable) | Admin who modified/deleted this record. |
| `updatedAt` | timestamp | Not Null | Auto-set timestamp. |
| `deletedAt` | timestamp | Nullable | Soft-delete flag. |

## Relationships

- **User 1:N Attendance**: One user can have many attendance records.
- **Device 1:N Attendance**: One gateway can generate many attendance records.
- **User M:1 User (`updatedBy`)**: Both `User` and `Attendance` entities track who performed the last administrative action.

## Design Decisions
- **Soft Deletion**: Records are never truly removed from the database to maintain audit trails and data integrity.
- **Card-to-User Mapping**: Attendance stores both a `user` relation and a raw `cardID`. This allows the system to show history for deleted users or track unauthorized attempts from unknown cards.
- **Timezone Awareness**: All timestamps are stored in UTC and converted to local time in the application layer.
