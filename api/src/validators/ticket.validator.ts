import { z } from 'zod';

const name = z.string({ error: 'name is required' }).min(1, 'name is required');

export const createTicketSchema = z.object({ name });

export const updateTicketSchema = z.object({ name });
