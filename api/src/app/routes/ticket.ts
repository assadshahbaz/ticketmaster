import createAsyncRouter from '../../utils/asyncRouter';
import TicketController from '../controllers/ticket';
import validate from '../../middleware/validate';
import { createTicketSchema, updateTicketSchema } from '../../validators/ticket.validator';

const router = createAsyncRouter();

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectID
 *           example: "63be60b0a5f12e34db7e94d8"
 *         sorting_id:
 *           type: integer
 *           description: Auto-incremented ID of the ticket
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the ticket
 *           example: "Sample Ticket"
 *         __v:
 *           type: integer
 *           description: MongoDB version key
 *           example: 0
 *     TicketInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the ticket
 *           example: "Sample Ticket"
 *     TicketsList:
 *       type: object
 *       properties:
 *         tickets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Ticket'
 *         totalTickets:
 *           type: integer
 *           description: Total number of tickets matching the search criteria
 *           example: 1
 *     Message:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *           example: Ticket created!
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Failed to create ticket"
 *   parameters:
 *     TicketId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: The MongoDB ObjectID of the ticket
 *       example: "63be60b0a5f12e34db7e94d8"
 *   responses:
 *     NotFound:
 *       description: Ticket not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     ServerError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketInput'
 *     responses:
 *       200:
 *         description: Ticket successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', validate(createTicketSchema), TicketController.create);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Retrieve tickets with optional search and pagination
 *     tags: [Tickets]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to find tickets by name (min 3 characters; supports partial matches and typos)
 *         example: "234"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tickets to retrieve per page
 *     responses:
 *       200:
 *         description: A list of tickets with total count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketsList'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', TicketController.fetch);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get details of a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - $ref: '#/components/parameters/TicketId'
 *     responses:
 *       200:
 *         description: Details of the ticket
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', TicketController.fetchOne);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - $ref: '#/components/parameters/TicketId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TicketInput'
 *     responses:
 *       200:
 *         description: Ticket successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', validate(updateTicketSchema), TicketController.update);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - $ref: '#/components/parameters/TicketId'
 *     responses:
 *       200:
 *         description: Ticket successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', TicketController.delete);

export default router;
