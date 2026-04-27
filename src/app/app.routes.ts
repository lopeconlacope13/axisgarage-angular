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
  {
    path: 'our-story',
    loadComponent: () =>
      import('./features/our-story/our-story.component').then(m => m.OurStoryComponent)
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/legal/terms-of-service/terms-of-service.component').then(m => m.TermsOfServiceComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent)
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
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // ── Edición de vehículo (MANAGER y ADMIN) ────────────────────────────────
  {
    path: 'dashboard/vehicles/:id/edit',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER', 'ADMIN'] },
    loadComponent: () =>
      import('./features/vehicles/edit/vehicle-edit.component').then(m => m.VehicleEditComponent)
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' }

];
