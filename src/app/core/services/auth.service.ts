import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { configuration } from '../../config/configuration';
import { AuthResponse, LoginRequest, RegisterRequest, UserDTO } from '../../models/types';
import { jwtDecode } from 'jwt-decode';

/**
 * SERVICIO DE AUTENTICACIÓN
 * ---------------------------------------------------------
 * Este archivo centraliza TODO lo que tiene que ver con el usuario.
 * @Injectable 'root' significa que Angular crea una sola instancia (un Singleton)
 * de esta clase para toda la aplicación. Si el usuario se loguea aquí, todos los
 * demás componentes lo saben al momento.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  /**
   * BehaviorSubject es como una variable especial de RXJS (Programación Reactiva).
   * A diferencia de una variable normal (let x = 0), un BehaviorSubject permite a otros
   * componentes "suscribirse" y avisarles automáticamente cada vez que el valor cambia.
   * Lo inicializamos leyendo el token del LocalStorage (por si cerramos el navegador y volvemos).
   */
  private token$ = new BehaviorSubject<string | null>(
    localStorage.getItem(configuration.KEY_TOKEN)
  );

  /**
   * INYECCIÓN DE DEPENDENCIAS
   * @param http   Servicio nativo de Angular para hacer peticiones GET/POST al backend (Spring Boot).
   * @param router Servicio nativo de Angular para mover al usuario entre pantallas.
   */
  constructor(private http: HttpClient, private router: Router) {}

  // ─── LOGIN ────────────────────────────────────────────────────────────────

  /**
   * Envía el email y contraseña al backend de Spring Boot.
   * 
   * @param email    Email introducido en el formulario (login.component.ts)
   * @param password Contraseña plana (Spring Boot se encargará de desencriptarla y verificarla)
   * @returns        Devuelve un Observable (Promesa asíncrona) con la respuesta de Spring (el Token JWT)
   */
  login(email: string, password: string): Observable<AuthResponse> {
    // 1. Preparamos el cuerpo de la petición (JSON)
    const body: LoginRequest = { email, password };
    
    // 2. Hacemos la petición POST a /api/v1/authenticate
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/v1/authenticate`,
      body,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      // 3. (tap) intercepta la respuesta correcta ANTES de devolvérsela al componente Login.
      // Aquí guardamos el token sin bloquear el flujo original.
      tap(res => this.setToken(res.token))
    );
  }

  // ─── REGISTRO ─────────────────────────────────────────────────────────────

  /**
   * REGISTRO DE NUEVO USUARIO
   * ---------------------------------------------------------
   * Envía los datos del formulario al endpoint POST /api/v1/register.
   * El backend devuelve el UserDTO del usuario creado (sin token).
   * Tras el registro, el usuario debe hacer login para obtener su JWT.
   *
   * @param data Objeto RegisterRequest con firstName, lastName, email y password
   * @returns    Observable<UserDTO> con los datos del usuario recién creado
   */
  register(data: RegisterRequest): Observable<UserDTO> {
    return this.http.post<UserDTO>(
      `${environment.apiUrl}/v1/register`,
      data,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }

  // ─── GESTIÓN DEL TOKEN ────────────────────────────────────────────────────

  /** 
   * Guarda el token en memoria RAM local (para BehaviorSubject) 
   * y en el disco duro del navegador (LocalStorage) para cerrar/abrir pestaña.
   */
  setToken(token: string): void {
    localStorage.setItem(configuration.KEY_TOKEN, token);
    this.token$.next(token); // Avisamos a todos los componentes de que hay token nuevo
  }

  /** Devuelve el token crudo en string */
  getToken(): string | null {
    return localStorage.getItem(configuration.KEY_TOKEN);
  }

  /**
   * Transforma el token$ en un Observable booleano (true o false).
   * Útil para poner un *ngIf en el menú superior para mostrar "Cerrar sesión" o "Iniciar sesión"
   */
  isLoggedIn(): Observable<boolean> {
    // Con 'map' cogemos el valor del token y le aplicamos !! (doble negación)
    // Básicamente convierte algo que existe (string) en 'true', y nulo en 'false'
    return this.token$.asObservable().pipe(map(t => !!t));
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────

  /** Borra el token y echa al usuario de vuelta a la Landing Page */
  logout(): void {
    localStorage.removeItem(configuration.KEY_TOKEN); // Borramos el disco duro
    localStorage.removeItem(configuration.KEY_USER); 
    this.token$.next(null); // Avisamos a la app de que ya no hay usuario
    this.router.navigate(['/']); // Redirigimos a la raíz /
  }

  // ─── OBTENCIÓN DE DATOS ───────────────────────────────────────────────────

  /** 
   * Extrae quién es el usuario directamente leyendo desde el string del token JWT.
   * (El token tiene tres partes separadas por puntos, el payload está en base64 y 'jwt-decode' lo lee).
   */
  getEmail(): string | null {
    const token = this.getToken();
    if (!token) return null; // Si no hay token, fuera
    
    try {
      // Usamos la librería jwt-decode para descifrar el token sin necesidad del backend
      const decoded: any = jwtDecode(token);
      return decoded?.sub ?? null; // 'sub' es la clave que Spring Boot asigna al CustomUserDetailsService
    } catch {
      return null;
    }
  }

  /**
   * Extrae info básica (email, inicial, roles) sincrónicamente del token actual.
   * Ideal para la cabecera del Navbar.
   */
  getCurrentUser(): { email: string, roles: string[], initial: string } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      const email = decoded?.sub ?? '';
      const roles = decoded?.roles ?? [];
      const initial = email ? email.charAt(0).toUpperCase() : 'U';
      return { email, roles, initial };
    } catch {
      return null;
    }
  }

  /** Llama a un endpoint protegido en Spring Boot para que te devuelva el DTO User (Roles, nombres, tlf, etc.) */
  getProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${environment.apiUrl}/user`);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * El JWT interceptor añade el token automáticamente, así que no hace falta adjuntarlo aquí.
   *
   * @param currentPassword Contraseña actual (para verificarla en el backend).
   * @param newPassword     Nueva contraseña que se guardará hasheada.
   */
  changePassword(currentPassword: string, newPassword: string): Observable<string> {
    return this.http.put(
      `${environment.apiUrl}/user/change-password`,
      { currentPassword, newPassword },
      // responseType 'text' evita que Angular intente parsear la respuesta como JSON.
      // El backend devuelve un string plano (ej: "Contraseña actualizada"), no un objeto JSON.
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }), responseType: 'text' as const }
    );
  }

  /**
   * Sube la foto de perfil del usuario al backend.
   * Usa FormData para enviar el archivo como multipart/form-data.
   * El interceptor JWT añade el token en la cabecera automáticamente.
   *
   * @param file Archivo de imagen seleccionado por el usuario.
   * @returns Observable con el UserDTO actualizado, que incluye el campo 'image'.
   */
  uploadAvatar(file: File): Observable<UserDTO> {
    const formData = new FormData();
    // El backend espera el archivo con el parámetro llamado "file"
    formData.append('file', file);
    return this.http.post<UserDTO>(`${environment.apiUrl}/user/avatar`, formData);
  }
}
