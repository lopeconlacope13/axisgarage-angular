import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleDTO } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Página de inicio: hero con fondo dinámico, marquee de partners
 * y tres vehículos destacados traídos en tiempo real del backend.
 *
 * NOTA DE CHANGE DETECTION:
 * La app usa Angular Zoneless (sin Zone.js), por lo que los cambios
 * que ocurren dentro de callbacks HTTP asincrónicos NO se detectan
 * automáticamente. Por eso inyectamos ChangeDetectorRef y llamamos
 * markForCheck() después de actualizar los datos, para forzar a Angular
 * a re-renderizar la vista con los nuevos valores.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  // OnPush: Angular solo comprueba cambios cuando le decimos explícitamente
  // que hay datos nuevos (con markForCheck). Más eficiente en Zoneless.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  /** Los seis coches más representativos de la flota */
  featuredVehicles: VehicleDTO[] = [];

  /** Número de vehículos destacados que se muestran en el hero */
  private readonly FEATURED_COUNT = 6;

  /**
   * URL base del backend, extraída de environment para evitar hardcoding.
   * Se elimina '/api' porque las imágenes se sirven desde la raíz del servidor.
   */
  private readonly backendUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private vehicleSvc: VehicleService,
    // Necesario en modo Zoneless: notifica a Angular que debe re-renderizar
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargamos los vehículos más exclusivos (FEATURED_COUNT) ordenados por precio descendente
    this.vehicleSvc.getAll(0, this.FEATURED_COUNT, 'pricePerDay,desc').subscribe({
      next: p => {
        this.featuredVehicles = p.content;
        // Sin esta llamada, Angular Zoneless no sabe que los datos cambiaron
        // y la vista se queda en blanco hasta que el usuario interactúa
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Devuelve la URL completa de la primera imagen de un vehículo destacado.
   * El backend guarda solo el nombre del archivo, así que lo completamos aquí.
   *
   * @param vehicle - El vehículo del que queremos la imagen
   * @returns URL completa si existe imagen, null si no
   */
  getImageUrl(vehicle: VehicleDTO): string | null {
    if (vehicle.images && vehicle.images.length > 0) {
      return `${this.backendUrl}/uploads/${vehicle.images[0]}`;
    }
    return null;
  }
}
