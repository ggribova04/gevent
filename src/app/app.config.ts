import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import routeConfig from './routes';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';

registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routeConfig), // Настройка маршрутизации с указанными путями
    provideHttpClient(), // HttpClient
    { provide: LOCALE_ID, useValue: 'ru' } // Устанавливаем локаль приложения
  ]
};