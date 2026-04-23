import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RenterService } from '../../core/services/renter.service';
import { ReservationService } from '../../core/services/reservation.service';
import { ReviewService } from '../../core/services/review.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ReservationDTO } from '../../models/types';

/**
 * Página de reservas del usuario autenticado.
 *
 * Flujo:
 * 1. Se extrae el email del token JWT con AuthService.
 * 2. Se resuelve el ID del cliente (renterId) mediante ensure().
 * 3. Se cargan las reservas filtrando por ese renterId.
 * 4. En las reservas COMPLETED se muestra el botón "Leave a Review".
 * 5. Al pulsar, se despliega un formulario inline con selector de estrellas y comentario.
 */
@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.css'
})
export class MyReservationsComponent implements OnInit {

  reservations: ReservationDTO[] = [];
  loading        = true;
  renterNotFound = false;

  /** ID del perfil de cliente resuelto al cargar la página */
  private renterId = 0;

  /** IDs de reservas que ya tienen reseña (para ocultar el botón) */
  reviewedIds = new Set<number>();

  /** ID de la reserva cuyo PDF se está descargando (para mostrar spinner) */
  downloadingId: number | null = null;

  /** Reserva sobre la que se está abriendo el formulario (null = cerrado) */
  reviewingReservation: ReservationDTO | null = null;
  reviewForm     = { rating: 5, comment: '' };
  reviewError    = '';
  submittingReview = false;

  constructor(
    private authSvc:        AuthService,
    private renterSvc:      RenterService,
    private reservationSvc: ReservationService,
    private reviewSvc:      ReviewService,
    private invoiceSvc:     InvoiceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const email = this.authSvc.getEmail();

    if (!email) {
      this.loading = false;
      this.renterNotFound = true;
      return;
    }

    // Paso 1: asegurar el perfil de Renter (idempotente).
    this.renterSvc.ensure().subscribe({
      next: (renter) => {
        this.renterId = renter.id;
        // Paso 2: cargar reservas de ese cliente
        this.reservationSvc.getByRenterId(renter.id).subscribe({
          next: (page) => {
            this.reservations = page.content;
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.renterNotFound = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Solicita el PDF de la factura al backend y lo descarga en el navegador.
   * El backend genera la factura automáticamente si no existe todavía.
   */
  downloadInvoice(reservationId: number): void {
    this.downloadingId = reservationId;
    this.cdr.markForCheck();
    this.invoiceSvc.downloadPdf(reservationId).subscribe({
      next: (blob) => {
        // Crea un enlace temporal en memoria y lo pulsa para forzar la descarga
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `invoice-reservation-${reservationId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.downloadingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  /** Abre el formulario de reseña para una reserva concreta. */
  openReviewForm(r: ReservationDTO): void {
    this.reviewingReservation = r;
    this.reviewForm   = { rating: 5, comment: '' };
    this.reviewError  = '';
    this.cdr.markForCheck();
  }

  /** Cierra el formulario sin enviar. */
  closeReviewForm(): void {
    this.reviewingReservation = null;
    this.reviewError = '';
    this.cdr.markForCheck();
  }

  /** Envía la reseña al backend y cierra el formulario si tiene éxito. */
  submitReview(): void {
    if (!this.reviewingReservation) return;
    if (!this.reviewForm.comment.trim()) {
      this.reviewError = 'El comentario no puede estar vacío.';
      this.cdr.markForCheck();
      return;
    }

    this.submittingReview = true;
    this.reviewError = '';

    this.reviewSvc.create({
      rating:        this.reviewForm.rating,
      comment:       this.reviewForm.comment.trim(),
      reservationId: this.reviewingReservation.id,
      renterId:      this.renterId
    }).subscribe({
      next: () => {
        // Marcar la reserva como reseñada para ocultar el botón
        this.reviewedIds.add(this.reviewingReservation!.id);
        this.submittingReview = false;
        this.reviewingReservation = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.reviewError = err?.error ?? 'Error al enviar la reseña. Inténtalo de nuevo.';
        this.submittingReview = false;
        this.cdr.markForCheck();
      }
    });
  }

  /** Devuelve el color según el estado de la reserva. */
  statusColor(status: string): string {
    if (status === 'CONFIRMED')  return 'var(--axis-gold)';
    if (status === 'COMPLETED')  return '#4ade80';
    if (status === 'CANCELLED')  return 'rgba(239,68,68,0.7)';
    return '#9a9a95';
  }
}
