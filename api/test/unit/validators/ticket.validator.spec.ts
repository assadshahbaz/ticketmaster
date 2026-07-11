import { expect } from 'chai';
import { createTicketSchema, updateTicketSchema } from '../../../src/validators/ticket.validator';

describe('ticket validators', () => {
  it('accepts a non-empty name', () => {
    expect(createTicketSchema.safeParse({ name: 'Ticket 1' }).success).to.be.true;
  });

  it('rejects a missing or empty name', () => {
    expect(createTicketSchema.safeParse({}).success).to.be.false;
    expect(createTicketSchema.safeParse({ name: '' }).success).to.be.false;
  });

  it('rejects a non-string name', () => {
    expect(createTicketSchema.safeParse({ name: 123 }).success).to.be.false;
  });

  it('updateTicketSchema applies the same rules', () => {
    expect(updateTicketSchema.safeParse({ name: 'Ticket 1' }).success).to.be.true;
    expect(updateTicketSchema.safeParse({}).success).to.be.false;
  });
});
