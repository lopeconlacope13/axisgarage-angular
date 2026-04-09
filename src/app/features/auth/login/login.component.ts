import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
  imports: [CommonModule, FormsModule, RouterLink], // Módulos necesarios para ngIf, ngModel y routerLink
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

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
  constructor(private auth: AuthService, private router: Router) {}

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
