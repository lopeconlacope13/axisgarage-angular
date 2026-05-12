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

  /**
   * Crea un nuevo socio propietario en la base de datos.
   * El backend responde con el OwnerDTO creado, incluyendo el ID asignado.
   * @param dto Datos del nuevo propietario (nombre, apellido, email, teléfono, dirección)
   */
  create(dto: Partial<OwnerDTO>): Observable<OwnerDTO> {
    return this.http.post<OwnerDTO>(this.base, dto);
  }

  /**
   * Elimina un socio propietario por su ID.
   * El backend responde con 204 No Content si la operación tiene éxito.
   * @param id Identificador del propietario a eliminar
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
