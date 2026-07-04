import { Connection, Document, Model, Schema } from 'mongoose';

export interface ITicket extends Document {
    sorting_id: number;
    name: string;
}

// Define the Ticket schema
const ticketSchema = new Schema<ITicket>({
    sorting_id: { type: Number, required: true },
    name: { type: String, required: true },
});

// Create and export the model
const getTicketModel = (connection: Connection): Model<ITicket> =>
    connection.model<ITicket>('Ticket', ticketSchema);

export default getTicketModel;
