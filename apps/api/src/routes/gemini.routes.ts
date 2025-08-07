import { Router } from 'express';
import { GeminiController } from '../controllers/gemini.controller';

const router = Router();

router.post('/', GeminiController.generateContent);

export default router;
