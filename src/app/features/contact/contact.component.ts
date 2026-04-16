import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Página de Contacto de Axis Garage.
 * Muestra un formulario simple (nombre, email, mensaje) y datos de contacto ficticios.
 * Al enviar, muestra un mensaje de confirmación en el template — sin POST real.
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

                <!-- Botón de envío -->
                <button class="btn-gold" (click)="submit()" style="width:100%;">
                  SEND MESSAGE
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

  /** Campos del formulario de contacto */
  name    = '';
  email   = '';
  message = '';

  /**
   * Controla si ya se ha "enviado" el formulario.
   * Cuando es true, se muestra el mensaje de confirmación en lugar del formulario.
   */
  submitted = false;

  /**
   * Simula el envío del formulario.
   * No hace ningún POST real — simplemente activa el mensaje de confirmación.
   * En un proyecto real, aquí llamaríamos a un servicio HTTP.
   */
  submit(): void {
    // Validación mínima: todos los campos deben estar rellenos
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) return;
    // Marcamos como enviado para que el template muestre la confirmación
    this.submitted = true;
  }
}
