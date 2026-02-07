/**
 * MSW browser setup — only activated when VITE_MOCK_API=true.
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
