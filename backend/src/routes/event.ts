import { Router } from 'express';
import { createEvent, getEvents, deleteEvent } from '../controllers/event';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Developer creates events, but anyone might be able to view them
router.post('/', authenticate, authorize(['DEVELOPER', 'ADMIN']), createEvent);
router.get('/', authenticate, getEvents);
router.delete('/:id', authenticate, authorize(['DEVELOPER', 'ADMIN']), deleteEvent);

export default router;
