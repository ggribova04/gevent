import { bootstrapApplication, provideProtractorTestingSupport } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import routeConfig from './app/routes';
import { authInterceptorProvider } from './app/services/auth.interceptor';
import { cookieInterceptorProvider } from './app/services/cookie-interceptor';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';

registerLocaleData(localeRu);

bootstrapApplication(AppComponent, {
  providers: [
    provideProtractorTestingSupport(),
    provideRouter(routeConfig),
    provideHttpClient(withInterceptorsFromDi()),
    authInterceptorProvider,
    cookieInterceptorProvider,
    { provide: LOCALE_ID, useValue: 'ru' }
  ]
}).catch((err) => console.error(err));