import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8082/api/auth';
  private roleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** ✅ Register new user */
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, data, { responseType: 'text' });
  }

  /** ✅ Login user */
  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signin`, data);
  }

  /** ✅ Normalize role to uppercase and remove prefix */
  private normalizeRole(role: string | null | undefined): string | null {
    if (!role) return null;
    let r = role.toString().trim().toUpperCase();
    if (r.startsWith('ROLE_')) r = r.replace('ROLE_', '');
    return r;
  }

  /** ✅ Save JWT token and normalized user info */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
    try {
      const decoded: any = jwtDecode(token);
      const rawRole =
        decoded.role ||
        decoded.roles ||
        decoded.authorities?.[0]?.authority ||
        decoded.auth?.[0] ||
        'UNKNOWN';

      const user = {
        username: decoded.sub || decoded.username || 'Unknown',
        role: this.normalizeRole(rawRole)
      };

      localStorage.setItem('user', JSON.stringify(user));
      this.roleSubject.next(user.role);
      console.log('✅ Token saved with role:', user.role);
    } catch (error) {
      console.error('❌ Token decoding failed:', error);
    }
  }

  /** ✅ Get JWT token */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** ✅ Logout user */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.roleSubject.next(null);
  }

  /** ✅ Decode token safely */
  decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  /** ✅ Check if user is logged in */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** ✅ Get normalized user role (TEACHER/STUDENT/ADMIN) */
  getUserRole(): string | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return this.normalizeRole(user.role);
    }
    const decoded = this.decodeToken();
    if (!decoded) return null;
    return this.normalizeRole(
      decoded.role || decoded.roles || decoded.authorities?.[0]?.authority
    );
  }

  /** ✅ Get username */
  getUsername(): string | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.username || null;
    }
    const decoded = this.decodeToken();
    return decoded ? decoded.sub || decoded.username || null : null;
  }
}
