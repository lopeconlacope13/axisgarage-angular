import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Página de Ateliers: muestra las cuatro sedes físicas de Axis Garage.
 * Contenido estático — los datos no cambian en producción.
 */
@Component({
  selector: 'app-ateliers',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-6 pt-32 pb-20">

      <div class="eyebrow mb-2" style="color:var(--axis-gold)">OUR LOCATIONS</div>
      <h1 class="section-title mb-4">The <span class="italic">Ateliers</span></h1>
      <p style="color:var(--axis-gray);max-width:32rem;margin-bottom:3.5rem;line-height:1.7;font-size:0.95rem;">
        Four sanctuaries of mechanical excellence, carefully positioned across the Iberian Peninsula.
        Each atelier is staffed by specialists and offers a discreet, appointment-based service.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        @for (a of ateliers; track a.city) {
          <div class="glass-card p-8" style="border-left:2px solid var(--axis-gold-40);">
            <div class="eyebrow mb-1" style="color:var(--axis-gold);font-size:0.6rem;">{{ a.region }}</div>
            <h2 class="font-display text-xl font-semibold mb-3">{{ a.city }}</h2>
            <p class="text-axis-gray text-sm mb-4" style="line-height:1.6;">{{ a.address }}</p>
            <div style="display:flex;gap:2rem;">
              <div>
                <div class="eyebrow" style="font-size:0.55rem;margin-bottom:0.2rem;">PHONE</div>
                <div class="text-sm">{{ a.phone }}</div>
              </div>
              <div>
                <div class="eyebrow" style="font-size:0.55rem;margin-bottom:0.2rem;">HOURS</div>
                <div class="text-sm">{{ a.hours }}</div>
              </div>
            </div>
          </div>
        }

      </div>

      <div style="margin-top:3rem;text-align:center;">
        <a routerLink="/vehicles" class="btn-gold" style="font-size:0.75rem;">BROWSE THE FLEET</a>
      </div>
    </div>
  `
})
export class AteliersComponent {

  ateliers = [
    { region: 'ANDALUCÍA', city: 'Sevilla', address: 'Av. de la Constitución 12, 41004 Sevilla', phone: '+34 954 000 111', hours: 'Mon–Sat 9–20h' },
    { region: 'COMUNIDAD DE MADRID', city: 'Madrid', address: 'Paseo de la Castellana 89, 28046 Madrid', phone: '+34 910 000 222', hours: 'Mon–Sat 9–20h' },
    { region: 'CATALUÑA', city: 'Barcelona', address: 'Passeig de Gràcia 55, 08007 Barcelona', phone: '+34 932 000 333', hours: 'Mon–Sat 9–20h' },
    { region: 'ANDALUCÍA', city: 'Puerto Banús', address: 'Puerto Banús, Marbella, 29660 Málaga', phone: '+34 952 000 444', hours: 'Mon–Sun 10–22h' }
  ];
}
