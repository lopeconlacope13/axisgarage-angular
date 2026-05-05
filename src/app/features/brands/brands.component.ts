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
    { name: 'Aston Martin', origin: 'GAYDON, ENGLAND',        tagline: 'British elegance with a racing soul.',                             logoUrl: '/assets/brands/aston-martin.svg' },
    { name: 'Audi',         origin: 'INGOLSTADT, GERMANY',    tagline: 'Vorsprung durch Technik. Progress through technology.',             logoUrl: '/assets/brands/audi.png' },
    { name: 'BMW',          origin: 'MUNICH, GERMANY',        tagline: 'The ultimate driving machine. No further explanation needed.',      logoUrl: '/assets/brands/bmw.png' },
    { name: 'Bentley',      origin: 'CREWE, ENGLAND',         tagline: 'Grand touring in absolute silence and absolute power.',             logoUrl: '/assets/brands/bentley.png' },
    { name: 'Bugatti',      origin: 'MOLSHEIM, FRANCE',       tagline: 'Nothing else matters at 400 km/h.',                               logoUrl: '/assets/brands/bugatti.png' },
    { name: 'Ferrari',      origin: 'MARANELLO, ITALY',       tagline: 'The prancing horse. Pure mechanical theatre, nothing more.',        logoUrl: '/assets/brands/ferrari.png' },
    { name: 'Jeep',         origin: 'TOLEDO, USA',            tagline: 'Go anywhere. Do anything. Leave no terrain behind.',               logoUrl: '/assets/brands/jeep.png' },
    { name: 'Lamborghini',  origin: 'SANT\'AGATA, ITALY',     tagline: 'Aggressive, angular, unapologetic. The anti-Ferrari.',              logoUrl: '/assets/brands/lamborghini.png' },
    { name: 'McLaren',      origin: 'WOKING, ENGLAND',        tagline: 'Born from Formula 1. Built for the road. Barely.',                 logoUrl: '/assets/brands/mclaren.png' },
    { name: 'Mercedes',     origin: 'STUTTGART, GERMANY',     tagline: 'The best or nothing. A century of uncompromising excellence.',      logoUrl: '/assets/brands/mercedes.png' },
    { name: 'Nissan',       origin: 'YOKOHAMA, JAPAN',        tagline: 'Innovation that excites. Engineering that endures.',                logoUrl: '/assets/brands/nissan.png' },
    { name: 'Porsche',      origin: 'STUTTGART, GERMANY',     tagline: 'Precision engineering meets timeless restraint.',                   logoUrl: '/assets/brands/porsche.png' },
    { name: 'Range Rover',  origin: 'SOLIHULL, ENGLAND',      tagline: 'Above and beyond. Luxury without limits, terrain without borders.', logoUrl: '/assets/brands/land-rover.svg' },
    { name: 'Rolls-Royce',  origin: 'GOODWOOD, ENGLAND',      tagline: 'The world\'s most coveted motor car. No debate.',                  logoUrl: '/assets/brands/rolls%20royce.png' },
  ];
}
