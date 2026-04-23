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
  template: `
    <div class="max-w-5xl mx-auto px-6 pt-32 pb-20">

      <div class="eyebrow mb-2" style="color:var(--axis-gold)">MY GARAGE</div>
      <h1 class="section-title mb-10">My <span class="italic">Reservations</span></h1>

      <!-- Estado: cargando -->
      <div *ngIf="loading" class="text-axis-gray text-sm">Loading...</div>

      <!-- Estado: sin perfil de cliente vinculado -->
      <div *ngIf="!loading && renterNotFound"
        style="background:rgba(255,80,80,0.07);border:1px solid rgba(255,80,80,0.25);border-radius:6px;padding:1.25rem 1.5rem;color:#ff9090;font-size:0.875rem;">
        No se encontró un perfil de cliente vinculado a esta cuenta.
        Contacta con el equipo de Axis Garage para activar tu acceso.
      </div>

      <!-- Estado: sin reservas -->
      <div *ngIf="!loading && !renterNotFound && reservations.length === 0"
        class="glass-card p-12 text-center">
        <p class="text-axis-gray mb-6">You have no reservations yet.</p>
        <a routerLink="/vehicles" class="btn-gold" style="font-size:0.75rem;">BROWSE THE FLEET</a>
      </div>

      <!-- Tabla de reservas -->
      <div *ngIf="!loading && reservations.length > 0" class="glass-card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="border-b" style="border-color:rgba(245,245,240,0.06)">
            <tr>
              <th class="eyebrow text-left p-4">Ref.</th>
              <th class="eyebrow text-left p-4">Vehicle</th>
              <th class="eyebrow text-left p-4">Pick-Up</th>
              <th class="eyebrow text-left p-4">Drop-Off</th>
              <th class="eyebrow text-left p-4">Status</th>
              <th class="eyebrow text-right p-4">Total</th>
              <th class="eyebrow text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let r of reservations">
              <!-- Fila de la reserva -->
              <tr class="border-b transition-colors"
                style="border-color:rgba(245,245,240,0.04);"
                onmouseenter="this.style.background='rgba(255,255,255,0.03)'"
                onmouseleave="this.style.background='transparent'">

                <td class="p-4 text-axis-gray">#{{ r.id }}</td>
                <td class="p-4 font-medium">{{ r.vehicleModel }}</td>
                <td class="p-4 text-axis-gray">{{ r.startDate }}</td>
                <td class="p-4 text-axis-gray">{{ r.endDate }}</td>
                <td class="p-4">
                  <span class="eyebrow px-2 py-1 rounded text-xs"
                    [style.color]="statusColor(r.status)">
                    {{ r.status }}
                  </span>
                </td>
                <td class="p-4 text-right font-display" style="color:var(--axis-gold)">
                  €{{ r.totalPrice | number:'1.0-0' }}
                </td>
                <td class="p-4 text-right" style="white-space:nowrap;">
                  <!-- Botón de descarga de factura (CONFIRMED o COMPLETED) -->
                  <button *ngIf="r.status === 'CONFIRMED' || r.status === 'COMPLETED'"
                    (click)="downloadInvoice(r.id)"
                    [disabled]="downloadingId === r.id"
                    style="font-size:0.6rem;letter-spacing:0.1em;padding:0.3rem 0.7rem;border:1px solid var(--axis-gold-30);background:transparent;color:rgba(201,161,74,0.8);border-radius:4px;cursor:pointer;margin-right:0.4rem;"
                    title="Download invoice PDF">
                    {{ downloadingId === r.id ? '...' : '⬇ PDF' }}
                  </button>
                  <!-- Botón de reseña solo en reservas COMPLETED que no han sido reseñadas -->
                  <button *ngIf="r.status === 'COMPLETED' && !reviewedIds.has(r.id)"
                    (click)="openReviewForm(r)"
                    style="font-size:0.6rem;letter-spacing:0.1em;padding:0.3rem 0.7rem;border:1px solid var(--axis-gold-40);background:transparent;color:var(--axis-gold);border-radius:4px;cursor:pointer;white-space:nowrap;">
                    ★ REVIEW
                  </button>
                  <!-- Badge "Reviewed" si ya tiene reseña -->
                  <span *ngIf="r.status === 'COMPLETED' && reviewedIds.has(r.id)"
                    style="font-size:0.6rem;letter-spacing:0.1em;color:rgba(245,245,240,0.3);">
                    REVIEWED ✓
                  </span>
                </td>
              </tr>

              <!-- Formulario de reseña (se despliega debajo de la fila) -->
              <tr *ngIf="reviewingReservation?.id === r.id"
                style="background:rgba(201,161,74,0.03);border-bottom:1px solid var(--axis-gold-12);">
                <td colspan="7" style="padding:1.25rem 1.5rem;">
                  <div style="max-width:500px;">
                    <div class="eyebrow" style="color:var(--axis-gold);font-size:0.6rem;margin-bottom:1rem;letter-spacing:0.15em;">
                      LEAVE A REVIEW — {{ r.vehicleModel }}
                    </div>

                    <!-- Selector de estrellas -->
                    <div style="display:flex;gap:6px;margin-bottom:1rem;">
                      <button *ngFor="let s of [1,2,3,4,5]"
                        (click)="reviewForm.rating = s"
                        type="button"
                        style="background:none;border:none;cursor:pointer;font-size:1.5rem;padding:0;line-height:1;"
                        [style.color]="s <= reviewForm.rating ? 'var(--axis-gold)' : 'rgba(245,245,240,0.2)'">
                        ★
                      </button>
                    </div>

                    <!-- Textarea del comentario -->
                    <textarea [(ngModel)]="reviewForm.comment" rows="3" placeholder="Share your experience..."
                      style="width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(245,245,240,0.1);border-radius:4px;padding:0.75rem;color:var(--axis-white);font-size:0.85rem;resize:vertical;font-family:inherit;box-sizing:border-box;"></textarea>

                    <!-- Error -->
                    <div *ngIf="reviewError"
                      style="margin-top:0.5rem;font-size:0.75rem;color:rgba(239,68,68,0.85);">
                      {{ reviewError }}
                    </div>

                    <!-- Botones -->
                    <div style="display:flex;gap:0.75rem;margin-top:0.75rem;">
                      <button (click)="submitReview()" [disabled]="submittingReview"
                        class="btn-gold" style="font-size:0.65rem;padding:0.5rem 1.25rem;">
                        {{ submittingReview ? 'SENDING...' : 'SUBMIT' }}
                      </button>
                      <button (click)="closeReviewForm()" type="button"
                        style="font-size:0.65rem;padding:0.5rem 1rem;background:transparent;border:1px solid rgba(245,245,240,0.1);border-radius:4px;color:rgba(245,245,240,0.4);cursor:pointer;">
                        CANCEL
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
      </div>

    </div>
  `
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
