import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleDTO, Page } from '../../../models/types';
import { environment } from '../../../../environments/environment';

/**
 * CATÁLOGO DE VEHÍCULOS
 * -------------------------------------------------------
 * Muestra los vehículos en una cuadrícula 3×3 y los carga
 * de 9 en 9 desde el backend (paginación real del servidor).
 * Así evitamos traer los 31 coches de golpe y la respuesta
 * HTTP es mucho más ligera y rápida.
 *
 * NOTA DE CHANGE DETECTION:
 * Usamos OnPush + ChangeDetectorRef.markForCheck() para que Angular
 * actualice la vista tras recibir los datos del backend en modo Zoneless.
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
  // OnPush: Angular solo re-renderiza cuando llamamos markForCheck()
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // ─── Filtros del usuario ────────────────────────────────────────────────────
  /** Filtro por marca del vehículo (búsqueda parcial, ej: "Ferrari") */
  filterBrand    = '';
  /** Filtro por modelo del vehículo (búsqueda parcial, ej: "488") */
  filterModel    = '';
  /** Filtro de potencia mínima en caballos. 0 = sin filtro */
  filterHorsePower = 0;
  /** Filtro por categoría: 0 significa "todas las categorías" */
  filterCategoryId = 0;

  /**
   * Lista de categorías cargadas desde el backend.
   * Cada categoría tiene id y name para mostrarlas en el <select>.
   */
  categories: { id: number; name: string }[] = [];

  /** URL base del backend para construir rutas de imágenes */
  readonly backendUrl = 'http://localhost:8080';

  constructor(
    private vehicleSvc: VehicleService,
    // Necesario para notificar a Angular que debe re-renderizar en modo Zoneless
    private cdr: ChangeDetectorRef,
    // HttpClient para cargar las categorías directamente desde el componente
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Cargamos las categorías del backend para el desplegable de filtros
    this.http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/categories`).subscribe({
      next: cats => { this.categories = cats; this.cdr.markForCheck(); },
      error: () => { /* Si falla, el select simplemente no muestra opciones */ }
    });

    // Al entrar al catálogo siempre arrancamos desde la primera página
    this.loadVehicles(0);
  }

  /**
   * Pide al backend exactamente 9 vehículos de la página indicada,
   * pasando los filtros activos en ese momento.
   *
   * @param page - Número de página a cargar (comienza en 0)
   */
  loadVehicles(page = 0): void {
    this.loading = true;

    // Construimos el objeto de filtros solo con los valores que no estén vacíos
    const filters: { brand?: string; model?: string; horsePower?: number; categoryId?: number } = {};
    if (this.filterBrand.trim())     filters.brand      = this.filterBrand.trim();
    if (this.filterModel.trim())     filters.model      = this.filterModel.trim();
    if (this.filterHorsePower > 0)   filters.horsePower = this.filterHorsePower;
    if (this.filterCategoryId > 0)   filters.categoryId = this.filterCategoryId;

    // 9 coches por página → llenan la cuadrícula 3 columnas × 3 filas
    this.vehicleSvc.getAll(page, 9, 'brand', filters).subscribe({
      next: (p: Page<VehicleDTO>) => {
        this.vehicles    = p.content;    // coches de esta página
        this.totalPages  = p.totalPages; // cuántas páginas existen en total
        this.currentPage = p.number;     // página actual confirmada por el servidor
        this.loading     = false;
        // Forzamos la detección de cambios: sin Zone.js Angular no detecta
        // que los datos han llegado y la cuadrícula se quedaría vacía
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Aplica los filtros actuales: resetea a la página 0 y recarga.
   * Se llama cuando el usuario pulsa "APPLY".
   */
  applyFilters(): void {
    this.loadVehicles(0);
  }

  /**
   * Limpia todos los filtros y vuelve a cargar el catálogo completo.
   * Se llama cuando el usuario pulsa "CLEAR".
   */
  clearFilters(): void {
    this.filterBrand       = '';
    this.filterModel       = '';
    this.filterHorsePower  = 0;
    this.filterCategoryId  = 0;
    this.loadVehicles(0);
  }

  /**
   * Devuelve la URL completa de la primera imagen de un vehículo.
   * El backend guarda solo el nombre del archivo (ej: "abc123.jpg"),
   * así que construimos la URL completa aquí en el frontend.
   *
   * @param vehicle - El vehículo del que queremos la imagen
   * @returns URL completa si existe imagen, null si no
   */
  getImageUrl(vehicle: VehicleDTO): string | null {
    if (vehicle.images && vehicle.images.length > 0) {
      // El backend sirve las imágenes en /uploads/<nombre-archivo>
      return `${this.backendUrl}/uploads/${vehicle.images[0]}`;
    }
    return null;
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
