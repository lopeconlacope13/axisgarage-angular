import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

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
export class OurStoryComponent implements OnInit {

  private seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update(
      'Our Story — La Anatomía del Control Absoluto',
      'El manifiesto de Axis Garage: lujo silencioso, pureza mecánica y cero fricción. La distancia más corta entre lo que exiges y lo que la máquina ofrece.',
      '/our-story'
    );
  }
}
