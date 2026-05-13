import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Página de Condiciones de Servicio de Axis Garage.
 * Define las condiciones del alquiler ficticio: reservas, cancelaciones,
 * responsabilidad y uso permitido del vehículo.
 *
 * Usa TranslatePipe para renderizar el contenido en el idioma activo (en/es).
 * NOTA: Este contenido es ficticio. El proyecto es un TFG académico.
 */
@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.css'
})
export class TermsOfServiceComponent {}
