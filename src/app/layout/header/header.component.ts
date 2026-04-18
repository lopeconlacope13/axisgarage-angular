import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Header sticky glassmorphism.
 * Soporta i18n, menú desplegable con avatar y roles,
 * y menú hamburguesa para dispositivos móviles.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {

  isLoggedIn  = false;
  user: { email: string, roles: string[], initial: string } | null = null;
  /** Foto de perfil guardada en localStorage por el dashboard */
  photoUrl     = '';
  dropdownOpen = false;
  /** Controla si el menú móvil está abierto o cerrado */
  menuOpen     = false;
  currentLang = 'en';
  private authSub?: Subscription;

  constructor(
    private auth: AuthService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authSub = this.auth.isLoggedIn().subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        this.user = this.auth.getCurrentUser();
        // Consultamos el perfil al backend para obtener la foto guardada en servidor
        this.auth.getProfile().subscribe({
          next: profile => {
            if (profile.image) {
              // Construimos la URL completa del archivo servido por Spring Boot
              this.photoUrl = `${environment.apiUrl.replace('/api', '')}/uploads/${profile.image}`;
            }
            this.cdr.markForCheck();
          }
        });
      } else {
        this.user     = null;
        this.photoUrl = '';
      }
      // Con OnPush, Angular no detecta el cambio del Observable automáticamente.
      // markForCheck() le indica que este componente necesita re-renderizarse.
      this.cdr.markForCheck();
    });
    this.currentLang = this.translate.currentLang || this.translate.defaultLang || 'en';
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  /** Abre o cierra el menú hamburguesa en móvil */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.cdr.markForCheck();
  }

  /** Cierra el menú móvil — se llama al pulsar un enlace */
  closeMenu(): void {
    this.menuOpen = false;
    this.cdr.markForCheck();
  }

  /**
   * Escucha clics en todo el documento.
   * Si el clic no es dentro del header, cierra el menú móvil.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Si el clic es fuera del header, cerramos el menú
    if (!target.closest('app-header')) {
      this.menuOpen = false;
      this.cdr.markForCheck();
    }
  }

  switchLang(lang: string): void {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  logout(): void {
    this.dropdownOpen = false;
    this.menuOpen = false;
    this.auth.logout();
  }
}
