/**
 * Event Detail screen — loads single event from API, shows full details.
 * Like/favorite toggle, gallery, reviews section.
 */

import { getEvent, addFavorite, removeFavorite } from '../api';
import { navigate, goBack } from '../router';
import { hapticFeedback, setBackButtonVisible, setupBackButton } from '../telegram/telegram';
import type { EventDetail } from '../api/generated';

const CATEGORY_EMOJI: Record<string, string> = {
  theatre: '🎭 Театр',
  cinema: '🎬 Кино',
  quest: '🔐 Квест',
  concert: '🎤 Концерт',
  standup: '🎙️ Стендап',
  exhibition: '🖼️ Выставка',
};

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${days[d.getDay()]}`;
}

export async function renderEventDetail(app: HTMLElement, eventId: string): Promise<void> {
  // Show Telegram back button
  setBackButtonVisible(true);
  setupBackButton(() => goBack());

  // Loading state
  app.innerHTML = `
    <div class="bg-orbs">
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <div class="page">
      <div class="container">
        <div class="card-hero">
          <div class="skeleton" style="width: 100%; height: 300px;"></div>
        </div>
        <div class="page-content" style="padding-top: var(--space-lg);">
          <div class="skeleton" style="height: 24px; width: 60%; margin-bottom: var(--space-md);"></div>
          <div class="skeleton" style="height: 18px; width: 40%; margin-bottom: var(--space-lg);"></div>
          <div class="skeleton" style="height: 120px; margin-bottom: var(--space-md);"></div>
          <div class="skeleton" style="height: 80px;"></div>
        </div>
      </div>
    </div>
  `;

  try {
    const event = await getEvent(eventId);
    renderDetail(app, event);
  } catch (err) {
    console.error('Failed to load event:', err);
    app.innerHTML = `
      <div class="bg-orbs">
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="page">
        <div class="container">
          <header class="page-header">
            <a href="#/events" class="back-btn" id="backBtn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              <span>Назад</span>
            </a>
          </header>
          <div class="page-content">
            <div class="error-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p class="text-muted mb-md">Событие не найдено</p>
              <button class="btn btn-secondary" id="goBackBtn">Вернуться к списку</button>
            </div>
          </div>
        </div>
      </div>
    `;
    app.querySelector('#backBtn')?.addEventListener('click', (e) => { e.preventDefault(); goBack(); });
    app.querySelector('#goBackBtn')?.addEventListener('click', () => navigate('/events'));
  }
}

function renderDetail(app: HTMLElement, event: EventDetail): void {
  const catLabel = CATEGORY_EMOJI[event.category] ?? event.category;
  const likeBtnClass = event.isFavorite ? 'liked' : '';
  const fillAttr = event.isFavorite ? 'currentColor' : 'none';

  const gallerySlides = (event.gallery.length > 0 ? event.gallery : [event.image])
    .map((bg, i) => `
      <div class="gallery-slide" data-index="${i}">
        <div style="width: 100%; height: 100%; background: ${bg};"></div>
      </div>
    `).join('');

  const galleryDots = (event.gallery.length > 0 ? event.gallery : [event.image])
    .map((_, i) => `<div class="gallery-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`)
    .join('');

  const priceDisplay = event.price.from.toLocaleString('ru-RU');

  app.innerHTML = `
    <div class="bg-orbs">
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="page">
      <div class="container">
        <!-- Hero Image Gallery -->
        <div class="card-hero" id="heroGallery">
          <div class="gallery-container">
            <div class="gallery-track" id="galleryTrack">
              ${gallerySlides}
            </div>
          </div>
          <div class="card-hero-overlay">
            <button class="btn btn-icon glass" style="color: white;" id="backBtn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <div class="card-hero-actions">
              <button class="btn btn-icon like-btn ${likeBtnClass}" id="likeBtn" data-event-id="${event.id}">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="${fillAttr}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <div class="heart-particles">
                  <span class="heart-particle" style="--tx: -20px; --ty: -30px;">❤️</span>
                  <span class="heart-particle" style="--tx: 20px; --ty: -30px;">❤️</span>
                  <span class="heart-particle" style="--tx: -30px; --ty: 0px;">❤️</span>
                  <span class="heart-particle" style="--tx: 30px; --ty: 0px;">❤️</span>
                  <span class="heart-particle" style="--tx: -15px; --ty: 25px;">❤️</span>
                  <span class="heart-particle" style="--tx: 15px; --ty: 25px;">❤️</span>
                </div>
              </button>
            </div>
          </div>
          <div class="gallery-dots" id="galleryDots">${galleryDots}</div>
        </div>

        <div class="page-content">
          <!-- Title & Rating -->
          <section class="section">
            ${event.matchPercentage ? `
              <div class="flex items-center gap-sm mb-sm">
                <span class="tag tag-teal text-xs">${event.matchPercentage}% совпадение</span>
              </div>
            ` : ''}
            <h1 class="heading-2 mb-sm">${event.title}</h1>
            <div class="flex items-center gap-md text-muted">
              <div class="flex items-center gap-xs">
                <span style="color: #FFD700;">⭐</span>
                <span style="color: var(--color-text-primary); font-weight: 600;">${event.rating}</span>
                <span>(${event.reviewCount} отзывов)</span>
              </div>
              <span>•</span>
              <span>${catLabel}</span>
            </div>
          </section>

          <!-- Quick Info -->
          <section class="section">
            <div class="glass">
              <div class="info-list-item">
                <div class="info-list-icon" style="background: rgba(255, 107, 157, 0.2); color: var(--color-accent-primary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div class="info-list-content">
                  <div style="font-weight: 500;">${formatDateFull(event.datetime.date)}</div>
                  <div class="text-sm text-muted">${event.datetime.time}</div>
                </div>
              </div>

              <div class="info-list-item">
                <div class="info-list-icon" style="background: rgba(78, 205, 196, 0.2); color: var(--color-accent-secondary);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div class="info-list-content">
                  <div style="font-weight: 500;">${event.location.name}</div>
                  <div class="text-sm text-muted">${event.location.address}${event.location.distance ? ` • ${event.location.distance} км` : ''}</div>
                </div>
              </div>

              <div class="info-list-item">
                <div class="info-list-icon" style="background: rgba(167, 139, 250, 0.2); color: var(--color-accent-purple);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div class="info-list-content">
                  <div style="font-weight: 500;">${event.datetime.duration}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Price -->
          <section class="section">
            <div class="glass p-md flex justify-between items-center">
              <div>
                <div class="price-label">Билеты от</div>
                <div class="price-tag">${priceDisplay} ₽</div>
              </div>
              ${event.availableSeats ? `
                <div class="text-right">
                  <div class="text-sm text-muted">Осталось мест</div>
                  <div style="font-weight: 600; color: var(--color-accent-primary);">${event.availableSeats}</div>
                </div>
              ` : ''}
            </div>
          </section>

          <!-- About -->
          <section class="section">
            <h2 class="section-title mb-md">Описание</h2>
            <p class="text-muted" style="line-height: 1.7;">${event.description}</p>
          </section>

          <!-- Tags -->
          ${event.tags.length > 0 ? `
            <section class="section">
              <h2 class="section-title mb-md">Жанры и особенности</h2>
              <div class="tags flex-wrap">
                ${event.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
              </div>
            </section>
          ` : ''}

          <!-- Spacer for bottom button -->
          <div style="height: 100px;"></div>
        </div>

        <!-- Bottom Actions -->
        <div style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;">
          <div class="glass glass-strong" style="border-radius: 0; border-top: 1px solid var(--glass-border); padding: var(--space-md); padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom, 0px));">
            <div class="container" style="padding: 0;">
              <button class="btn btn-primary btn-full" id="buyBtn">
                Купить билет
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Wire up interactions
  setupGallery(app);
  setupLikeButton(app, event);

  app.querySelector('#backBtn')?.addEventListener('click', () => goBack());

  app.querySelector('#buyBtn')?.addEventListener('click', () => {
    if (event.bookingUrl) {
      window.open(event.bookingUrl, '_blank');
    }
  });
}

function setupGallery(app: HTMLElement): void {
  const track = app.querySelector('#galleryTrack') as HTMLElement | null;
  const dotsContainer = app.querySelector('#galleryDots') as HTMLElement | null;
  if (!track || !dotsContainer) return;

  const slides = track.querySelectorAll('.gallery-slide');
  const dots = dotsContainer.querySelectorAll('.gallery-dot');
  let currentSlide = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function goToSlide(index: number) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;
    track!.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt((dot as HTMLElement).dataset.index ?? '0'));
    });
  });

  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchmove', (e) => { touchEndX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', () => {
    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) > 50) {
      goToSlide(currentSlide + (delta > 0 ? 1 : -1));
    }
    touchStartX = 0;
    touchEndX = 0;
  });
}

function setupLikeButton(app: HTMLElement, event: EventDetail): void {
  const likeBtn = app.querySelector('#likeBtn') as HTMLElement | null;
  if (!likeBtn) return;

  let isLiked = event.isFavorite;

  likeBtn.addEventListener('click', async () => {
    hapticFeedback('medium');

    try {
      if (isLiked) {
        await removeFavorite(event.id);
        isLiked = false;
        likeBtn.classList.remove('liked', 'animating');
        likeBtn.querySelector('svg')?.setAttribute('fill', 'none');
      } else {
        await addFavorite(event.id);
        isLiked = true;
        likeBtn.classList.add('liked', 'animating');
        likeBtn.querySelector('svg')?.setAttribute('fill', 'currentColor');
        setTimeout(() => likeBtn.classList.remove('animating'), 600);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  });
}
