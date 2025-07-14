import { DataSource } from "typeorm";
import { User } from "../entity/User";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "stockit_db",
  synchronize: true,
  logging: true,
  entities: [User],
  migrations: [],
  subscribers: [],
});
export default AppDataSource;