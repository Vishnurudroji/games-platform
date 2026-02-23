import { Router } from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/category';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize(['DEVELOPER', 'ADMIN']), createCategory);
router.get('/', authenticate, getCategories);
router.put('/:id', authenticate, authorize(['DEVELOPER', 'ADMIN']), updateCategory);
router.delete('/:id', authenticate, authorize(['DEVELOPER', 'ADMIN']), deleteCategory);

export default router;
