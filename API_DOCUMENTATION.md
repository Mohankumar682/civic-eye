# CivicEye AI+ API Documentation

Complete API reference for CivicEye civic issue reporting platform.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in header:
```
x-auth-token: <your_jwt_token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"  // or "admin"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login User
**POST** `/auth/login`

Authenticate and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Errors:**
- `400`: Invalid Credentials

---

## Issue Endpoints

### List All Issues
**GET** `/issues`

Retrieve all issues with optional filtering and sorting.

**Query Parameters:**
- `status` (string): Filter by status - `pending`, `in-progress`, `resolved`
- `category` (string): Filter by category
- `priority` (string): Filter by priority - `high`, `medium`, `low`
- `sort` (string): Sort option - `newest`, `oldest`, `upvotes`

**Example:**
```
GET /issues?status=pending&priority=high&sort=upvotes
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Large Pothole on Main St",
    "description": "There's a dangerous pothole...",
    "category": "Roads",
    "priority": "high",
    "status": "pending",
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "Main Street, Downtown"
    },
    "imageUrl": "/uploads/1234567890-image.jpg",
    "upvotes": ["507f1f77bcf86cd799439012"],
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "createdAt": "2024-04-15T10:30:00Z",
    "resolvedAt": null
  }
]
```

### Get Single Issue
**GET** `/issues/:id`

Retrieve details of a specific issue.

**Response (200):** Same as issue object above

**Errors:**
- `404`: Issue not found

### Create Issue
**POST** `/issues`

Report a new civic issue with optional image.

**Headers:**
```
x-auth-token: <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `title` (string, required): Issue title
- `description` (string, required): Detailed description
- `category` (string): Category or "auto" for AI classification
- `priority` (string): Priority level
- `lat` (number, required): Latitude
- `lng` (number, required): Longitude
- `address` (string): Location address/landmark
- `image` (file, optional): Image file (jpeg, png, etc)

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Large Pothole on Main St",
  "description": "There's a dangerous pothole...",
  "category": "Roads",
  "priority": "high",
  "status": "pending",
  "location": { "lat": 40.7128, "lng": -74.0060, "address": "Main St" },
  "imageUrl": "/uploads/1234567890-image.jpg",
  "upvotes": [],
  "createdBy": "507f1f77bcf86cd799439013",
  "createdAt": "2024-04-15T10:30:00Z",
  "suggestedDepartment": "Public Works Department"
}
```

**Errors:**
- `401`: No token provided
- `500`: Server error

### Update Issue (Admin Only)
**PUT** `/issues/:id`

Update issue status and/or priority.

**Headers:**
```
x-auth-token: <admin_token>
```

**Request Body:**
```json
{
  "status": "in-progress",
  "priority": "medium"
}
```

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Large Pothole on Main St",
  "description": "There's a dangerous pothole...",
  "category": "Roads",
  "priority": "medium",
  "status": "in-progress",
  "location": { "lat": 40.7128, "lng": -74.0060, "address": "Main St" },
  "imageUrl": "/uploads/1234567890-image.jpg",
  "upvotes": [],
  "createdBy": "507f1f77bcf86cd799439013",
  "createdAt": "2024-04-15T10:30:00Z",
  "resolvedAt": null
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Not authorized (not admin)
- `404`: Issue not found

### Upvote Issue
**PUT** `/issues/upvote/:id`

Toggle upvote on an issue.

**Headers:**
```
x-auth-token: <token>
```

**Response (200):**
```json
["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439014"]
```

**Notes:**
- Toggles upvote on/off
- User can only upvote once
- Returns array of upvoter user IDs

### Delete Issue (Admin Only)
**DELETE** `/issues/:id`

Remove an issue from the system.

**Headers:**
```
x-auth-token: <admin_token>
```

**Response (200):**
```json
{
  "msg": "Issue removed"
}
```

**Errors:**
- `403`: Not authorized
- `404`: Issue not found

---

## Notification Endpoints

### List Notifications
**GET** `/notifications`

Get all notifications for current user (max 50, newest first).

**Headers:**
```
x-auth-token: <token>
```

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "issueId": "507f1f77bcf86cd799439013",
    "message": "Your issue 'Pothole at Main St' has been updated to In Progress.",
    "type": "status_change",
    "read": false,
    "createdAt": "2024-04-15T11:00:00Z"
  }
]
```

### Get Unread Count
**GET** `/notifications/unread`

Get count of unread notifications.

**Headers:**
```
x-auth-token: <token>
```

**Response (200):**
```json
{
  "count": 3
}
```

### Mark as Read
**PUT** `/notifications/:id/read`

Mark single notification as read.

**Headers:**
```
x-auth-token: <token>
```

**Response (200):**
```json
{
  "msg": "Marked as read"
}
```

### Mark All as Read
**PUT** `/notifications/read-all`

Mark all user notifications as read.

**Headers:**
```
x-auth-token: <token>
```

**Response (200):**
```json
{
  "msg": "All marked as read"
}
```

---

## Analytics Endpoints

### Get Analytics (Admin Only)
**GET** `/analytics`

Retrieve comprehensive analytics and statistics.

**Headers:**
```
x-auth-token: <admin_token>
```

**Response (200):**
```json
{
  "total": 45,
  "statusCounts": {
    "pending": 12,
    "in-progress": 8,
    "resolved": 25
  },
  "categoryCounts": {
    "Roads": 15,
    "Garbage": 12,
    "Streetlights": 10,
    "Water": 5,
    "Drainage": 3,
    "Other": 0
  },
  "priorityCounts": {
    "high": 8,
    "medium": 20,
    "low": 17
  },
  "avgResolutionTime": 72,
  "resolvedCount": 25,
  "resolutionRate": 56,
  "topUpvoted": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Huge Pothole",
      "upvotes": 45,
      "status": "resolved"
    }
  ],
  "issuesPerDay": {
    "2024-04-10": 2,
    "2024-04-11": 3,
    "2024-04-12": 1
  },
  "departmentMap": {
    "Garbage": "Sanitation Department",
    "Roads": "Public Works Department",
    "Streetlights": "Electrical Department",
    "Water": "Water Supply Board",
    "Drainage": "Municipal Engineering"
  }
}
```

**Errors:**
- `403`: Not authorized

---

## Error Responses

### Common Errors

**401 - No Token**
```json
{
  "msg": "No token, authorization denied"
}
```

**401 - Invalid Token**
```json
{
  "msg": "Token is not valid"
}
```

**403 - Forbidden**
```json
{
  "msg": "Not authorized"
}
```

**404 - Not Found**
```json
{
  "msg": "Issue not found"
}
```

**400 - Bad Request**
```json
{
  "msg": "Invalid input"
}
```

**500 - Server Error**
```json
{
  "msg": "Server Error"
}
```

---

## Rate Limiting

No rate limiting implemented by default. Consider adding for production.

## CORS

CORS is enabled for all origins by default:
```javascript
app.use(cors());
```

## File Uploads

- **Path**: `/uploads/[timestamp]-[filename]`
- **Max Size**: No limit set (configure in multer)
- **Allowed Types**: All file types (configure in multer)

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Example Workflows

### Workflow 1: Report an Issue

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "pass123",
    "role": "user"
  }'

# Response includes token and user info

# 2. Report Issue
curl -X POST http://localhost:5000/api/issues \
  -H "x-auth-token: <token>" \
  -F "title=Pothole on Main" \
  -F "description=Large pothole dangerous" \
  -F "category=auto" \
  -F "priority=high" \
  -F "lat=40.7128" \
  -F "lng=-74.0060" \
  -F "address=Main St" \
  -F "image=@photo.jpg"
```

### Workflow 2: Admin Updates Status

```bash
# 1. Login as Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass"
  }'

# 2. Update Issue Status
curl -X PUT http://localhost:5000/api/issues/<issue_id> \
  -H "x-auth-token: <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress",
    "priority": "medium"
  }'

# 3. Get Analytics
curl -X GET http://localhost:5000/api/analytics \
  -H "x-auth-token: <admin_token>"
```

---

For more information, visit the main README.md
