import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects').then((m) => m.Projects),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then((m) => m.Services),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'selected-project',
    loadComponent: () => import('./pages/selected-project/selected-project').then((m) => m.SelectedProject),
  },
];


