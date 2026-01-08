import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const isLoggedIn = this.authService.isLoggedIn();
    const requiredRole = route.data['role']; // e.g. STUDENT / TEACHER / ADMIN
    const userRole = this.authService.getUserRole();

    if (!isLoggedIn) {
      alert('⚠️ Please sign in first!');
      return this.router.parseUrl('/sign-in/STUDENT'); // default redirect
    }

    if (requiredRole) {
      const normalizedUserRole = userRole ? userRole.toUpperCase().replace('ROLE_', '') : '';
      const normalizedRequiredRole = requiredRole.toUpperCase().replace('ROLE_', '');
      if (normalizedUserRole !== normalizedRequiredRole) {
        alert(`🚫 Access denied! Only ${normalizedRequiredRole} users can access this page.`);
        return this.router.parseUrl('/');
      }
    }

    return true;
  }
}
