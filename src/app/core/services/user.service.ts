import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserSummary } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Servicio para la gestión de usuarios desde el panel de administración.
 * <p>
 * Consume los endpoints de /api/users que solo están disponibles para ROLE_ADMIN.
 * El JWT interceptor añade automáticamente el token en cada petición,
 * por lo que no es necesario gestionarlo aquí manualmente.
 */
@Injectable({ providedIn: 'root' })
export class UserService {

  /** URL base del endpoint de administración de usuarios */
  private readonly base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista completa de todos los usuarios registrados en el sistema.
   * Llama a GET /api/users — requiere ROLE_ADMIN.
   *
   * @returns Observable con el array de UserSummary.
   */
  getAll(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.base);
  }

  /**
   * Cambia el rol de un usuario concreto.
   * Llama a PATCH /api/users/{id}/role — requiere ROLE_ADMIN.
   *
   * @param id   ID del usuario al que se le cambia el rol.
   * @param role Nombre del nuevo rol: "ROLE_USER" o "ROLE_MANAGER".
   * @returns Observable con el UserSummary actualizado.
   */
  changeRole(id: number, role: string): Observable<UserSummary> {
    // El backend espera un JSON con la clave "role"
    return this.http.patch<UserSummary>(`${this.base}/${id}/role`, { role });
  }

  /**
   * Elimina un usuario del sistema de forma permanente.
   * Llama a DELETE /api/users/{id} — requiere ROLE_ADMIN.
   * El backend devolverá 204 No Content si la operación fue exitosa.
   *
   * @param id ID del usuario a eliminar.
   * @returns Observable<void> que completa cuando el usuario ha sido eliminado.
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
