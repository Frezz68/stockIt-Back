import { testDataSource } from "./setup";
import { StockMovement, MovementType } from "../entity/StockMovement";
import { createTestData } from "./helpers/testDataHelper";

describe("StockMovementController - Integration", () => {
  let testData: any;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe("Repository Operations", () => {
    it("devrait créer et récupérer un mouvement de stock", async () => {
      const stockMovementRepository =
        testDataSource.getRepository(StockMovement);

      // Créer un mouvement de stock
      const movement = stockMovementRepository.create({
        productId: testData.testProduct.id,
        companyId: testData.testCompany.id,
        userId: testData.testUser.id,
        quantity: 50,
        type: MovementType.IN,
        date: new Date(),
        product: testData.testProduct,
        user: testData.testUser,
      });

      const savedMovement = await stockMovementRepository.save(movement);
      expect(savedMovement.id).toBeDefined();
      expect(savedMovement.quantity).toBe(50);
      expect(savedMovement.type).toBe(MovementType.IN);

      // Récupérer tous les mouvements
      const allMovements = await stockMovementRepository.find({
        relations: ["product", "user"],
      });

      expect(allMovements).toHaveLength(1);
      expect(allMovements[0].quantity).toBe(50);
      expect(allMovements[0].type).toBe(MovementType.IN);
    });

    it("devrait filtrer les mouvements par entreprise", async () => {
      const stockMovementRepository =
        testDataSource.getRepository(StockMovement);

      // Créer un mouvement pour l'entreprise de test
      const movement1 = stockMovementRepository.create({
        productId: testData.testProduct.id,
        companyId: testData.testCompany.id,
        userId: testData.testUser.id,
        quantity: 50,
        type: MovementType.IN,
        date: new Date(),
        product: testData.testProduct,
        user: testData.testUser,
      });
      await stockMovementRepository.save(movement1);

      // Récupérer les mouvements pour cette entreprise
      const companyMovements = await stockMovementRepository.find({
        where: { companyId: testData.testCompany.id },
        relations: ["product", "user"],
      });

      expect(companyMovements).toHaveLength(1);
      expect(companyMovements[0].companyId).toBe(testData.testCompany.id);
    });
  });
});
