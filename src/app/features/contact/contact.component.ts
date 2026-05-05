import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Página de Contacto de Axis Garage.
 * Muestra los datos del atelier: dirección, teléfono, email y horario.
 * Contenido editorial estático — proyecto académico TFG.
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {}
