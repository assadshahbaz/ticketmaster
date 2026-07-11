import { expect } from 'chai';
import sinon from 'sinon';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketAddEditComponent } from './add-edit.component';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../model/ticket.model';

describe('TicketAddEditComponent', () => {
  let ticketService: { fetchById: sinon.SinonStub; create: sinon.SinonStub; update: sinon.SinonStub };
  let router: { navigate: sinon.SinonStub };

  const setup = (routeParams: Record<string, string>) => {
    ticketService = {
      fetchById: sinon.stub(),
      create: sinon.stub().returns(of({})),
      update: sinon.stub().returns(of({})),
    };
    router = { navigate: sinon.stub() };

    TestBed.configureTestingModule({
      imports: [TicketAddEditComponent],
      providers: [
        { provide: TicketService, useValue: ticketService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: routeParams } } },
      ],
    });

    const fixture = TestBed.createComponent(TicketAddEditComponent);
    return fixture.componentInstance;
  };

  it('leaves the form empty for a new ticket (no :id route param)', () => {
    const component = setup({});

    component.ngOnInit();

    expect(component.ticketId).to.be.undefined;
    expect(ticketService.fetchById).to.not.have.been.called;
  });

  it('loads and populates the ticket when :id is present', () => {
    const ticket: Ticket = { _id: '1', name: 'Existing', sorting_id: 7 };
    const component = setup({ id: '1' });
    ticketService.fetchById.returns(of(ticket));

    component.ngOnInit();

    expect(ticketService.fetchById).to.have.been.calledOnceWith('1');
    expect(component.name).to.equal('Existing');
    expect(component.sortingId).to.equal(7);
  });

  it('onSubmit() creates a new ticket and navigates back when there is no ticketId', () => {
    const component = setup({});
    component.name = 'Brand new';

    component.onSubmit();

    expect(ticketService.create).to.have.been.calledOnceWith({ name: 'Brand new' });
    expect(ticketService.update).to.not.have.been.called;
    expect(router.navigate).to.have.been.calledOnceWith(['/tickets']);
  });

  it('onSubmit() updates the existing ticket and navigates back when ticketId is present', () => {
    const component = setup({ id: '5' });
    ticketService.fetchById.returns(of({ _id: '5', name: 'Old', sorting_id: 2 }));
    component.ngOnInit();
    component.name = 'Renamed';

    component.onSubmit();

    expect(ticketService.update).to.have.been.calledOnceWith('5', { name: 'Renamed' });
    expect(ticketService.create).to.not.have.been.called;
    expect(router.navigate).to.have.been.calledOnceWith(['/tickets']);
  });
});
