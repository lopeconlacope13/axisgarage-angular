import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InvoiceDTO, Page } from '../../models/types';

/**
 * Servicio para consumir el módulo de facturas del backend.
 * El endpoint de PDF devuelve los bytes del archivo directamente,
 * por lo que se usa responseType 'blob' para poder descargarlo en el navegador.
 */
@Injectable({ providedIn: 'root' })
export class InvoiceService {

  private readonly base = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  /** Devuelve la lista paginada de todas las facturas (MANAGER y ADMIN). */
  getAll(page = 0, size = 50): Observable<Page<InvoiceDTO>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<InvoiceDTO>>(this.base, { params });
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
