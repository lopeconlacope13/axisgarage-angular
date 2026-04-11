import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleDTO, Page } from '../../../models/types';

/**
 * CATÁLOGO DE VEHÍCULOS
 * -------------------------------------------------------
 * Muestra los vehículos en una cuadrícula 3×3 y los carga
 * de 9 en 9 desde el backend (paginación real del servidor).
 * Así evitamos traer los 31 coches de golpe y la respuesta
 * HTTP es mucho más ligera y rápida.
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {

  /** Lista de vehículos de la página actual */
  vehicles: VehicleDTO[] = [];

  /** Total de páginas que calcula el backend según el tamaño elegido */
  totalPages = 0;

  /** Página en la que estamos ahora mismo (el backend empieza en 0) */
  currentPage = 0;

  /** Controla el spinner mientras esperamos la respuesta del servidor */
  loading = false;

  constructor(private vehicleSvc: VehicleService) {}

  ngOnInit(): void {
    // Al entrar al catálogo siempre arrancamos desde la primera página
    this.loadVehicles(0);
  }

  /**
   * Pide al backend exactamente 9 vehículos de la página indicada.
   * Se llama al entrar al componente y cada vez que el usuario
   * pulsa un botón de paginación (anterior, número o siguiente).
   *
   * @param page - Número de página a cargar (comienza en 0)
   */
  loadVehicles(page = 0): void {
    this.loading = true;
    // 9 coches por página → llenan la cuadrícula 3 columnas × 3 filas
    this.vehicleSvc.getAll(page, 9).subscribe({
      next: (p: Page<VehicleDTO>) => {
        this.vehicles    = p.content;    // coches de esta página
        this.totalPages  = p.totalPages; // cuántas páginas existen en total
        this.currentPage = p.number;     // página actual confirmada por el servidor
        this.loading     = false;
      },
      error: () => this.loading = false
    });
  }

  /**
   * Genera un array [0, 1, 2 … totalPages-1] para que el HTML
   * pueda dibujar un botón de número por cada página disponible.
   * Ejemplo: 31 coches / 9 por página → [0, 1, 2, 3]
   */
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }
}
