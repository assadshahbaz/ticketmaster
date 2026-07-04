import { Document, model, Schema } from 'mongoose';
import elasticService from '../../services/elasticsearch';

export interface ITicket extends Document {
  sorting_id: number;
  name: string;
}

const ES_INDEX = 'tickets';

// Define the Ticket schema
const ticketSchema = new Schema<ITicket>({
  sorting_id: {
    type: Number,
    required: true
  },
  name: { type: String, required: true },
});

// Keep Elasticsearch in sync with every write that goes through this model,
// regardless of which controller/service triggers it.
ticketSchema.post('save', async function (doc: ITicket) {
  await elasticService.indexDocument(ES_INDEX, doc._id.toString(), {
    sorting_id: doc.sorting_id,
    name: doc.name,
  });
});

ticketSchema.post('findOneAndUpdate', async function (doc: ITicket | null) {
  if (!doc) return;

  // Read the new name from the update payload rather than `doc`, since `doc` only
  // reflects the post-update state when the query was run with `{ new: true }`.
  const update = this.getUpdate() as { name?: string } | null;
  if (!update?.name) return;

  await elasticService.updateDocument(ES_INDEX, doc._id.toString(), { doc: { name: update.name } });
});

ticketSchema.post('findOneAndDelete', async function (doc: ITicket | null) {
  if (!doc) return;
  await elasticService.deleteDocument(ES_INDEX, doc._id.toString());
});

// Bound to the default mongoose connection; ready to use as soon as it's imported
export default model<ITicket>('ticket', ticketSchema);
