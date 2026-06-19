import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public pricingModalOpen$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  // Dummy JWT para simular autenticación exitosa (ADMIN)
  private dummyAdminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGVzIjpbIlJPTEVfQURNSU4iXX0.dummy_signature';
  // Dummy JWT para simular autenticación exitosa (USER)
  private dummyUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQHRlc3QuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl19.dummy_signature';

  login(credentials: any): Observable<any> {
    if (credentials.email === 'admin@lexia.com') {
      return of({ token: this.dummyAdminToken }).pipe(delay(800));
    }
    return of({ token: this.dummyUserToken }).pipe(delay(800));
  }

  register(user: any): Observable<any> {
    return of('Usuario registrado exitosamente').pipe(delay(800));
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return of({ token: this.dummyUserToken }).pipe(delay(800));
  }

  forgotPassword(email: string): Observable<any> {
    return of('Enlace de recuperación enviado').pipe(delay(800));
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return of('Contraseña restablecida').pipe(delay(800));
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.sub,
        name: payload.sub.split('@')[0], 
        isAdmin: payload.roles && payload.roles.includes('ROLE_ADMIN')
      };
    } catch (e) {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userPlan');
  }

  getUserPlan(): string {
    return localStorage.getItem('userPlan') || 'Gratuito';
  }

  setUserPlan(plan: string): void {
    localStorage.setItem('userPlan', plan);
  }
}
