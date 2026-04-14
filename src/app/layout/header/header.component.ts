import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

/**
 * Header sticky glassmorphism.
 * Soporta i18n y Menú Desplegable con Avatar y Roles.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  isLoggedIn  = false;
  user: { email: string, roles: string[], initial: string } | null = null;
  /** Foto de perfil guardada en localStorage por el dashboard */
  photoUrl     = '';
  dropdownOpen = false;
  currentLang = 'en';
  private authSub?: Subscription;

  constructor(
    private auth: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.authSub = this.auth.isLoggedIn().subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        this.user    = this.auth.getCurrentUser();
        // Cargamos la foto de perfil si el usuario la subió desde el dashboard
        this.photoUrl = this.user?.email
          ? (localStorage.getItem(`axis-avatar-${this.user.email}`) ?? '')
          : '';
      } else {
        this.user     = null;
        this.photoUrl = '';
      }
    });
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  switchLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  logout(): void {
    this.dropdownOpen = false;
    this.auth.logout();
  }
}
