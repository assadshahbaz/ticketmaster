import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTicket, ITickets, Ticket } from '../model/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {

    private apiUrl = 'http://localhost:3000/api/tickets';

    constructor(private http: HttpClient) { }

    getTickets(page: number, size: number, searchTerm?: string): Observable<ITickets> {
        let params: any = { page: page.toString(), size: size.toString() };
        if (searchTerm && searchTerm.length >= 3) {
            params = { ...params, search: searchTerm };
        }
        return this.http.get<ITickets>(this.apiUrl, { params });
    }

    getTicketById(id: string): Observable<Ticket> {
        return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
    }

    createTicket(ticket: CreateTicket): Observable<Ticket> {
        return this.http.post<Ticket>(this.apiUrl, ticket);
    }

    updateTicket(id: string, ticket: CreateTicket): Observable<Ticket> {
        return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket);
    }

    deleteTicket(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

}