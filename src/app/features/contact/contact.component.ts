import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <div style="max-width:52rem;margin:0 auto;padding:0 1.5rem;">

        <!-- Eyebrow y título -->
        <div class="eyebrow" style="color:#b8952a;margin-bottom:0.75rem;">GET IN TOUCH</div>
        <h1 style="font-family:'Playfair Display',serif;font-size:2.25rem;font-weight:700;margin-bottom:0.5rem;">
          Contact <span style="font-style:italic;">Us</span>
        </h1>
        <div class="gold-divider" style="margin-bottom:2rem;"></div>

        <!-- Banner de disclaimer TFG -->
        <div style="background:rgba(184,149,42,0.1);border:1px solid rgba(184,149,42,0.3);padding:1rem;margin-bottom:2rem;border-radius:4px;">
          <p style="color:#b8952a;font-size:0.8rem;text-align:center;margin:0;">
            &#9888; Este sitio es un proyecto académico ficticio desarrollado como Trabajo de Fin de Grado (DAW). No presta servicios reales.
          </p>
        </div>

        <!-- Layout de dos columnas: formulario + datos de contacto -->
        <div style="display:grid;grid-template-columns:1fr 280px;gap:2rem;align-items:start;">

          <!-- Formulario de contacto -->
          <div class="glass-card" style="padding:2rem;">

            <!-- Mensaje de confirmación (se muestra tras enviar) -->
            @if (submitted) {
              <div style="text-align:center;padding:2rem 0;">
                <div style="font-family:'Playfair Display',serif;font-size:1.5rem;color:#b8952a;margin-bottom:0.75rem;">
                  Message Received
                </div>
                <p style="color:rgba(245,245,240,0.6);font-size:0.9rem;line-height:1.75;">
                  Our concierge team will get back to you within 24 hours.
                </p>
              </div>
            } @else {

              <div style="display:flex;flex-direction:column;gap:1.25rem;">

                <!-- Campo: nombre -->
                <div>
                  <label class="eyebrow" style="display:block;margin-bottom:0.4rem;font-size:0.6rem;opacity:0.6;">NAME</label>
                  <input
                    type="text"
                    [(ngModel)]="name"
                    placeholder="Your full name"
                    class="input-dark"
                    style="width:100%;box-sizing:border-box;"
                  />
                </div>

                <!-- Campo: email -->
                <div>
                  <label class="eyebrow" style="display:block;margin-bottom:0.4rem;font-size:0.6rem;opacity:0.6;">EMAIL</label>
                  <input
                    type="email"
                    [(ngModel)]="email"
                    placeholder="your@email.com"
                    class="input-dark"
                    style="width:100%;box-sizing:border-box;"
                  />
                </div>

                <!-- Campo: mensaje -->
                <div>
                  <label class="eyebrow" style="display:block;margin-bottom:0.4rem;font-size:0.6rem;opacity:0.6;">MESSAGE</label>
                  <textarea
                    [(ngModel)]="message"
                    placeholder="How can we help you?"
                    class="input-dark"
                    rows="5"
                    style="width:100%;box-sizing:border-box;resize:vertical;"
                  ></textarea>
                </div>

                <!-- Mensaje de error (se muestra si el POST falla) -->
                @if (errorMessage) {
                  <div style="background:rgba(220,50,50,0.1);border:1px solid rgba(220,50,50,0.3);padding:0.75rem 1rem;border-radius:4px;">
                    <p style="color:#e05555;font-size:0.8rem;margin:0;">{{ errorMessage }}</p>
                  </div>
                }

                <!-- Botón de envío — deshabilitado mientras se procesa la petición -->
                <button class="btn-gold" (click)="submit()" [disabled]="sending" [style.opacity]="sending ? 0.6 : 1" style="width:100%;">
                  {{ sending ? 'SENDING...' : 'SEND MESSAGE' }}
                </button>

              </div>
            }

          </div>

          <!-- Datos de contacto ficticios -->
          <div style="display:flex;flex-direction:column;gap:1.25rem;">

            <div class="glass-card" style="padding:1.5rem;">
              <div class="eyebrow" style="font-size:0.6rem;opacity:0.5;margin-bottom:0.5rem;">ADDRESS</div>
              <p style="color:rgba(245,245,240,0.7);font-size:0.85rem;line-height:1.7;margin:0;">
                Paseo de la Castellana 200<br>
                28046 Madrid, España
              </p>
            </div>

            <div class="glass-card" style="padding:1.5rem;">
              <div class="eyebrow" style="font-size:0.6rem;opacity:0.5;margin-bottom:0.5rem;">PHONE</div>
              <p style="color:rgba(245,245,240,0.7);font-size:0.85rem;margin:0;">+34 910 000 000</p>
            </div>

            <div class="glass-card" style="padding:1.5rem;">
              <div class="eyebrow" style="font-size:0.6rem;opacity:0.5;margin-bottom:0.5rem;">EMAIL</div>
              <p style="color:#b8952a;font-size:0.85rem;margin:0;">concierge&#64;axisgarage.com</p>
            </div>

            <div class="glass-card" style="padding:1.5rem;">
              <div class="eyebrow" style="font-size:0.6rem;opacity:0.5;margin-bottom:0.5rem;">HOURS</div>
              <p style="color:rgba(245,245,240,0.7);font-size:0.85rem;line-height:1.7;margin:0;">
                Mon – Fri: 09:00 – 20:00<br>
                Sat: 10:00 – 16:00<br>
                Sun: By appointment
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  `
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
