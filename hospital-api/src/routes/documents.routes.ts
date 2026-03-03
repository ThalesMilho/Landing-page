import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { uploadMiddleware } from '../middleware/upload';
import { documentController } from '../controllers/documentController';

const router = Router();
router.use(apiLimiter);
router.use(requireAuth);

router.get('/:module', documentController.listByModule);

router.post('/upload', uploadMiddleware.single('file'), documentController.upload);

router.get('/download/:id', documentController.download);

router.patch('/publish/:id', documentController.publish);

export default router;
