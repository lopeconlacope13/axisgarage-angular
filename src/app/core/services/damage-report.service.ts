import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DamageReportDTO } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestionar los informes de daños (partes PRE/POST alquiler).
 * Solo accesible para usuarios con rol MANAGER o ADMIN.
 * Se comunica con los endpoints /api/damage-reports del backend.
 */
@Injectable({ providedIn: 'root' })
export class DamageReportService {

  private readonly url = `${environment.apiUrl}/damage-reports`;

  constructor(private http: HttpClient) {}

  /** Devuelve todos los partes de daños del sistema. */
  getAll(): Observable<DamageReportDTO[]> {
    return this.http.get<DamageReportDTO[]>(this.url);
  }

  /** Crea un nuevo parte vinculado a una reserva existente. */
  create(dto: Partial<DamageReportDTO>): Observable<DamageReportDTO> {
    return this.http.post<DamageReportDTO>(this.url, dto);
  }

  /** Elimina un parte por su ID. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
