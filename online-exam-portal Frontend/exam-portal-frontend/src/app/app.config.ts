import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth-interceptor';

/**
 * 🧩 Global Angular Configuration
 * Registers routes, HttpClient (with fetch API + DI-based interceptors),
 * and the AuthInterceptor for JWT authentication.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ Routing
    provideRouter(routes),

    // ✅ HttpClient setup
    provideHttpClient(
      withFetch(),                // use browser fetch API internally
      withInterceptorsFromDi()    // enable dependency-injected interceptors
    ),

    // ✅ Global JWT Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
