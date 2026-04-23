import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página de Brands: listado de las marcas de la flota con su origen y filosofía.
 * Contenido editorial estático — sirve como presentación de la colección.
 */
@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandsComponent {

  brands = [
    { name: 'Ferrari',        origin: 'MARANELLO, ITALY',     tagline: 'The prancing horse. Pure mechanical theatre, nothing more.' },
    { name: 'Lamborghini',    origin: 'SANT\'AGATA, ITALY',   tagline: 'Aggressive, angular, unapologetic. The anti-Ferrari.' },
    { name: 'Porsche',        origin: 'STUTTGART, GERMANY',   tagline: 'Precision engineering meets timeless restraint.' },
    { name: 'Bentley',        origin: 'CREWE, ENGLAND',       tagline: 'Grand touring in absolute silence and absolute power.' },
    { name: 'McLaren',        origin: 'WOKING, ENGLAND',      tagline: 'Born from Formula 1. Built for the road. Barely.' },
    { name: 'Aston Martin',   origin: 'GAYDON, ENGLAND',      tagline: 'British elegance with a racing soul.' },
    { name: 'Mercedes-AMG',   origin: 'AFFALTERBACH, GERMANY',tagline: 'One Man, One Engine. Handcrafted performance.' },
    { name: 'Alfa Romeo',     origin: 'MILAN, ITALY',         tagline: 'Passion and precision in every curve.' },
    { name: 'Rolls-Royce',    origin: 'GOODWOOD, ENGLAND',    tagline: 'The world\'s most coveted motor car. No debate.' },
  ];
}
