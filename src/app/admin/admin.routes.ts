import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { unsavedChangesGuard } from './project-form/unsaved-changes.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login').then((m) => m.AdminLogin),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'projects',
        loadComponent: () => import('./projects/projects').then((m) => m.AdminProjects),
      },
      {
        path: 'projects/new',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./project-form/project-form').then((m) => m.AdminProjectForm),
      },
      {
        path: 'projects/:id',
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () => import('./project-form/project-form').then((m) => m.AdminProjectForm),
      },
      {
        path: 'account',
        loadComponent: () => import('./account/account').then((m) => m.AdminAccount),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
