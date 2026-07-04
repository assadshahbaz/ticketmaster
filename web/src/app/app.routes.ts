import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'tickets' },

    {
        path: "tickets",
        loadComponent: () => import('./tickets-listing/tickets-listing.component').then((m) => m.TicketsListingComponent)
    },
    {
        path: "tickets/edit/:id",
        loadComponent: () => import('./ticket-add-edit/ticket-add-edit.component').then((m) => m.TicketAddEditComponent)
    },
    {
        path: "tickets/create",
        loadComponent: () => import('./ticket-add-edit/ticket-add-edit.component').then((m) => m.TicketAddEditComponent)
    },

];