import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

/**
 * COMPONENTE DE LOGIN (VISTA)
 * ---------------------------------------------------------
 * Este componente maneja la pantalla donde el usuario mete
 * su email y contraseña. Es un componente "Standalone",
 * lo que significa que no necesita declararse en ningún módulo.
 */
@Component({
  selector: 'app-login', // El nombre de la etiqueta HTML (<app-login>)
  standalone: true,      // Angular moderno: sin app.module
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule], // Módulos necesarios para ngIf, ngModel y routerLink
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  // Variables enlazadas al formulario HTML mediante [(ngModel)]
  email    = '';
  password = '';
  
  // Variables auxiliares para controlar la interfaz
  error    = '';    // Guarda el mensaje de error si el login falla
  loading  = false; // Se pone en 'true' cuando estamos esperando la respuesta del servidor

  /**
   * EL CONSTRUCTOR (Inyección de dependencias)
   * Aquí le pedimos a Angular que nos preste ("inyecte") dos herramientas:
   * 1. auth: Nuestro servicio que habla con Spring Boot.
   * 2. router: El servicio de Angular para cambiar de página (hacer redirecciones).
   */
  constructor(private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  /**
   * NGONINIT — Captura del callback OAuth2
   * ---------------------------------------------------------
   * Cuando Google o Facebook redirigen de vuelta al frontend,
   * Spring Boot inyecta el JWT en la URL de retorno:
   *   /login?token=eyJ...  → autenticación correcta
   *   /login?error=...     → algo falló en el proveedor externo
   *
   * Usamos 'snapshot' (lectura única) porque el componente se carga
   * una sola vez desde la redirección — sin suscripción continua.
   */
  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const token  = params.get('token');
    const error  = params.get('error');

    if (token) {
      // OAuth2 exitoso: guardamos el token y navegamos al home
      this.auth.setToken(token);
      this.router.navigate(['/']);
    }
    if (error) {
      // OAuth2 fallido: mostramos el motivo devuelto por Spring Boot
      this.error = error;
    }
  }

  /**
   * FUNCIÓN ONSUBMIT
   * Se ejecuta automáticamente cuando hacemos clic en el botón de submit del formulario.
   */
  onSubmit(): void {
    // 1. Reiniciamos el error y bloqueamos el botón (loading = true)
    this.error   = '';
    this.loading = true;

    // 2. Llamamos a nuestro servicio pasándole el email y el password
    // Como devuelve un "Observable" (una promesa asíncrona), nos TENEMOS que suscribir (.subscribe)
    this.auth.login(this.email, this.password).subscribe({
      
      // Si Spring Boot responde con un 200 OK (Credenciales correctas)
      next: () => this.router.navigate(['/']), // Redirigimos a la página de inicio (Landing Page)
      
      // Si Spring Boot responde con un 401 Unauthorized (o cualquier error)
      error: () => {
        this.error   = 'Credenciales incorrectas. Inténtalo de nuevo.'; // Mostramos el mensaje en rojo
        this.loading = false; // Desbloqueamos el botón
      },
      
      // Pase lo que pase (haya fallado o sea exitoso), cuando acabe la petición:
      complete: () => this.loading = false
    });
  }
}
