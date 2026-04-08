import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Footer con links legales y copyright. TODO (Día 5): maquetar completo. */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  year = new Date().getFullYear();
}
