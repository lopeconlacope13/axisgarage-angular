import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Header sticky glassmorphism con navegación y botón de sesión.
 * TODO (Día 4): suscribirse a isLoggedIn() para mostrar avatar/logout.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.isLoggedIn().subscribe(v => this.isLoggedIn = v);
  }

  logout(): void {
    this.auth.logout();
  }
}
