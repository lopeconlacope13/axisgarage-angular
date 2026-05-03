import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Página editorial "Nuestra Historia": manifiesto de marca de Axis Garage.
 * Estructura en cuatro capítulos: el silencio, el eje, el estándar soberano
 * y la promesa del asfalto.
 */
@Component({
  selector: 'app-our-story',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './our-story.component.html',
  styleUrl: './our-story.component.css'
})
export class OurStoryComponent {}
