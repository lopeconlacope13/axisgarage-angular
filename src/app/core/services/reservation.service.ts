import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservationDTO, Page } from '../../models/types';

/** Gestión de reservas. Requiere autenticación (USER+). */
@Injectable({ providedIn: 'root' })
export class ReservationService {

  private readonly base = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10): Observable<Page<ReservationDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReservationDTO>>(this.base, { params });
  }

  getById(id: number): Observable<ReservationDTO> {
    return this.http.get<ReservationDTO>(`${this.base}/${id}`);
  }

  // TODO (Día 10): implementar con fechas y vehicleId
  create(dto: Partial<ReservationDTO>): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(this.base, dto);
  }

  update(id: number, dto: Partial<ReservationDTO>): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
