import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { RenterService } from '../../core/services/renter.service';
import { ReservationService } from '../../core/services/reservation.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { OwnerService } from '../../core/services/owner.service';
import { DamageReportService } from '../../core/services/damage-report.service';
import { ReviewService } from '../../core/services/review.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { UserDTO, ReservationDTO, VehicleDTO, RenterDTO, OwnerDTO, DamageReportDTO, ReviewDTO, InvoiceDTO } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Panel de control principal de Axis Garage.
 *
 * Renderiza vistas distintas según el rol del usuario autenticado:
 *   - ROLE_USER    → Perfil personal + historial de sus reservas.
 *   - ROLE_MANAGER → Gestión de reservas, flota y clientes.
 *   - ROLE_ADMIN   → Todo lo anterior + gestión de propietarios.
 *
 * El rol se extrae del JWT mediante AuthService, sin necesidad de llamar al backend.
 * Los datos de cada sección se cargan de forma perezosa (lazy): solo cuando el usuario
 * navega a esa sección por primera vez.
 *
 * NOTA DE CHANGE DETECTION:
 * Usamos OnPush + ChangeDetectorRef.markForCheck() porque la app está en modo
 * Zoneless (Angular 21 sin Zone.js). Sin markForCheck(), los datos que llegan
 * de HTTP no actualizan la vista hasta que el usuario interactúa con algo.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  // OnPush: Angular solo comprueba este componente cuando llamamos markForCheck()
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  // ─── Identidad del usuario ────────────────────────────────────────────────
  /** Rol prioritario extraído del JWT: ROLE_USER | ROLE_MANAGER | ROLE_ADMIN */
  userRole  = '';
  userEmail = '';
  /** Sección activa en el sidebar (controla qué panel se muestra) */
  activeSection = '';

  // ─── Datos del perfil (sección USER) ─────────────────────────────────────
  profileData: UserDTO | null = null;
  /** URL de la foto de perfil en base64, guardada en localStorage */
  photoUrl = '';

  // ─── Datos de las secciones ───────────────────────────────────────────────
  myReservations:  ReservationDTO[]  = [];
  allReservations: ReservationDTO[]  = [];
  vehicles:        VehicleDTO[]      = [];
  renters:         RenterDTO[]        = [];
  owners:          OwnerDTO[]         = [];
  damageReports:   DamageReportDTO[]  = [];
  reviews:         ReviewDTO[]        = [];
  invoices:        InvoiceDTO[]       = [];
  invoiceDownloadingId: number | null = null;

  /** Formulario para registrar un nuevo parte de daños */
  newReport = { reservationId: 0, type: 'PRE' as 'PRE' | 'POST', description: '', reportedDate: '' };
  reportError   = '';
  reportSuccess = false;

  /** Texto de búsqueda para filtrar las reservas en el desplegable del formulario de daños */
  reportFilter = '';

  /**
   * Devuelve las reservas filtradas según el texto de búsqueda.
   * Filtra por ID, modelo de vehículo o nombre del cliente (case-insensitive).
   */
  get filteredReservationsForReport(): ReservationDTO[] {
    const q = this.reportFilter.toLowerCase().trim();
    if (!q) return this.allReservations;
    return this.allReservations.filter(r =>
      String(r.id).includes(q) ||
      r.vehicleModel.toLowerCase().includes(q) ||
      r.renterName.toLowerCase().includes(q)
    );
  }

  // ─── Edición de vehículos (MANAGER/ADMIN) ────────────────────────────────
  /** Vehículo seleccionado para editar (null = panel cerrado). */
  editingVehicle: VehicleDTO | null = null;
  /** Campos editables del formulario inline. */
  editForm = { pricePerDay: 0, horsePower: 0, productionYear: 0, description: '' };
  editError   = '';
  editLoading = false;

  // ─── KPIs del overview ────────────────────────────────────────────────────
  /** Ingresos totales: suma de reservas CONFIRMED */
  totalRevenue      = 0;
  confirmedCount    = 0;
  cancelledCount    = 0;
  availableVehicles = 0;
  totalClients      = 0;
  overviewLoaded    = false;

  loading = false;

  constructor(
    private authSvc:           AuthService,
    private renterSvc:         RenterService,
    private reservationSvc:    ReservationService,
    private vehicleSvc:        VehicleService,
    private ownerSvc:          OwnerService,
    private damageReportSvc:   DamageReportService,
    private reviewSvc:         ReviewService,
    private invoiceSvc:        InvoiceService,
    // Imprescindible en modo Zoneless: notifica a Angular que re-renderice la vista
    private cdr:               ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authSvc.getCurrentUser();
    if (!user) return;

    this.userEmail = user.email;

    // Determinamos el rol de mayor jerarquía (un usuario puede tener varios)
    if      (user.roles.includes('ROLE_ADMIN'))   this.userRole = 'ROLE_ADMIN';
    else if (user.roles.includes('ROLE_MANAGER')) this.userRole = 'ROLE_MANAGER';
    else                                           this.userRole = 'ROLE_USER';

    // Recuperamos la foto de perfil si el usuario la había subido antes
    this.photoUrl = localStorage.getItem(`axis-avatar-${this.userEmail}`) ?? '';

    // Cargamos la sección inicial según el rol
    this.setSection(this.isManager ? 'overview' : 'profile');
  }

  /**
   * Cambia la sección activa y carga sus datos si aún no se han solicitado al backend.
   * Este patrón evita llamadas HTTP redundantes cada vez que el usuario cambia de pestaña.
   *
   * @param section Identificador de la sección a mostrar.
   */
  setSection(section: string): void {
    this.activeSection = section;
    if (section === 'overview'        && !this.overviewLoaded)          this.loadOverview();
    if (section === 'profile'         && !this.profileData)             this.loadProfile();
    if (section === 'my-reservations' && !this.myReservations.length)   this.loadMyReservations();
    if (section === 'reservations'    && !this.allReservations.length)  this.loadAllReservations();
    if (section === 'fleet'           && !this.vehicles.length)         this.loadVehicles();
    if (section === 'clients'         && !this.renters.length)          this.loadRenters();
    if (section === 'owners'          && !this.owners.length)           this.loadOwners();
    if (section === 'damage-reports') {
      // Carga los partes de daños si no están cargados
      if (!this.damageReports.length) this.loadDamageReports();
      // También necesitamos la lista de reservas para el desplegable del formulario
      if (!this.allReservations.length) this.loadAllReservations();
    }
    if (section === 'reviews'         && !this.reviews.length)          this.loadReviews();
    if (section === 'invoices'        && !this.invoices.length)         this.loadInvoices();
  }

  // ─── Carga de datos por sección ───────────────────────────────────────────

  /** Carga el perfil del usuario autenticado desde GET /api/user */
  loadProfile(): void {
    this.authSvc.getProfile().subscribe({
      next: p => { this.profileData = p; this.cdr.markForCheck(); }
    });
  }

  /**
   * Carga las reservas del usuario autenticado en dos pasos:
   * 1. Resuelve el renterId a partir del email del JWT.
   * 2. Consulta las reservas filtradas por ese renterId.
   */
  loadMyReservations(): void {
    // ensure() crea el perfil de Renter si todavía no existe — evita el error
    // "perfil no encontrado" para usuarios recién registrados.
    this.renterSvc.ensure().subscribe({
      next: renter => {
        this.reservationSvc.getByRenterId(renter.id).subscribe({
          next: page => {
            this.myReservations = page.content;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  /** Carga todas las reservas del sistema (para MANAGER y ADMIN) */
  loadAllReservations(): void {
    this.loading = true;
    this.reservationSvc.getAll(0, 50).subscribe({
      next:  p  => { this.allReservations = p.content; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  /** Carga el catálogo completo de vehículos (para MANAGER y ADMIN) */
  loadVehicles(): void {
    this.vehicleSvc.getAll(0, 50).subscribe({
      next: p => { this.vehicles = p.content; this.cdr.markForCheck(); }
    });
  }

  /** Carga la lista de clientes registrados (para MANAGER y ADMIN) */
  loadRenters(): void {
    this.renterSvc.getAll(0, 50).subscribe({
      next: p => { this.renters = p.content; this.cdr.markForCheck(); }
    });
  }

  /** Carga la lista de propietarios de vehículos (solo para ADMIN) */
  loadOwners(): void {
    this.ownerSvc.getAll(0, 50).subscribe({
      next: p => { this.owners = p.content; this.cdr.markForCheck(); }
    });
  }

  /** Carga todos los partes de daños del sistema (MANAGER y ADMIN). */
  loadDamageReports(): void {
    this.damageReportSvc.getAll().subscribe({
      next: list => { this.damageReports = list; this.cdr.markForCheck(); }
    });
  }

  /** Carga todas las facturas del sistema (MANAGER y ADMIN). */
  loadInvoices(): void {
    this.loading = true;
    // El backend devuelve directamente un array, no un objeto paginado
    this.invoiceSvc.getAll().subscribe({
      next: list => { this.invoices = list; this.loading = false; this.cdr.markForCheck(); },
      error: ()  => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  /**
   * Descarga el PDF de la factura de una reserva concreta.
   * Crea un enlace temporal en memoria y lo activa para forzar la descarga.
   */
  downloadInvoicePdf(reservationId: number): void {
    this.invoiceDownloadingId = reservationId;
    this.cdr.markForCheck();
    this.invoiceSvc.downloadPdf(reservationId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `invoice-reservation-${reservationId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.invoiceDownloadingId = null;
        this.cdr.markForCheck();
      },
      error: () => { this.invoiceDownloadingId = null; this.cdr.markForCheck(); }
    });
  }

  /** Carga todas las reseñas del sistema (MANAGER y ADMIN). */
  loadReviews(): void {
    this.loading = true;
    this.reviewSvc.getAll(0, 100).subscribe({
      next: p  => { this.reviews = p.content; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
    });
  }

  /**
   * Carga los datos necesarios para el panel de resumen (MANAGER y ADMIN).
   * Obtiene reservas y flota en paralelo para calcular los KPIs del overview.
   */
  loadOverview(): void {
    // Reservas: para calcular ingresos y estado de cada una
    this.reservationSvc.getAll(0, 200).subscribe({
      next: p => {
        this.confirmedCount = p.content.filter(r => r.status === 'CONFIRMED').length;
        this.cancelledCount = p.content.filter(r => r.status === 'CANCELLED').length;
        this.totalRevenue   = p.content
          .filter(r => r.status === 'CONFIRMED')
          .reduce((sum, r) => sum + r.totalPrice, 0);
        // Notificamos a Angular que los KPIs cambiaron para que los pinte
        this.cdr.markForCheck();
      }
    });
    // Vehículos: para saber cuántos están disponibles
    this.vehicleSvc.getAll(0, 50).subscribe({
      next: p => { this.availableVehicles = p.content.filter(v => v.available).length; this.cdr.markForCheck(); }
    });
    // Clientes registrados
    this.renterSvc.getAll(0, 200).subscribe({
      next: p => { this.totalClients = p.totalElements; this.cdr.markForCheck(); }
    });
    this.overviewLoaded = true;
  }

  // ─── Acciones de gestión ──────────────────────────────────────────────────

  /**
   * Cancela una reserva del panel de MANAGER/ADMIN.
   * Actualiza el elemento en la lista allReservations sin recargar del servidor.
   */
  cancelReservation(r: ReservationDTO): void {
    if (!confirm(`¿Cancelar la reserva #${r.id}?`)) return;
    this.reservationSvc.update(r.id, { ...r, status: 'CANCELLED' }).subscribe({
      next: updated => {
        const idx = this.allReservations.findIndex(x => x.id === r.id);
        if (idx !== -1) this.allReservations[idx] = updated;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Cancela una de las propias reservas del usuario (sección MY RESERVATIONS).
   * Mismo mecanismo que cancelReservation() pero opera sobre myReservations.
   * Solo se muestra el botón si la reserva no está ya CANCELLED o COMPLETED.
   */
  cancelMyReservation(r: ReservationDTO): void {
    if (!confirm(`¿Seguro que quieres cancelar la reserva #${r.id}?`)) return;
    this.reservationSvc.update(r.id, { ...r, status: 'CANCELLED' }).subscribe({
      next: updated => {
        // Actualizamos el elemento en la lista local sin recargar todas las reservas
        const idx = this.myReservations.findIndex(x => x.id === r.id);
        if (idx !== -1) this.myReservations[idx] = updated;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Alterna la disponibilidad de un vehículo llamando al endpoint PATCH.
   * Actualiza el elemento en la lista local sin recargar toda la flota.
   */
  toggleAvailability(v: VehicleDTO): void {
    this.vehicleSvc.toggleAvailability(v.id).subscribe({
      next: updated => {
        const idx = this.vehicles.findIndex(x => x.id === v.id);
        if (idx !== -1) this.vehicles[idx] = updated;
        this.cdr.markForCheck();
      }
    });
  }

  /** Abre el panel de edición prerellenando el formulario con los datos actuales. */
  startEditVehicle(v: VehicleDTO): void {
    this.editError      = '';
    this.editingVehicle = v;
    this.editForm = {
      pricePerDay:    v.pricePerDay,
      horsePower:     v.horsePower,
      productionYear: v.productionYear,
      description:    v.description ?? ''
    };
  }

  /** Cierra el panel de edición sin guardar. */
  cancelEditVehicle(): void {
    this.editingVehicle = null;
    this.editError      = '';
  }

  /**
   * Guarda los cambios. El backend espera multipart/form-data en PUT, así que
   * construimos un FormData solo con los campos editables (sin tocar las imágenes).
   * Los demás campos se envían tal cual estaban para no perder información.
   */
  saveEditVehicle(): void {
    if (!this.editingVehicle) return;
    this.editError   = '';
    this.editLoading = true;

    const v   = this.editingVehicle;
    const fd  = new FormData();
    fd.append('brand',          v.brand);
    fd.append('model',          v.model);
    fd.append('engineType',     v.engineType);
    fd.append('transmission',   v.transmission);
    fd.append('drivetrain',     v.drivetrain);
    fd.append('fuelType',       v.fuelType);
    fd.append('zeroToHundred',  String(v.zeroToHundred));
    fd.append('torqueNm',       String(v.torqueNm));
    fd.append('available',      String(v.available));
    fd.append('categoryId',     String(v.categoryId));
    fd.append('locationId',     String(v.locationId));
    // Campos editados:
    fd.append('pricePerDay',    String(this.editForm.pricePerDay));
    fd.append('horsePower',     String(this.editForm.horsePower));
    fd.append('productionYear', String(this.editForm.productionYear));
    fd.append('description',    this.editForm.description);

    this.vehicleSvc.update(v.id, fd).subscribe({
      next: updated => {
        const idx = this.vehicles.findIndex(x => x.id === v.id);
        if (idx !== -1) this.vehicles[idx] = updated;
        this.editingVehicle = null;
        this.editLoading    = false;
        this.cdr.markForCheck();
      },
      error: err => {
        this.editError   = err?.error ?? 'Error al actualizar el vehículo.';
        this.editLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Elimina un vehículo del catálogo. Solo accesible para ADMIN.
   * Pide confirmación porque la operación es irreversible.
   */
  deleteVehicle(v: VehicleDTO): void {
    if (!confirm(`¿Eliminar definitivamente el ${v.brand} ${v.model}? Esta acción no se puede deshacer.`)) return;
    this.vehicleSvc.delete(v.id).subscribe({
      next: () => { this.vehicles = this.vehicles.filter(x => x.id !== v.id); this.cdr.markForCheck(); },
      error: err => { alert(err?.error ?? 'No se pudo eliminar el vehículo. Puede tener reservas asociadas.'); }
    });
  }

  /**
   * Elimina un parte de daños (solo ADMIN).
   * Actualiza la lista local sin recargar del servidor.
   */
  deleteReport(id: number): void {
    if (!confirm('¿Eliminar este parte de daños?')) return;
    this.damageReportSvc.delete(id).subscribe({
      next: () => { this.damageReports = this.damageReports.filter(d => d.id !== id); this.cdr.markForCheck(); }
    });
  }

  /** Elimina una reseña del sistema. Solo visible para MANAGER y ADMIN. */
  deleteReview(id: number): void {
    if (!confirm('¿Eliminar esta reseña?')) return;
    this.reviewSvc.delete(id).subscribe({
      next: () => { this.reviews = this.reviews.filter(r => r.id !== id); this.cdr.markForCheck(); }
    });
  }

  /**
   * Envía un nuevo parte de daños al backend.
   * Valida que todos los campos estén rellenos antes de llamar al servicio.
   */
  submitReport(): void {
    this.reportError   = '';
    this.reportSuccess = false;
    if (!this.newReport.reservationId || !this.newReport.description || !this.newReport.reportedDate) {
      this.reportError = 'Rellena todos los campos obligatorios.';
      return;
    }
    this.damageReportSvc.create(this.newReport).subscribe({
      next: created => {
        this.damageReports = [created, ...this.damageReports];
        this.reportSuccess = true;
        this.newReport = { reservationId: 0, type: 'PRE', description: '', reportedDate: '' };
        this.cdr.markForCheck();
      },
      error: () => {
        this.reportError = 'Error al registrar el parte. Verifica el ID de reserva.';
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Foto de perfil ───────────────────────────────────────────────────────

  /**
   * Lee el archivo de imagen seleccionado, lo convierte a base64 y lo guarda en localStorage.
   * No se hace ninguna petición HTTP: la foto es local al navegador del usuario.
   */
  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoUrl = reader.result as string;
      localStorage.setItem(`axis-avatar-${this.userEmail}`, this.photoUrl);
      // reader.onload es un callback fuera del ciclo de Angular → necesita markForCheck()
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Devuelve el color del badge de estado de una reserva */
  statusColor(status: string): string {
    if (status === 'CONFIRMED') return '#b8952a';
    if (status === 'CANCELLED') return 'rgba(239,68,68,0.7)';
    return '#9a9a95';
  }

  get isManager(): boolean { return this.userRole === 'ROLE_MANAGER' || this.userRole === 'ROLE_ADMIN'; }
  get isAdmin():   boolean { return this.userRole === 'ROLE_ADMIN'; }

  /** Devuelve la etiqueta legible del rol sin el prefijo ROLE_ */
  get roleLabel(): string { return this.userRole.replace('ROLE_', ''); }

  // ─── Gestión de imágenes de vehículos ─────────────────────────────────────

  /**
   * Construye la URL completa de una imagen servida por el backend.
   * El backend guarda solo el nombre del archivo; aquí lo completamos con la base.
   *
   * @param filename Nombre del archivo (ej: "uuid.jpg")
   * @returns URL completa para mostrar en un <img>
   */
  getVehicleImageUrl(filename: string): string {
    // Quitamos "/api" del final de apiUrl para obtener la raíz del servidor
    return `${environment.apiUrl.replace('/api', '')}/uploads/${filename}`;
  }

  /**
   * Se ejecuta cuando el usuario selecciona un archivo en el input de subida.
   * Sube la imagen al backend y actualiza el vehículo en la lista local.
   *
   * @param vehicle Vehículo al que se asocia la imagen.
   * @param event   Evento change del input[type=file].
   */
  onImageUpload(vehicle: VehicleDTO, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    this.vehicleSvc.uploadImage(vehicle.id, file).subscribe({
      next: updated => {
        // Reemplazamos el vehículo en la lista con la versión actualizada del backend
        const idx = this.vehicles.findIndex(v => v.id === updated.id);
        if (idx !== -1) this.vehicles[idx] = updated;
        this.cdr.markForCheck();
      },
      error: () => console.error('Error al subir imagen')
    });
  }

  /**
   * Elimina una imagen concreta de un vehículo.
   * Llama al backend y actualiza la lista local sin recargar todo.
   *
   * @param vehicle  Vehículo propietario de la imagen.
   * @param filename Nombre del archivo a eliminar.
   */
  removeVehicleImage(vehicle: VehicleDTO, filename: string): void {
    this.vehicleSvc.removeImage(vehicle.id, filename).subscribe({
      next: updated => {
        // Actualizamos la entrada del vehículo con la respuesta del backend
        const idx = this.vehicles.findIndex(v => v.id === updated.id);
        if (idx !== -1) this.vehicles[idx] = updated;
        this.cdr.markForCheck();
      },
      error: () => console.error('Error al eliminar imagen')
    });
  }
}
