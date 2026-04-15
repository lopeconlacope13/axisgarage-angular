import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../core/services/vehicle.service';
import { ReservationService } from '../../core/services/reservation.service';
import { RenterService } from '../../core/services/renter.service';
import { AuthService } from '../../core/services/auth.service';
import { VehicleDTO, ReservationDTO } from '../../models/types';

/**
 * Componente de checkout: muestra el resumen de la reserva, una pasarela de
 * pago simulada (claramente marcada como ficticia) y confirma la reserva en el
 * backend. Al completarse, el backend envía un email de confirmación al cliente.
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  // OnPush: Angular solo re-renderiza cuando lo pedimos explícitamente con markForCheck().
  // Necesario en modo Zoneless (provideZonelessChangeDetection) para que los datos del HTTP
  // aparezcan al cargar la página, sin esperar a una interacción del usuario.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent implements OnInit {

  vehicle: VehicleDTO | null = null;
  start    = '';
  end      = '';
  coverage = 'STANDARD';
  calculatedTotal = 0;

  /** ID del cliente resuelto desde el JWT para crear la reserva */
  renterId       = 0;
  renterNotFound = false;
  renterEmail    = '';

  /** Formulario de la pasarela de pago simulada */
  cardHolder = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvv    = '';

  /** Método de pago seleccionado: CARD o PAYPAL */
  payMethod: 'CARD' | 'PAYPAL' = 'CARD';

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
    private authSvc:        AuthService,
    // ChangeDetectorRef: referencia manual al detector de cambios de este componente.
    // Con OnPush, Angular no detecta cambios automáticamente — llamamos a markForCheck()
    // después de cada respuesta HTTP para forzar la actualización de la vista.
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id   = Number(this.route.snapshot.paramMap.get('vehicleId'));
    this.start    = this.route.snapshot.queryParamMap.get('start')    || '';
    this.end      = this.route.snapshot.queryParamMap.get('end')      || '';
    this.coverage = this.route.snapshot.queryParamMap.get('coverage') || 'STANDARD';

    // Si llegan sin parámetros de reserva, redirigimos al catálogo
    if (!id || !this.start || !this.end) {
      this.router.navigate(['/vehicles']);
      return;
    }

    this.vehicleSvc.getById(id).subscribe(v => {
      this.vehicle = v;
      this.calculateTotal();
      // Notificamos a Angular que hay nuevos datos para renderizar
      this.cdr.markForCheck();
    });

    // Resolvemos el perfil de cliente del usuario autenticado.
    // Llamamos a ensure() — si el Renter no existe lo crea desde los datos del User.
    this.renterEmail = this.authSvc.getEmail() ?? '';
    this.renterSvc.ensure().subscribe({
      next: r => {
        this.renterId    = r.id!;
        this.renterEmail = r.email || this.renterEmail;
        // Forzamos re-render para que la vista muestre el formulario de pago
        this.cdr.markForCheck();
      },
      error: () => {
        this.renterNotFound = true;
        // También forzamos re-render en el caso de error para mostrar el mensaje
        this.cdr.markForCheck();
      }
    });
  }

  /** Calcula el total en función de los días y el nivel de cobertura */
  calculateTotal(): void {
    if (!this.vehicle) return;
    const days = Math.ceil(
      (new Date(this.end).getTime() - new Date(this.start).getTime()) / 86400000
    );
    const rates: Record<string, number> = { STANDARD: 0, PREMIUM: 45, TOTAL: 85 };
    this.calculatedTotal = (this.vehicle.pricePerDay + (rates[this.coverage] ?? 0)) * Math.max(0, days);
  }

  /** Número de días de la reserva (calculado desde las fechas) */
  get days(): number {
    if (!this.start || !this.end) return 0;
    return Math.max(0, Math.ceil(
      (new Date(this.end).getTime() - new Date(this.start).getTime()) / 86400000
    ));
  }

  /**
   * Valida el formulario de pago simulado y envía la reserva al backend.
   * La validación del pago es puramente visual (es una simulación).
   * El backend crea la reserva y dispara el email de confirmación.
   */
  confirmReservation(): void {
    this.error = '';

    if (!this.renterId) {
      this.error = 'No se pudo verificar el perfil de cliente. Contacte con soporte.';
      return;
    }

    // Validación del formulario de tarjeta (solo si método = CARD)
    if (this.payMethod === 'CARD') {
      if (!this.cardHolder || !this.cardNumber || !this.cardExpiry || !this.cardCvv) {
        this.error = 'Completa todos los datos de la tarjeta para continuar.';
        return;
      }
    }

    this.processing = true;

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
        this.cdr.markForCheck();
      },
      error: err => {
        this.error      = err?.error ?? 'Error al procesar la reserva. Inténtelo de nuevo.';
        this.processing = false;
        this.cdr.markForCheck();
      }
    });
  }
}
