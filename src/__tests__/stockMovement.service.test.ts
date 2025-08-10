import { testDataSource } from "./setup";
import { StockMovement, MovementType } from "../entity/StockMovement";
import { createMockResponse, createMockRequest } from "./helpers/mockHelpers";
import { createTestData } from "./helpers/testDataHelper";

describe("StockMovement Repository and Service Tests", () => {
  let testData: any;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe("StockMovement Repository", () => {
    it("devrait créer un mouvement de stock", async () => {
      const stockMovementRepository =
        testDataSource.getRepository(StockMovement);

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
      expect(savedMovement.productId).toBe(testData.testProduct.id);
    });

    it("devrait récupérer tous les mouvements", async () => {
      const stockMovementRepository =
        testDataSource.getRepository(StockMovement);

      // Créer plusieurs mouvements
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

      const movement2 = stockMovementRepository.create({
        productId: testData.testProduct.id,
        companyId: testData.testCompany.id,
        userId: testData.testUser.id,
        quantity: 20,
        type: MovementType.OUT,
        date: new Date(),
        product: testData.testProduct,
        user: testData.testUser,
      });
      await stockMovementRepository.save(movement2);

      // Récupérer tous les mouvements
      const allMovements = await stockMovementRepository.find({
        where: { companyId: testData.testCompany.id },
        relations: ["product", "user"],
      });

      expect(allMovements).toHaveLength(2);
      expect(
        allMovements.some(
          (m) => m.quantity === 50 && m.type === MovementType.IN
        )
      ).toBeTruthy();
      expect(
        allMovements.some(
          (m) => m.quantity === 20 && m.type === MovementType.OUT
        )
      ).toBeTruthy();
    });
  });

  describe("StockMovement Service Logic", () => {
    it("devrait implémenter la logique de création de mouvement", async () => {
      const stockMovementRepository =
        testDataSource.getRepository(StockMovement);

      // Simulation de la logique du service
      const createStockMovementService = async (
        productId: number,
        companyId: number,
        userId: number,
        quantity: number,
        type: MovementType
      ) => {
        try {
          const movement = stockMovementRepository.create({
            productId,
            companyId,
            userId,
            quantity,
            type,
            date: new Date(),
          });
          return await stockMovementRepository.save(movement);
        } catch (error) {
          throw new Error("Error creating stock movement");
        }
      };

      const initialCount = await stockMovementRepository.count();

      const createdMovement = await createStockMovementService(
        testData.testProduct.id,
        testData.testCompany.id,
        testData.testUser.id,
        25,
        MovementType.IN
      );

      expect(createdMovement).toBeDefined();
      expect(createdMovement.quantity).toBe(25);
      expect(createdMovement.type).toBe(MovementType.IN);

      const finalCount = await stockMovementRepository.count();
      expect(finalCount).toBe(initialCount + 1);
    });

    it("devrait implémenter la logique de récupération des mouvements", async () => {
      const stockMovementRepository =
        testDataSource.getRepository(StockMovement);

      // Créer quelques mouvements
      await Promise.all([
        stockMovementRepository.save(
          stockMovementRepository.create({
            productId: testData.testProduct.id,
            companyId: testData.testCompany.id,
            userId: testData.testUser.id,
            quantity: 100,
            type: MovementType.IN,
            date: new Date(),
          })
        ),
        stockMovementRepository.save(
          stockMovementRepository.create({
            productId: testData.testProduct.id,
            companyId: testData.testCompany.id,
            userId: testData.testUser.id,
            quantity: 30,
            type: MovementType.OUT,
            date: new Date(),
          })
        ),
      ]);

      // Simulation de la logique du service
      const getAllStockMovementsService = async (companyId: number) => {
        try {
          return await stockMovementRepository.find({
            where: { companyId },
            relations: ["product", "user"],
          });
        } catch (error) {
          throw new Error("Error fetching stock movements");
        }
      };

      const movements = await getAllStockMovementsService(
        testData.testCompany.id
      );

      expect(movements).toHaveLength(2);
      expect(
        movements.some((m) => m.quantity === 100 && m.type === MovementType.IN)
      ).toBeTruthy();
      expect(
        movements.some((m) => m.quantity === 30 && m.type === MovementType.OUT)
      ).toBeTruthy();
    });
  });

  describe("Mock Response Tests", () => {
    it("devrait tester la structure des mocks de réponse", () => {
      const mockRes = createMockResponse();
      const mockReq = createMockRequest({ user: testData.testUser });

      // Tester que les mocks sont correctement configurés
      mockRes.status(200);
      mockRes.json({ message: "test" });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "test" });
      expect(mockReq.user).toBe(testData.testUser);
    });
  });
});
