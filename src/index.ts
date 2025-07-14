import express, { Request, Response } from 'express';
import cors from "cors";
import  AppDataSource from './config/database';
import dotenvx from '@dotenvx/dotenvx';
import userRoutes from './routes/user.route';

dotenvx.config();

const app = express();

const port: number = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);


app.get('/', (req: Request, res: Response) => {
  res.send('Hello, StockIt!');
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err: Error) => {
    console.error('Error during Data Source initialization:', err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
