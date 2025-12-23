# Faces & Places - API Contracts

## Overview

This document defines the API contracts for the Faces & Places backend service.

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer JWT token in `Authorization` header

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Profile](#2-user-profile)
3. [User Preferences](#3-user-preferences)
4. [Events](#4-events)
5. [Favorites](#5-favorites)
6. [Preference Quiz](#6-preference-quiz)
7. [Personalized Selection](#7-personalized-selection)
8. [Reviews](#8-reviews)

---

## Common Types

### Error Response

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Pagination

```typescript
interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Event Categories (Enum)

```typescript
type EventCategory =
  | "theatre"     // Театр
  | "cinema"      // Кино
  | "quest"       // Квесты
  | "concert"     // Концерты
  | "standup"     // Стендап
  | "exhibition"  // Выставки
  | "festival"    // Фестивали
  | "ballet"      // Балет
  | "opera"       // Опера
  | "club"        // Клубы
  | "sport"       // Спорт
  | "lecture";    // Лекции
```

### Budget Level (Enum)

```typescript
type BudgetLevel = "low" | "medium" | "high";
```

---

## 1. Authentication

### 1.1 Register

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Алексей Иванов"
}
```

**Response** `201 Created`:
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "Алексей Иванов",
    "avatar": null,
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

**Errors**:
- `400 Bad Request` - Invalid input (validation failed)
- `409 Conflict` - Email already registered

---

### 1.2 Login

Authenticate existing user.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** `200 OK`:
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "Алексей Иванов",
    "avatar": "https://cdn.example.com/avatars/usr_abc123.jpg",
    "location": "Москва, Россия",
    "createdAt": "2025-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

**Errors**:
- `401 Unauthorized` - Invalid credentials

---

### 1.3 Social Auth

Authenticate via third-party provider.

**Endpoint**: `POST /auth/social`

**Request Body**:
```json
{
  "provider": "google",
  "token": "google_oauth_token_here"
}
```

**Supported Providers**: `google`, `facebook`, `telegram`

**Response** `200 OK`: Same as Login response

**Errors**:
- `400 Bad Request` - Invalid provider or token
- `401 Unauthorized` - Token verification failed

---

### 1.4 Refresh Token

Get new access token using refresh token.

**Endpoint**: `POST /auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** `200 OK`:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

**Errors**:
- `401 Unauthorized` - Invalid or expired refresh token

---

### 1.5 Logout

Invalidate current session.

**Endpoint**: `POST /auth/logout`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `204 No Content`

---

### 1.6 Password Reset Request

Request password reset email.

**Endpoint**: `POST /auth/password-reset/request`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** `200 OK`:
```json
{
  "message": "Password reset link sent to email"
}
```

---

### 1.7 Password Reset Confirm

Set new password using reset token.

**Endpoint**: `POST /auth/password-reset/confirm`

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newSecurePassword456"
}
```

**Response** `200 OK`:
```json
{
  "message": "Password successfully reset"
}
```

**Errors**:
- `400 Bad Request` - Invalid or expired token

---

## 2. User Profile

### 2.1 Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /users/me`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `200 OK`:
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "Алексей Иванов",
  "avatar": "https://cdn.example.com/avatars/usr_abc123.jpg",
  "location": "Москва, Россия",
  "preferences": {
    "categories": ["theatre", "cinema", "concert"],
    "budget": "medium",
    "searchRadius": 5
  },
  "notifications": {
    "push": true,
    "emailDigest": true
  },
  "hasCompletedQuiz": true,
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-20T14:00:00Z"
}
```

---

### 2.2 Update Profile

Update user's basic profile information.

**Endpoint**: `PATCH /users/me`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body** (all fields optional):
```json
{
  "name": "Алексей Петров",
  "location": "Санкт-Петербург, Россия"
}
```

**Response** `200 OK`: Updated user object (same as Get Current User)

---

### 2.3 Update Avatar

Upload or update user avatar.

**Endpoint**: `POST /users/me/avatar`

**Headers**:
- `Authorization: Bearer <accessToken>`
- `Content-Type: multipart/form-data`

**Request Body**: Form data with `avatar` file field

**Response** `200 OK`:
```json
{
  "avatar": "https://cdn.example.com/avatars/usr_abc123.jpg"
}
```

---

### 2.4 Delete Account

Permanently delete user account.

**Endpoint**: `DELETE /users/me`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "password": "currentPassword123"
}
```

**Response** `204 No Content`

---

## 3. User Preferences

### 3.1 Get Preferences

Get user's event preferences.

**Endpoint**: `GET /users/me/preferences`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `200 OK`:
```json
{
  "categories": ["theatre", "cinema", "concert", "quest"],
  "budget": "medium",
  "searchRadius": 5,
  "notifications": {
    "push": true,
    "emailDigest": true
  }
}
```

---

### 3.2 Update Preferences

Update user's event preferences.

**Endpoint**: `PUT /users/me/preferences`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "categories": ["theatre", "cinema", "concert", "standup"],
  "budget": "high",
  "searchRadius": 10
}
```

**Validation**:
- `categories`: minimum 3 required
- `searchRadius`: 1-50 km

**Response** `200 OK`: Updated preferences object

**Errors**:
- `400 Bad Request` - Less than 3 categories selected

---

### 3.3 Update Notification Settings

Update notification preferences.

**Endpoint**: `PATCH /users/me/notifications`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "push": false,
  "emailDigest": true
}
```

**Response** `200 OK`:
```json
{
  "push": false,
  "emailDigest": true
}
```

---

## 4. Events

### Event Object

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  image: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    distance?: number; // km, calculated based on user location
  };
  datetime: {
    date: string;      // ISO date: "2025-02-14"
    time: string;      // "19:00"
    duration: string;  // "3 часа"
    endDate?: string;  // For multi-day events
  };
  price: {
    from: number;
    to?: number;
    currency: "RUB";
  };
  rating: number;         // 0-5
  reviewCount: number;
  tags: string[];
  matchPercentage?: number; // 0-100, personalization score
  isFavorite: boolean;
  availableSeats?: number;
  bookingUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### 4.1 List Events

Get paginated list of events with filtering.

**Endpoint**: `GET /events`

**Headers**: `Authorization: Bearer <accessToken>` (optional, enables personalization)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |
| `category` | string | Filter by category (comma-separated for multiple) |
| `search` | string | Search in title, description, tags |
| `sort` | string | Sort order: `popular`, `date`, `price_asc`, `price_desc`, `match` |
| `dateFrom` | string | Filter events from date (ISO format) |
| `dateTo` | string | Filter events until date (ISO format) |
| `priceMin` | number | Minimum price filter |
| `priceMax` | number | Maximum price filter |
| `lat` | number | User latitude for distance calculation |
| `lng` | number | User longitude for distance calculation |
| `radius` | number | Search radius in km (requires lat/lng) |

**Example**: `GET /events?category=theatre,cinema&sort=popular&limit=10`

**Response** `200 OK`:
```json
{
  "data": [
    {
      "id": "evt_xyz789",
      "title": "Мастер и Маргарита",
      "description": "Культовый спектакль по роману Михаила Булгакова...",
      "category": "theatre",
      "image": "https://cdn.example.com/events/master-margarita.jpg",
      "location": {
        "name": "Театр им. Вахтангова",
        "address": "ул. Арбат, 26",
        "coordinates": {
          "lat": 55.7520,
          "lng": 37.5877
        },
        "distance": 2.3
      },
      "datetime": {
        "date": "2025-02-14",
        "time": "19:00",
        "duration": "3 часа"
      },
      "price": {
        "from": 2500,
        "to": 8000,
        "currency": "RUB"
      },
      "rating": 4.8,
      "reviewCount": 342,
      "tags": ["Драма", "Классика", "Мистика"],
      "matchPercentage": 95,
      "isFavorite": true,
      "availableSeats": 45
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 4.2 Get Event Details

Get single event with full details.

**Endpoint**: `GET /events/:eventId`

**Headers**: `Authorization: Bearer <accessToken>` (optional)

**Response** `200 OK`:
```json
{
  "id": "evt_xyz789",
  "title": "Мастер и Маргарита",
  "description": "Культовый спектакль по роману Михаила Булгакова в современной интерпретации. Погрузитесь в мистический мир московской богемы 1930-х годов.",
  "category": "theatre",
  "image": "https://cdn.example.com/events/master-margarita.jpg",
  "gallery": [
    "https://cdn.example.com/events/master-margarita-1.jpg",
    "https://cdn.example.com/events/master-margarita-2.jpg"
  ],
  "location": {
    "name": "Театр им. Вахтангова",
    "address": "ул. Арбат, 26",
    "coordinates": {
      "lat": 55.7520,
      "lng": 37.5877
    },
    "distance": 2.3
  },
  "datetime": {
    "date": "2025-02-14",
    "time": "19:00",
    "duration": "3 часа"
  },
  "price": {
    "from": 2500,
    "to": 8000,
    "currency": "RUB"
  },
  "rating": 4.8,
  "reviewCount": 342,
  "tags": ["Драма", "Классика", "Мистика"],
  "matchPercentage": 95,
  "isFavorite": true,
  "availableSeats": 45,
  "bookingUrl": "https://tickets.example.com/event/xyz789",
  "venue": {
    "id": "ven_abc123",
    "name": "Театр им. Вахтангова",
    "description": "Один из ведущих драматических театров России",
    "facilities": ["Гардероб", "Буфет", "Парковка"]
  },
  "schedule": [
    {
      "date": "2025-02-14",
      "time": "19:00",
      "availableSeats": 45
    },
    {
      "date": "2025-02-15",
      "time": "18:00",
      "availableSeats": 120
    }
  ],
  "createdAt": "2025-01-10T12:00:00Z",
  "updatedAt": "2025-01-20T09:30:00Z"
}
```

**Errors**:
- `404 Not Found` - Event not found

---

### 4.3 Get Similar Events

Get events similar to a specific event.

**Endpoint**: `GET /events/:eventId/similar`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max items to return (default: 6) |

**Response** `200 OK`:
```json
{
  "data": [
    {
      "id": "evt_abc456",
      "title": "Анна Каренина",
      "category": "theatre",
      "image": "...",
      "price": { "from": 1800, "currency": "RUB" },
      "rating": 4.6,
      "matchPercentage": 88
    }
  ]
}
```

---

## 5. Favorites

### 5.1 Get Favorites

Get user's favorite events.

**Endpoint**: `GET /users/me/favorites`

**Headers**: `Authorization: Bearer <accessToken>`

**Query Parameters**: Standard pagination

**Response** `200 OK`:
```json
{
  "data": [
    {
      "id": "evt_xyz789",
      "title": "Мастер и Маргарита",
      "category": "theatre",
      "image": "https://cdn.example.com/events/master-margarita.jpg",
      "location": {
        "name": "Театр им. Вахтангова",
        "distance": 2.3
      },
      "datetime": {
        "date": "2025-02-14",
        "time": "19:00"
      },
      "price": {
        "from": 2500,
        "currency": "RUB"
      },
      "rating": 4.8,
      "matchPercentage": 95,
      "isFavorite": true,
      "addedAt": "2025-01-18T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 5.2 Add to Favorites

Add an event to user's favorites.

**Endpoint**: `POST /users/me/favorites`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "eventId": "evt_xyz789"
}
```

**Response** `201 Created`:
```json
{
  "eventId": "evt_xyz789",
  "addedAt": "2025-01-18T15:30:00Z"
}
```

**Errors**:
- `404 Not Found` - Event not found
- `409 Conflict` - Event already in favorites

---

### 5.3 Remove from Favorites

Remove an event from user's favorites.

**Endpoint**: `DELETE /users/me/favorites/:eventId`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `204 No Content`

**Errors**:
- `404 Not Found` - Event not in favorites

---

### 5.4 Check Favorite Status

Check if event is in favorites (bulk).

**Endpoint**: `POST /users/me/favorites/check`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "eventIds": ["evt_xyz789", "evt_abc456", "evt_def123"]
}
```

**Response** `200 OK`:
```json
{
  "favorites": {
    "evt_xyz789": true,
    "evt_abc456": false,
    "evt_def123": true
  }
}
```

---

## 6. Preference Quiz

### Quiz Question Object

```typescript
interface QuizQuestion {
  id: number;
  text: string;
  type: "single" | "multiple" | "scale";
  options: {
    id: string;
    text: string;
    image?: string;
  }[];
  minSelections?: number; // For type "multiple"
  maxSelections?: number;
}
```

---

### 6.1 Get Quiz Questions

Get the preference quiz questions.

**Endpoint**: `GET /quiz/questions`

**Headers**: `Authorization: Bearer <accessToken>` (optional)

**Response** `200 OK`:
```json
{
  "questions": [
    {
      "id": 1,
      "text": "Какой формат отдыха вам ближе?",
      "type": "single",
      "options": [
        { "id": "active", "text": "Активный", "image": "..." },
        { "id": "relaxed", "text": "Спокойный", "image": "..." },
        { "id": "mixed", "text": "Смешанный", "image": "..." }
      ]
    },
    {
      "id": 2,
      "text": "Какие жанры кино вам нравятся?",
      "type": "multiple",
      "minSelections": 1,
      "maxSelections": 3,
      "options": [
        { "id": "comedy", "text": "Комедии" },
        { "id": "drama", "text": "Драмы" },
        { "id": "thriller", "text": "Триллеры" },
        { "id": "scifi", "text": "Фантастика" },
        { "id": "horror", "text": "Ужасы" }
      ]
    },
    {
      "id": 3,
      "text": "Насколько вам важна близость к дому?",
      "type": "scale",
      "options": [
        { "id": "1", "text": "Не важно" },
        { "id": "2", "text": "Немного" },
        { "id": "3", "text": "Средне" },
        { "id": "4", "text": "Важно" },
        { "id": "5", "text": "Очень важно" }
      ]
    }
  ],
  "totalQuestions": 10
}
```

---

### 6.2 Submit Quiz Answers

Submit answers to the preference quiz.

**Endpoint**: `POST /quiz/submit`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "answers": [
    { "questionId": 1, "selectedOptions": ["mixed"] },
    { "questionId": 2, "selectedOptions": ["drama", "thriller"] },
    { "questionId": 3, "selectedOptions": ["4"] },
    { "questionId": 4, "selectedOptions": ["evening"] },
    { "questionId": 5, "selectedOptions": ["medium"] },
    { "questionId": 6, "selectedOptions": ["theatre", "cinema", "concert"] },
    { "questionId": 7, "selectedOptions": ["2-3"] },
    { "questionId": 8, "selectedOptions": ["yes"] },
    { "questionId": 9, "selectedOptions": ["classic", "modern"] },
    { "questionId": 10, "selectedOptions": ["discovery"] }
  ]
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "profile": {
    "dominantCategories": ["theatre", "cinema", "concert"],
    "preferredBudget": "medium",
    "preferredRadius": 5,
    "preferredTimes": ["evening", "weekend"],
    "traits": ["culture_lover", "social", "adventure_seeker"]
  },
  "message": "Ваш профиль предпочтений создан!"
}
```

---

### 6.3 Get Quiz Progress

Get user's quiz completion status.

**Endpoint**: `GET /quiz/progress`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `200 OK`:
```json
{
  "completed": false,
  "answeredQuestions": 3,
  "totalQuestions": 10,
  "lastAnsweredAt": "2025-01-18T14:20:00Z"
}
```

---

### 6.4 Reset Quiz

Reset quiz to retake it.

**Endpoint**: `POST /quiz/reset`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `204 No Content`

---

## 7. Personalized Selection

### 7.1 Get Personalized Selection

Get personalized event recommendations.

**Endpoint**: `GET /selection`

**Headers**: `Authorization: Bearer <accessToken>`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Number of recommendations (default: 10) |
| `refresh` | boolean | Force refresh recommendations |

**Response** `200 OK`:
```json
{
  "selection": [
    {
      "id": "evt_xyz789",
      "title": "Мастер и Маргарита",
      "category": "theatre",
      "image": "https://cdn.example.com/events/master-margarita.jpg",
      "location": {
        "name": "Театр им. Вахтангова",
        "distance": 2.3
      },
      "datetime": {
        "date": "2025-02-14",
        "time": "19:00"
      },
      "price": {
        "from": 2500,
        "currency": "RUB"
      },
      "rating": 4.8,
      "tags": ["Драма", "Классика"],
      "matchPercentage": 95,
      "matchReasons": [
        "Соответствует вашему интересу к театру",
        "Высокий рейтинг среди похожих пользователей",
        "В пределах вашего бюджета"
      ],
      "isFavorite": false
    }
  ],
  "generatedAt": "2025-01-20T10:00:00Z",
  "basedOn": {
    "quizCompleted": true,
    "favoritesCount": 5,
    "viewHistory": true
  }
}
```

---

### 7.2 Selection Feedback

Provide feedback on selection (swipe left/right).

**Endpoint**: `POST /selection/feedback`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "eventId": "evt_xyz789",
  "action": "like"
}
```

**Actions**: `like`, `dislike`, `skip`

**Response** `200 OK`:
```json
{
  "recorded": true,
  "nextEvent": {
    "id": "evt_next123",
    "title": "...",
    ...
  }
}
```

---

## 8. Reviews

### Review Object

```typescript
interface Review {
  id: string;
  eventId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  rating: number;     // 1-5
  text: string;
  visitDate: string;  // ISO date
  createdAt: string;
  updatedAt: string;
  helpful: number;    // Helpful votes count
  isOwn: boolean;     // Is current user's review
}
```

---

### 8.1 Get Event Reviews

Get reviews for a specific event.

**Endpoint**: `GET /events/:eventId/reviews`

**Headers**: `Authorization: Bearer <accessToken>` (optional)

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Items per page (default: 10) |
| `sort` | string | Sort: `recent`, `rating_high`, `rating_low`, `helpful` |

**Response** `200 OK`:
```json
{
  "data": [
    {
      "id": "rev_abc123",
      "eventId": "evt_xyz789",
      "author": {
        "id": "usr_def456",
        "name": "Мария С.",
        "avatar": "https://cdn.example.com/avatars/usr_def456.jpg"
      },
      "rating": 5,
      "text": "Потрясающий спектакль! Актёры великолепны, особенно исполнитель роли Воланда.",
      "visitDate": "2025-01-10",
      "createdAt": "2025-01-12T18:30:00Z",
      "updatedAt": "2025-01-12T18:30:00Z",
      "helpful": 24,
      "isOwn": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 342,
    "totalPages": 35,
    "hasNext": true,
    "hasPrev": false
  },
  "summary": {
    "averageRating": 4.8,
    "totalReviews": 342,
    "ratingDistribution": {
      "5": 280,
      "4": 45,
      "3": 12,
      "2": 3,
      "1": 2
    }
  }
}
```

---

### 8.2 Create Review

Create a review for an event.

**Endpoint**: `POST /events/:eventId/reviews`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "rating": 5,
  "text": "Потрясающий спектакль! Актёры великолепны.",
  "visitDate": "2025-01-10"
}
```

**Validation**:
- `rating`: 1-5, required
- `text`: 10-2000 characters, required
- `visitDate`: must be in past, required

**Response** `201 Created`:
```json
{
  "id": "rev_new789",
  "eventId": "evt_xyz789",
  "author": {
    "id": "usr_abc123",
    "name": "Алексей И.",
    "avatar": "..."
  },
  "rating": 5,
  "text": "Потрясающий спектакль! Актёры великолепны.",
  "visitDate": "2025-01-10",
  "createdAt": "2025-01-20T14:00:00Z",
  "updatedAt": "2025-01-20T14:00:00Z",
  "helpful": 0,
  "isOwn": true
}
```

**Errors**:
- `400 Bad Request` - Validation failed
- `409 Conflict` - User already reviewed this event

---

### 8.3 Update Review

Update user's own review.

**Endpoint**: `PUT /events/:eventId/reviews/:reviewId`

**Headers**: `Authorization: Bearer <accessToken>`

**Request Body**:
```json
{
  "rating": 4,
  "text": "Обновлённый текст отзыва..."
}
```

**Response** `200 OK`: Updated review object

**Errors**:
- `403 Forbidden` - Not user's review
- `404 Not Found` - Review not found

---

### 8.4 Delete Review

Delete user's own review.

**Endpoint**: `DELETE /events/:eventId/reviews/:reviewId`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `204 No Content`

**Errors**:
- `403 Forbidden` - Not user's review

---

### 8.5 Mark Review Helpful

Mark a review as helpful.

**Endpoint**: `POST /reviews/:reviewId/helpful`

**Headers**: `Authorization: Bearer <accessToken>`

**Response** `200 OK`:
```json
{
  "helpful": 25
}
```

---

## HTTP Status Codes Summary

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No Content (success, no body) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (not logged in) |
| `403` | Forbidden (no permission) |
| `404` | Not Found |
| `409` | Conflict (duplicate) |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

---

## Rate Limiting

All endpoints are rate limited:
- **Authenticated requests**: 1000 requests/minute
- **Unauthenticated requests**: 100 requests/minute

Rate limit headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705756800
```

---

## Versioning

API version is included in the URL path (`/api/v1/...`). Breaking changes will result in a new version (`/api/v2/...`). Non-breaking additions (new fields, new endpoints) may be added without version change.

---

## Notes for Backend Implementation

### Priority Order (MVP)

1. **Phase 1 - Core**
   - Authentication (register, login, tokens)
   - User profile (get, update)
   - Events list with basic filtering
   - Event details

2. **Phase 2 - Personalization**
   - User preferences CRUD
   - Favorites CRUD
   - Quiz questions and submission

3. **Phase 3 - Recommendations**
   - Personalized selection algorithm
   - Selection feedback loop
   - Match percentage calculation

4. **Phase 4 - Social**
   - Reviews CRUD
   - Helpful votes
   - Social auth providers

### External Integrations Needed

- **Ticketing service**: For `bookingUrl` and `availableSeats`
- **Geocoding service**: For location coordinates and distance calculation
- **Image CDN**: For event images and avatars
- **Email service**: For password reset and notifications
- **Push notification service**: For mobile notifications
