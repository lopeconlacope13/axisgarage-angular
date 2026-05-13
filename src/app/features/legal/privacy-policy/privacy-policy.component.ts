import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Página de Política de Privacidad de Axis Garage.
 * Informa al usuario sobre qué datos se recogen, con qué finalidad
 * y cuáles son sus derechos según el RGPD.
 *
 * Usa TranslatePipe para renderizar el contenido en el idioma activo (en/es).
 * NOTA: Este contenido es ficticio. El proyecto es un TFG académico.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {}
