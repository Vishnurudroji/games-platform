import { Router } from 'express';
import { getBudgetDashboard } from '../controllers/dashboard';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/budget', authenticate, authorize(['DEVELOPER', 'ADMIN']), getBudgetDashboard);

export default router;
