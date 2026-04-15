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
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // ── Páginas informativas públicas ─────────────────────────────────────────
  {
    path: 'ateliers',
    loadComponent: () =>
      import('./features/ateliers/ateliers.component').then(m => m.AteliersComponent)
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./features/brands/brands.component').then(m => m.BrandsComponent)
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
    path: 'checkout/:vehicleId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'my-reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/my-reservations/my-reservations.component').then(m => m.MyReservationsComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }

];
