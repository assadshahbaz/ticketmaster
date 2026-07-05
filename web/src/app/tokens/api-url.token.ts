import { InjectionToken } from '@angular/core';

// Provided differently per platform: app.config.ts (browser) supplies the
// public URL, app.config.server.ts (SSR) supplies the Docker-internal URL —
// since "localhost" inside the web container doesn't resolve to the api container.
export const API_URL = new InjectionToken<string>('API_URL');
