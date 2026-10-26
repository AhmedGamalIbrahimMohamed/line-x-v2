import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'X-Line | Architectural Design & Construction',
    data: {
      description:
        'X-Line delivers business-driven architectural solutions through immersive visual storytelling for forward-thinking clients.',
    },
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'projects',
    title: 'Projects | X-Line',
    data: {
      description:
        'Explore the X-Line portfolio: administrative, commercial, residential, entertainment, landscape and interior design projects.',
    },
    loadComponent: () => import('./pages/projects/projects').then((m) => m.Projects),
  },
  {
    path: 'services',
    title: 'Services | X-Line',
    data: {
      description:
        'Integrated architectural and construction services: design, planning and delivery for complex business projects.',
    },
    loadComponent: () => import('./pages/services/services').then((m) => m.Services),
  },
  {
    path: 'about',
    title: 'About | X-Line',
    data: {
      description:
        'Meet the multidisciplinary team shaping architectural solutions for complex business challenges across the MENA region.',
    },
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'contact',
    title: 'Contact | X-Line',
    data: {
      description: 'Start a conversation with X-Line about your next architectural or construction project.',
    },
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    // The title and description are set by the page once the project has loaded.
    path: 'selected-project/:id',
    loadComponent: () => import('./pages/selected-project/selected-project').then((m) => m.SelectedProject),
  },
  {
    path: 'admin',
    title: 'Admin | X-Line',
    data: { noindex: true },
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    title: 'Page not found | X-Line',
    data: { noindex: true },
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
