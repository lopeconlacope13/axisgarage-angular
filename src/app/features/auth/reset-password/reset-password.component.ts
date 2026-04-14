import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/**
 * COMPONENTE RESET PASSWORD
 * ---------------------------------------------------------
 * Se activa cuando el usuario hace clic en el enlace del correo.
 * Extrae el token UUID de los query params (?token=...) y muestra
 * un formulario para introducir y confirmar la nueva contraseña.
 *
 * Llama a /api/v1/reset-password enviando el token y la nueva contraseña.
 * El backend valida el token, comprueba que no haya caducado y actualiza la BD.
 */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="grain-overlay"></div>
    <div class="vignette"></div>

    <section style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                    background:linear-gradient(135deg,#0a0a0a 0%,#111111 60%,#0f0e0a 100%);padding:1.5rem;">

      <div class="glass-card animate-fade-in" style="width:100%;max-width:28rem;padding:3rem 2.5rem;
                                                     position:relative;z-index:10;box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);">

        <div style="text-align:center;margin-bottom:2.5rem;">
          <h1 class="section-title" style="font-size:1.8rem;margin-bottom:0.5rem;">
            New <span style="font-style:italic;color:var(--axis-gold);">Password</span>
          </h1>
          <p style="color:var(--axis-gray);font-size:0.85rem;">Choose a strong password for your account.</p>
        </div>

        <!-- Error de token inválido o caducado -->
        @if (!token) {
          <div style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);
                      color:#fca5a5;padding:1rem;border-radius:6px;font-size:0.85rem;text-align:center;">
            Invalid or missing recovery link.
          </div>
          <div style="text-align:center;margin-top:1.5rem;">
            <a routerLink="/forgot-password" class="eyebrow" style="color:var(--axis-gold);font-size:0.65rem;text-decoration:none;">
              REQUEST A NEW LINK
            </a>
          </div>
        }

        <!-- Contraseña actualizada con éxito -->
        @if (success) {
          <div style="background:rgba(184,149,42,0.08);border:1px solid rgba(184,149,42,0.3);
                      color:#b8952a;padding:1.25rem;border-radius:6px;font-size:0.85rem;text-align:center;line-height:1.6;">
            Password updated successfully.
          </div>
          <div style="text-align:center;margin-top:1.5rem;">
            <a routerLink="/login" class="eyebrow" style="color:var(--axis-gold);font-size:0.65rem;text-decoration:none;">
              LOG IN WITH YOUR NEW PASSWORD
            </a>
          </div>
        }

        <!-- Formulario (solo si hay token y aún no hay éxito) -->
        @if (token && !success) {
          @if (error) {
            <div style="background:rgba(220,38,38,0.1);border:1px solid rgba(220,38,38,0.3);
                        color:#fca5a5;padding:0.75rem;border-radius:6px;font-size:0.8rem;
                        margin-bottom:1.5rem;text-align:center;">
              {{ error }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" #form="ngForm">
            <div style="margin-bottom:1.25rem;">
              <label class="eyebrow" style="display:block;margin-bottom:0.5rem;">NEW PASSWORD</label>
              <input
                type="password"
                name="newPassword"
                [(ngModel)]="newPassword"
                required
                minlength="6"
                class="input-dark"
                placeholder="••••••••"
              >
            </div>

            <div style="margin-bottom:2rem;">
              <label class="eyebrow" style="display:block;margin-bottom:0.5rem;">CONFIRM PASSWORD</label>
              <input
                type="password"
                name="confirm"
                [(ngModel)]="confirm"
                required
                class="input-dark"
                placeholder="••••••••"
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
              {{ loading ? 'UPDATING...' : 'SET NEW PASSWORD' }}
            </button>
          </form>
        }

      </div>
    </section>
  `
})
export class ResetPasswordComponent implements OnInit {

  token       = '';
  newPassword = '';
  confirm     = '';
  error       = '';
  success     = false;
  loading     = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Extraemos el token de la URL: /reset-password?token=xxxxxxxx-xxxx-...
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  onSubmit(): void {
    // Validamos que las contraseñas coincidan antes de llamar al backend
    if (this.newPassword !== this.confirm) {
      this.error = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.http.post(
      `${environment.apiUrl}/v1/reset-password`,
      { token: this.token, newPassword: this.newPassword },
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        // El backend devuelve el mensaje de error en el body como texto plano
        this.error   = err.error || 'The recovery link is invalid or has expired.';
        this.loading = false;
      }
    });
  }
}
