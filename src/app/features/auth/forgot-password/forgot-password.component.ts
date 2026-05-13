import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

/**
 * COMPONENTE FORGOT PASSWORD
 * ---------------------------------------------------------
 * Pantalla para solicitar el restablecimiento de contraseña.
 * El usuario introduce su email y, si está registrado, el backend
 * le envía un enlace de un solo uso válido durante 1 hora.
 *
 * El backend responde siempre 200 OK (aunque el email no exista)
 * para evitar que un atacante pueda averiguar si un email está registrado.
 * Por eso mostramos siempre el mismo mensaje de confirmación.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {

  /** Email que el usuario introduce para recibir el enlace */
  email = '';

  /** true mientras esperamos respuesta del backend */
  loading = false;

  /** true cuando el email se ha enviado correctamente */
  success = false;

  /** Mensaje de error en caso de fallo de red o servidor */
  errorMessage = '';

  /**
   * Inyectamos AuthService (para hacer la llamada al backend)
   * y ChangeDetectorRef (necesario en modo OnPush para forzar re-render).
   */
  constructor(private authSvc: AuthService, private cdr: ChangeDetectorRef) {}

  /**
   * Envía el formulario de recuperación.
   * Llama a POST /api/v1/forgot-password con el email del usuario.
   * El backend siempre responde 200, así que en el 'next' mostramos el mensaje de éxito.
   */
  onSubmit(): void {
    // Evitar doble envío
    if (this.loading || !this.email.trim()) return;

    this.loading      = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.authSvc.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        // El backend respondió — mostramos confirmación independientemente de si el email existe
        this.success = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // Solo llegamos aquí si hay un error de red/servidor (no por email inexistente)
        this.errorMessage = 'Error al procesar la solicitud. Comprueba tu conexión e inténtalo de nuevo.';
        this.loading      = false;
        this.cdr.markForCheck();
      }
    });
  }
}
