import { Router } from 'express';
import { createGame, getGames, deleteGame } from '../controllers/game';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize(['DEVELOPER', 'ADMIN']), createGame);
router.get('/', authenticate, getGames);
router.delete('/:id', authenticate, authorize(['DEVELOPER', 'ADMIN']), deleteGame);

export default router;
