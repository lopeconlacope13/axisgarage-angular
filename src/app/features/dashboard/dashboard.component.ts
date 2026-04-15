import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RenterService } from '../../core/services/renter.service';
import { ReservationService } from '../../core/services/reservation.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { OwnerService } from '../../core/services/owner.service';
import { DamageReportService } from '../../core/services/damage-report.service';
import { UserDTO, ReservationDTO, VehicleDTO, RenterDTO, OwnerDTO, DamageReportDTO } from '../../models/types';

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
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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

  /** Formulario de cambio de contraseña */
  pwdForm    = { current: '', newPwd: '', confirm: '' };
  pwdError   = '';
  pwdSuccess = false;
  pwdLoading = false;

  // ─── Datos de las secciones ───────────────────────────────────────────────
  myReservations:  ReservationDTO[]  = [];
  allReservations: ReservationDTO[]  = [];
  vehicles:        VehicleDTO[]      = [];
  renters:         RenterDTO[]        = [];
  owners:          OwnerDTO[]         = [];
  damageReports:   DamageReportDTO[]  = [];

  /** Formulario para registrar un nuevo parte de daños */
  newReport = { reservationId: 0, type: 'PRE' as 'PRE' | 'POST', description: '', reportedDate: '' };
  reportError   = '';
  reportSuccess = false;

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
    private damageReportSvc:   DamageReportService
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
    if (section === 'damage-reports'  && !this.damageReports.length)    this.loadDamageReports();
  }

  // ─── Carga de datos por sección ───────────────────────────────────────────

  /** Carga el perfil del usuario autenticado desde GET /api/user */
  loadProfile(): void {
    this.authSvc.getProfile().subscribe({ next: p => this.profileData = p });
  }

  /**
   * Carga las reservas del usuario autenticado en dos pasos:
   * 1. Resuelve el renterId a partir del email del JWT.
   * 2. Consulta las reservas filtradas por ese renterId.
   */
  loadMyReservations(): void {
    this.renterSvc.getByEmail(this.userEmail).subscribe({
      next: renter => {
        this.reservationSvc.getByRenterId(renter.id).subscribe({
          next: page => { this.myReservations = page.content; }
        });
      }
    });
  }

  /** Carga todas las reservas del sistema (para MANAGER y ADMIN) */
  loadAllReservations(): void {
    this.loading = true;
    this.reservationSvc.getAll(0, 50).subscribe({
      next:  p  => { this.allReservations = p.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  /** Carga el catálogo completo de vehículos (para MANAGER y ADMIN) */
  loadVehicles(): void {
    this.vehicleSvc.getAll(0, 50).subscribe({ next: p => this.vehicles = p.content });
  }

  /** Carga la lista de clientes registrados (para MANAGER y ADMIN) */
  loadRenters(): void {
    this.renterSvc.getAll(0, 50).subscribe({ next: p => this.renters = p.content });
  }

  /** Carga la lista de propietarios de vehículos (solo para ADMIN) */
  loadOwners(): void {
    this.ownerSvc.getAll(0, 50).subscribe({ next: p => this.owners = p.content });
  }

  /** Carga todos los partes de daños del sistema (MANAGER y ADMIN). */
  loadDamageReports(): void {
    this.damageReportSvc.getAll().subscribe({ next: list => this.damageReports = list });
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
      }
    });
    // Vehículos: para saber cuántos están disponibles
    this.vehicleSvc.getAll(0, 50).subscribe({
      next: p => { this.availableVehicles = p.content.filter(v => v.available).length; }
    });
    // Clientes registrados
    this.renterSvc.getAll(0, 200).subscribe({
      next: p => { this.totalClients = p.totalElements; }
    });
    this.overviewLoaded = true;
  }

  // ─── Acciones de gestión ──────────────────────────────────────────────────

  /**
   * Cancela una reserva enviando el DTO completo con status = CANCELLED.
   * El backend actualiza el estado sin modificar el resto de los datos.
   */
  cancelReservation(r: ReservationDTO): void {
    if (!confirm(`¿Cancelar la reserva #${r.id}?`)) return;
    this.reservationSvc.update(r.id, { ...r, status: 'CANCELLED' }).subscribe({
      next: updated => {
        const idx = this.allReservations.findIndex(x => x.id === r.id);
        if (idx !== -1) this.allReservations[idx] = updated;
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
      }
    });
  }

  /**
   * Elimina un parte de daños (solo ADMIN).
   * Actualiza la lista local sin recargar del servidor.
   */
  deleteReport(id: number): void {
    if (!confirm('¿Eliminar este parte de daños?')) return;
    this.damageReportSvc.delete(id).subscribe({
      next: () => { this.damageReports = this.damageReports.filter(d => d.id !== id); }
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
      },
      error: () => { this.reportError = 'Error al registrar el parte. Verifica el ID de reserva.'; }
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
    };
    reader.readAsDataURL(file);
  }

  // ─── Cambio de contraseña ─────────────────────────────────────────────────

  /**
   * Valida el formulario y llama al endpoint PUT /api/user/change-password.
   * El backend verifica la contraseña actual antes de guardar la nueva.
   */
  changePassword(): void {
    this.pwdError   = '';
    this.pwdSuccess = false;

    if (!this.pwdForm.current || !this.pwdForm.newPwd || !this.pwdForm.confirm) {
      this.pwdError = 'Rellena todos los campos.';
      return;
    }
    if (this.pwdForm.newPwd !== this.pwdForm.confirm) {
      this.pwdError = 'Las contraseñas nuevas no coinciden.';
      return;
    }

    this.pwdLoading = true;
    this.authSvc.changePassword(this.pwdForm.current, this.pwdForm.newPwd).subscribe({
      next: () => {
        this.pwdSuccess = true;
        this.pwdLoading = false;
        this.pwdForm    = { current: '', newPwd: '', confirm: '' };
      },
      error: err => {
        this.pwdError   = err?.error ?? 'Error al cambiar la contraseña.';
        this.pwdLoading = false;
      }
    });
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
}
