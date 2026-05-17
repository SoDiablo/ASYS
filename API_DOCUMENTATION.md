# ASYS API Documentation

Complete API reference for the ASYS Smart Building Management System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "data": { ... }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| NO_TOKEN | 401 | No authentication token provided |
| TOKEN_INVALID | 403 | Invalid or expired token |
| INVALID_CREDENTIALS | 401 | Wrong email or password |
| ACCOUNT_LOCKED | 403 | Account locked due to failed attempts |
| ACCOUNT_INACTIVE | 403 | Account has been deactivated |
| INSUFFICIENT_PERMISSIONS | 403 | User role lacks required permissions |
| MISSING_REQUIRED_FIELD | 400 | Required field not provided |
| INVALID_FORMAT | 400 | Field format is incorrect |
| INVALID_VALUE | 400 | Field value outside allowed range |
| DUPLICATE_EMAIL | 400 | Email already exists |
| MAX_REQUESTS_EXCEEDED | 422 | Resident has 3 open requests |
| MAX_PARKING_EXCEEDED | 422 | Apartment has 2 parking spots |
| OUTSTANDING_DUES | 422 | Resident has overdue dues |
| RESERVATION_CONFLICT | 422 | Time slot already reserved |
| INVALID_TIME_RANGE | 422 | Reservation outside allowed hours |
| DAILY_LIMIT_EXCEEDED | 422 | Daily reservation limit reached |
| CANCELLATION_TOO_LATE | 422 | Less than 2 hours before reservation |
| RESOURCE_NOT_FOUND | 404 | Requested resource does not exist |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

---

## Authentication Endpoints

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "admin@asys.com",
  "password": "Admin123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid",
    "name": "System Administrator",
    "email": "admin@asys.com",
    "role": "admin",
    "phone": "+1234567890"
  }
}
```

### POST /auth/forgot-password
Request password reset link.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

### POST /auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### PATCH /auth/activate-user/:userId
Activate or deactivate user account (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "is_active": false
}
```

**Response:**
```json
{
  "message": "User status updated successfully"
}
```

---

## Dues Management Endpoints

### GET /dues/apartment/:apartmentId
Get dues for an apartment.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `status` (optional): Filter by status (pending/paid/overdue)

**Response:**
```json
{
  "dues": [
    {
      "due_id": "uuid",
      "apartment_id": "uuid",
      "due_date": "2026-04-05",
      "amount": 500.00,
      "penalty": 0.00,
      "status": "pending",
      "period_month": "2026-04-01",
      "block": "A",
      "floor": 1,
      "number": "101"
    }
  ]
}
```

### POST /dues/:dueId/pay
Pay dues.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "paid_amount": 500.00,
  "payment_method": "credit_card"
}
```

**Response:**
```json
{
  "payment_id": "uuid",
  "receipt_no": "RCP-1234567890-ABCD1234",
  "paid_at": "2026-03-30T10:30:00Z",
  "message": "Payment processed successfully"
}
```

### GET /dues/apartment/:apartmentId/payments
Get payment history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**
```json
{
  "payments": [
    {
      "payment_id": "uuid",
      "due_id": "uuid",
      "paid_amount": 500.00,
      "payment_method": "credit_card",
      "paid_at": "2026-03-30T10:30:00Z",
      "receipt_no": "RCP-1234567890-ABCD1234",
      "period_month": "2026-03-01",
      "due_amount": 500.00
    }
  ]
}
```

### GET /dues/all
Get all apartments with dues status (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status
- `overdue` (optional): Set to "true" to show only overdue

**Response:**
```json
{
  "apartments": [
    {
      "apartment_id": "uuid",
      "block": "A",
      "floor": 1,
      "number": "101",
      "resident_name": "John Doe",
      "due_id": "uuid",
      "amount": 500.00,
      "penalty": 10.00,
      "dues_status": "overdue",
      "due_date": "2026-03-05",
      "period_month": "2026-03-01"
    }
  ]
}
```

---

## Maintenance Endpoints

### POST /maintenance/requests
Create maintenance request.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "apartment_id": "uuid",
  "category": "electric",
  "priority": "high",
  "description": "Light fixture not working in living room",
  "photo_url": "/uploads/photo.jpg"
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "status": "pending",
  "created_at": "2026-03-30T10:30:00Z"
}
```

### GET /maintenance/requests
Get maintenance requests.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `apartment_id` (optional): Filter by apartment
- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**
```json
{
  "requests": [
    {
      "request_id": "uuid",
      "apartment_id": "uuid",
      "user_id": "uuid",
      "category": "electric",
      "priority": "high",
      "description": "Light fixture not working",
      "photo_url": "/uploads/photo.jpg",
      "status": "pending",
      "created_at": "2026-03-30T10:30:00Z",
      "resolved_at": null,
      "rating": null,
      "block": "A",
      "floor": 1,
      "number": "101",
      "requester_name": "John Doe"
    }
  ]
}
```

### PATCH /maintenance/requests/:requestId/status
Update request status (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "in_progress"
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "status": "in_progress",
  "resolved_at": null
}
```

### POST /maintenance/requests/:requestId/rating
Rate completed request.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "rating": 5
}
```

**Response:**
```json
{
  "request_id": "uuid",
  "rating": 5
}
```

---

## Announcement Endpoints

### POST /announcements
Create announcement (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Building Maintenance Notice",
  "content": "Water will be shut off on April 1st from 9 AM to 12 PM for pipe maintenance."
}
```

**Response:**
```json
{
  "announcement_id": "uuid",
  "published_at": "2026-03-30T10:30:00Z"
}
```

### GET /announcements
Get all announcements.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional, default: 50): Number of announcements
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "announcements": [
    {
      "announcement_id": "uuid",
      "admin_id": "uuid",
      "title": "Building Maintenance Notice",
      "content": "Water will be shut off...",
      "published_at": "2026-03-30T10:30:00Z",
      "is_active": true,
      "admin_name": "System Administrator"
    }
  ]
}
```

### PATCH /announcements/:announcementId
Update announcement (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Response:**
```json
{
  "announcement_id": "uuid",
  "updated_at": "2026-03-30T11:00:00Z"
}
```

### DELETE /announcements/:announcementId
Delete announcement (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Announcement deleted successfully"
}
```

---

## Reservation Endpoints

### GET /reservations/common-areas
Get all common areas.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "areas": [
    {
      "area_id": "uuid",
      "name": "Gym",
      "capacity": 20,
      "max_hours": 2,
      "open_time": "07:00:00",
      "close_time": "23:00:00",
      "is_active": true
    }
  ]
}
```

### GET /reservations/availability
Check availability for a common area.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `area_id` (required): Common area ID
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "area": {
    "area_id": "uuid",
    "name": "Gym",
    "capacity": 20,
    "max_hours": 2,
    "open_time": "07:00:00",
    "close_time": "23:00:00"
  },
  "booked_slots": [
    {
      "start_time": "2026-04-01T10:00:00Z",
      "end_time": "2026-04-01T12:00:00Z"
    }
  ]
}
```

### POST /reservations
Create reservation.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "area_id": "uuid",
  "start_time": "2026-04-01T14:00:00Z",
  "end_time": "2026-04-01T16:00:00Z"
}
```

**Response:**
```json
{
  "reservation_id": "uuid",
  "status": "active"
}
```

### GET /reservations/user
Get user's reservations.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "reservations": [
    {
      "reservation_id": "uuid",
      "area_id": "uuid",
      "user_id": "uuid",
      "start_time": "2026-04-01T14:00:00Z",
      "end_time": "2026-04-01T16:00:00Z",
      "status": "active",
      "cancelled_at": null,
      "area_name": "Gym"
    }
  ]
}
```

### DELETE /reservations/:reservationId
Cancel reservation.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Reservation cancelled successfully"
}
```

---

## Parking Endpoints

### GET /parking/spots
Get all parking spots.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "spots": [
    {
      "spot_id": "uuid",
      "spot_number": "A-001",
      "apartment_id": "uuid",
      "type": "standard",
      "is_occupied": false,
      "block": "A",
      "floor": 1,
      "apartment_number": "101"
    }
  ]
}
```

### PATCH /parking/spots/:spotId/assign
Assign parking spot (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "apartment_id": "uuid"
}
```

**Response:**
```json
{
  "spot_id": "uuid",
  "apartment_id": "uuid"
}
```

### POST /parking/visitors
Register visitor vehicle (Security only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "plate_number": "ABC-1234",
  "spot_id": "uuid",
  "visited_apartment_id": "uuid"
}
```

**Response:**
```json
{
  "visit_id": "uuid",
  "entry_time": "2026-03-30T10:30:00Z",
  "max_duration": "2026-03-30T14:30:00Z"
}
```

### PATCH /parking/visitors/:visitId/exit
Record visitor exit (Security only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "visit_id": "uuid",
  "exit_time": "2026-03-30T12:00:00Z",
  "duration": "1.50 hours"
}
```

### GET /parking/visitors/overstay
Get overstay alerts (Security only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "overstay_vehicles": [
    {
      "visit_id": "uuid",
      "plate_number": "ABC-1234",
      "spot_id": "uuid",
      "visited_apartment_id": "uuid",
      "entry_time": "2026-03-30T06:00:00Z",
      "exit_time": null,
      "spot_number": "V-001",
      "block": "A",
      "floor": 1,
      "number": "101",
      "hours_exceeded": "0.50"
    }
  ]
}
```

---

## Report Endpoints

### GET /reports/dashboard
Get dashboard data (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "total_collected": 5000.00,
  "open_requests": 3,
  "occupancy_rate": 75.00,
  "payment_trend": [
    {
      "month": "2026-01-01T00:00:00Z",
      "amount": 4500.00
    }
  ],
  "request_categories": [
    {
      "category": "electric",
      "count": 5
    }
  ]
}
```

### GET /reports/dues-collection/pdf
Generate PDF report (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `month` (required): Month number (1-12)
- `year` (required): Year (e.g., 2026)

**Response:**
PDF file download or JSON with report data

---

## User Management Endpoints

### POST /users
Create user (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Resident",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "resident",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "email": "john@example.com",
  "role": "resident"
}
```

### GET /users/:userId
Get user by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user_id": "uuid",
  "name": "John Resident",
  "email": "john@example.com",
  "role": "resident",
  "phone": "+1234567890",
  "is_active": true,
  "created_at": "2026-03-30T10:30:00Z"
}
```

### PATCH /users/:userId
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Updated",
  "phone": "+0987654321"
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "updated_fields": {
    "name": "John Updated",
    "phone": "+0987654321"
  }
}
```

### GET /users
Get all users (Manager only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role` (optional): Filter by role
- `is_active` (optional): Filter by active status

**Response:**
```json
{
  "users": [
    {
      "user_id": "uuid",
      "name": "John Resident",
      "email": "john@example.com",
      "role": "resident",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2026-03-30T10:30:00Z"
    }
  ]
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## Pagination

Endpoints that return lists support pagination via `limit` and `offset` query parameters.

## Timestamps

All timestamps are in ISO 8601 format with UTC timezone.

---

**API Version:** 1.0.0  
**Last Updated:** March 30, 2026
