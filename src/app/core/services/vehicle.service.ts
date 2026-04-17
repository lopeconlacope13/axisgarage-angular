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
    filters: { brand?: string; model?: string; horsePower?: number; categoryId?: number } = {}
  ): Observable<Page<VehicleDTO>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);
    // Solo añadimos el parámetro si el usuario ha introducido un valor real
    if (filters.brand)      params = params.set('brand', filters.brand);
    if (filters.model)      params = params.set('model', filters.model);
    if (filters.horsePower) params = params.set('horsePower', filters.horsePower);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    return this.http.get<Page<VehicleDTO>>(this.base, { params });
  }

  getById(id: number): Observable<VehicleDTO> {
    return this.http.get<VehicleDTO>(`${this.base}/${id}`);
  }

  // ─── WRITE (MANAGER+) ─────────────────────────────────────────────────────

  create(formData: FormData): Observable<VehicleDTO> {
    return this.http.post<VehicleDTO>(this.base, formData);
  }

  update(id: number, formData: FormData): Observable<VehicleDTO> {
    return this.http.put<VehicleDTO>(`${this.base}/${id}`, formData);
  }

  /** Alterna la disponibilidad del vehículo sin necesidad de subir imágenes. */
  toggleAvailability(id: number): Observable<VehicleDTO> {
    return this.http.patch<VehicleDTO>(`${this.base}/${id}/toggle-availability`, {});
  }

  delete(id: number): Observable<string> {
    return this.http.delete<string>(`${this.base}/${id}`);
  }

  /** Sube una imagen a la galería de un vehículo existente. */
  uploadImage(vehicleId: number, file: File): Observable<VehicleDTO> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<VehicleDTO>(`${this.base}/${vehicleId}/images`, formData);
  }

  /** Elimina una imagen concreta de la galería del vehículo. */
  removeImage(vehicleId: number, filename: string): Observable<VehicleDTO> {
    return this.http.delete<VehicleDTO>(`${this.base}/${vehicleId}/images/${encodeURIComponent(filename)}`);
  }
}
