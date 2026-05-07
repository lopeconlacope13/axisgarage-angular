import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleCategoryDTO, LocationDTO } from '../../../models/types';

/**
 * Página dedicada a la creación de un nuevo vehículo en el catálogo.
 *
 * Esta página solo es accesible para MANAGER y ADMIN (protegida en app.routes.ts
 * con authGuard + roleGuard). Sustituye al formulario inline que existía en
 * el DashboardComponent, separando la responsabilidad de forma más limpia.
 *
 * El formulario se envía como multipart/form-data porque el backend usa
 * @ModelAttribute + MultipartFile para admitir la imagen principal.
 *
 * Al crear con éxito → navega a /dashboard.
 * Al cancelar → navega a /dashboard.
 */
@Component({
  selector: 'app-vehicle-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-create.component.html',
  // OnPush: Angular solo re-renderiza cuando llamamos markForCheck()
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleCreateComponent implements OnInit {

  // ─── Listas auxiliares para los selectores ───────────────────────────────
  /** Categorías de vehículo cargadas desde GET /api/categories */
  categories: VehicleCategoryDTO[] = [];
  /** Ubicaciones disponibles cargadas desde GET /api/locations */
  locations: LocationDTO[] = [];

  // ─── Datos del formulario ─────────────────────────────────────────────────
  /**
   * Objeto que acumula los valores del formulario.
   * Los campos coinciden uno a uno con lo que espera el backend.
   */
  vehicle = {
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

  /** Archivo de imagen principal seleccionado (opcional) */
  imageFile: File | null = null;

  // ─── Estado de la petición ────────────────────────────────────────────────
  /** True mientras la petición al backend está en curso */
  submitting = false;
  /** Mensaje de error de validación o del servidor */
  errorMsg = '';
  /** True cuando el vehículo se ha creado correctamente */
  success = false;

  constructor(
    private vehicleSvc: VehicleService,
    private router:     Router,
    private cdr:        ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargamos categorías y ubicaciones al entrar en la página
    this.vehicleSvc.getCategories().subscribe({
      next: list => { this.categories = list; this.cdr.markForCheck(); }
    });
    this.vehicleSvc.getLocations().subscribe({
      next: list => { this.locations = list; this.cdr.markForCheck(); }
    });
  }

  /**
   * Captura el archivo de imagen cuando el usuario lo selecciona.
   * Solo guardamos la referencia; se añade al FormData al enviar.
   */
  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.imageFile = file ?? null;
  }

  /**
   * Valida el formulario y envía el nuevo vehículo al backend.
   *
   * Construye un FormData con todos los campos y, si el gestor eligió
   * una imagen, la añade también. El backend responde con el VehicleDTO creado.
   *
   * Si la operación tiene éxito, espera 1.5 s para que el usuario vea el mensaje
   * de confirmación y luego navega al dashboard.
   */
  submit(): void {
    // Limpiamos mensajes anteriores
    this.errorMsg = '';
    this.success  = false;

    // ── Validación mínima ──────────────────────────────────────────────────
    if (!this.vehicle.brand.trim() || !this.vehicle.model.trim()) {
      this.errorMsg = 'La marca y el modelo son obligatorios.';
      this.cdr.markForCheck();
      return;
    }
    if (!this.vehicle.categoryId || !this.vehicle.locationId) {
      this.errorMsg = 'Selecciona una categoría y una ubicación.';
      this.cdr.markForCheck();
      return;
    }
    if (this.vehicle.pricePerDay <= 0) {
      this.errorMsg = 'El precio por día debe ser mayor que 0.';
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;

    // ── Construcción del FormData ──────────────────────────────────────────
    // El backend usa @ModelAttribute, por eso enviamos cada campo como parte separada
    const fd = new FormData();
    fd.append('brand',          this.vehicle.brand.trim());
    fd.append('model',          this.vehicle.model.trim());
    fd.append('productionYear', String(this.vehicle.productionYear));
    fd.append('pricePerDay',    String(this.vehicle.pricePerDay));
    fd.append('engineType',     this.vehicle.engineType.trim());
    fd.append('horsePower',     String(this.vehicle.horsePower));
    fd.append('torqueNm',       String(this.vehicle.torqueNm));
    fd.append('transmission',   this.vehicle.transmission.trim());
    fd.append('drivetrain',     this.vehicle.drivetrain.trim());
    fd.append('fuelType',       this.vehicle.fuelType.trim());
    fd.append('zeroToHundred',  String(this.vehicle.zeroToHundred));
    fd.append('description',    this.vehicle.description.trim());
    fd.append('available',      String(this.vehicle.available));
    fd.append('categoryId',     String(this.vehicle.categoryId));
    fd.append('locationId',     String(this.vehicle.locationId));

    // Añadimos la imagen solo si el gestor seleccionó una
    if (this.imageFile) {
      fd.append('imageFiles', this.imageFile);
    }

    // ── Llamada al backend ─────────────────────────────────────────────────
    this.vehicleSvc.create(fd).subscribe({
      next: () => {
        // Mostramos el mensaje de éxito y redirigimos al dashboard tras 1.5s
        this.submitting = false;
        this.success    = true;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: err => {
        this.errorMsg   = err?.error ?? 'Error al crear el vehículo. Revisa los datos.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  /** Cancela la operación y vuelve al dashboard sin guardar nada. */
  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

}
