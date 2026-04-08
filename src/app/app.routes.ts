import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // ── Pública ────────────────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ── Catálogo público ───────────────────────────────────────────────────────
  {
    path: 'vehicles',
    loadComponent: () =>
      import('./features/vehicles/catalog/catalog.component').then(m => m.CatalogComponent)
  },
  {
    path: 'vehicles/:id',
    loadComponent: () =>
      import('./features/vehicles/detail/vehicle-detail.component').then(m => m.VehicleDetailComponent)
  },

  // ── Protegidas (USER+) ─────────────────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }

];
