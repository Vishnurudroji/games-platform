import { Router } from 'express';
import { scheduleMatch, getMatches, updateMatchResult, updateMatch, deleteMatch } from '../controllers/match';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize(['DEVELOPER', 'ADMIN', 'INCHARGE']), scheduleMatch);
router.patch('/:id/result', authenticate, authorize(['DEVELOPER', 'ADMIN', 'INCHARGE']), updateMatchResult);
router.put('/:id', authenticate, authorize(['DEVELOPER', 'ADMIN', 'INCHARGE']), updateMatch);
router.delete('/:id', authenticate, authorize(['DEVELOPER', 'ADMIN', 'INCHARGE']), deleteMatch);
router.get('/', getMatches); // Can be public to view schedule

export default router;
