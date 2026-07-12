import { Document, Model, model, Schema } from 'mongoose';
import esIndexPlugin, { ESSearchable } from '../../plugins/esIndexPlugin';

export interface ITicket extends Document {
  sorting_id: number;
  name: string;
}

const ticketSchema = new Schema<ITicket>({
  sorting_id: {
    type: Number,
    required: true
  },
  name: { type: String, required: true },
});

esIndexPlugin(ticketSchema, {
  index: 'tickets',
  toDocument: (doc) => ({ sorting_id: doc.sorting_id, name: doc.name }),
  searchFields: ['name'],
});

type TicketModel = Model<ITicket> & ESSearchable<ITicket>;

export default model<ITicket, TicketModel>('ticket', ticketSchema);
