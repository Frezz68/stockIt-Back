import { testDataSource } from "./setup";
import { ProductCompany } from "../entity/ProductCompany";
import { Product } from "../entity/Product";
import { Company } from "../entity/Company";
import { createMockResponse, createMockRequest } from "./helpers/mockHelpers";
import { createTestData } from "./helpers/testDataHelper";

describe("ProductCompany Repository and Service Tests", () => {
  let testData: any;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe("ProductCompany Repository", () => {
    it("devrait créer une relation produit-entreprise", async () => {
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);
      const productRepository = testDataSource.getRepository(Product);

      // Créer un nouveau produit pour cette relation
      const newProduct = productRepository.create({
        name: "New Product for Relation",
        EAN: "8888888888888",
        reference: "REL-001",
      });
      await productRepository.save(newProduct);

      const productCompany = productCompanyRepository.create({
        product: newProduct,
        company: testData.testCompany,
        amount: 50,
      });

      const savedProductCompany = await productCompanyRepository.save(
        productCompany
      );

      expect(savedProductCompany.productId).toBeDefined();
      expect(savedProductCompany.companyId).toBeDefined();
      expect(savedProductCompany.amount).toBe(50);
      expect(savedProductCompany.productId).toBe(newProduct.id);
      expect(savedProductCompany.companyId).toBe(testData.testCompany.id);
    });

    it("devrait récupérer une relation produit-entreprise par clé composite", async () => {
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);

      const foundProductCompany = await productCompanyRepository.findOne({
        where: {
          productId: testData.testProductCompany.productId,
          companyId: testData.testProductCompany.companyId,
        },
        relations: ["product", "company"],
      });

      expect(foundProductCompany).toBeTruthy();
      expect(foundProductCompany?.amount).toBe(
        testData.testProductCompany.amount
      );
    });

    it("devrait récupérer toutes les relations produit-entreprise", async () => {
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);

      const allProductCompanies = await productCompanyRepository.find({
        relations: ["product", "company"],
      });

      expect(allProductCompanies.length).toBeGreaterThanOrEqual(1);
      expect(
        allProductCompanies.some(
          (pc) => pc.amount === testData.testProductCompany.amount
        )
      ).toBeTruthy();
    });

    it("devrait mettre à jour une relation produit-entreprise", async () => {
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);

      const productCompany = await productCompanyRepository.findOneBy({
        productId: testData.testProductCompany.productId,
        companyId: testData.testProductCompany.companyId,
      });

      if (productCompany) {
        productCompany.amount = 200;
        const updatedProductCompany = await productCompanyRepository.save(
          productCompany
        );

        expect(updatedProductCompany.amount).toBe(200);
      }
    });

    it("devrait supprimer une relation produit-entreprise", async () => {
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);

      const productCompany = await productCompanyRepository.findOneBy({
        productId: testData.testProductCompany.productId,
        companyId: testData.testProductCompany.companyId,
      });

      if (productCompany) {
        await productCompanyRepository.remove(productCompany);

        const deletedProductCompany = await productCompanyRepository.findOneBy({
          productId: testData.testProductCompany.productId,
          companyId: testData.testProductCompany.companyId,
        });

        expect(deletedProductCompany).toBeNull();
      }
    });
  });

  describe("ProductCompany Service Logic", () => {
    it("devrait implémenter la logique de création de relation produit-entreprise", async () => {
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);
      const productRepo = testDataSource.getRepository(Product);

      const createProductCompanyService = async (
        productId: number,
        companyId: number,
        amount: number
      ) => {
        try {
          // Vérifier si le produit existe
          const product = await productRepo.findOneBy({ id: productId });
          if (!product) {
            throw new Error("Produit non trouvé");
          }

          // Vérifier si la relation existe déjà
          const existingRelation = await productCompanyRepository.findOne({
            where: {
              productId: productId,
              companyId: companyId,
            },
          });

          if (existingRelation) {
            throw new Error("Ce produit est déjà associé à cette entreprise");
          }

          const productCompany = productCompanyRepository.create({
            product: { id: productId } as Product,
            company: { id: companyId } as Company,
            amount,
          });

          return await productCompanyRepository.save(productCompany);
        } catch (error) {
          throw error;
        }
      };

      // Créer un nouveau produit pour le test
      const newProduct = productRepo.create({
        name: "Service Test Product",
        EAN: "9999999999999",
        reference: "SVC-PC-001",
      });
      await productRepo.save(newProduct);

      const newRelation = await createProductCompanyService(
        newProduct.id,
        testData.testCompany.id,
        75
      );

      expect(newRelation).toBeDefined();
      expect(newRelation.amount).toBe(75);

      // Test du cas d'erreur avec produit inexistant
      await expect(
        createProductCompanyService(99999, testData.testCompany.id, 50)
      ).rejects.toThrow("Produit non trouvé");

      // Test du cas d'erreur avec relation existante
      await expect(
        createProductCompanyService(newProduct.id, testData.testCompany.id, 50)
      ).rejects.toThrow("Ce produit est déjà associé à cette entreprise");
    });

    it("devrait implémenter la logique de mise à jour de quantité", async () => {
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);

      const updateAmountService = async (
        productId: number,
        companyId: number,
        action: "increase" | "decrease",
        quantity: number
      ) => {
        try {
          const productCompany = await productCompanyRepository.findOne({
            where: {
              productId: productId,
              companyId: companyId,
            },
            relations: ["product", "company"],
          });

          if (!productCompany) {
            throw new Error("ProductCompany non trouvé");
          }

          if (action === "increase") {
            productCompany.amount += quantity;
          } else if (action === "decrease") {
            if (productCompany.amount < quantity) {
              throw new Error("Stock insuffisant");
            }
            productCompany.amount -= quantity;
          } else {
            throw new Error(
              'Action invalide. Utilisez "increase" ou "decrease"'
            );
          }

          return await productCompanyRepository.save(productCompany);
        } catch (error) {
          throw error;
        }
      };

      const initialAmount = testData.testProductCompany.amount;

      // Test augmentation
      const increasedPC = await updateAmountService(
        testData.testProductCompany.productId,
        testData.testProductCompany.companyId,
        "increase",
        25
      );
      expect(increasedPC.amount).toBe(initialAmount + 25);

      // Test diminution
      const decreasedPC = await updateAmountService(
        testData.testProductCompany.productId,
        testData.testProductCompany.companyId,
        "decrease",
        10
      );
      expect(decreasedPC.amount).toBe(initialAmount + 25 - 10);

      // Test erreur stock insuffisant
      await expect(
        updateAmountService(
          testData.testProductCompany.productId,
          testData.testProductCompany.companyId,
          "decrease",
          1000
        )
      ).rejects.toThrow("Stock insuffisant");

      // Test erreur action invalide
      await expect(
        updateAmountService(
          testData.testProductCompany.productId,
          testData.testProductCompany.companyId,
          "invalid" as any,
          10
        )
      ).rejects.toThrow('Action invalide. Utilisez "increase" ou "decrease"');
    });
  });

  describe("Mock Response Tests for ProductCompany Controller", () => {
    it("devrait simuler createProductCompany avec succès", async () => {
      const productRepo = testDataSource.getRepository(Product);

      // Créer un nouveau produit pour ce test
      const newProduct = productRepo.create({
        name: "Mock Product for PC",
        EAN: "1010101010101",
        reference: "MOCK-PC-001",
      });
      await productRepo.save(newProduct);

      const productCompanyData = {
        productId: newProduct.id,
        amount: 150,
      };

      const mockReq = createMockRequest({
        body: productCompanyData,
        user: { company: testData.testCompany },
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);

      if (!mockReq.body.productId || !mockReq.body.amount) {
        mockRes.status(400);
        mockRes.json({ message: "ProductId et amount sont requis" });
      } else {
        const product = await productRepo.findOneBy({
          id: mockReq.body.productId,
        });

        if (!product) {
          mockRes.status(404);
          mockRes.json({ message: "Produit non trouvé" });
        } else {
          const existingRelation = await productCompanyRepository.findOne({
            where: {
              productId: mockReq.body.productId,
              companyId: mockReq.user.company.id,
            },
          });

          if (existingRelation) {
            mockRes.status(400);
            mockRes.json({
              message: "Ce produit est déjà associé à cette entreprise",
            });
          } else {
            const productCompany = productCompanyRepository.create({
              product,
              company: mockReq.user.company,
              amount: mockReq.body.amount,
            });

            const savedProductCompany = await productCompanyRepository.save(
              productCompany
            );
            mockRes.status(201);
            mockRes.json(savedProductCompany);
          }
        }
      }

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 150,
        })
      );
    });

    it("devrait simuler getAllProductCompanies", async () => {
      const mockReq = createMockRequest({
        user: { company: testData.testCompany },
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);
      const productCompanies = await productCompanyRepository.find({
        where: { companyId: mockReq.user.company.id },
        relations: ["product", "company"],
      });

      mockRes.status(200);
      mockRes.json(productCompanies);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            amount: testData.testProductCompany.amount,
          }),
        ])
      );
    });

    it("devrait simuler updateAmount avec succès", async () => {
      const mockReq = createMockRequest({
        params: {
          productId: testData.testProductCompany.productId.toString(),
          companyId: testData.testProductCompany.companyId.toString(),
        },
        body: { action: "increase", quantity: 30 },
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);
      const productCompany = await productCompanyRepository.findOne({
        where: {
          productId: parseInt(mockReq.params.productId),
          companyId: parseInt(mockReq.params.companyId),
        },
        relations: ["product", "company"],
      });

      if (!productCompany) {
        mockRes.status(404);
        mockRes.json({ message: "ProductCompany non trouvé" });
      } else {
        const { action, quantity } = mockReq.body;

        if (action === "increase") {
          productCompany.amount += quantity;
        } else if (action === "decrease") {
          if (productCompany.amount < quantity) {
            mockRes.status(400);
            mockRes.json({ message: "Stock insuffisant" });
            return;
          }
          productCompany.amount -= quantity;
        } else {
          mockRes.status(400);
          mockRes.json({
            message: 'Action invalide. Utilisez "increase" ou "decrease"',
          });
          return;
        }

        const updatedProductCompany = await productCompanyRepository.save(
          productCompany
        );
        mockRes.status(200);
        mockRes.json({
          message: `Stock ${
            action === "increase" ? "augmenté" : "diminué"
          } de ${quantity}`,
          productCompany: updatedProductCompany,
        });
      }

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Stock augmenté de 30",
          productCompany: expect.objectContaining({
            amount: testData.testProductCompany.amount + 30,
          }),
        })
      );
    });

    it("devrait simuler deleteProductCompany avec succès", async () => {
      const mockReq = createMockRequest({
        params: {
          productId: testData.testProductCompany.productId.toString(),
          companyId: testData.testProductCompany.companyId.toString(),
        },
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const productCompanyRepository =
        testDataSource.getRepository(ProductCompany);
      const productCompany = await productCompanyRepository.findOneBy({
        productId: parseInt(mockReq.params.productId),
        companyId: parseInt(mockReq.params.companyId),
      });

      if (productCompany) {
        await productCompanyRepository.remove(productCompany);
        mockRes.status(204);
        mockRes.send();
      } else {
        mockRes.status(404);
        mockRes.json({ message: "ProductCompany non trouvé" });
      }

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });
});
