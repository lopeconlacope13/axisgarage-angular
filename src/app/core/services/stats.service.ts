import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio que obtiene las estadísticas globales del backend.
 * Solo disponible para usuarios con rol MANAGER o ADMIN.
 */
@Injectable({ providedIn: 'root' })
export class StatsService {

  constructor(private http: HttpClient) {}

  /**
   * Llama a GET /api/stats y devuelve un objeto con tres métricas:
   *   - totalReservations: número total de reservas
   *   - availableVehicles: número de vehículos disponibles
   *   - totalClients:      número total de clientes registrados
   */
  getStats(): Observable<{ totalReservations: number; availableVehicles: number; totalClients: number }> {
    return this.http.get<{ totalReservations: number; availableVehicles: number; totalClients: number }>(
      `${environment.apiUrl}/stats`
    );
  }
}
