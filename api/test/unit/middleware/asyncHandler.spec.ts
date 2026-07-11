import { expect } from 'chai';
import sinon from 'sinon';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../../../src/middleware/asyncHandler';

describe('asyncHandler', () => {
  const req = {} as Request;
  const res = {} as Response;

  it('calls the wrapped handler and does not call next() on success', async () => {
    const handler = sinon.stub().resolves();
    const next = sinon.stub();

    await asyncHandler(handler)(req, res, next as unknown as NextFunction);

    expect(handler.calledOnceWith(req, res, next)).to.be.true;
    expect(next.called).to.be.false;
  });

  it('forwards a rejected promise to next()', async () => {
    const error = new Error('boom');
    const handler = sinon.stub().rejects(error);
    const next = sinon.stub();

    asyncHandler(handler)(req, res, next as unknown as NextFunction);

    // the rejection is handled asynchronously via .catch(next)
    await new Promise((resolve) => setImmediate(resolve));

    expect(next.calledOnceWith(error)).to.be.true;
  });
});
