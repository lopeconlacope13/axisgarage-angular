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
    { name: 'Ferrari',       origin: 'MARANELLO, ITALY',      tagline: 'The prancing horse. Pure mechanical theatre, nothing more.',        logoUrl: '/assets/brands/ferrari.svg' },
    { name: 'Lamborghini',   origin: 'SANT\'AGATA, ITALY',    tagline: 'Aggressive, angular, unapologetic. The anti-Ferrari.',               logoUrl: '/assets/brands/lamborghini.svg' },
    { name: 'Porsche',       origin: 'STUTTGART, GERMANY',    tagline: 'Precision engineering meets timeless restraint.',                    logoUrl: '/assets/brands/porsche.svg' },
    { name: 'Bentley',       origin: 'CREWE, ENGLAND',        tagline: 'Grand touring in absolute silence and absolute power.',              logoUrl: '/assets/brands/bentley.svg' },
    { name: 'McLaren',       origin: 'WOKING, ENGLAND',       tagline: 'Born from Formula 1. Built for the road. Barely.',                  logoUrl: '/assets/brands/mclaren.svg' },
    { name: 'Aston Martin',  origin: 'GAYDON, ENGLAND',       tagline: 'British elegance with a racing soul.',                              logoUrl: '/assets/brands/aston-martin.svg' },
    { name: 'Mercedes-AMG',  origin: 'AFFALTERBACH, GERMANY', tagline: 'One Man, One Engine. Handcrafted performance.',                     logoUrl: '/assets/brands/mercedes-amg.svg' },
    { name: 'Alfa Romeo',    origin: 'MILAN, ITALY',          tagline: 'Passion and precision in every curve.',                             logoUrl: '/assets/brands/alfa-romeo.svg' },
    { name: 'Rolls-Royce',   origin: 'GOODWOOD, ENGLAND',     tagline: 'The world\'s most coveted motor car. No debate.',                   logoUrl: '/assets/brands/rolls-royce.svg' },
  ];
}
