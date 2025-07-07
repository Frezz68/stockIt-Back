import express, { Request, Response } from 'express';
import  AppDataSource from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port: number = Number(process.env.PORT) || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: Error) => {
    console.error('Error during Data Source initialization:', err);
  });

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, StockIt!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
