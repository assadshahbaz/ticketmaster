import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { appConfig } from './app.config';
import { API_URL } from './tokens/api-url.token';
import { environment } from '../environments/environment';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(serverRoutes),
    { provide: API_URL, useValue: process.env['API_INTERNAL_URL'] || environment.apiUrl },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
