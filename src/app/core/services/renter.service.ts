import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RenterDTO, Page } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Servicio para consumir el endpoint de clientes (Renters).
 * GET de lista disponible para todos los roles autenticados.
 * POST/PUT/DELETE requieren MANAGER o ADMIN.
 */
@Injectable({ providedIn: 'root' })
export class RenterService {

  private readonly base = `${environment.apiUrl}/renters`;

  constructor(private http: HttpClient) {}

  /** Devuelve la lista paginada de todos los clientes registrados. */
  getAll(page = 0, size = 20): Observable<Page<RenterDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<RenterDTO>>(this.base, { params });
  }

  /** Busca el perfil de cliente por email. Usado en el flujo de checkout. */
  getByEmail(email: string): Observable<RenterDTO> {
    return this.http.get<RenterDTO>(`${this.base}/by-email`, { params: { email } });
  }

  /**
   * Crea el perfil de Renter del usuario autenticado si no existe todavía.
   * Operación idempotente: si ya existe, devuelve el existente sin error.
   * El backend deduce el email del JWT, por lo que no se envía body.
   */
  ensure(): Observable<RenterDTO> {
    return this.http.post<RenterDTO>(`${this.base}/ensure`, {});
  }
}
