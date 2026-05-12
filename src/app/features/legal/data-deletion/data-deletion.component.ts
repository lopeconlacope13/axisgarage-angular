import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Página de instrucciones para la eliminación de datos de usuario.
 * Requerida por Meta (Facebook) para apps con Login social.
 * Explica al usuario cómo puede solicitar que se borren sus datos
 * de Axis Garage de forma permanente.
 */
@Component({
  selector: 'app-data-deletion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-deletion.component.html',
  styleUrl: './data-deletion.component.css'
})
export class DataDeletionComponent {}
