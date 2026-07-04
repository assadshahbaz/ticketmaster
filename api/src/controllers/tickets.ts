import { Request, Response } from 'express';
import { Connection } from 'mongoose';
import getTicketModel from '../models/Ticket';
import elasticService from '../services/elasticsearch';

const getMongoConnection = (req: Request): Connection => req.app.locals.dbConnection;

export default class TicketController {

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const db = getMongoConnection(req);
      const Ticket = getTicketModel(db);

      const lastTicket = await Ticket.findOne().sort({ sorting_id: -1 });
      const nextId = lastTicket ? lastTicket.sorting_id + 1 : 1;

      const { name } = req.body;
      const postPayload = { sorting_id: nextId, name };

      const ticket = new Ticket(postPayload);
      await ticket.save();

      // Index ticket in Elasticsearch
      await elasticService.indexDocument('tickets', ticket._id.toString(), postPayload);

      res.status(200).send({ msg: 'Ticket created!' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  }

  static async fetch(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const db = getMongoConnection(req);
      const Ticket = getTicketModel(db);

      if (search && search.length >= 3) {

        const results = await elasticService.searchDocuments('tickets', {
          bool: {
            should: [
              { wildcard: { name: { value: `*${search}*` } } },
              { fuzzy: { name: { value: search, fuzziness: 'AUTO' } } },
            ],
          },
        });

        res.json({
          tickets: results,
          totalTickets: results.length,
        });

      } else {
        const totalTickets = await Ticket.countDocuments();
        const tickets = await Ticket.find()
          .sort({ sorting_id: 1 })
          .skip((page - 1) * limit)
          .limit(limit);

        res.json({
          tickets,
          totalTickets,
        });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve tickets' });
    }
  }

  static async fetchOne(req: Request, res: Response): Promise<void> {
    try {
      const _id = req.params.id as string; // MongoDB ObjectID
      const db = getMongoConnection(req);
      const Ticket = getTicketModel(db);

      const ticket = await Ticket.findOne({ _id });

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.status(200).json(ticket);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch ticket details' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const _id = req.params.id as string;
      const { name } = req.body;
      const db = getMongoConnection(req);
      const Ticket = getTicketModel(db);

      const ticket = await Ticket.findOneAndUpdate({ _id }, { name }, { new: true });

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Update Elasticsearch document
      await elasticService.updateDocument('tickets', _id, { doc: { name } });

      res.status(200).send({ msg: 'Ticket updated!' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const _id = req.params.id as string;
      const db = getMongoConnection(req);
      const Ticket = getTicketModel(db);

      const ticket = await Ticket.findOneAndDelete({ _id });

      if (!ticket) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      // Remove Elasticsearch document
      await elasticService.deleteDocument('tickets', _id);

      res.status(200).send({ msg: 'Ticket deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete ticket' });
    }
  }
}
