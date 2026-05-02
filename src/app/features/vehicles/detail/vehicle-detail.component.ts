import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewService } from '../../../core/services/review.service';
import { VehicleDTO, ReviewDTO } from '../../../models/types';
import { environment } from '../../../../environments/environment';

/**
 * Vista de detalle de un vehículo: imagen panorámica, specs y selector de fechas/cobertura.
 * El usuario elige fechas y nivel de cobertura; el precio total se recalcula en tiempo real.
 * Al pulsar "Proceed to Checkout", redirige a /checkout/:id con los parámetros por query string.
 *
 * NOTA DE CHANGE DETECTION:
 * OnPush + markForCheck() para compatibilidad con Angular Zoneless.
 */
@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleDetailComponent implements OnInit {

  vehicle: VehicleDTO | null = null;
  selectedCoverage: 'STANDARD' | 'PREMIUM' | 'TOTAL' = 'STANDARD';
  startDate  = '';
  endDate    = '';
  loading    = false;
  /** Mensaje de error de validación antes de ir al checkout */
  errorMsg   = '';
  /** Índice de la imagen actualmente visible en el carrusel */
  currentImageIndex = 0;
  /** Reseñas del vehículo cargadas desde el backend */
  reviews: ReviewDTO[] = [];
  reviewsLoading = false;

  private readonly backendUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleSvc: VehicleService,
    private authSvc: AuthService,
    private reviewSvc: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.vehicleSvc.getById(id).subscribe({
      next: v => {
        this.vehicle = v;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadReviews(v.id);
      },
      error: () => { this.loading = false; this.cdr.markForCheck(); }
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

  /** Carga las reseñas del vehículo desde el backend */
  loadReviews(vehicleId: number): void {
    this.reviewsLoading = true;
    this.reviewSvc.getByVehicle(vehicleId).subscribe({
      next: list => { this.reviews = list; this.reviewsLoading = false; this.cdr.markForCheck(); },
      error: ()   => { this.reviewsLoading = false; this.cdr.markForCheck(); }
    });
  }

  /** Devuelve un array de N elementos para iterar las estrellas en el template */
  starsArray(n: number): number[] {
    return Array.from({ length: Math.max(0, Math.min(5, n)) });
  }

  /** Construye la URL completa de una imagen servida por el backend */
  getImageUrl(filename: string): string {
    return `${this.backendUrl}/uploads/${filename}`;
  }

  /** Avanza al siguiente imagen del carrusel (vuelve al inicio al llegar al final) */
  nextImage(): void {
    if (!this.vehicle?.images?.length) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.vehicle.images.length;
    this.cdr.markForCheck();
  }

  /**
   * Salta directamente a la imagen de la miniatura pulsada.
   * Usado por la fila de thumbnails debajo del carrusel principal.
   *
   * @param index - Posición de la imagen en el array vehicle.images
   */
  goToImage(index: number): void {
    if (!this.vehicle?.images?.length) return;
    this.currentImageIndex = index;
    this.cdr.markForCheck();
  }

  /** Retrocede a la imagen anterior (va al final si está en la primera) */
  prevImage(): void {
    if (!this.vehicle?.images?.length) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.vehicle.images.length) % this.vehicle.images.length;
    this.cdr.markForCheck();
  }

  goToCheckout(): void {
    this.errorMsg = '';

    if (!this.startDate || !this.endDate || !this.vehicle) {
      this.errorMsg = 'Selecciona fechas de recogida y devolución.';
      return;
    }
    if (new Date(this.endDate) <= new Date(this.startDate)) {
      this.errorMsg = 'La fecha de devolución debe ser posterior a la de recogida.';
      return;
    }

    // Comprobación de autenticación: si no hay token, mandamos al login con
    // returnUrl al detalle del vehículo y un flag para mostrar el banner.
    // El authGuard de la ruta /checkout también lo bloquearía, pero así
    // damos feedback inmediato sin pasar por la pantalla de checkout.
    if (!this.authSvc.getToken()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: `/vehicles/${this.vehicle.id}`,
          msg: 'auth_required'
        }
      });
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
