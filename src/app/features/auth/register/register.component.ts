import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterRequest } from '../../../models/types';

/**
 * COMPONENTE DE REGISTRO (VISTA)
 * ---------------------------------------------------------
 * Pantalla donde el nuevo usuario introduce sus datos para
 * crear una cuenta en Axis Garage. Ofrece también el acceso
 * rápido mediante Google o Facebook (OAuth2).
 *
 * Flujo tras un registro exitoso:
 *   1. El backend crea el usuario con ROLE_USER y devuelve su UserDTO.
 *   2. Mostramos un mensaje de confirmación durante 2 segundos.
 *   3. Redirigimos a /login para que el usuario inicie sesión.
 *
 * Nota: el registro vía OAuth (Google/Facebook) también funciona desde
 * aquí — Spring Boot crea la cuenta automáticamente si el email
 * no existe, y redirige a /login?token=... igual que en el login.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {

  /** Campos del formulario enlazados con [(ngModel)] */
  firstName = '';
  lastName  = '';
  email     = '';
  password  = '';

  /** Clave i18n del mensaje de éxito (se traduce en el template con | translate) */
  success  = '';

  /** Mensaje de error: puede ser una cadena del backend o una clave i18n */
  error    = '';

  /** Bloquea el botón mientras se espera respuesta del servidor */
  loading  = false;

  /**
   * Valida que la contraseña tenga al menos 1 mayúscula, 1 número y 1 símbolo especial.
   * Se usa en el template para mostrar el indicador de fuerza en tiempo real.
   */
  get passwordIsStrong(): boolean {
    // /[A-Z]/ comprueba que haya al menos una letra mayúscula
    // /[0-9]/ comprueba que haya al menos un dígito
    // /[^a-zA-Z0-9]/ comprueba que haya al menos un carácter que no sea letra ni número (símbolo)
    return /[A-Z]/.test(this.password) && /[0-9]/.test(this.password) && /[^a-zA-Z0-9]/.test(this.password);
  }

  /**
   * CONSTRUCTOR — Inyección de dependencias
   * @param auth   Servicio central de autenticación (login, register, token)
   * @param router Servicio de Angular para navegar entre rutas
   */
  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  /**
   * ONSUBMIT — Envía el formulario de registro al backend
   * ---------------------------------------------------------
   * Construye un RegisterRequest y llama a AuthService.register().
   * Si tiene éxito → muestra confirmación y redirige a /login.
   * Si falla      → muestra el error devuelto por Spring Boot.
   */
  onSubmit(): void {
    // Evitar doble envío si ya hay una petición en curso
    if (this.loading) return;

    // Validamos la fortaleza de la contraseña antes de enviar al backend
    if (!this.passwordIsStrong) {
      this.error = 'La contraseña debe tener al menos 1 mayúscula, 1 número y 1 símbolo.';
      return;
    }

    this.error   = '';
    this.success = '';
    this.loading = true;

    // Construimos el objeto que espera el endpoint POST /api/v1/register
    const request: RegisterRequest = {
      firstName: this.firstName,
      lastName:  this.lastName,
      email:     this.email,
      password:  this.password
    };

    this.auth.register(request).subscribe({

      // Registro exitoso: hacemos login automático con las mismas credenciales
      next: () => {
        this.success = 'AUTH.REGISTER_SUCCESS';
        this.loading = false;
        this.cdr.markForCheck();
        // Auto-login: usamos el email y password que el usuario acaba de introducir
        this.auth.login(this.email, this.password).subscribe({
          next: () => this.router.navigate(['/']),
          error: () => {
            // Si el auto-login falla por algún motivo extraño, mandamos al login manual
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        });
      },

      // Error: el backend puede devolver "Email ya registrado" u otro mensaje
      error: (err) => {
        this.error   = err.error ?? 'AUTH.REGISTER_ERROR';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
