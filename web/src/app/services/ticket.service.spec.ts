import { expect } from 'chai';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TicketService } from './ticket.service';
import { API_URL } from '../tokens/api-url.token';
import { Ticket } from '../model/ticket.model';

const API_BASE = 'http://test-api';

describe('TicketService', () => {
  let service: TicketService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: API_BASE },
      ],
    });

    service = TestBed.inject(TicketService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetch() requests page/size without a search param when none is given', () => {
    service.fetch(2, 10).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE}/tickets` && r.params.get('page') === '2' && r.params.get('size') === '10',
    );
    expect(req.request.method).to.equal('GET');
    expect(req.request.params.has('search')).to.be.false;
    req.flush({ tickets: [], totalTickets: 0 });
  });

  it('fetch() includes the search param when the term is 3+ characters', () => {
    service.fetch(1, 20, 'abc').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${API_BASE}/tickets` && r.params.get('search') === 'abc');
    req.flush({ tickets: [], totalTickets: 0 });
  });

  it('fetchById() GETs /tickets/:id', () => {
    const ticket: Ticket = { _id: '1', name: 'Ticket 1', sorting_id: 1 };

    service.fetchById('1').subscribe((result) => {
      expect(result).to.deep.equal(ticket);
    });

    const req = httpMock.expectOne(`${API_BASE}/tickets/1`);
    expect(req.request.method).to.equal('GET');
    req.flush(ticket);
  });

  it('create() POSTs the ticket to /tickets', () => {
    service.create({ name: 'New ticket' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/tickets`);
    expect(req.request.method).to.equal('POST');
    expect(req.request.body).to.deep.equal({ name: 'New ticket' });
    req.flush({ msg: 'Ticket created!' });
  });

  it('update() PUTs the ticket to /tickets/:id', () => {
    service.update('1', { name: 'Renamed' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE}/tickets/1`);
    expect(req.request.method).to.equal('PUT');
    expect(req.request.body).to.deep.equal({ name: 'Renamed' });
    req.flush({ msg: 'Ticket updated!' });
  });

  it('delete() DELETEs /tickets/:id', () => {
    service.delete('1').subscribe();

    const req = httpMock.expectOne(`${API_BASE}/tickets/1`);
    expect(req.request.method).to.equal('DELETE');
    req.flush(null);
  });
});
