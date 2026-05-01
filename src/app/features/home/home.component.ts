import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleDTO } from '../../models/types';
import { environment } from '../../../environments/environment';

/**
 * Página de inicio: hero con fondo dinámico, marquee de partners
 * y tres vehículos destacados traídos en tiempo real del backend.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
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

  constructor(private vehicleSvc: VehicleService) {}

  ngOnInit(): void {
    // Cargamos los vehículos más exclusivos (FEATURED_COUNT) ordenados por precio descendente
    this.vehicleSvc.getAll(0, this.FEATURED_COUNT, 'pricePerDay,desc').subscribe({
      next: p => {
        this.featuredVehicles = p.content;
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
