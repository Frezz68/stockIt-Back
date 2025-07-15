import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import { InsertRole1752526701059 } from "../migrations/1752526701059-InsertRole";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "stockit_db",
  synchronize: true,
  logging: true,
  entities: [User, Role],
  migrations: [InsertRole1752526701059],
  subscribers: [],
});
export default AppDataSource;