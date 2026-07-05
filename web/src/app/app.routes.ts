import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tickets' },

  {
    path: 'tickets',
    loadChildren: () => import('./ticket/ticket.routes').then((m) => m.ticketRoutes),
  },

];
