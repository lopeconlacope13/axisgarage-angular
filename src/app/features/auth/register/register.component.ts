import { Component } from '@angular/core';
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
  styleUrl: './register.component.css'
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
   * CONSTRUCTOR — Inyección de dependencias
   * @param auth   Servicio central de autenticación (login, register, token)
   * @param router Servicio de Angular para navegar entre rutas
   */
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * ONSUBMIT — Envía el formulario de registro al backend
   * ---------------------------------------------------------
   * Construye un RegisterRequest y llama a AuthService.register().
   * Si tiene éxito → muestra confirmación y redirige a /login.
   * Si falla      → muestra el error devuelto por Spring Boot.
   */
  onSubmit(): void {
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

      // Registro exitoso: el backend devuelve el UserDTO del nuevo usuario
      next: () => {
        this.success = 'AUTH.REGISTER_SUCCESS';
        this.loading = false;
        // Damos 2 segundos para leer el mensaje antes de redirigir
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },

      // Error: el backend puede devolver "Email ya registrado" u otro mensaje
      error: (err) => {
        this.error   = err.error ?? 'AUTH.REGISTER_ERROR';
        this.loading = false;
      }
    });
  }
}
