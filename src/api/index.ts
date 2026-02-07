/**
 * API client functions — all calls go through the unified http() wrapper.
 * URLs and methods match the OpenAPI spec + API_CONTRACTS.md.
 *
 * In dev mode with VITE_MOCK_API=true, these requests are intercepted
 * by MSW (Mock Service Worker) and never reach the network.
 */

import { http } from './http';
import type {
  AuthResponse,
  SocialAuthRequest,
  Event,
  EventDetail,
  EventsListParams,
  PaginatedResponse,
  FavoriteEvent,
  AddFavoriteResponse,
  UserProfile,
  EventsSelectionPageDto,
} from './generated';

// ─── Auth ────────────────────────────────────────────────

/**
 * TODO: In production, this must exchange Telegram initData for a real JWT
 * via the backend. The backend must verify the initData signature using
 * HMAC-SHA-256 with the bot token before issuing tokens.
 */
export function authSocial(data: SocialAuthRequest): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/social', { method: 'POST', body: data });
}

// ─── User ────────────────────────────────────────────────

export function getMe(): Promise<UserProfile> {
  return http<UserProfile>('/users/me');
}

// ─── Events ──────────────────────────────────────────────

export function getEvents(params?: EventsListParams): Promise<PaginatedResponse<Event>> {
  return http<PaginatedResponse<Event>>('/events', {
    params: params as Record<string, string | number | undefined>,
  });
}

export function getEvent(eventId: string): Promise<EventDetail> {
  return http<EventDetail>(`/events/${eventId}`);
}

// ─── Favorites ───────────────────────────────────────────

export function getFavorites(page = 1, limit = 20): Promise<PaginatedResponse<FavoriteEvent>> {
  return http<PaginatedResponse<FavoriteEvent>>('/users/me/favorites', {
    params: { page, limit },
  });
}

export function addFavorite(eventId: string): Promise<AddFavoriteResponse> {
  return http<AddFavoriteResponse>('/users/me/favorites', {
    method: 'POST',
    body: { eventId },
  });
}

export function removeFavorite(eventId: string): Promise<void> {
  return http<void>(`/users/me/favorites/${eventId}`, { method: 'DELETE' });
}

// ─── OpenAPI Registration Endpoints ──────────────────────

export function getFirstStepPreferences(): Promise<unknown> {
  return http('/events/registration/first-form', { method: 'POST' });
}

export function getSecondStepPreferences(): Promise<unknown> {
  return http('/events/registration/second-form', { method: 'POST' });
}

// ─── OpenAPI Like/Selection Endpoints ────────────────────

export function getLikedEvents(): Promise<EventsSelectionPageDto> {
  return http<EventsSelectionPageDto>('/events/like/selection');
}

export function likeEvent(eventId: number): Promise<void> {
  return http<void>(`/events/like/${eventId}`, { method: 'POST' });
}

export function getEventsByCategory(categoryName: string): Promise<EventsSelectionPageDto> {
  return http<EventsSelectionPageDto>(`/events/categorized/${categoryName}`);
}
