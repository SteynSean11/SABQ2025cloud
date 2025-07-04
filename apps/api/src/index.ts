import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app: Application = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('SA Budget Queen API is running!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;
