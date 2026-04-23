import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Página de Política de Privacidad de Axis Garage.
 * Informa al usuario sobre qué datos se recogen, con qué finalidad
 * y cuáles son sus derechos según el RGPD.
 *
 * NOTA: Este contenido es ficticio. El proyecto es un TFG académico.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent {}
