import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../core/services/vehicle.service';
import { LocationService } from '../../core/services/location.service';
import { VehicleDTO, LocationDTO } from '../../models/types';
import { HeaderComponent } from '../../layout/header/header.component';

/**
 * Página de inicio: hero, partners marquee, ateliers y vehículos destacados.
 * TODO (Día 6): conectar VehicleService y LocationService reales.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  featuredVehicles: VehicleDTO[] = [];
  locations: LocationDTO[]       = [];
  loading = false;

  constructor(
    private vehicleSvc: VehicleService,
    private locationSvc: LocationService
  ) {}

  ngOnInit(): void {
    // this.vehicleSvc.getAll(0, 3).subscribe(p => this.featuredVehicles = p.content);
    // this.locationSvc.getAll().subscribe(l => this.locations = l);
  }
}
