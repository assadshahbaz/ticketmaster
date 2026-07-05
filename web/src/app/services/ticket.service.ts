import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTicket, ITickets, Ticket } from '../model/ticket.model';
import { API_URL } from '../tokens/api-url.token';

@Injectable({ providedIn: 'root' })
export class TicketService {

  private ticketsUrl: string;

  private apiUrl: string = inject(API_URL);

  constructor(private http: HttpClient) {
    this.ticketsUrl = `${this.apiUrl}/tickets`;
  }

  fetch(page: number, size: number, searchTerm?: string): Observable<ITickets> {
    let params: any = { page: page.toString(), size: size.toString() };
    if (searchTerm && searchTerm.length >= 3) {
      params = { ...params, search: searchTerm };
    }
    return this.http.get<ITickets>(this.ticketsUrl, { params });
  }

  fetchById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.ticketsUrl}/${id}`);
  }

  create(ticket: CreateTicket): Observable<Ticket> {
    return this.http.post<Ticket>(this.ticketsUrl, ticket);
  }

  update(id: string, ticket: CreateTicket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.ticketsUrl}/${id}`, ticket);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.ticketsUrl}/${id}`);
  }

}