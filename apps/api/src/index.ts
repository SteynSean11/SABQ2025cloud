import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from './config/passport.config';

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const app: Application = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// User routes
import userRoutes from './routes/user.routes';
app.use('/api/users', userRoutes);

// Gemini routes
import geminiRoutes from './routes/gemini.routes';
app.use('/api/gemini', geminiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('SA Budget Queen API is running!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;
