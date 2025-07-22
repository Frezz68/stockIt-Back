import express, { Request, Response } from "express";
import cors from "cors";
import AppDataSource from "./config/database";
import dotenvx from "@dotenvx/dotenvx";
import userRoutes from "./routes/user.route";
import companyRoutes from "./routes/company.route";
import productRoutes from "./routes/product.route";
import productCompanyRoutes from "./routes/ProductCompany.route";
import stockMovementRoutes from "./routes/stockMovement.route";

dotenvx.config();

const app = express();

const port: number = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/product", productRoutes);
app.use("/api/product-company", productCompanyRoutes);
app.use("/api/stock-movement", stockMovementRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, StockIt!");
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err: Error) => {
    console.error("Error during Data Source initialization:", err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
