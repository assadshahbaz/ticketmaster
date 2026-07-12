import { Request, Response } from 'express';
import Ticket from '../models/ticket';
import ApiError from '../../utils/ApiError';
import getPagination from '../../utils/pagination';

export default class TicketController {

  static async create(req: Request, res: Response): Promise<void> {
    const { name } = req.body;

    const lastTicket = await Ticket.findOne().sort({ sorting_id: -1 });
    const nextId = lastTicket ? lastTicket.sorting_id + 1 : 1;

    const ticket = new Ticket({ sorting_id: nextId, name });
    await ticket.save();

    res.status(200).json({ msg: 'Ticket created!' });
  }

  static async fetch(req: Request, res: Response): Promise<void> {
    const search = req.query.search as string | undefined;
    const { page, limit } = getPagination(req);

    if (search && search.length >= 3) {
      const results = await Ticket.search(search);

      res.json({
        tickets: results,
        totalTickets: results.length,
      });
      return;
    }

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

  static async fetchOne(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    const ticket = await Ticket.findOne({ _id: id });
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    res.status(200).json(ticket);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const { name } = req.body;

    const ticket = await Ticket.findOneAndUpdate({ _id: id }, { name }, { new: true });
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    res.status(200).json({ msg: 'Ticket updated!' });
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    const ticket = await Ticket.findOneAndDelete({ _id: id });
    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    res.status(200).json({ msg: 'Ticket deleted' });
  }
}
