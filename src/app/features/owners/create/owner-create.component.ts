import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OwnerService } from '../../../core/services/owner.service';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Página de registro de un nuevo socio propietario (Private Partner).
 *
 * Solo accesible para MANAGER y ADMIN (protegida en app.routes.ts
 * con authGuard + roleGuard). La incorporación de socios es selectiva
 * y manual, por eso existe esta pantalla dedicada en lugar de un
 * formulario inline en el dashboard.
 *
 * Al registrar con éxito → navega a /dashboard.
 * Al cancelar → navega a /dashboard.
 */
@Component({
  selector: 'app-owner-create',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './owner-create.component.html',
  // OnPush: Angular solo re-renderiza cuando llamamos markForCheck()
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnerCreateComponent {

  // ─── Datos del formulario ─────────────────────────────────────────────────
  /**
   * Objeto que acumula los valores del formulario.
   * Los campos coinciden con los que espera el backend en OwnerDTO.
   */
  owner = {
    name:     '',
    lastName: '',
    email:    '',
    phone:    '',
    address:  ''
  };

  // ─── Estado de la petición ────────────────────────────────────────────────
  /** True mientras la petición al backend está en curso */
  submitting = false;
  /** Mensaje de error de validación o del servidor */
  errorMsg = '';
  /** True cuando el socio se ha registrado correctamente */
  success = false;

  constructor(
    private ownerSvc: OwnerService,
    private router:   Router,
    private cdr:      ChangeDetectorRef
  ) {}

  /**
   * Valida el formulario y envía los datos del nuevo socio al backend.
   *
   * Solo son obligatorios nombre y apellido. El resto de campos son
   * opcionales según el modelo de negocio de Axis Garage (algunos socios
   * prefieren no exponer su teléfono o dirección).
   *
   * Si la operación tiene éxito, espera 1.5s para mostrar confirmación
   * y luego navega al dashboard.
   */
  submit(): void {
    // Limpiamos mensajes anteriores
    this.errorMsg = '';
    this.success  = false;

    // ── Validación mínima ──────────────────────────────────────────────────
    if (!this.owner.name.trim() || !this.owner.lastName.trim()) {
      this.errorMsg = 'El nombre y el apellido son obligatorios.';
      this.cdr.markForCheck();
      return;
    }

    this.submitting = true;
    this.cdr.markForCheck();

    // ── Llamada al backend ─────────────────────────────────────────────────
    this.ownerSvc.create(this.owner).subscribe({
      next: () => {
        // Mostramos el mensaje de éxito y redirigimos al dashboard tras 1.5s
        this.submitting = false;
        this.success    = true;
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: err => {
        // El backend devuelve un string de error en el cuerpo (400 o 500)
        this.errorMsg   = err?.error ?? 'Error al registrar el socio. Revisa los datos.';
        this.submitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  /** Cancela la operación y vuelve al dashboard sin guardar nada. */
  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
