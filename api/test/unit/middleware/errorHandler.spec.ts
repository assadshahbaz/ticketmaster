import { expect } from 'chai';
import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';
import errorHandler from '../../../src/middleware/errorHandler';
import ApiError from '../../../src/utils/ApiError';
import logger from '../../../src/config/logger';

const makeRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res as Response;
};

const noop = sinon.stub() as unknown as NextFunction;

describe('errorHandler', () => {
  let loggerErrorStub: sinon.SinonStub;

  beforeEach(() => {
    loggerErrorStub = sinon.stub(logger, 'error');
  });

  afterEach(() => {
    loggerErrorStub.restore();
  });

  it('responds with the ApiError status code and message', () => {
    const res = makeRes();
    const req = { method: 'GET', path: '/api/tickets' } as Request;

    errorHandler(new ApiError(404, 'Ticket not found'), req, res, noop);

    expect((res.status as sinon.SinonStub).calledOnceWith(404)).to.be.true;
    expect((res.json as sinon.SinonStub).calledOnceWith({ error: 'Ticket not found' })).to.be.true;
    expect(loggerErrorStub.called).to.be.false;
  });

  it('responds with a generic 500 and logs unexpected errors', () => {
    const res = makeRes();
    const req = { method: 'POST', path: '/api/tickets' } as Request;
    const err = new Error('db exploded');

    errorHandler(err, req, res, noop);

    expect((res.status as sinon.SinonStub).calledOnceWith(500)).to.be.true;
    expect((res.json as sinon.SinonStub).calledOnceWith({ error: 'Internal server error' })).to.be.true;
    expect(loggerErrorStub.calledOnce).to.be.true;
    expect((res as any).err).to.equal(err);
  });
});
