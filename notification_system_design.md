# Notification System Design

## Overview

This document describes the design of the notification system, including the backend service (`notification_app_be`) and frontend application (`notification_app_fe`), along with the logging middleware.

---

## Architecture

```
notification_app_fe  <-->  notification_app_be  <-->  Database
                               |
                         logging_middleware
```

---

## Components

### 1. `logging_middleware`
Middleware responsible for logging all incoming requests and outgoing responses. Used for debugging, monitoring, and auditing notification events.

### 2. `notification_app_be`
Backend service that:
- Handles notification creation, retrieval, and deletion
- Manages subscriptions and channels
- Connects to a message broker (e.g., Redis, RabbitMQ)
- Exposes a REST/WebSocket API

### 3. `notification_app_fe`
Frontend application that:
- Displays real-time notifications to the user
- Manages notification preferences
- Connects to the backend via REST/WebSocket

---

## API Design (Draft)

### Endpoints

| Method | Endpoint                    | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | `/api/notifications`        | Fetch all notifications         |
| POST   | `/api/notifications`        | Create a new notification       |
| DELETE | `/api/notifications/:id`    | Delete a notification by ID     |
| PATCH  | `/api/notifications/:id`    | Mark notification as read       |

---

## Data Model

```json
{
  "id": "string",
  "title": "string",
  "message": "string",
  "type": "info | warning | error | success",
  "read": false,
  "createdAt": "ISO 8601 timestamp",
  "userId": "string"
}
```

---

## Tech Stack (Planned)

| Layer       | Technology          |
|-------------|---------------------|
| Frontend    | React / TypeScript  |
| Backend     | Node.js / Express   |
| Database    | PostgreSQL / MongoDB|
| Middleware  | Custom logging      |
| Broker      | Redis / RabbitMQ    |

---

## Notes

- Add authentication (JWT) to all protected endpoints.
- Use `.env` files for environment-specific configuration.
- See `.gitignore` for files excluded from version control.

---

## Stage 1

### Priority Inbox Implementation

#### Approach
To address the issue of users losing track of important notifications, we implemented a Priority Inbox. This system ranks incoming notifications based on a combination of predefined category weights and recency.

#### Scoring Algorithm
1. **Weight**: Each notification type is assigned a base weight:
   - `Placement`: 3 points
   - `Result`: 2 points
   - `Event`: 1 point
2. **Recency**: A normalized recency score is calculated on a 0.0 to 1.0 scale, where the newest notification in the current batch gets 1.0 and the oldest gets 0.0.
3. **Total Score**: `Total Score = Weight + Recency Score`.

#### Efficiency
To maintain the top `n` (e.g., 10) notifications efficiently as new ones stream in, the implementation utilizes a **min-heap** (priority queue) of size `n`. 
- Processing a single new notification takes `O(log n)` time.
- This approach ensures low memory footprint and high throughput, making it scalable for high-volume notification streams without requiring full database sorts or queries for every incoming event.

