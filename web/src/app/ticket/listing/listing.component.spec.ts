import { expect } from 'chai';
import sinon from 'sinon';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TicketsListingComponent } from './listing.component';
import { TicketService } from '../../services/ticket.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ITickets, Ticket } from '../../model/ticket.model';

describe('TicketsListingComponent', () => {
  let component: TicketsListingComponent;
  let ticketService: { fetch: sinon.SinonStub; delete: sinon.SinonStub };
  let toastrService: { error: sinon.SinonStub };
  let confirmDialogService: { confirm: sinon.SinonStub };

  const response: ITickets = {
    tickets: [{ _id: '1', name: 'Ticket 1', sorting_id: 1 } as Ticket],
    totalTickets: 1,
  };

  beforeEach(() => {
    ticketService = {
      fetch: sinon.stub().returns(of(response)),
      delete: sinon.stub().returns(of(undefined)),
    };
    toastrService = { error: sinon.stub() };
    confirmDialogService = { confirm: sinon.stub() };

    TestBed.configureTestingModule({
      imports: [TicketsListingComponent],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: ticketService },
        { provide: ToastrService, useValue: toastrService },
        { provide: ConfirmDialogService, useValue: confirmDialogService },
      ],
    });

    const fixture = TestBed.createComponent(TicketsListingComponent);
    component = fixture.componentInstance;
  });

  it('loads tickets on init', () => {
    component.ngOnInit();

    expect(ticketService.fetch).to.have.been.calledOnceWith(1, 20, '');
    expect(component.tickets).to.deep.equal(response.tickets);
    expect(component.totalTickets).to.equal(1);
  });

  describe('search', () => {
    it('resets to page 1 and reloads when the term is 3+ characters', () => {
      component.currentPage = 3;
      component.searchTerm = 'abc';

      component.search();

      expect(component.currentPage).to.equal(1);
      expect(ticketService.fetch).to.have.been.calledOnceWith(1, 20, 'abc');
      expect(toastrService.error).to.not.have.been.called;
    });

    it('shows a toast and does not reload when the term is under 3 characters', () => {
      component.searchTerm = 'ab';

      component.search();

      expect(ticketService.fetch).to.not.have.been.called;
      expect(toastrService.error).to.have.been.calledOnceWith('At least 3 characters required');
    });
  });

  it('clearSearch() resets the term and page, then reloads', () => {
    component.searchTerm = 'abc';
    component.currentPage = 4;

    component.clearSearch();

    expect(component.searchTerm).to.equal('');
    expect(component.currentPage).to.equal(1);
    expect(ticketService.fetch).to.have.been.calledOnceWith(1, 20, '');
  });

  describe('deleteTicket', () => {
    it('deletes and reloads when the user confirms', async () => {
      confirmDialogService.confirm.resolves(true);

      await component.deleteTicket('1');

      expect(ticketService.delete).to.have.been.calledOnceWith('1');
      expect(ticketService.fetch).to.have.been.called;
    });

    it('does nothing when the user cancels', async () => {
      confirmDialogService.confirm.resolves(false);

      await component.deleteTicket('1');

      expect(ticketService.delete).to.not.have.been.called;
    });
  });

  it('onPageChange() updates the page and reloads', () => {
    component.onPageChange(2);

    expect(component.currentPage).to.equal(2);
    expect(ticketService.fetch).to.have.been.calledOnceWith(2, 20, '');
  });

  it('totalPages derives from totalTickets and pageSize', () => {
    component.totalTickets = 45;
    component.pageSize = 20;

    expect(component.totalPages).to.equal(3);
  });
});
