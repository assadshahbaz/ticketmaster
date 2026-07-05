import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { API_URL } from './tokens/api-url.token';
import { environment } from '../environments/environment';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: API_URL, useValue: process.env['API_INTERNAL_URL'] || environment.apiUrl },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
