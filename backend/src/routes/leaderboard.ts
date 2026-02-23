import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard';

const router = Router();

router.get('/:categoryId', getLeaderboard);

export default router;
