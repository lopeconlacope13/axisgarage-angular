import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnerDTO, Page } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Servicio para consumir el endpoint de propietarios de vehículos.
 * Requiere rol MANAGER o ADMIN para todas las operaciones.
 */
@Injectable({ providedIn: 'root' })
export class OwnerService {

  private readonly base = `${environment.apiUrl}/owners`;

  constructor(private http: HttpClient) {}

  /** Devuelve la lista paginada de todos los propietarios registrados. */
  getAll(page = 0, size = 20): Observable<Page<OwnerDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<OwnerDTO>>(this.base, { params });
  }
}
