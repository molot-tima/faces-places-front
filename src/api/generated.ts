/**
 * API types generated from OpenAPI spec + API_CONTRACTS.md
 *
 * Run `npm run gen:api` to regenerate from the OpenAPI yaml.
 * These types are manually enriched with detail from API_CONTRACTS.md
 * since the OpenAPI spec is minimal.
 */

// ─── Enums ───────────────────────────────────────────────

export type EventCategory =
  | 'theatre'
  | 'cinema'
  | 'quest'
  | 'concert'
  | 'standup'
  | 'exhibition'
  | 'festival'
  | 'ballet'
  | 'opera'
  | 'club'
  | 'sport'
  | 'lecture';

export type BudgetLevel = 'low' | 'medium' | 'high';

// ─── Common ──────────────────────────────────────────────

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// ─── Auth ────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  location?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface SocialAuthRequest {
  provider: 'google' | 'facebook' | 'telegram';
  token: string;
}

// ─── User ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  location: string;
  preferences: {
    categories: EventCategory[];
    budget: BudgetLevel;
    searchRadius: number;
  };
  notifications: {
    push: boolean;
    emailDigest: boolean;
  };
  hasCompletedQuiz: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Events ──────────────────────────────────────────────

export interface EventLocation {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
}

export interface EventDatetime {
  date: string;
  time: string;
  duration: string;
  endDate?: string;
}

export interface EventPrice {
  from: number;
  to?: number;
  currency: 'RUB';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  image: string;
  location: EventLocation;
  datetime: EventDatetime;
  price: EventPrice;
  rating: number;
  reviewCount: number;
  tags: string[];
  matchPercentage?: number;
  isFavorite: boolean;
  availableSeats?: number;
  bookingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventDetail extends Event {
  gallery: string[];
  venue: {
    id: string;
    name: string;
    description: string;
    facilities: string[];
  };
  schedule: Array<{
    date: string;
    time: string;
    availableSeats: number;
  }>;
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: 'popular' | 'date' | 'price_asc' | 'price_desc' | 'match';
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
}

// ─── Favorites ───────────────────────────────────────────

export interface FavoriteEvent extends Event {
  addedAt: string;
}

export interface AddFavoriteResponse {
  eventId: string;
  addedAt: string;
}

// ─── OpenAPI Schemas (from places_and_faces_back-openapi.yaml) ───

export interface CategoryDescriptionDto {
  name: string | null;
  description: string | null;
  img: string | null;
}

export interface FirstPreferencesPageResponseDto {
  sessionId: string | null;
  categories: CategoryDescriptionDto[] | null;
}

export interface SecondPreferencesPageResponseDto {
  subCategories: CategoryDescriptionDto[] | null;
}

export interface EventCartDescriptionDto {
  id: number | null;
  name: string | null;
  description: string | null;
  startsFrom: string | null;
  price: number | null;
  categories: CategoryDescriptionDto[] | null;
  imgUrl: string | null;
}

export interface ThirdPreferencesPageResponseDto {
  carts: EventCartDescriptionDto[] | null;
}

export interface EventsSelectionPageDto {
  selectionId: string | null;
  offset: number | null;
  carts: EventCartDescriptionDto[] | null;
}

export interface EventCartPageDto {
  [key: string]: unknown;
}

// ─── Selection ───────────────────────────────────────────

export interface SelectionEvent {
  id: string;
  title: string;
  category: EventCategory;
  image: string;
  location: {
    name: string;
    distance: number;
  };
  datetime: {
    date: string;
    time: string;
  };
  price: {
    from: number;
    currency: 'RUB';
  };
  rating: number;
  tags: string[];
  matchPercentage: number;
  matchReasons: string[];
  isFavorite: boolean;
}

export interface SelectionResponse {
  selection: SelectionEvent[];
  generatedAt: string;
  basedOn: {
    quizCompleted: boolean;
    favoritesCount: number;
    viewHistory: boolean;
  };
}
