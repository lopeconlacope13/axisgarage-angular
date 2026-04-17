import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReviewDTO, Page } from '../../models/types';

/** Reviews de vehículos. Requiere USER+. */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly base = `${environment.apiUrl}/reviews`;
  constructor(private http: HttpClient) {}

  getByVehicle(vehicleId: number): Observable<ReviewDTO[]> {
    return this.http.get<ReviewDTO[]>(`${this.base}/vehicle/${vehicleId}`);
  }

  getByReservation(reservationId: number): Observable<ReviewDTO[]> {
    return this.http.get<ReviewDTO[]>(`${this.base}/reservation/${reservationId}`);
  }

  getAll(page = 0, size = 10): Observable<Page<ReviewDTO>> {
    return this.http.get<Page<ReviewDTO>>(this.base, {
      params: { page, size }
    });
  }

  create(dto: Partial<ReviewDTO>): Observable<ReviewDTO> {
    return this.http.post<ReviewDTO>(this.base, dto);
  }

  update(id: number, dto: Partial<ReviewDTO>): Observable<ReviewDTO> {
    return this.http.put<ReviewDTO>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
