import { Router } from 'express';
import { getPublicEventsData } from '../controllers/public';

const router = Router();

// Public route to fetch necessary data for the student team registration form
router.get('/events', getPublicEventsData);

export default router;
