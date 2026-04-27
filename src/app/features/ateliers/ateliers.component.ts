import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Página de Ateliers: muestra las cuatro sedes físicas de Axis Garage.
 * Contenido estático — los datos no cambian en producción.
 */
@Component({
  selector: 'app-ateliers',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './ateliers.component.html',
  styleUrl: './ateliers.component.css'
})
export class AteliersComponent {

  ateliers = [
    { region: 'ANDALUCÍA',           city: 'Sevilla',       address: 'Av. de la Constitución 12, 41004 Sevilla',        phone: '+34 954 000 111', hours: 'Mon–Sat 9–20h',  imageUrl: '/assets/ateliers/sevilla.svg' },
    { region: 'COMUNIDAD DE MADRID', city: 'Madrid',        address: 'Paseo de la Castellana 89, 28046 Madrid',         phone: '+34 910 000 222', hours: 'Mon–Sat 9–20h',  imageUrl: '/assets/ateliers/madrid.svg' },
    { region: 'CATALUÑA',            city: 'Barcelona',     address: 'Passeig de Gràcia 55, 08007 Barcelona',           phone: '+34 932 000 333', hours: 'Mon–Sat 9–20h',  imageUrl: '/assets/ateliers/barcelona.svg' },
    { region: 'ANDALUCÍA',           city: 'Puerto Banús',  address: 'Puerto Banús, Marbella, 29660 Málaga',            phone: '+34 952 000 444', hours: 'Mon–Sun 10–22h', imageUrl: '/assets/ateliers/puerto-banus.svg' },
  ];
}
