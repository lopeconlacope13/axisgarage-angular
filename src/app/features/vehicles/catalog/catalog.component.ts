import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle.service';
import { VehicleDTO, Page } from '../../../models/types';

/**
 * Catálogo paginado de vehículos con filtros.
 * TODO (Día 8): implementar filtros, paginación y grid.
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {

  vehicles: VehicleDTO[] = [];
  totalPages = 0;
  currentPage = 0;
  loading = false;

  constructor(private vehicleSvc: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(page = 0): void {
    this.loading = true;
    this.vehicleSvc.getAll(page).subscribe({
      next: (p: Page<VehicleDTO>) => {
        this.vehicles    = p.content;
        this.totalPages  = p.totalPages;
        this.currentPage = p.number;
        this.loading     = false;
      },
      error: () => this.loading = false
    });
  }
}
