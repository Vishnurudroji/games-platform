import { Router } from 'express';
import { createAssociation, getAssociations, updateAssociation, deleteAssociation } from '../controllers/association';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Only DEVELOPER can create/view associations (or maybe ADMIN can view theirs, but keeping it simple)
router.post('/', authenticate, authorize(['DEVELOPER']), createAssociation);
router.get('/', authenticate, authorize(['DEVELOPER', 'ADMIN', 'INCHARGE']), getAssociations);
router.put('/:id', authenticate, authorize(['DEVELOPER']), updateAssociation);
router.delete('/:id', authenticate, authorize(['DEVELOPER']), deleteAssociation);

export default router;
