/**
 * Favorites screen — loads user's favorited events from API.
 * Allows removing from favorites with animation.
 */

import { getFavorites, removeFavorite } from '../api';
import { navigate } from '../router';
import { hapticFeedback } from '../telegram/telegram';
import { bottomNav, setupNavLinks } from './home';
import type { FavoriteEvent } from '../api/generated';

const CATEGORY_EMOJI: Record<string, string> = {
  theatre: '🎭 Театр',
  cinema: '🎬 Кино',
  quest: '🔐 Квест',
  concert: '🎤 Концерт',
  standup: '🎙️ Стендап',
  exhibition: '🖼️ Выставка',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatPrice(price: { from: number }): string {
  return `от ${price.from.toLocaleString('ru-RU')} ₽`;
}

function pluralize(n: number): string {
  if (n === 1) return 'событие';
  if (n >= 2 && n <= 4) return 'события';
  return 'событий';
}

function renderFavoriteCard(event: FavoriteEvent): string {
  const catLabel = CATEGORY_EMOJI[event.category] ?? event.category;
  const dateLabel = formatDate(event.datetime.date) + ', ' + event.datetime.time;
  const priceLabel = formatPrice(event.price);

  return `
    <div class="card" data-event-id="${event.id}">
      <div class="card-image" style="cursor: pointer;" data-navigate="/event/${event.id}">
        <div style="width: 100%; height: 100%; background: ${event.image};"></div>
        <button class="card-favorite btn btn-icon-sm liked" style="background: var(--color-accent-primary); color: white; box-shadow: var(--glow-primary);" data-unfav-id="${event.id}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div class="card-image-overlay">
          <h3 class="card-title">${event.title}</h3>
          <div class="flex items-center gap-sm text-sm" style="opacity: 0.9;">
            <span>${catLabel}</span>
            <span>•</span>
            <span>${dateLabel}</span>
            <span>•</span>
            <span>${priceLabel}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSkeleton(): string {
  return Array.from({ length: 3 }, () => `
    <div class="card">
      <div class="card-image skeleton" style="height: 200px;"></div>
    </div>
  `).join('');
}

export async function renderFavorites(app: HTMLElement): Promise<void> {
  app.innerHTML = `
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="page has-bottom-nav">
      <div class="container">
        <header class="page-header">
          <h1 class="heading-3">Избранное</h1>
          <span class="text-muted text-sm" id="favCount"></span>
        </header>

        <div class="page-content">
          <section class="section">
            <div class="list stagger-children" id="favList">
              ${renderSkeleton()}
            </div>

            <!-- Empty state -->
            <div id="emptyState" style="display: none;" class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p class="text-muted mb-md">У вас пока нет избранных событий</p>
              <button class="btn btn-secondary" id="browseBtn">Найти события</button>
            </div>

            <!-- Error state -->
            <div id="errorState" style="display: none;" class="error-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p class="text-muted mb-md">Не удалось загрузить избранное</p>
              <button class="btn btn-secondary" id="retryBtn">Попробовать снова</button>
            </div>
          </section>

          <!-- Tip -->
          <div id="tipSection" style="display: none;">
            <section class="section">
              <div class="glass p-md" style="background: linear-gradient(135deg, rgba(255, 217, 61, 0.15) 0%, rgba(255, 107, 157, 0.1) 100%);">
                <div class="flex gap-md items-center">
                  <div style="font-size: 24px;">💡</div>
                  <p class="text-sm">
                    <strong>Совет:</strong> Нажмите на сердечко, чтобы убрать событие из избранного
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      ${bottomNav('favorites')}
    </div>
  `;

  setupNavLinks(app);

  app.querySelector('#browseBtn')?.addEventListener('click', () => navigate('/events'));
  app.querySelector('#retryBtn')?.addEventListener('click', () => loadFavorites());

  async function loadFavorites() {
    const listEl = app.querySelector('#favList') as HTMLElement;
    const emptyEl = app.querySelector('#emptyState') as HTMLElement;
    const errorEl = app.querySelector('#errorState') as HTMLElement;
    const countEl = app.querySelector('#favCount') as HTMLElement;
    const tipEl = app.querySelector('#tipSection') as HTMLElement;

    listEl.innerHTML = renderSkeleton();
    listEl.style.display = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';
    tipEl.style.display = 'none';

    try {
      const result = await getFavorites();

      if (result.data.length === 0) {
        listEl.style.display = 'none';
        emptyEl.style.display = '';
        countEl.textContent = '0 событий';
        return;
      }

      countEl.textContent = `${result.data.length} ${pluralize(result.data.length)}`;
      listEl.innerHTML = result.data.map(renderFavoriteCard).join('');
      tipEl.style.display = '';

      // Wire up card navigation
      listEl.querySelectorAll('[data-navigate]').forEach((el) => {
        el.addEventListener('click', (e) => {
          if ((e.target as HTMLElement).closest('.card-favorite')) return;
          e.preventDefault();
          navigate((el as HTMLElement).dataset.navigate!);
        });
      });

      // Wire up unfavorite buttons
      listEl.querySelectorAll('[data-unfav-id]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();

          const el = btn as HTMLElement;
          const eventId = el.dataset.unfavId!;
          const card = el.closest('.card') as HTMLElement;

          hapticFeedback('light');

          // Create particles
          const container = document.createElement('div');
          container.className = 'like-particles';
          el.appendChild(container);
          for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'like-particle';
            const angle = (i / 8) * Math.PI * 2;
            const distance = 25 + Math.random() * 15;
            particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            container.appendChild(particle);
          }

          try {
            await removeFavorite(eventId);

            // Animate removal
            setTimeout(() => {
              card.classList.add('removing');
              setTimeout(() => {
                card.remove();
                // Update count
                const remaining = listEl.querySelectorAll('.card').length;
                countEl.textContent = `${remaining} ${pluralize(remaining)}`;

                if (remaining === 0) {
                  listEl.style.display = 'none';
                  emptyEl.style.display = '';
                  tipEl.style.display = 'none';
                }
              }, 400);
            }, 200);
          } catch (err) {
            console.error('Failed to remove favorite:', err);
          }
        });
      });
    } catch (err) {
      console.error('Failed to load favorites:', err);
      listEl.style.display = 'none';
      errorEl.style.display = '';
      countEl.textContent = '';
    }
  }

  await loadFavorites();
}
