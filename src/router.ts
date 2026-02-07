/**
 * Minimal hash-based router for the SPA.
 *
 * Routes:
 *   #/          → Home
 *   #/events    → Events list
 *   #/event/:id → Event detail
 *   #/favorites → Favorites
 */

export interface Route {
  pattern: RegExp;
  handler: (params: Record<string, string>) => void | Promise<void>;
}

const routes: Route[] = [];

export function addRoute(
  pattern: string,
  handler: (params: Record<string, string>) => void | Promise<void>,
): void {
  // Convert pattern like '/event/:id' to regex with named groups
  const regexStr = pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)');
  routes.push({
    pattern: new RegExp(`^${regexStr}$`),
    handler,
  });
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function getCurrentPath(): string {
  return window.location.hash.slice(1) || '/';
}

let previousPath = '';

export function getPreviousPath(): string {
  return previousPath;
}

export function resolve(): void {
  const path = getCurrentPath();
  previousPath = path;

  for (const route of routes) {
    const match = path.match(route.pattern);
    if (match) {
      route.handler(match.groups ?? {});
      return;
    }
  }

  // Fallback: redirect to home
  navigate('/');
}

export function startRouter(): void {
  window.addEventListener('hashchange', () => resolve());

  // Initial route
  if (!window.location.hash) {
    window.location.hash = '/';
  } else {
    resolve();
  }
}

export function goBack(): void {
  // Simple back: if we have history, go back; otherwise go home
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigate('/');
  }
}
