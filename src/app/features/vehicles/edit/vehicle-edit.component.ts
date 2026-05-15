import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { VehicleService }  from '../../../core/services/vehicle.service';
import { VehicleDTO }      from '../../../models/types';
import { environment }     from '../../../../environments/environment';

/**
 * Página de edición dedicada para un vehículo de la flota.
 *
 * Accesible desde el botón EDIT del panel FLEET en el dashboard.
 * Lee el :id de la URL, carga el vehículo del backend y permite modificar
 * los campos editables (precio, caballos, año, descripción) y gestionar
 * la galería de imágenes (subir y eliminar).
 *
 * FLUJO:
 *   1. ngOnInit → VehicleService.getById(id) → rellena editForm con datos actuales
 *   2. save()   → construye FormData con TODOS los campos → PUT /vehicles/:id → navega a /dashboard
 *   3. uploadImage() → POST /vehicles/:id/images → actualiza this.vehicle con el nuevo array images
 *   4. removeImage() → DELETE /vehicles/:id/images/:filename → actualiza this.vehicle
 *
 * IMPORTANTE: El PUT espera multipart/form-data con todos los campos del vehículo,
 * no solo los editados. Por eso los campos estáticos (brand, model, etc.) se envían
 * tal cual estaban en el DTO original.
 *
 * CHANGE DETECTION:
 * OnPush + markForCheck() → compatible con Angular Zoneless (sin Zone.js).
 */
@Component({
  selector: 'app-vehicle-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './vehicle-edit.component.html',
  styleUrl: './vehicle-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleEditComponent implements OnInit {

  /** Vehículo cargado desde el backend (null mientras carga) */
  vehicle: VehicleDTO | null = null;

  /**
   * Campos que el gestor puede modificar.
   * Se inicializan con los valores actuales del vehículo al cargar la página.
   */
  editForm = {
    pricePerDay:    0,
    horsePower:     0,
    productionYear: 0,
    description:    ''
  };

  /** ID del vehículo leído de la URL (/dashboard/vehicles/:id/edit) */
  vehicleId = 0;

  loading      = false;
  saving       = false;
  savingOrder  = false;
  orderChanged = false;
  error        = '';
  saveError    = '';

  /**
   * URL base del backend para construir las rutas de imágenes.
   * Eliminamos /api del final porque los archivos están en /uploads.
   */
  private readonly backendUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private route:      ActivatedRoute,
    private router:     Router,
    private vehicleSvc: VehicleService,
    private cdr:        ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Leemos el :id de los parámetros de la URL
    this.vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadVehicle();
  }

  /**
   * Carga el vehículo desde el backend y rellena el formulario con sus valores actuales.
   * Si falla (ID no encontrado, error de red), muestra mensaje de error.
   */
  loadVehicle(): void {
    this.loading = true;
    this.error   = '';
    this.vehicleSvc.getById(this.vehicleId).subscribe({
      next: v => {
        this.vehicle = v;
        // Pre-rellenamos el formulario con los valores actuales del vehículo
        this.editForm = {
          pricePerDay:    v.pricePerDay,
          horsePower:     v.horsePower,
          productionYear: v.productionYear,
          description:    v.description ?? ''
        };
        this.loading = false;
        // Notificamos a Angular que hay datos nuevos (necesario en modo Zoneless)
        this.cdr.markForCheck();
      },
      error: () => {
        this.error   = 'No se pudo cargar el vehículo.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Guarda los cambios enviando todos los campos al backend mediante PUT multipart/form-data.
   * Los campos estáticos (brand, model, etc.) se envían tal cual para no perder información.
   * Los campos editables se toman del formulario.
   *
   * Al completarse con éxito, navega de vuelta al dashboard.
   */
  save(): void {
    if (!this.vehicle) return;

    this.saveError = '';
    this.saving    = true;

    const v  = this.vehicle;
    const fd = new FormData();

    // Campos estáticos: se envían exactamente como están en el DTO
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

    // Campos editables: tomados del formulario
    fd.append('pricePerDay',    String(this.editForm.pricePerDay));
    fd.append('horsePower',     String(this.editForm.horsePower));
    fd.append('productionYear', String(this.editForm.productionYear));
    fd.append('description',    this.editForm.description);

    this.vehicleSvc.update(this.vehicleId, fd).subscribe({
      next: () => {
        // Redirigimos al dashboard con la sección fleet activa
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.saveError = err?.error ?? 'Error al guardar los cambios.';
        this.saving    = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Sube una o varias imágenes a la galería del vehículo.
   * El input[type=file multiple] puede devolver varios archivos a la vez.
   * Se suben en secuencia: cada petición espera a que la anterior termine
   * para que el array de imágenes no tenga condiciones de carrera.
   *
   * @param event Evento change del input de archivo
   */
  uploadImage(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0 || !this.vehicle) return;

    // Convertimos FileList a array normal para poder iterar con índice
    const fileArray = Array.from(files);
    let index = 0;

    // Función recursiva que sube un archivo y al terminar pasa al siguiente
    const uploadNext = (): void => {
      if (index >= fileArray.length) return;
      const file = fileArray[index++];
      this.vehicleSvc.uploadImage(this.vehicleId, file).subscribe({
        next: updated => {
          // Actualizamos el vehículo con el DTO más reciente del backend
          this.vehicle = updated;
          this.cdr.markForCheck();
          // Subimos el siguiente archivo
          uploadNext();
        },
        error: () => {
          alert(`Error al subir la imagen: ${file.name}`);
          // Continuamos con el resto aunque uno falle
          uploadNext();
        }
      });
    };

    uploadNext();
  }

  /**
   * Elimina una imagen de la galería tras confirmación del usuario.
   * Actualiza this.vehicle con la respuesta del backend.
   *
   * @param filename Nombre del archivo a eliminar (ej: "ferrari-01.jpg")
   */
  removeImage(filename: string): void {
    if (!confirm('¿Eliminar esta imagen?')) return;

    this.vehicleSvc.removeImage(this.vehicleId, filename).subscribe({
      next: updated => {
        this.vehicle = updated;
        this.cdr.markForCheck();
      },
      error: () => {
        alert('Error al eliminar la imagen.');
      }
    });
  }

  /**
   * Mueve una imagen hacia arriba o hacia abajo en el array de imágenes.
   * El intercambio se hace localmente; no llama al backend hasta que el
   * usuario pulse "SAVE ORDER".
   *
   * @param index Posición actual de la imagen en el array
   * @param dir   -1 para subir, +1 para bajar
   */
  moveImage(index: number, dir: -1 | 1): void {
    if (!this.vehicle) return;
    const imgs  = [...this.vehicle.images];
    const target = index + dir;
    // Comprobamos que el destino esté dentro del rango
    if (target < 0 || target >= imgs.length) return;
    // Intercambiamos las dos posiciones (swap clásico con variable temporal)
    const temp    = imgs[index];
    imgs[index]   = imgs[target];
    imgs[target]  = temp;
    this.vehicle  = { ...this.vehicle, images: imgs };
    this.orderChanged = true;
    this.cdr.markForCheck();
  }

  /**
   * Envía el nuevo orden de imágenes al backend.
   * Solo se activa cuando el usuario ha movido al menos una imagen (orderChanged).
   */
  saveOrder(): void {
    if (!this.vehicle || !this.orderChanged) return;
    this.savingOrder = true;
    this.vehicleSvc.reorderImages(this.vehicleId, this.vehicle.images).subscribe({
      next: updated => {
        this.vehicle      = updated;
        this.orderChanged = false;
        this.savingOrder  = false;
        this.cdr.markForCheck();
      },
      error: () => {
        alert('Error al guardar el orden de las imágenes.');
        this.savingOrder = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Construye la URL completa de una imagen a partir de su nombre de archivo.
   * Las imágenes se sirven desde /uploads/ en el servidor backend.
   *
   * @param filename Nombre del archivo (ej: "ferrari-front.jpg")
   * @returns URL completa accesible desde el navegador
   */
  imageUrl(filename: string): string {
    return `${this.backendUrl}/uploads/${filename}`;
  }
}
