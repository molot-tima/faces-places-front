/**
 * MSW request handlers — intercept fetch calls and return mock data
 * matching the OpenAPI / API_CONTRACTS.md response shapes.
 */

import { http, HttpResponse, delay } from 'msw';
import {
  getEventsWithFavorites,
  getEventById,
  getFavoriteEvents,
  favoritesStore,
  mockUser,
  mockEvents,
} from './data';

function randomDelay() {
  return delay(100 + Math.random() * 300);
}

/** Accept any non-empty Bearer token in mock mode */
function checkAuth(request: Request): boolean {
  const auth = request.headers.get('Authorization');
  return !!auth && auth.startsWith('Bearer ') && auth.length > 7;
}

export const handlers = [
  // ─── Auth ─────────────────────────────────────────────

  http.post('*/api/v1/auth/social', async ({ request }) => {
    await randomDelay();
    const body = (await request.json()) as { provider: string; token: string };
    if (!body.provider || !body.token) {
      return HttpResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Missing provider or token' } },
        { status: 400 },
      );
    }
    return HttpResponse.json({
      user: mockUser,
      tokens: {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
      },
    });
  }),

  // ─── User Profile ─────────────────────────────────────

  http.get('*/api/v1/users/me', async ({ request }) => {
    await randomDelay();
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockUser);
  }),

  // ─── Events List ──────────────────────────────────────

  http.get('*/api/v1/events', async ({ request }) => {
    await randomDelay();
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '20');
    const category = url.searchParams.get('category');

    let events = getEventsWithFavorites();

    if (category) {
      const cats = category.split(',');
      events = events.filter((e) => cats.includes(e.category));
    }

    const total = events.length;
    const start = (page - 1) * limit;
    const paged = events.slice(start, start + limit);

    return HttpResponse.json({
      data: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: start + limit < total,
        hasPrev: page > 1,
      },
    });
  }),

  // ─── Event Details ────────────────────────────────────

  http.get('*/api/v1/events/:eventId', async ({ params }) => {
    await randomDelay();
    const event = getEventById(params.eventId as string);
    if (!event) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 },
      );
    }
    return HttpResponse.json(event);
  }),

  // ─── Favorites ────────────────────────────────────────

  http.get('*/api/v1/users/me/favorites', async ({ request }) => {
    await randomDelay();
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const limit = parseInt(url.searchParams.get('limit') ?? '20');

    const favorites = getFavoriteEvents();
    const total = favorites.length;
    const start = (page - 1) * limit;
    const paged = favorites.slice(start, start + limit);

    return HttpResponse.json({
      data: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasNext: start + limit < total,
        hasPrev: page > 1,
      },
    });
  }),

  http.post('*/api/v1/users/me/favorites', async ({ request }) => {
    await randomDelay();
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { eventId: string };
    if (favoritesStore.has(body.eventId)) {
      return HttpResponse.json(
        { error: { code: 'CONFLICT', message: 'Already in favorites' } },
        { status: 409 },
      );
    }

    favoritesStore.add(body.eventId);
    return HttpResponse.json(
      { eventId: body.eventId, addedAt: new Date().toISOString() },
      { status: 201 },
    );
  }),

  http.delete('*/api/v1/users/me/favorites/:eventId', async ({ params, request }) => {
    await randomDelay();
    if (!checkAuth(request)) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const eventId = params.eventId as string;
    if (!favoritesStore.has(eventId)) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Not in favorites' } },
        { status: 404 },
      );
    }

    favoritesStore.remove(eventId);
    return new HttpResponse(null, { status: 204 });
  }),

  // ─── OpenAPI: Registration Steps ──────────────────────

  http.post('*/api/v1/events/registration/first-form', async () => {
    await randomDelay();
    return HttpResponse.json({
      sessionId: 'session_' + Date.now(),
      categories: [
        { name: 'theatre', description: 'Театр', img: null },
        { name: 'cinema', description: 'Кино', img: null },
        { name: 'concert', description: 'Концерты', img: null },
        { name: 'quest', description: 'Квесты', img: null },
        { name: 'standup', description: 'Стендап', img: null },
        { name: 'exhibition', description: 'Выставки', img: null },
      ],
    });
  }),

  http.post('*/api/v1/events/registration/second-form', async () => {
    await randomDelay();
    return HttpResponse.json({
      subCategories: [
        { name: 'drama', description: 'Драма', img: null },
        { name: 'comedy', description: 'Комедия', img: null },
        { name: 'horror', description: 'Хоррор', img: null },
      ],
    });
  }),

  http.post('*/api/v1/events/registration/third-form', async () => {
    await randomDelay();
    return HttpResponse.json({
      carts: mockEvents.slice(0, 3).map((e) => ({
        id: parseInt(e.id.replace('evt_', '')),
        name: e.title,
        description: e.description,
        startsFrom: e.datetime.date + 'T' + e.datetime.time + ':00Z',
        price: e.price.from,
        categories: [{ name: e.category, description: e.category, img: null }],
        imgUrl: e.image,
      })),
    });
  }),

  http.post('*/api/v1/events/registration/fourth-form', async () => {
    await randomDelay();
    return HttpResponse.json({});
  }),

  // ─── OpenAPI: Like / Selection ────────────────────────

  http.get('*/api/v1/events/like/selection', async () => {
    await randomDelay();
    const liked = favoritesStore.getAll();
    const carts = mockEvents
      .filter((e) => liked.includes(e.id))
      .map((e) => ({
        id: parseInt(e.id.replace('evt_', '')),
        name: e.title,
        description: e.description,
        startsFrom: e.datetime.date + 'T' + e.datetime.time + ':00Z',
        price: e.price.from,
        categories: [{ name: e.category, description: e.category, img: null }],
        imgUrl: e.image,
      }));
    return HttpResponse.json({
      selectionId: 'sel_' + Date.now(),
      offset: 0,
      carts,
    });
  }),

  http.post('*/api/v1/events/like/:eventId', async ({ params }) => {
    await randomDelay();
    const eventId = 'evt_' + params.eventId;
    favoritesStore.add(eventId);
    return new HttpResponse(null, { status: 200 });
  }),

  http.get('*/api/v1/events/categorized/:categoryName', async ({ params }) => {
    await randomDelay();
    const cat = params.categoryName as string;
    const filtered = mockEvents
      .filter((e) => e.category === cat)
      .map((e) => ({
        id: parseInt(e.id.replace('evt_', '')),
        name: e.title,
        description: e.description,
        startsFrom: e.datetime.date + 'T' + e.datetime.time + ':00Z',
        price: e.price.from,
        categories: [{ name: e.category, description: e.category, img: null }],
        imgUrl: e.image,
      }));
    return HttpResponse.json({
      selectionId: 'sel_' + Date.now(),
      offset: 0,
      carts: filtered,
    });
  }),
];
