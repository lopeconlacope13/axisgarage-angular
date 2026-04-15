import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../core/services/vehicle.service';
import { VehicleDTO } from '../../models/types';

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
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  // OnPush: Angular solo comprueba cambios cuando le decimos explícitamente
  // que hay datos nuevos (con markForCheck). Más eficiente en Zoneless.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  /** Los tres coches más representativos de la flota */
  featuredVehicles: VehicleDTO[] = [];

  constructor(
    private vehicleSvc: VehicleService,
    // Necesario en modo Zoneless: notifica a Angular que debe re-renderizar
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargamos 3 vehículos de la primera página para mostrarlos como "destacados"
    this.vehicleSvc.getAll(0, 3, 'pricePerDay').subscribe({
      next: p => {
        this.featuredVehicles = p.content;
        // Sin esta llamada, Angular Zoneless no sabe que los datos cambiaron
        // y la vista se queda en blanco hasta que el usuario interactúa
        this.cdr.markForCheck();
      }
    });
  }
}
