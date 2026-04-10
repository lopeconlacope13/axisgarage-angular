import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RenterService } from '../../core/services/renter.service';
import { ReservationService } from '../../core/services/reservation.service';
import { ReservationDTO } from '../../models/types';

/**
 * Página de reservas del usuario autenticado.
 *
 * Flujo:
 * 1. Se extrae el email del token JWT con AuthService.
 * 2. Se resuelve el ID del cliente (renterId) a partir de ese email.
 * 3. Se consultan las reservas filtrando por ese renterId.
 * 4. Se muestran en una tabla estilizada.
 */
@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-6 pt-32 pb-20">

      <div class="eyebrow mb-2" style="color:#b8952a">MY GARAGE</div>
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
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of reservations"
              class="border-b transition-colors"
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
              <td class="p-4 text-right font-display" style="color:#b8952a">
                €{{ r.totalPrice | number:'1.0-0' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class MyReservationsComponent implements OnInit {

  reservations: ReservationDTO[] = [];
  loading       = true;
  renterNotFound = false;

  constructor(
    private authSvc:        AuthService,
    private renterSvc:      RenterService,
    private reservationSvc: ReservationService
  ) {}

  ngOnInit(): void {
    const email = this.authSvc.getEmail();

    if (!email) {
      this.loading = false;
      this.renterNotFound = true;
      return;
    }

    // Paso 1: resolver el ID del cliente a partir del email del JWT
    this.renterSvc.getByEmail(email).subscribe({
      next: (renter) => {
        // Paso 2: cargar las reservas de ese cliente
        this.reservationSvc.getByRenterId(renter.id).subscribe({
          next: (page) => {
            this.reservations = page.content;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: () => {
        this.renterNotFound = true;
        this.loading = false;
      }
    });
  }

  /** Devuelve el color según el estado de la reserva. */
  statusColor(status: string): string {
    if (status === 'CONFIRMED') return '#b8952a';
    if (status === 'CANCELLED') return 'rgba(239,68,68,0.7)';
    return '#9a9a95';
  }
}
