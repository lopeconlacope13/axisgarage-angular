import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/**
 * COMPONENTE FORGOT PASSWORD
 * ---------------------------------------------------------
 * Muestra un formulario con el campo email. Al enviarlo, llama
 * al endpoint /api/v1/forgot-password del backend, que genera un
 * token UUID y manda el enlace de recuperación por correo.
 *
 * Por seguridad, siempre mostramos el mismo mensaje de confirmación
 * sin importar si el email existe o no en la base de datos.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grain-overlay"></div>
    <div class="vignette"></div>

    <section style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                    background:linear-gradient(135deg,#0a0a0a 0%,#111111 60%,#0f0e0a 100%);padding:1.5rem;">

      <a routerLink="/login" style="position:absolute;top:2rem;left:2rem;display:flex;align-items:center;
                                    gap:0.75rem;opacity:0.7;transition:opacity 0.3s;"
         onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">
        <div style="width:2rem;height:2rem;border:1px solid var(--axis-gold);border-radius:4px;
                    display:flex;align-items:center;justify-content:center;">
          <span style="color:var(--axis-gold);font-family:'Playfair Display',serif;font-weight:700;font-style:italic;font-size:0.9rem;">A</span>
        </div>
        <span class="eyebrow" style="margin:0;">BACK TO LOGIN</span>
      </a>

      <div class="glass-card animate-fade-in" style="width:100%;max-width:28rem;padding:3rem 2.5rem;
                                                     position:relative;z-index:10;box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);">

        <div style="text-align:center;margin-bottom:2.5rem;">
          <h1 class="section-title" style="font-size:1.8rem;margin-bottom:0.5rem;">
            Reset <span style="font-style:italic;color:var(--axis-gold);">Access</span>
          </h1>
          <p style="color:var(--axis-gray);font-size:0.85rem;">
            Enter your email and we'll send you a recovery link.
          </p>
        </div>

        <!-- Estado: email enviado -->
        @if (sent) {
          <div style="background:var(--axis-gold-08);border:1px solid var(--axis-gold-30);
                      color:var(--axis-gold);padding:1.25rem;border-radius:6px;font-size:0.85rem;text-align:center;line-height:1.6;">
            If an account exists with that email, a recovery link has been sent.<br>
            <span style="color:var(--axis-gray);font-size:0.75rem;">Check your inbox (and spam folder).</span>
          </div>
          <div style="text-align:center;margin-top:1.5rem;">
            <a routerLink="/login" class="eyebrow" style="color:var(--axis-gold);font-size:0.65rem;text-decoration:none;">
              BACK TO LOGIN
            </a>
          </div>
        }

        <!-- Formulario -->
        @if (!sent) {
          <form (ngSubmit)="onSubmit()" #form="ngForm">
            <div style="margin-bottom:1.5rem;">
              <label class="eyebrow" style="display:block;margin-bottom:0.5rem;">EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                required
                class="input-dark"
                placeholder="your@email.com"
                autocomplete="email"
              >
            </div>

            <button
              type="submit"
              class="btn-gold block"
              style="width:100%;font-size:0.8rem;padding:0.875rem;"
              [disabled]="loading || !form.form.valid"
              [style.opacity]="(loading || !form.form.valid) ? '0.5' : '1'"
              [style.cursor]="(loading || !form.form.valid) ? 'not-allowed' : 'pointer'"
            >
              {{ loading ? 'SENDING...' : 'SEND RECOVERY LINK' }}
            </button>

            <div style="text-align:center;margin-top:1.5rem;">
              <a routerLink="/login" class="eyebrow" style="color:var(--axis-gray);font-size:0.65rem;text-decoration:none;">
                REMEMBERED IT? LOG IN
              </a>
            </div>
          </form>
        }

      </div>
    </section>
  `
})
export class ForgotPasswordComponent {

  email   = '';
  sent    = false;
  loading = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  onSubmit(): void {
    this.loading = true;
    // Enviamos el email al backend. Usamos responseType: 'text' porque el backend devuelve un String plano.
    this.http.post(`${environment.apiUrl}/v1/forgot-password`, { email: this.email }, { responseType: 'text' })
      .subscribe({
        next:  () => { this.sent = true; this.loading = false; this.cdr.markForCheck(); },
        error: () => { this.sent = true; this.loading = false; this.cdr.markForCheck(); } // Mismo mensaje siempre (seguridad)
      });
  }
}
