import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VehicleDTO, Page } from '../../models/types';

/**
 * Servicio para consumir el endpoint de vehículos.
 * GET público · POST/PUT/DELETE requieren rol MANAGER+.
 */
@Injectable({ providedIn: 'root' })
export class VehicleService {

  private readonly base = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  // ─── GET (público) ────────────────────────────────────────────────────────

  /** Obtiene el catálogo paginado con filtros opcionales. */
  getAll(
    page = 0,
    size = 9,
    sort = 'brand',
    filters: { model?: string; horsePower?: number } = {}
  ): Observable<Page<VehicleDTO>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    if (filters.model)      params = params.set('model', filters.model);
    if (filters.horsePower) params = params.set('horsePower', filters.horsePower);
    return this.http.get<Page<VehicleDTO>>(this.base, { params });
  }

  getById(id: number): Observable<VehicleDTO> {
    return this.http.get<VehicleDTO>(`${this.base}/${id}`);
  }

  // ─── WRITE (MANAGER+) ─────────────────────────────────────────────────────

  // TODO (Día 7): implementar create / update con multipart/form-data
  create(formData: FormData): Observable<VehicleDTO> {
    return this.http.post<VehicleDTO>(this.base, formData);
  }

  update(id: number, formData: FormData): Observable<VehicleDTO> {
    return this.http.put<VehicleDTO>(`${this.base}/${id}`, formData);
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.base}/${id}`);
  }
}
