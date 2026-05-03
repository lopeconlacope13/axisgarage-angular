import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Página de Contacto de Axis Garage.
 * Muestra un formulario (nombre, email, mensaje) y datos de contacto ficticios.
 * Al enviar, hace un POST real al backend que reenvía el mensaje por email al administrador.
 *
 * NOTA: Este contenido es ficticio. El proyecto es un TFG académico.
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

  /** HttpClient inyectado con inject() — patrón moderno de Angular Standalone */
  private http = inject(HttpClient);

  /** Campos del formulario de contacto */
  name    = '';
  email   = '';
  message = '';

  /**
   * Controla si ya se ha enviado el formulario con éxito.
   * Cuando es true, se muestra el mensaje de confirmación en lugar del formulario.
   */
  submitted = false;

  /**
   * Controla si hay una petición HTTP en curso.
   * Mientras es true, el botón de envío queda deshabilitado para evitar duplicados.
   */
  sending = false;

  /**
   * Almacena el mensaje de error si el backend devuelve un fallo.
   * Se muestra en el template justo encima del botón de envío.
   */
  errorMessage = '';

  /**
   * Envía los datos del formulario al backend mediante un POST a /api/contact.
   * El backend reenvía el mensaje por email al administrador de la plataforma.
   * Si el envío es exitoso, muestra la pantalla de confirmación.
   * Si falla, muestra un mensaje de error sin abandonar el formulario.
   */
  submit(): void {
    // Validación mínima: todos los campos deben estar rellenos
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) return;

    // Bloqueamos el botón y limpiamos cualquier error previo
    this.sending = true;
    this.errorMessage = '';

    // Construimos el payload que espera el backend (name, email, message)
    const payload = {
      name:    this.name.trim(),
      email:   this.email.trim(),
      message: this.message.trim()
    };

    // POST al endpoint público del backend — no requiere token JWT
    this.http.post(`${environment.apiUrl}/contact`, payload).subscribe({
      next: () => {
        // Éxito: ocultamos el formulario y mostramos la confirmación
        this.submitted = true;
        this.sending   = false;
      },
      error: () => {
        // Error de red o del servidor: informamos al usuario sin perder su mensaje
        this.errorMessage = 'Error sending message. Please try again.';
        this.sending      = false;
      }
    });
  }
}
