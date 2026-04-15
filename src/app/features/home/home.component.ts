import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleDTO } from '../../models/types';

/**
 * Página de inicio: hero con fondo dinámico, marquee de partners
 * y tres vehículos destacados traídos en tiempo real del backend.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  /** Los tres coches más representativos de la flota */
  featuredVehicles: VehicleDTO[] = [];

  constructor(private vehicleSvc: VehicleService) {}

  ngOnInit(): void {
    // Cargamos 3 vehículos de la primera página para mostrarlos como "destacados"
    this.vehicleSvc.getAll(0, 3, 'pricePerDay').subscribe({
      next: p => this.featuredVehicles = p.content
    });
  }
}
