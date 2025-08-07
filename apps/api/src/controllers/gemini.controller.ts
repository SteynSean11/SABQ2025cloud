import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';

export class GeminiController {
  static async generateContent(req: Request, res: Response) {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }
      const result = await GeminiService.generateContent(prompt);
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error in GeminiController:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
