import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Página editorial "Nuestra Historia": narra el origen y propósito de Axis Garage.
 * Contenido placeholder — el copy definitivo se añadirá en una iteración posterior.
 */
@Component({
  selector: 'app-our-story',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './our-story.component.html'
})
export class OurStoryComponent {}
