import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { ReviewService } from '../../../core/services/review.service';
import { VehicleDTO, ReviewDTO } from '../../../models/types';

/**
 * Vista de detalle de un vehículo: imagen panorámica, specs y selector de fechas/cobertura.
 */
@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.css'
})
export class VehicleDetailComponent implements OnInit {

  vehicle: VehicleDTO | null = null;
  reviews: ReviewDTO[]       = [];
  selectedCoverage: 'STANDARD' | 'PREMIUM' | 'TOTAL' = 'STANDARD';
  startDate = '';
  endDate   = '';
  loading   = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleSvc: VehicleService,
    private reviewSvc: ReviewService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.vehicleSvc.getById(id).subscribe({
      next: v => { this.vehicle = v; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get totalPrice(): number {
    if (!this.vehicle || !this.startDate || !this.endDate) return 0;
    const days = Math.ceil(
      (new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / 86400000
    );
    const coverageCost = { STANDARD: 0, PREMIUM: 45, TOTAL: 85 }[this.selectedCoverage];
    return (this.vehicle.pricePerDay + coverageCost) * Math.max(0, days);
  }

  goToCheckout(): void {
    if (!this.startDate || !this.endDate || !this.vehicle) {
      alert('Please select pick-up and drop-off dates.');
      return;
    }
    this.router.navigate(['/checkout', this.vehicle.id], {
      queryParams: {
        start: this.startDate,
        end: this.endDate,
        coverage: this.selectedCoverage
      }
    });
  }
}
