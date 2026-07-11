import { expect } from 'chai';
import { Request } from 'express';
import getPagination from '../../../src/utils/pagination';

const makeRequest = (query: Record<string, unknown>): Request => ({ query } as unknown as Request);

describe('getPagination', () => {
  it('falls back to the default page/limit when the query string is empty', () => {
    expect(getPagination(makeRequest({}))).to.deep.equal({ page: 1, limit: 20 });
  });

  it('reads page/limit off the query string', () => {
    expect(getPagination(makeRequest({ page: '3', limit: '5' }))).to.deep.equal({ page: 3, limit: 5 });
  });

  it('clamps out-of-range page/limit values', () => {
    expect(getPagination(makeRequest({ page: '-5' })).page).to.equal(1);
    expect(getPagination(makeRequest({ limit: '-5' })).limit).to.equal(1);
    expect(getPagination(makeRequest({ limit: '500' })).limit).to.equal(100);
  });

  it('falls back to defaults for non-numeric values', () => {
    expect(getPagination(makeRequest({ page: 'abc', limit: 'xyz' }))).to.deep.equal({ page: 1, limit: 20 });
  });
});
