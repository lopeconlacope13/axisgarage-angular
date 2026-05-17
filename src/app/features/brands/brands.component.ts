import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Página de Brands: listado de las marcas de la flota con su origen y filosofía.
 * Contenido editorial estático — sirve como presentación de la colección.
 */
@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandsComponent {

  brands = [
    { name: 'Aston Martin', originKey: 'BRANDS.ASTON_MARTIN_ORIGIN', taglineKey: 'BRANDS.ASTON_MARTIN_TAGLINE', logoUrl: '/assets/brands/aston-martin.svg' },
    { name: 'Audi',         originKey: 'BRANDS.AUDI_ORIGIN',         taglineKey: 'BRANDS.AUDI_TAGLINE',         logoUrl: '/assets/brands/audi.png' },
    { name: 'BMW',          originKey: 'BRANDS.BMW_ORIGIN',          taglineKey: 'BRANDS.BMW_TAGLINE',          logoUrl: '/assets/brands/bmw.png' },
    { name: 'Bentley',      originKey: 'BRANDS.BENTLEY_ORIGIN',      taglineKey: 'BRANDS.BENTLEY_TAGLINE',      logoUrl: '/assets/brands/bentley.png' },
    { name: 'Bugatti',      originKey: 'BRANDS.BUGATTI_ORIGIN',      taglineKey: 'BRANDS.BUGATTI_TAGLINE',      logoUrl: '/assets/brands/bugatti.png' },
    { name: 'Ferrari',      originKey: 'BRANDS.FERRARI_ORIGIN',      taglineKey: 'BRANDS.FERRARI_TAGLINE',      logoUrl: '/assets/brands/ferrari.png' },
    { name: 'Jeep',         originKey: 'BRANDS.JEEP_ORIGIN',         taglineKey: 'BRANDS.JEEP_TAGLINE',         logoUrl: '/assets/brands/jeep.png' },
    { name: 'Lamborghini',  originKey: 'BRANDS.LAMBORGHINI_ORIGIN',  taglineKey: 'BRANDS.LAMBORGHINI_TAGLINE',  logoUrl: '/assets/brands/lamborghini.png' },
    { name: 'McLaren',      originKey: 'BRANDS.MCLAREN_ORIGIN',      taglineKey: 'BRANDS.MCLAREN_TAGLINE',      logoUrl: '/assets/brands/mclaren.png' },
    { name: 'Mercedes',     originKey: 'BRANDS.MERCEDES_ORIGIN',     taglineKey: 'BRANDS.MERCEDES_TAGLINE',     logoUrl: '/assets/brands/mercedes.png' },
    { name: 'Nissan',       originKey: 'BRANDS.NISSAN_ORIGIN',       taglineKey: 'BRANDS.NISSAN_TAGLINE',       logoUrl: '/assets/brands/nissan.png' },
    { name: 'Porsche',      originKey: 'BRANDS.PORSCHE_ORIGIN',      taglineKey: 'BRANDS.PORSCHE_TAGLINE',      logoUrl: '/assets/brands/porsche.png' },
    { name: 'Range Rover',  originKey: 'BRANDS.RANGE_ROVER_ORIGIN',  taglineKey: 'BRANDS.RANGE_ROVER_TAGLINE',  logoUrl: '/assets/brands/land-rover.svg' },
    { name: 'Rolls-Royce',  originKey: 'BRANDS.ROLLS_ROYCE_ORIGIN',  taglineKey: 'BRANDS.ROLLS_ROYCE_TAGLINE',  logoUrl: '/assets/brands/rolls%20royce.png' },
  ];
}
