import { expect } from 'chai';
import sinon from 'sinon';
import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import validate from '../../../src/middleware/validate';
import ApiError from '../../../src/utils/ApiError';

const schema = z.object({ name: z.string().min(1, 'name is required') });

describe('validate', () => {
  it('replaces req.body with the parsed data and calls next() on success', () => {
    const req = { body: { name: 'Ticket 1', extra: 'stripped-if-schema-said-so' } } as unknown as Request;
    const res = {} as Response;
    const next = sinon.stub();

    validate(schema)(req, res, next as unknown as NextFunction);

    expect(req.body).to.deep.equal({ name: 'Ticket 1' });
    expect(next.calledOnceWith()).to.be.true;
  });

  it('forwards an ApiError(400) with the validation message on failure', () => {
    const req = { body: { name: '' } } as unknown as Request;
    const res = {} as Response;
    const next = sinon.stub();

    validate(schema)(req, res, next as unknown as NextFunction);

    expect(next.calledOnce).to.be.true;
    const error = next.firstCall.args[0];
    expect(error).to.be.instanceOf(ApiError);
    expect(error.statusCode).to.equal(400);
    expect(error.message).to.equal('name is required');
  });
});
