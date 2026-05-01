import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { VehicleService } from '../../../core/services/vehicle.service';
import { SeoService } from '../../../core/services/seo.service';
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
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
  // OnPush: Angular solo re-renderiza cuando llamamos markForCheck()
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit {

  private seo = inject(SeoService);

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
   * Ordenación del catálogo. Formato que acepta el Pageable de Spring Boot.
   * Ejemplos: 'brand,asc' | 'brand,desc' | 'pricePerDay,asc' | 'pricePerDay,desc'
   */
  filterSort = 'brand,asc';

  /**
   * Texto del buscador rápido. Se envía al backend como parámetro 'search',
   * que hace un OR entre marca y modelo para buscar en todo el catálogo.
   */
  filterSearch = '';

  /**
   * Lista de categorías cargadas desde el backend.
   * Cada categoría tiene id y name para mostrarlas en el <select>.
   */
  categories: { id: number; name: string }[] = [];

  /**
   * Lista de marcas únicas extraídas de los vehículos.
   * Se usa para el <select> de marca en los filtros.
   * Se carga una vez al inicio pidiendo todos los vehículos al backend.
   */
  brands: string[] = [];

  /** Número de vehículos por página: llena exactamente el grid 3×3 */
  private readonly PAGE_SIZE = 9;

  /**
   * URL base del backend, extraída de environment para evitar hardcoding.
   * Se elimina '/api' porque las imágenes se sirven desde la raíz del servidor.
   */
  private readonly backendUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private vehicleSvc: VehicleService,
    // Necesario para notificar a Angular que debe re-renderizar en modo Zoneless
    private cdr: ChangeDetectorRef,
    // HttpClient para cargar las categorías directamente desde el componente
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.seo.update(
      'Fleet — Catálogo de Vehículos',
      'Explora la flota de Axis Garage: Ferrari, Lamborghini, Porsche, Bentley y más. Filtra por marca, potencia y categoría.',
      '/vehicles'
    );

    // Cargamos las categorías del backend para el desplegable de filtros
    this.http.get<{ id: number; name: string }[]>(`${environment.apiUrl}/categories`).subscribe({
      next: cats => { this.categories = cats; this.cdr.markForCheck(); },
      error: () => { /* Si falla, el select simplemente no muestra opciones */ }
    });

    // Cargamos todos los vehículos en una sola página grande para extraer las marcas únicas.
    // No usamos un endpoint específico de marcas porque el backend no lo tiene: lo calculamos aquí.
    // Set() elimina duplicados automáticamente y sort() las ordena alfabéticamente.
    this.http.get<{ content: { brand: string }[] }>(`${environment.apiUrl}/vehicles?size=200`).subscribe({
      next: page => {
        this.brands = [...new Set(page.content.map(v => v.brand))].sort();
        this.cdr.markForCheck();
      },
      error: () => { /* Si falla, el select de marca queda vacío */ }
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

    // Construimos el objeto de filtros solo con los valores que no estén vacíos.
    // 'search' (buscador rápido) hace OR entre brand y model en el backend.
    // 'brand' y 'model' (barra de filtros) aplican AND independientes.
    const filters: { search?: string; brand?: string; model?: string; horsePower?: number; categoryId?: number } = {};
    if (this.filterSearch.trim())    filters.search     = this.filterSearch.trim();
    if (this.filterBrand.trim())     filters.brand      = this.filterBrand.trim();
    if (this.filterModel.trim())     filters.model      = this.filterModel.trim();
    if (this.filterHorsePower > 0)   filters.horsePower = this.filterHorsePower;
    if (this.filterCategoryId > 0)   filters.categoryId = this.filterCategoryId;

    // PAGE_SIZE coches por página → llenan la cuadrícula 3 columnas × 3 filas
    // filterSort viene del select de ordenación (ej: 'pricePerDay,desc')
    this.vehicleSvc.getAll(page, this.PAGE_SIZE, this.filterSort, filters).subscribe({
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
    this.filterSearch      = '';
    this.filterHorsePower  = 0;
    this.filterCategoryId  = 0;
    this.filterSort        = 'brand,asc';
    this.searchQuery       = '';
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

  // ─── Buscador rápido (filtro en servidor) ─────────────────────────────────

  /**
   * Texto introducido en el buscador rápido de la parte superior de la grid.
   * Al cambiar, actualiza filterModel y lanza una petición al backend para
   * buscar en todo el catálogo, no solo en la página actual.
   */
  searchQuery = '';

  /**
   * Conecta el buscador rápido con el parámetro 'search' del backend.
   * El backend hace OR entre brand y model, así "Ferrari" y "488" funcionan igual.
   * Siempre resetea a la página 0 para mostrar todos los resultados relevantes.
   *
   * @param value - Texto que el usuario ha escrito en el buscador
   */
  onSearch(value: string): void {
    this.searchQuery  = value;
    this.filterSearch = value.trim();
    this.applyFilters();
  }

  /**
   * Alias de vehicles para mantener compatibilidad con el template.
   * El filtrado real lo hace el backend, así que devolvemos la página directamente.
   */
  get filteredVehicles(): VehicleDTO[] {
    return this.vehicles;
  }
}
