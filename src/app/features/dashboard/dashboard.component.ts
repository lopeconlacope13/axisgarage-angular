import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RenterService } from '../../core/services/renter.service';
import { ReservationService } from '../../core/services/reservation.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { OwnerService } from '../../core/services/owner.service';
import { DamageReportService } from '../../core/services/damage-report.service';
import { ReviewService } from '../../core/services/review.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { UserService } from '../../core/services/user.service';
import { StatsService } from '../../core/services/stats.service';
import { UserDTO, ReservationDTO, VehicleDTO, VehicleCategoryDTO, LocationDTO, RenterDTO, OwnerDTO, DamageReportDTO, ReviewDTO, InvoiceDTO, UserSummary } from '../../models/types';
import { environment } from '../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

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
  /** Datos de facturación del Renter: dni, phone, address */
  renterData: any = null;
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

  /** Lista de todos los usuarios del sistema (solo para ADMIN) */
  users: UserSummary[] = [];

  /** Formulario para registrar un nuevo parte de daños */
  newReport = { reservationId: 0, type: 'PRE' as 'PRE' | 'POST', description: '', reportedDate: '' };
  reportError   = '';
  reportSuccess = false;

  // ─── Formulario de reseña ─────────────────────────────────────────────────
  /** ID de la reserva que se está valorando. Null si el modal está cerrado. */
  reviewingReservationId: number | null = null;
  /** Datos del formulario de reseña */
  reviewForm = { rating: 5, comment: '' };
  /** Mensaje de error del formulario de reseña */
  reviewError = '';
  /**
   * IDs de reservas para las que ya se ha enviado una reseña en esta sesión.
   * Se usa para ocultar el botón tras el envío sin necesidad de un endpoint extra.
   */
  reviewedReservationIds = new Set<number>();

  // ─── Estadísticas del backend (endpoint /api/stats) ──────────────────────
  /**
   * Datos devueltos por GET /api/stats: reservas totales, vehículos disponibles y clientes.
   * Null hasta que se carga; el template lo muestra solo cuando tiene valor.
   */
  stats: { totalReservations: number; availableVehicles: number; totalClients: number } | null = null;

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
    private userSvc:           UserService,
    private statsSvc:          StatsService,
    private router:            Router,
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

    // Cargamos la foto de perfil desde el backend (campo 'image' del UserDTO)
    this.authSvc.getProfile().subscribe({
      next: profile => {
        if (profile.image) {
          // Construimos la URL completa del avatar a partir del nombre de archivo
          this.photoUrl = `${environment.apiUrl.replace('/api', '')}/uploads/${profile.image}`;
        }
        this.cdr.markForCheck();
      }
    });

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
    if (section === 'users'           && !this.users.length)            this.loadUsers();
  }

  // ─── Carga de datos por sección ───────────────────────────────────────────

  /** Carga el perfil del usuario autenticado desde GET /api/user */
  loadProfile(): void {
    this.authSvc.getProfile().subscribe({
      next: p => {
        this.profileData = p;
        this.cdr.markForCheck();

        // Tras cargar el perfil, cargamos también los datos de facturación del Renter
        // (dni, phone, address) para mostrarlos en la sección de perfil.
        // Usamos el email del JWT que ya tenemos en this.userEmail.
        this.renterSvc.getByEmail(this.userEmail).subscribe({
          next: r => { this.renterData = r; this.cdr.markForCheck(); }
        });
      }
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
      next: p => { this.totalClients = p.page.totalElements; this.cdr.markForCheck(); }
    });
    // Cargamos las estadísticas consolidadas desde el endpoint dedicado
    this.statsSvc.getStats().subscribe({
      next: s => { this.stats = s; this.cdr.markForCheck(); }
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

  /**
   * Navega a la página de edición dedicada del vehículo seleccionado.
   * La lógica de edición se ha movido a VehicleEditComponent para mayor claridad.
   *
   * @param id Identificador del vehículo a editar
   */
  navigateToEdit(id: number): void {
    this.router.navigate(['/dashboard/vehicles', id, 'edit']);
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

  // ─── Gestión de usuarios (solo ADMIN) ────────────────────────────────────

  /** Carga la lista completa de usuarios del sistema desde GET /api/users */
  loadUsers(): void {
    this.userSvc.getAll().subscribe({
      next: list => { this.users = list; this.cdr.markForCheck(); }
    });
  }

  /**
   * Alterna el rol de un usuario entre ROLE_USER y ROLE_MANAGER.
   * Si el usuario es MANAGER pasa a USER, y viceversa.
   * Tras el cambio recarga la lista completa para reflejar el estado actual.
   *
   * @param user El UserSummary del usuario al que se cambia el rol.
   */
  toggleUserRole(user: UserSummary): void {
    // Determinamos el rol destino: si es MANAGER baja a USER, si es USER sube a MANAGER
    const currentRole = user.roles[0] ?? 'ROLE_USER';
    const newRole = currentRole === 'ROLE_MANAGER' ? 'ROLE_USER' : 'ROLE_MANAGER';

    this.userSvc.changeRole(user.id, newRole).subscribe({
      next: () => this.loadUsers()
    });
  }

  /**
   * Elimina un usuario del sistema tras pedir confirmación al administrador.
   * El usuario con ID=1 y el usuario logueado no tienen este botón visible.
   *
   * @param user El UserSummary del usuario a eliminar.
   */
  removeUser(user: UserSummary): void {
    if (!confirm(`¿Eliminar usuario "${user.username}"? Esta acción no se puede deshacer.`)) return;
    this.userSvc.deleteUser(user.id).subscribe({
      next: () => {
        // Eliminamos el elemento de la lista local sin recargar del servidor
        this.users = this.users.filter(u => u.id !== user.id);
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Cambio de contraseña ─────────────────────────────────────────────────

  /** Contraseña actual introducida en el formulario */
  currentPassword  = '';
  /** Nueva contraseña introducida en el formulario */
  newPassword      = '';
  /** Confirmación de la nueva contraseña (debe coincidir con newPassword) */
  confirmPassword  = '';
  /** Mensaje de éxito tras cambiar la contraseña correctamente */
  passwordMessage  = '';
  /** Mensaje de error si la contraseña actual es incorrecta o las nuevas no coinciden */
  passwordError    = '';

  /**
   * Envía la solicitud de cambio de contraseña al backend.
   * Antes de llamar al servidor, comprueba que la nueva contraseña y la confirmación coincidan.
   * Si no coinciden, muestra un error local sin llamar al backend.
   */
  changePassword(): void {
    // Limpiamos mensajes anteriores para no confundir al usuario
    this.passwordMessage = '';
    this.passwordError   = '';

    // Validación local: las dos contraseñas nuevas deben ser idénticas
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      this.cdr.markForCheck();
      return;
    }

    // Llamamos al backend para verificar la contraseña actual y actualizar la nueva
    this.authSvc.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordMessage = 'Contraseña actualizada correctamente.';
        // Limpiamos los campos del formulario tras el éxito
        this.currentPassword  = '';
        this.newPassword      = '';
        this.confirmPassword  = '';
        this.cdr.markForCheck();
      },
      error: () => {
        this.passwordError = 'Contraseña actual incorrecta.';
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Foto de perfil ───────────────────────────────────────────────────────

  /**
   * Sube la imagen de perfil al backend cuando el usuario selecciona un archivo.
   * Llama a AuthService.uploadAvatar() que hace POST /api/user/avatar con el archivo.
   * Al recibir respuesta, actualiza photoUrl con la URL del nuevo avatar.
   */
  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Subimos el archivo al backend y actualizamos la URL de la foto
    this.authSvc.uploadAvatar(file).subscribe({
      next: updated => {
        if (updated.image) {
          this.photoUrl = `${environment.apiUrl.replace('/api', '')}/uploads/${updated.image}`;
        }
        // Notificamos a Angular para que re-renderice el avatar
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Formulario de creación de vehículo ───────────────────────────────────

  /** Controla si el formulario de creación está visible o no */
  showCreateForm = false;

  /** Listas de categorías y ubicaciones para los selectores del formulario */
  categories: VehicleCategoryDTO[] = [];
  locations:  LocationDTO[]         = [];

  /**
   * Datos del formulario de creación de vehículo.
   * Se corresponden campo a campo con el VehicleDTO que espera el backend.
   */
  newVehicle = {
    brand:          '',
    model:          '',
    productionYear: new Date().getFullYear(),
    pricePerDay:    0,
    engineType:     '',
    horsePower:     0,
    torqueNm:       0,
    transmission:   '',
    drivetrain:     '',
    fuelType:       '',
    zeroToHundred:  0,
    description:    '',
    available:      true,
    categoryId:     0,
    locationId:     0
  };

  /** Archivo de imagen principal seleccionado (opcional en la creación) */
  newVehicleImageFile: File | null = null;

  /** Mensaje de error de validación del formulario de creación */
  createError   = '';
  /** True mientras la petición al backend está en curso */
  creating      = false;
  /** True cuando el vehículo se ha creado correctamente (muestra mensaje de éxito) */
  createSuccess = false;

  /**
   * Abre el formulario de creación y carga categorías/ubicaciones si aún no están.
   * Separo la carga de catálogos en un método propio para que sea reutilizable.
   */
  openCreateForm(): void {
    this.showCreateForm = true;
    this.createError    = '';
    this.createSuccess  = false;
    // Solo cargamos categorías y ubicaciones la primera vez
    if (!this.categories.length) {
      this.vehicleSvc.getCategories().subscribe({
        next: list => { this.categories = list; this.cdr.markForCheck(); }
      });
    }
    if (!this.locations.length) {
      this.vehicleSvc.getLocations().subscribe({
        next: list => { this.locations = list; this.cdr.markForCheck(); }
      });
    }
    this.cdr.markForCheck();
  }

  /** Cierra el formulario de creación y resetea su estado. */
  closeCreateForm(): void {
    this.showCreateForm     = false;
    this.createError        = '';
    this.createSuccess      = false;
    this.newVehicleImageFile = null;
    // Reseteamos el formulario a sus valores por defecto
    this.newVehicle = {
      brand: '', model: '', productionYear: new Date().getFullYear(),
      pricePerDay: 0, engineType: '', horsePower: 0, torqueNm: 0,
      transmission: '', drivetrain: '', fuelType: '', zeroToHundred: 0,
      description: '', available: true, categoryId: 0, locationId: 0
    };
    this.cdr.markForCheck();
  }

  /**
   * Captura el archivo de imagen seleccionado en el input file.
   * Solo guardamos la referencia; se incluye en el FormData al enviar.
   */
  onNewVehicleImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.newVehicleImageFile = file ?? null;
  }

  /**
   * Valida el formulario y envía el nuevo vehículo al backend.
   * Construye un FormData con todos los campos (obligatorio porque el backend
   * espera multipart/form-data para poder recibir también la imagen).
   *
   * Al crear correctamente, añade el vehículo al principio de la lista local
   * y cierra el formulario.
   */
  submitCreateVehicle(): void {
    this.createError   = '';
    this.createSuccess = false;

    // Validación mínima antes de llamar al backend
    if (!this.newVehicle.brand.trim() || !this.newVehicle.model.trim()) {
      this.createError = 'La marca y el modelo son obligatorios.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.newVehicle.categoryId || !this.newVehicle.locationId) {
      this.createError = 'Selecciona una categoría y una ubicación.';
      this.cdr.markForCheck();
      return;
    }
    if (this.newVehicle.pricePerDay <= 0) {
      this.createError = 'El precio por día debe ser mayor que 0.';
      this.cdr.markForCheck();
      return;
    }

    this.creating = true;

    // Construimos el FormData campo a campo (el backend usa @ModelAttribute)
    const fd = new FormData();
    fd.append('brand',          this.newVehicle.brand.trim());
    fd.append('model',          this.newVehicle.model.trim());
    fd.append('productionYear', String(this.newVehicle.productionYear));
    fd.append('pricePerDay',    String(this.newVehicle.pricePerDay));
    fd.append('engineType',     this.newVehicle.engineType.trim());
    fd.append('horsePower',     String(this.newVehicle.horsePower));
    fd.append('torqueNm',       String(this.newVehicle.torqueNm));
    fd.append('transmission',   this.newVehicle.transmission.trim());
    fd.append('drivetrain',     this.newVehicle.drivetrain.trim());
    fd.append('fuelType',       this.newVehicle.fuelType.trim());
    fd.append('zeroToHundred',  String(this.newVehicle.zeroToHundred));
    fd.append('description',    this.newVehicle.description.trim());
    fd.append('available',      String(this.newVehicle.available));
    fd.append('categoryId',     String(this.newVehicle.categoryId));
    fd.append('locationId',     String(this.newVehicle.locationId));

    // Añadimos la imagen si el gestor ha seleccionado una
    if (this.newVehicleImageFile) {
      fd.append('imageFiles', this.newVehicleImageFile);
    }

    this.vehicleSvc.create(fd).subscribe({
      next: created => {
        // Añadimos el vehículo creado al principio de la lista (se ve de inmediato)
        this.vehicles = [created, ...this.vehicles];
        this.creating      = false;
        this.createSuccess = true;
        this.cdr.markForCheck();
        // Cerramos el formulario tras 1.5 segundos para que el usuario vea el éxito
        setTimeout(() => this.closeCreateForm(), 1500);
      },
      error: err => {
        this.createError = err?.error ?? 'Error al crear el vehículo. Revisa los datos.';
        this.creating    = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Devuelve el color del badge de estado de una reserva */
  statusColor(status: string): string {
    if (status === 'CONFIRMED') return 'var(--axis-gold)';
    if (status === 'CANCELLED') return 'rgba(239,68,68,0.7)';
    return '#9a9a95';
  }

  get isManager(): boolean { return this.userRole === 'ROLE_MANAGER' || this.userRole === 'ROLE_ADMIN'; }
  get isAdmin():   boolean { return this.userRole === 'ROLE_ADMIN'; }

  /** Devuelve la etiqueta legible del rol sin el prefijo ROLE_ */
  get roleLabel(): string { return this.userRole.replace('ROLE_', ''); }

  /** Abre el modal de reseña para la reserva indicada. */
  openReviewForm(reservationId: number): void {
    this.reviewingReservationId = reservationId;
    this.reviewForm = { rating: 5, comment: '' };
    this.reviewError = '';
    this.cdr.markForCheck();
  }

  /** Cierra el modal de reseña sin guardar. */
  closeReviewForm(): void {
    this.reviewingReservationId = null;
    this.cdr.markForCheck();
  }

  /**
   * Envía la reseña al backend y, si tiene éxito, marca la reserva como valorada
   * para ocultar el botón sin necesidad de recargar.
   */
  submitReview(): void {
    if (!this.reviewForm.comment.trim()) {
      this.reviewError = 'El comentario no puede estar vacío.';
      this.cdr.markForCheck();
      return;
    }
    const reservation = this.myReservations.find(r => r.id === this.reviewingReservationId);
    if (!reservation) return;

    this.reviewSvc.create({
      rating: this.reviewForm.rating,
      comment: this.reviewForm.comment.trim(),
      reservationId: this.reviewingReservationId!
    }).subscribe({
      next: () => {
        this.reviewedReservationIds.add(this.reviewingReservationId!);
        this.reviewingReservationId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.reviewError = 'No se pudo enviar la reseña. Puede que ya hayas valorado esta reserva.';
        this.cdr.markForCheck();
      }
    });
  }

}
