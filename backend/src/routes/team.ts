import { Router } from 'express';
import { registerTeam, getTeams, updateTeamStatus } from '../controllers/team';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public route for team registration
router.post('/register', registerTeam);

// Protected routes for viewing and managing teams
router.get('/', authenticate, authorize(['DEVELOPER', 'ADMIN', 'INCHARGE']), getTeams);
router.patch('/:id/status', authenticate, authorize(['DEVELOPER', 'ADMIN', 'INCHARGE']), updateTeamStatus);

export default router;
