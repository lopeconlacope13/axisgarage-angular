import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../core/services/vehicle.service';
import { ReservationService } from '../../core/services/reservation.service';
import { RenterService } from '../../core/services/renter.service';
import { AuthService } from '../../core/services/auth.service';
import { VehicleDTO, ReservationDTO } from '../../models/types';

/**
 * Componente de checkout: resume la reserva, verifica el perfil del cliente
 * y envía la petición de creación al backend con todos los datos necesarios.
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Estado de carga inicial -->
    <div *ngIf="!vehicle" class="max-w-7xl mx-auto px-6 pt-32 pb-16 text-center text-axis-gray">
      Loading...
    </div>

    <div class="max-w-7xl mx-auto px-6 pt-32 pb-16" *ngIf="vehicle">
      <div class="eyebrow mb-2" style="color:#b8952a">SECURE GATEWAY</div>
      <h1 class="section-title mb-8">Checkout <span class="italic">Vault</span></h1>

      <!-- Aviso si el usuario no tiene perfil de cliente -->
      <div *ngIf="renterNotFound"
        style="background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.3);border-radius:6px;padding:1rem 1.5rem;margin-bottom:2rem;color:#ff9090;font-size:0.875rem;">
        No se encontró un perfil de cliente vinculado a su cuenta. Contacte con el equipo de Axis Garage para activar su acceso.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">

        <!-- Resumen de reserva -->
        <div>
          <div class="glass-card p-8 mb-6">
            <h2 class="font-display text-xl font-semibold mb-6">Reservation Summary</h2>
            <div class="flex justify-between border-b border-white/5 pb-4 mb-4">
              <span class="text-axis-gray">Asset</span>
              <span class="font-medium">{{ vehicle.brand }} {{ vehicle.model }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-4 mb-4">
              <span class="text-axis-gray">Pick-Up</span>
              <span class="font-medium">{{ start | date:'mediumDate' }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-4 mb-4">
              <span class="text-axis-gray">Drop-Off</span>
              <span class="font-medium">{{ end | date:'mediumDate' }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-4 mb-4">
              <span class="text-axis-gray">Coverage</span>
              <span class="font-medium">{{ coverage }}</span>
            </div>
            <div class="flex justify-between pt-2">
              <span class="text-axis-gray">Total Investment</span>
              <span class="font-display text-2xl font-bold" style="color:#b8952a">€{{ calculatedTotal | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Panel de pago simulado -->
        <div class="flex flex-col">
          <div class="glass-card p-8 flex-1">
            <h2 class="font-display text-xl font-semibold mb-6">Secure Transfer</h2>
            <p class="text-axis-gray mb-6 text-sm leading-relaxed">
              To proceed with the acquisition of this temporary asset, confirm the transaction parameters. A digital vault signature will be generated uniquely for your profile.
            </p>

            <div class="mb-6">
              <label class="eyebrow block mb-2">Cardholder Name</label>
              <input type="text" class="input-dark w-full" placeholder="ALVARO LOPEZ" />
            </div>
            <div class="mb-8">
              <label class="eyebrow block mb-2">Secure Link (Vault)</label>
              <div class="input-dark flex items-center justify-between" style="opacity:0.5;pointer-events:none;">
                <span>**** **** **** 4092</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
                  <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
                </svg>
              </div>
            </div>

            <button class="btn-gold w-full" (click)="confirmReservation()"
              [disabled]="processing || renterNotFound">
              {{ processing ? 'AUTHORIZING...' : 'AUTHORIZE ACQUISITION' }}
            </button>
            <div *ngIf="error" class="text-red-500 text-xs mt-4 text-center">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación exitosa -->
    <div *ngIf="success" class="fixed inset-0 z-50 flex items-center justify-center bg-axis-black/90 backdrop-blur-md px-4 text-center">
      <div class="glass-card p-10 max-w-md w-full border-axis-gold/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#b8952a" class="mx-auto mb-6" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
        </svg>
        <h2 class="font-display text-2xl font-semibold mb-2 text-axis-gold">Access Granted</h2>
        <p class="text-axis-gray mb-8">Reservation #{{ confirmedId }} successfully vaulted. Our concierge will contact you shortly.</p>
        <button class="btn-outline w-full" routerLink="/dashboard">VIEW MY GARAGE</button>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {

  vehicle: VehicleDTO | null = null;
  start    = '';
  end      = '';
  coverage = 'STANDARD';
  calculatedTotal = 0;

  // ID del cliente resuelto a partir del email del JWT
  renterId = 0;
  renterNotFound = false;

  processing  = false;
  success     = false;
  error       = '';
  confirmedId = 0;

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private vehicleSvc:     VehicleService,
    private reservationSvc: ReservationService,
    private renterSvc:      RenterService,
    private authSvc:        AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('vehicleId'));
    this.start    = this.route.snapshot.queryParamMap.get('start')    || '';
    this.end      = this.route.snapshot.queryParamMap.get('end')      || '';
    this.coverage = this.route.snapshot.queryParamMap.get('coverage') || 'STANDARD';

    // Si faltan parámetros de reserva, redirigimos al catálogo
    if (!id || !this.start || !this.end) {
      this.router.navigate(['/vehicles']);
      return;
    }

    // Cargamos el vehículo seleccionado
    this.vehicleSvc.getById(id).subscribe(v => {
      this.vehicle = v;
      this.calculateTotal();
    });

    // Resolvemos el renterId a partir del email del token JWT
    const email = this.authSvc.getEmail();
    if (email) {
      this.renterSvc.getByEmail(email).subscribe({
        next:  (r) => { this.renterId = r.id!; },
        error: ()  => { this.renterNotFound = true; }
      });
    } else {
      this.renterNotFound = true;
    }
  }

  calculateTotal(): void {
    if (!this.vehicle) return;
    const days = Math.ceil(
      (new Date(this.end).getTime() - new Date(this.start).getTime()) / 86400000
    );
    const rates: Record<string, number> = { STANDARD: 0, PREMIUM: 45, TOTAL: 85 };
    const coverageCost = rates[this.coverage] ?? 0;
    this.calculatedTotal = (this.vehicle.pricePerDay + coverageCost) * Math.max(0, days);
  }

  confirmReservation(): void {
    // Doble verificación antes de enviar al backend
    if (!this.renterId) {
      this.error = 'No se pudo verificar el perfil del cliente. Contacte con soporte.';
      return;
    }

    this.processing = true;
    this.error = '';

    const nuevaReserva: Partial<ReservationDTO> = {
      vehicleId:  this.vehicle?.id,
      renterId:   this.renterId,
      startDate:  this.start,
      endDate:    this.end,
      totalPrice: this.calculatedTotal,
      status:     'CONFIRMED'
    };

    this.reservationSvc.create(nuevaReserva).subscribe({
      next: (res: any) => {
        this.confirmedId = res?.id ?? 0;
        this.processing  = false;
        this.success     = true;
      },
      error: (err) => {
        // Mostramos el mensaje de error del backend si está disponible
        this.error      = err?.error ?? 'Error al procesar la reserva. Inténtelo de nuevo.';
        this.processing = false;
      }
    });
  }
}
