/**
 * Telegram WebApp SDK integration module.
 *
 * Provides safe access to Telegram WebApp API with fallbacks
 * for browser development outside Telegram.
 */

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
    hash?: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    setText(text: string): void;
    setParams(params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  platform: string;
  version: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const FAKE_USER: TelegramUser = {
  id: 123456789,
  first_name: 'Алексей',
  last_name: 'Иванов',
  username: 'alexey_dev',
  language_code: 'ru',
};

let tg: TelegramWebApp | undefined;

export function initTelegram(): void {
  tg = window.Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();
  }
}

export function isTelegram(): boolean {
  return !!window.Telegram?.WebApp?.initData;
}

export function getInitData(): string {
  return tg?.initData ?? '';
}

/**
 * Get user info from Telegram initDataUnsafe.
 * WARNING: Only for UI display in dev/demo. In production, initData must be
 * verified server-side before trusting user identity.
 *
 * TODO: In production, exchange initData for a JWT via backend POST /auth/social
 * with server-side signature verification (HMAC-SHA-256 with bot token).
 */
export function getUserUnsafe(): TelegramUser | null {
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user;
  }

  if (import.meta.env.VITE_DEV_FAKE_TELEGRAM_USER === 'true') {
    return FAKE_USER;
  }

  return null;
}

export function applyTheme(): void {
  if (!tg) return;

  const params = tg.themeParams;
  const root = document.documentElement;

  // Telegram provides theme params — we can override CSS custom properties.
  // In the current dark glassmorphic design, we only apply minimal overrides
  // so the design stays consistent.
  if (params.bg_color) {
    root.style.setProperty('--tg-bg-color', params.bg_color);
  }
  if (params.text_color) {
    root.style.setProperty('--tg-text-color', params.text_color);
  }
  if (params.hint_color) {
    root.style.setProperty('--tg-hint-color', params.hint_color);
  }
}

export function setupBackButton(handler: () => void): void {
  if (!tg) return;
  tg.BackButton.onClick(handler);
}

export function setBackButtonVisible(visible: boolean): void {
  if (!tg) return;
  if (visible) {
    tg.BackButton.show();
  } else {
    tg.BackButton.hide();
  }
}

export function setupMainButton(options: {
  text: string;
  color?: string;
  onClick: () => void;
}): void {
  if (!tg) return;

  tg.MainButton.setParams({
    text: options.text,
    color: options.color,
    is_visible: true,
    is_active: true,
  });
  tg.MainButton.onClick(options.onClick);
}

export function hideMainButton(): void {
  if (!tg) return;
  tg.MainButton.hide();
}

export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  } else if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}
