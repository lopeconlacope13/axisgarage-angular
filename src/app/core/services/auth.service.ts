import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { configuration } from '../../config/configuration';
import { AuthResponse, LoginRequest, UserDTO } from '../../models/types';

// TODO (Día 2): instalar jwt-decode → npm install jwt-decode
// import { jwtDecode } from 'jwt-decode';

/**
 * Servicio de autenticación de Axis Garage.
 * Gestiona el ciclo de vida del JWT: login, logout, token y roles del usuario.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private token$ = new BehaviorSubject<string | null>(
    localStorage.getItem(configuration.KEY_TOKEN)
  );

  constructor(private http: HttpClient, private router: Router) {}

  // ─── Login ────────────────────────────────────────────────────────────────

  /**
   * Autentica al usuario contra el backend.
   * @param email    Email del usuario (no username).
   * @param password Contraseña en texto plano.
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/v1/authenticate`,
      body,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  // ─── Token ────────────────────────────────────────────────────────────────

  setToken(token: string): void {
    localStorage.setItem(configuration.KEY_TOKEN, token);
    this.token$.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem(configuration.KEY_TOKEN);
  }

  isLoggedIn(): Observable<boolean> {
    return this.token$.asObservable().pipe(map(t => !!t));
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem(configuration.KEY_TOKEN);
    localStorage.removeItem(configuration.KEY_USER);
    this.token$.next(null);
    this.router.navigate(['/']);
  }

  // ─── User info ────────────────────────────────────────────────────────────

  /**
   * Extrae el subject (email) del token JWT almacenado.
   * TODO (Día 2): implementar con jwtDecode cuando esté instalado.
   */
  getEmail(): string | null {
    // const token = this.getToken();
    // if (!token) return null;
    // try { return (jwtDecode<any>(token)).sub ?? null; } catch { return null; }
    return null; // placeholder
  }

  /** Obtiene el perfil del usuario logueado desde el backend. */
  getProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${environment.apiUrl}/user`);
  }
}
