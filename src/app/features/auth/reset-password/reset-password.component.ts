import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * COMPONENTE RESET PASSWORD
 * ---------------------------------------------------------
 * Pantalla para establecer una nueva contraseña usando el token
 * recibido por email (enlace de restablecimiento).
 *
 * Flujo:
 *   1. El backend genera un token único al llamar a /forgot-password
 *   2. El usuario recibe un email con: /reset-password?token=abc123
 *   3. Angular lee el token de la URL y lo envía junto con la nueva contraseña
 *   4. Si el token es válido (no ha caducado), el backend actualiza la contraseña
 *   5. Si el token ha caducado o es inválido, mostramos un error con opción de reintentar
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {

  /** Token extraído de la URL (?token=...) */
  token = '';

  /** Nueva contraseña introducida por el usuario */
  newPassword = '';

  /** Repetición de la nueva contraseña para confirmar que no hay errores de escritura */
  confirmPassword = '';

  /** true mientras esperamos respuesta del backend */
  loading = false;

  /** true cuando la contraseña se ha restablecido correctamente */
  success = false;

  /** true cuando el token ha caducado o es inválido (backend responde 400) */
  tokenExpired = false;

  /** Mensaje de error genérico (red, servidor, contraseñas no coinciden) */
  errorMessage = '';

  /**
   * Inyectamos ActivatedRoute para leer el token de la URL,
   * Router para redirigir si no hay token,
   * AuthService para llamar al backend,
   * y ChangeDetectorRef para forzar re-renders en modo OnPush.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authSvc: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Al iniciar el componente, leemos el token de los queryParams.
   * Si no hay token en la URL, redirigimos a /forgot-password
   * para que el usuario solicite un nuevo enlace.
   */
  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');

    if (!tokenParam) {
      // Sin token → no podemos restablecer la contraseña → volvemos al formulario
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.token = tokenParam;
  }

  /**
   * Comprueba si la contraseña cumple los requisitos mínimos de seguridad:
   * al menos una mayúscula, un número y un carácter especial.
   * Se usa para mostrar feedback visual antes de enviar el formulario.
   */
  get passwordIsStrong(): boolean {
    if (!this.newPassword) return false;
    return (
      /[A-Z]/.test(this.newPassword) &&
      /[0-9]/.test(this.newPassword) &&
      /[^a-zA-Z0-9]/.test(this.newPassword)
    );
  }

  /**
   * Envía el formulario de restablecimiento de contraseña.
   * Primero valida localmente (coincidencia, fortaleza), luego llama al backend.
   */
  onSubmit(): void {
    // Evitar doble envío
    if (this.loading) return;

    this.errorMessage = '';

    // Validación local: las contraseñas deben coincidir
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.cdr.markForCheck();
      return;
    }

    // Validación local: la contraseña debe ser suficientemente fuerte
    if (!this.passwordIsStrong) {
      this.errorMessage = 'La contraseña debe tener al menos una mayúscula, un número y un carácter especial.';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    // Llamamos al backend con el token y la nueva contraseña
    this.authSvc.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        // Contraseña restablecida correctamente
        this.success = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;

        // El backend responde 400 si el token ha caducado o es inválido
        if (err.status === 400) {
          this.tokenExpired = true;
        } else {
          this.errorMessage = 'Error al restablecer la contraseña. Inténtalo de nuevo.';
        }

        this.cdr.markForCheck();
      }
    });
  }
}
