import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import { Role } from "../entity/Role";
import { Company } from "../entity/Company";
import { Product } from "../entity/Product";
import { ProductCompany } from "../entity/ProductCompany";
import { StockMovement } from "../entity/StockMovement";

// Configuration de la base de données de test
export const testDataSource = new DataSource({
  type: "sqlite",
  database: ":memory:",
  synchronize: true,
  logging: false,
  entities: [User, Role, Company, Product, ProductCompany, StockMovement],
});

// Mock des variables d'environnement
process.env.JWT_SECRET = "test-secret-key";
process.env.NODE_ENV = "test";

// Setup global pour les tests
beforeAll(async () => {
  await testDataSource.initialize();
  // Désactiver les contraintes de clé étrangère pour SQLite
  await testDataSource.query("PRAGMA foreign_keys = OFF;");
});

afterAll(async () => {
  await testDataSource.destroy();
});

beforeEach(async () => {
  // Nettoyer toutes les tables avant chaque test
  const entities = testDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = testDataSource.getRepository(entity.name);
    await repository.clear();
  }
});

export { testDataSource as AppDataSource };
