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
  template: `
    <div class="max-w-7xl mx-auto px-6 pt-32 pb-20">

      <div class="eyebrow mb-2" style="color:#b8952a">THE COLLECTION</div>
      <h1 class="section-title mb-4">Curated <span class="italic">Brands</span></h1>
      <p style="color:var(--axis-gray);max-width:32rem;margin-bottom:3.5rem;line-height:1.7;font-size:0.95rem;">
        Every marque in our fleet was selected for its singular character.
        We do not carry volume — we carry icons.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        @for (b of brands; track b.name) {
          <div class="glass-card p-6" style="display:flex;flex-direction:column;gap:0.5rem;">
            <div class="font-display text-lg font-semibold" style="color:#b8952a;">{{ b.name }}</div>
            <div class="eyebrow" style="font-size:0.6rem;opacity:0.5;">{{ b.origin }}</div>
            <p class="text-axis-gray text-sm" style="line-height:1.6;margin-top:0.25rem;">{{ b.tagline }}</p>
          </div>
        }
      </div>

      <div style="margin-top:3rem;text-align:center;">
        <a routerLink="/vehicles" class="btn-gold" style="font-size:0.75rem;">EXPLORE THE FLEET</a>
      </div>
    </div>
  `
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
