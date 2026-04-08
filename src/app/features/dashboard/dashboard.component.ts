import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { ReservationDTO, Page } from '../../../models/types';

/**
 * Dashboard de administración: tabla de reservas activas.
 * TODO (Día 12): sidebar con módulos de vehículos, renters y owners.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  reservations: ReservationDTO[] = [];
  loading = false;

  constructor(private reservationSvc: ReservationService) {}

  ngOnInit(): void {
    this.loading = true;
    this.reservationSvc.getAll().subscribe({
      next: (p: Page<ReservationDTO>) => {
        this.reservations = p.content;
        this.loading      = false;
      },
      error: () => this.loading = false
    });
  }
}
