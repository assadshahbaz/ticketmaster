import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import TicketController from '../../../src/app/controllers/ticket';
import Ticket from '../../../src/app/models/ticket';
import elasticService from '../../../src/services/elasticsearch';
import ApiError from '../../../src/utils/ApiError';

const makeRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res as Response;
};

describe('TicketController', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {
    it('numbers the first ticket 1 when no tickets exist yet', async () => {
      sinon.stub(Ticket, 'findOne').returns({ sort: sinon.stub().resolves(null) } as any);
      const saveStub = sinon.stub(Ticket.prototype, 'save').resolves();

      const req = { body: { name: 'First ticket' } } as Request;
      const res = makeRes();

      await TicketController.create(req, res);

      expect(saveStub.calledOnce).to.be.true;
      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ msg: 'Ticket created!' });
    });
  });

  describe('fetch', () => {
    it('returns paginated tickets when there is no search term', async () => {
      const tickets = [{ name: 'A' }, { name: 'B' }];
      const findStub = {
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(tickets),
      };
      sinon.stub(Ticket, 'find').returns(findStub as any);
      sinon.stub(Ticket, 'countDocuments').resolves(2);
      const searchStub = sinon.stub(elasticService, 'searchTickets');

      const req = { query: {} } as unknown as Request;
      const res = makeRes();

      await TicketController.fetch(req, res);

      expect(searchStub.called).to.be.false;
      expect(res.json).to.have.been.calledWith({ tickets, totalTickets: 2 });
    });

    it('delegates to Elasticsearch when a search term of 3+ chars is given', async () => {
      const results = [{ name: 'matched' }];
      const searchStub = sinon.stub(elasticService, 'searchTickets').resolves(results as any);
      const findStub = sinon.stub(Ticket, 'find');

      const req = { query: { search: 'abc' } } as unknown as Request;
      const res = makeRes();

      await TicketController.fetch(req, res);

      expect(searchStub.calledOnceWith('abc')).to.be.true;
      expect(findStub.called).to.be.false;
      expect(res.json).to.have.been.calledWith({ tickets: results, totalTickets: results.length });
    });

    it('ignores search terms shorter than 3 characters', async () => {
      const findStub = {
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves([]),
      };
      sinon.stub(Ticket, 'find').returns(findStub as any);
      sinon.stub(Ticket, 'countDocuments').resolves(0);
      const searchStub = sinon.stub(elasticService, 'searchTickets');

      const req = { query: { search: 'ab' } } as unknown as Request;
      const res = makeRes();

      await TicketController.fetch(req, res);

      expect(searchStub.called).to.be.false;
    });
  });

  describe('fetchOne', () => {
    it('returns the ticket when found', async () => {
      const ticket = { _id: '1', name: 'Found' };
      sinon.stub(Ticket, 'findOne').resolves(ticket as any);

      const req = { params: { id: '1' } } as unknown as Request;
      const res = makeRes();

      await TicketController.fetchOne(req, res);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith(ticket);
    });

    it('throws ApiError(404) when the ticket does not exist', async () => {
      sinon.stub(Ticket, 'findOne').resolves(null);

      const req = { params: { id: 'missing' } } as unknown as Request;
      const res = makeRes();

      try {
        await TicketController.fetchOne(req, res);
        expect.fail('expected fetchOne to throw');
      } catch (err) {
        expect(err).to.be.instanceOf(ApiError);
        expect((err as ApiError).statusCode).to.equal(404);
      }
    });
  });

  describe('update', () => {
    it('updates the ticket and responds with a confirmation message', async () => {
      sinon.stub(Ticket, 'findOneAndUpdate').resolves({ _id: '1', name: 'Updated' } as any);

      const req = { params: { id: '1' }, body: { name: 'Updated' } } as unknown as Request;
      const res = makeRes();

      await TicketController.update(req, res);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ msg: 'Ticket updated!' });
    });

    it('throws ApiError(404) when the ticket does not exist', async () => {
      sinon.stub(Ticket, 'findOneAndUpdate').resolves(null);

      const req = { params: { id: 'missing' }, body: { name: 'x' } } as unknown as Request;
      const res = makeRes();

      try {
        await TicketController.update(req, res);
        expect.fail('expected update to throw');
      } catch (err) {
        expect(err).to.be.instanceOf(ApiError);
        expect((err as ApiError).statusCode).to.equal(404);
      }
    });
  });

  describe('delete', () => {
    it('deletes the ticket and responds with a confirmation message', async () => {
      sinon.stub(Ticket, 'findOneAndDelete').resolves({ _id: '1' } as any);

      const req = { params: { id: '1' } } as unknown as Request;
      const res = makeRes();

      await TicketController.delete(req, res);

      expect(res.status).to.have.been.calledWith(200);
      expect(res.json).to.have.been.calledWith({ msg: 'Ticket deleted' });
    });

    it('throws ApiError(404) when the ticket does not exist', async () => {
      sinon.stub(Ticket, 'findOneAndDelete').resolves(null);

      const req = { params: { id: 'missing' } } as unknown as Request;
      const res = makeRes();

      try {
        await TicketController.delete(req, res);
        expect.fail('expected delete to throw');
      } catch (err) {
        expect(err).to.be.instanceOf(ApiError);
        expect((err as ApiError).statusCode).to.equal(404);
      }
    });
  });
});
