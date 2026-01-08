import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * 🔒 Global HTTP Interceptor
 * Automatically attaches JWT Bearer Token to every API request.
 * Handles token expiry and unauthorized responses globally.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 🔑 Retrieve token from localStorage (or AuthService if you prefer)
    const token = localStorage.getItem('token');

    // ✅ Clone and attach Authorization header if token exists
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // ✅ Handle errors globally (optional but useful)
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('⚠️ Unauthorized or expired token detected.');
          // Optionally redirect to login:
          // window.location.href = '/sign-in/student';
        }
        return throwError(() => error);
      })
    );
  }
}
