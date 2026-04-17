import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceDTO } from '../../models/types';

/**
 * Servicio para consumir el módulo de facturas del backend.
 * El endpoint de PDF devuelve los bytes del archivo directamente,
 * por lo que se usa responseType 'blob' para poder descargarlo en el navegador.
 */
@Injectable({ providedIn: 'root' })
export class InvoiceService {

  private readonly base = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  /**
   * Devuelve todas las facturas del sistema (MANAGER y ADMIN).
   * El backend devuelve directamente un array, no una página paginada.
   */
  getAll(): Observable<InvoiceDTO[]> {
    return this.http.get<InvoiceDTO[]>(this.base);
  }

  /** Obtiene la factura asociada a una reserva concreta. */
  getByReservation(reservationId: number): Observable<InvoiceDTO> {
    return this.http.get<InvoiceDTO>(`${this.base}/reservation/${reservationId}`);
  }

  /**
   * Descarga el PDF de la factura de una reserva.
   * Si la factura no existe en el backend, este endpoint la crea automáticamente.
   * Devuelve un Blob que el componente convierte en enlace de descarga.
   */
  downloadPdf(reservationId: number): Observable<Blob> {
    return this.http.get(`${this.base}/reservation/${reservationId}/pdf`, {
      responseType: 'blob'
    });
  }
}
