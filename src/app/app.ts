import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Idioma de fallback: si una clave no existe en el idioma activo,
    // ngx-translate busca la clave en el idioma por defecto antes de mostrar la clave en bruto.
    this.translate.setDefaultLang('es');
    // Cargamos la preferencia guardada por el usuario.
    // Si no hay ninguna (primera visita), usamos español.
    const lang = localStorage.getItem('axis-lang') || 'es';
    this.translate.use(lang);
  }
}

