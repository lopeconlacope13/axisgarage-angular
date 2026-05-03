import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { VehicleService } from '../../core/services/vehicle.service';
import { ReservationService } from '../../core/services/reservation.service';
import { RenterService } from '../../core/services/renter.service';
import { AuthService } from '../../core/services/auth.service';
import { VehicleDTO, ReservationDTO } from '../../models/types';
import { validateDni } from '../../shared/validators/dni.validator';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Componente de checkout: muestra el resumen de la reserva, una pasarela de
 * pago simulada (claramente marcada como ficticia) y confirma la reserva en el
 * backend. Al completarse, el backend envía un email de confirmación al cliente.
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
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

  /** Datos de facturación — se piden si el perfil de Renter tiene placeholders */
  dni = '';
  phone = '';
  address = '';
  addressControl = new FormControl('');
  addressSuggestions: string[] = [];
  needsBillingDetails = false;
  dniValid = false;
  phoneValid = false;

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
    private http:           HttpClient,
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
        this.dni         = r.dni || '';
        this.phone       = r.phone || '';
        this.address     = r.address || '';
        this.dniValid    = validateDni(this.dni);
        this.phoneValid  = /^[0-9]{9}$/.test(this.phone);
        // Si el DNI es placeholder, el teléfono no tiene 9 dígitos o falta dirección,
        // exigimos completar datos de facturación antes de reservar
        this.needsBillingDetails = !this.dni || this.dni.startsWith('PENDING-') || !this.dniValid || !this.phoneValid || !this.address;
        // Forzamos re-render para que la vista muestre el formulario de pago
        this.cdr.markForCheck();
      },
      error: () => {
        this.renterNotFound = true;
        // También forzamos re-render en el caso de error para mostrar el mensaje
        this.cdr.markForCheck();
      }
    });

    // Autocompletado de direcciones con OpenStreetMap Nominatim.
    // Usamos debounceTime(500) para no saturar el servicio gratuito de OSM.
    this.addressControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) return of([]);
        return this.http.get<any[]>(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
        );
      })
    ).subscribe(results => {
      this.addressSuggestions = results.map((r: any) => r.display_name);
      this.cdr.markForCheck();
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
   * Valida la letra de control del DNI en tiempo real mientras el usuario escribe.
   */
  onDniInput(): void {
    this.dniValid = validateDni(this.dni);
  }

  /**
   * Valida que el teléfono tenga exactamente 9 dígitos (formato español).
   */
  onPhoneInput(): void {
    this.phoneValid = /^[0-9]{9}$/.test(this.phone);
  }

  /**
   * Rellena el campo de dirección con la sugerencia seleccionada de OSM.
   */
  selectAddress(suggestion: string): void {
    this.address = suggestion;
    this.addressControl.setValue(suggestion, { emitEvent: false });
    this.addressSuggestions = [];
    this.cdr.markForCheck();
  }

  /**
   * Valida el formulario de pago simulado y envía la reserva al backend.
   * Si faltan datos de facturación (DNI o address), primero actualiza el perfil
   * de Renter mediante ensure() y luego crea la reserva.
   * La validación del pago es puramente visual (es una simulación).
   * El backend crea la reserva y dispara el email de confirmación.
   */
  confirmReservation(): void {
    this.error = '';

    if (!this.renterId) {
      this.error = 'No se pudo verificar el perfil de cliente. Contacte con soporte.';
      return;
    }

    // Validación de datos de facturación antes de proceder al pago
    if (this.needsBillingDetails) {
      if (!this.dni || !validateDni(this.dni)) {
        this.error = 'Introduce un DNI válido (8 dígitos + letra). Ej: 12345678Z';
        return;
      }
      if (!this.phone || !/^[0-9]{9}$/.test(this.phone)) {
        this.error = 'Introduce un teléfono válido (9 dígitos). Ej: 612345678';
        return;
      }
      if (!this.address || this.address.length < 5) {
        this.error = 'Introduce una dirección de facturación válida.';
        return;
      }
    }

    // Validación del formulario de tarjeta (solo si método = CARD)
    if (this.payMethod === 'CARD') {
      if (!this.cardHolder || !this.cardNumber || !this.cardExpiry || !this.cardCvv) {
        this.error = 'Completa todos los datos de la tarjeta para continuar.';
        return;
      }
    }

    this.processing = true;

    // Primero actualizamos el perfil de cliente con DNI y dirección si es necesario
    const updateRenter$ = this.needsBillingDetails
      ? this.renterSvc.ensure({ dni: this.dni, phone: this.phone, address: this.address })
      : this.renterSvc.ensure();

    updateRenter$.subscribe({
      next: () => {
        // Perfil actualizado: procedemos a crear la reserva
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
      },
      error: err => {
        this.error      = err?.error ?? 'Error al guardar los datos de facturación.';
        this.processing = false;
        this.cdr.markForCheck();
      }
    });
  }
}
