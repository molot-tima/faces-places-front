/**
 * In-memory mock data store for MSW handlers.
 * Favorites are persisted to localStorage.
 */

import type { Event, EventDetail, FavoriteEvent, UserProfile } from '../api/generated';

// ─── Mock Events ─────────────────────────────────────────

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

export const mockEvents: EventDetail[] = [
  {
    id: 'evt_1',
    title: 'Мастер и Маргарита',
    description: 'Легендарная постановка по роману Михаила Булгакова в новой интерпретации режиссёра Юрия Бутусова. Мистическая история о визите Сатаны в Москву, о любви Мастера и Маргариты переплетается с библейским сюжетом о Понтии Пилате.',
    category: 'theatre',
    image: GRADIENTS[0],
    gallery: [GRADIENTS[0], GRADIENTS[1], GRADIENTS[2], GRADIENTS[6]],
    location: {
      name: 'Театр им. Вахтангова',
      address: 'ул. Арбат, 26',
      coordinates: { lat: 55.7520, lng: 37.5877 },
      distance: 2.3,
    },
    datetime: { date: '2025-03-14', time: '19:00', duration: '3 часа' },
    price: { from: 1500, to: 8000, currency: 'RUB' },
    rating: 4.9,
    reviewCount: 312,
    tags: ['Драма', 'Классика', 'Мистика'],
    matchPercentage: 95,
    isFavorite: false,
    availableSeats: 23,
    bookingUrl: 'https://tickets.example.com/event/evt_1',
    venue: {
      id: 'ven_1',
      name: 'Театр им. Вахтангова',
      description: 'Один из ведущих драматических театров России',
      facilities: ['Гардероб', 'Буфет', 'Парковка'],
    },
    schedule: [
      { date: '2025-03-14', time: '19:00', availableSeats: 23 },
      { date: '2025-03-15', time: '18:00', availableSeats: 120 },
    ],
    createdAt: '2025-01-10T12:00:00Z',
    updatedAt: '2025-01-20T09:30:00Z',
  },
  {
    id: 'evt_2',
    title: 'Квест "Тайна старого дома"',
    description: 'Захватывающий хоррор-квест для компании 2-4 человека. Разгадайте тайну заброшенного особняка XIX века и выберитесь за 60 минут.',
    category: 'quest',
    image: GRADIENTS[1],
    gallery: [GRADIENTS[1], GRADIENTS[4]],
    location: {
      name: 'QuestHouse Moscow',
      address: 'Тверская ул., 15',
      coordinates: { lat: 55.7640, lng: 37.6050 },
      distance: 3.1,
    },
    datetime: { date: '2025-03-16', time: '18:00', duration: '60 мин' },
    price: { from: 2500, to: 4000, currency: 'RUB' },
    rating: 4.7,
    reviewCount: 189,
    tags: ['Хоррор', '2-4 чел', 'Для компании'],
    matchPercentage: 82,
    isFavorite: false,
    availableSeats: 8,
    bookingUrl: 'https://tickets.example.com/event/evt_2',
    venue: {
      id: 'ven_2',
      name: 'QuestHouse Moscow',
      description: 'Лучшие квесты в центре Москвы',
      facilities: ['Раздевалка', 'Фотозона'],
    },
    schedule: [
      { date: '2025-03-16', time: '18:00', availableSeats: 4 },
      { date: '2025-03-16', time: '20:00', availableSeats: 4 },
    ],
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z',
  },
  {
    id: 'evt_3',
    title: 'Интерстеллар',
    description: 'Культовый фильм Кристофера Нолана на большом экране IMAX. Путешествие сквозь червоточину в поисках нового дома для человечества.',
    category: 'cinema',
    image: GRADIENTS[2],
    gallery: [GRADIENTS[2], GRADIENTS[6]],
    location: {
      name: 'Кинотеатр "Октябрь"',
      address: 'Новый Арбат, 24',
      coordinates: { lat: 55.7522, lng: 37.5849 },
      distance: 1.8,
    },
    datetime: { date: '2025-03-18', time: '20:00', duration: '2 ч 49 мин' },
    price: { from: 650, to: 1200, currency: 'RUB' },
    rating: 4.8,
    reviewCount: 524,
    tags: ['Фантастика', 'IMAX', 'Драма'],
    matchPercentage: 90,
    isFavorite: false,
    venue: {
      id: 'ven_3',
      name: 'Кинотеатр "Октябрь"',
      description: 'Легендарный кинотеатр с IMAX залом',
      facilities: ['IMAX', 'Бар', 'Парковка'],
    },
    schedule: [
      { date: '2025-03-18', time: '20:00', availableSeats: 150 },
    ],
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-01-20T12:00:00Z',
  },
  {
    id: 'evt_4',
    title: 'Концерт Земфиры',
    description: 'Долгожданный концерт Земфиры с новой программой. Хиты и новые песни в авторском исполнении.',
    category: 'concert',
    image: GRADIENTS[3],
    gallery: [GRADIENTS[3], GRADIENTS[5]],
    location: {
      name: 'Crocus City Hall',
      address: 'МКАД 65-66 км',
      coordinates: { lat: 55.8224, lng: 37.3857 },
      distance: 15.2,
    },
    datetime: { date: '2025-03-28', time: '20:00', duration: '2.5 часа' },
    price: { from: 3500, to: 12000, currency: 'RUB' },
    rating: 4.6,
    reviewCount: 98,
    tags: ['Рок', 'Инди', 'Живой звук'],
    matchPercentage: 78,
    isFavorite: false,
    availableSeats: 340,
    bookingUrl: 'https://tickets.example.com/event/evt_4',
    venue: {
      id: 'ven_4',
      name: 'Crocus City Hall',
      description: 'Одна из крупнейших концертных площадок',
      facilities: ['Парковка', 'Гардероб', 'Бар', 'VIP-зона'],
    },
    schedule: [
      { date: '2025-03-28', time: '20:00', availableSeats: 340 },
    ],
    createdAt: '2025-01-08T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'evt_5',
    title: 'Stand Up: Открытый микрофон',
    description: 'Вечер стендапа с начинающими и опытными комиками. Непредсказуемый юмор и живая энергия зала.',
    category: 'standup',
    image: GRADIENTS[4],
    gallery: [GRADIENTS[4]],
    location: {
      name: 'StandUp Club #1',
      address: 'ул. Покровка, 16/1',
      coordinates: { lat: 55.7600, lng: 37.6500 },
      distance: 4.5,
    },
    datetime: { date: '2025-03-22', time: '21:00', duration: '2 часа' },
    price: { from: 800, to: 1500, currency: 'RUB' },
    rating: 4.5,
    reviewCount: 76,
    tags: ['Комедия', '18+', 'Живое выступление'],
    matchPercentage: 70,
    isFavorite: false,
    availableSeats: 35,
    venue: {
      id: 'ven_5',
      name: 'StandUp Club #1',
      description: 'Клуб стендап-комедии',
      facilities: ['Бар', 'Еда'],
    },
    schedule: [
      { date: '2025-03-22', time: '21:00', availableSeats: 35 },
    ],
    createdAt: '2025-01-14T16:00:00Z',
    updatedAt: '2025-01-19T11:00:00Z',
  },
  {
    id: 'evt_6',
    title: 'Выставка Айвазовского',
    description: 'Масштабная ретроспектива работ великого мариниста. Более 200 полотен из музеев России и частных коллекций.',
    category: 'exhibition',
    image: GRADIENTS[5],
    gallery: [GRADIENTS[5], GRADIENTS[7]],
    location: {
      name: 'Третьяковская галерея',
      address: 'Лаврушинский пер., 10',
      coordinates: { lat: 55.7415, lng: 37.6208 },
      distance: 3.7,
    },
    datetime: { date: '2025-03-01', time: '10:00', duration: '2 часа', endDate: '2025-04-15' },
    price: { from: 500, to: 800, currency: 'RUB' },
    rating: 4.9,
    reviewCount: 412,
    tags: ['Живопись', 'Классика', 'Культура'],
    matchPercentage: 85,
    isFavorite: false,
    venue: {
      id: 'ven_6',
      name: 'Третьяковская галерея',
      description: 'Главный художественный музей страны',
      facilities: ['Гардероб', 'Кафе', 'Сувенирный магазин', 'Аудиогид'],
    },
    schedule: [
      { date: '2025-03-01', time: '10:00', availableSeats: 200 },
    ],
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-20T15:00:00Z',
  },
];

// ─── Favorites Store (with localStorage persistence) ─────

const FAVORITES_KEY = 'fp_favorites';

function loadFavorites(): Set<string> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch { /* ignore */ }
  return new Set();
}

function saveFavorites(favs: Set<string>): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
}

export const favoritesStore = {
  _favorites: loadFavorites(),

  has(eventId: string): boolean {
    return this._favorites.has(eventId);
  },

  add(eventId: string): void {
    this._favorites.add(eventId);
    saveFavorites(this._favorites);
  },

  remove(eventId: string): void {
    this._favorites.delete(eventId);
    saveFavorites(this._favorites);
  },

  getAll(): string[] {
    return [...this._favorites];
  },
};

// Mark initially favorited events
export function getEventsWithFavorites(): Event[] {
  return mockEvents.map((e) => ({
    ...e,
    isFavorite: favoritesStore.has(e.id),
  }));
}

export function getEventById(id: string): EventDetail | undefined {
  const event = mockEvents.find((e) => e.id === id);
  if (!event) return undefined;
  return { ...event, isFavorite: favoritesStore.has(event.id) };
}

export function getFavoriteEvents(): FavoriteEvent[] {
  return favoritesStore
    .getAll()
    .map((id) => mockEvents.find((e) => e.id === id))
    .filter((e): e is EventDetail => !!e)
    .map((e) => ({
      ...e,
      isFavorite: true,
      addedAt: new Date().toISOString(),
    }));
}

// ─── Mock User ───────────────────────────────────────────

export const mockUser: UserProfile = {
  id: 'usr_abc123',
  email: 'alexey@example.com',
  name: 'Алексей Иванов',
  avatar: null,
  location: 'Москва, Россия',
  preferences: {
    categories: ['theatre', 'cinema', 'concert'],
    budget: 'medium',
    searchRadius: 5,
  },
  notifications: {
    push: true,
    emailDigest: true,
  },
  hasCompletedQuiz: true,
  createdAt: '2025-01-15T10:30:00Z',
  updatedAt: '2025-01-20T14:00:00Z',
};
