import { Routes } from '@angular/router';

export const ticketRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./listing/listing.component').then((m) => m.TicketsListingComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./add-edit/add-edit.component').then((m) => m.TicketAddEditComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./add-edit/add-edit.component').then((m) => m.TicketAddEditComponent)
  },
];
