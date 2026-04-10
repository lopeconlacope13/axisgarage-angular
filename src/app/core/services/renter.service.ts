import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RenterDTO } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Servicio para consultar el perfil de cliente (Renter) desde el backend.
 * Actualmente sólo expone la búsqueda por email, necesaria para resolver
 * el renterId durante el flujo de checkout a partir del JWT.
 */
@Injectable({ providedIn: 'root' })
export class RenterService {

  private readonly base = `${environment.apiUrl}/renters`;

  constructor(private http: HttpClient) {}

  /**
   * Busca el perfil de cliente asociado al email proporcionado.
   * Devuelve un Observable con el RenterDTO si existe en la base de datos.
   */
  getByEmail(email: string): Observable<RenterDTO> {
    return this.http.get<RenterDTO>(`${this.base}/by-email`, { params: { email } });
  }
}
