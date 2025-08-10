import { testDataSource } from "./setup";
import { Product } from "../entity/Product";
import { createTestData } from "./helpers/testDataHelper";

describe("Product Repository and Service Tests", () => {
  let testData: any;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe("Product Repository", () => {
    it("devrait créer un produit", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const product = productRepository.create({
        name: "New Product",
        EAN: "9876543210987",
        reference: "NEW-001",
        description: "A new test product",
      });

      const savedProduct = await productRepository.save(product);

      expect(savedProduct.id).toBeDefined();
      expect(savedProduct.name).toBe("New Product");
      expect(savedProduct.EAN).toBe("9876543210987");
      expect(savedProduct.reference).toBe("NEW-001");
    });

    it("devrait récupérer un produit par ID", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const foundProduct = await productRepository.findOneBy({
        id: testData.testProduct.id,
      });

      expect(foundProduct).toBeTruthy();
      expect(foundProduct?.name).toBe(testData.testProduct.name);
    });

    it("devrait récupérer un produit par EAN", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const foundProduct = await productRepository.findOneBy({
        EAN: testData.testProduct.EAN,
      });

      expect(foundProduct).toBeTruthy();
      expect(foundProduct?.EAN).toBe(testData.testProduct.EAN);
    });

    it("devrait récupérer un produit par référence", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const foundProduct = await productRepository.findOneBy({
        reference: testData.testProduct.reference,
      });

      expect(foundProduct).toBeTruthy();
      expect(foundProduct?.reference).toBe(testData.testProduct.reference);
    });

    it("devrait récupérer tous les produits", async () => {
      const productRepository = testDataSource.getRepository(Product);

      // Créer un produit supplémentaire
      const additionalProduct = productRepository.create({
        name: "Additional Product",
        EAN: "1111111111111",
        reference: "ADD-001",
      });
      await productRepository.save(additionalProduct);

      const allProducts = await productRepository.find();

      expect(allProducts.length).toBeGreaterThanOrEqual(2);
      expect(
        allProducts.some((p) => p.name === testData.testProduct.name)
      ).toBeTruthy();
      expect(
        allProducts.some((p) => p.name === "Additional Product")
      ).toBeTruthy();
    });

    it("devrait mettre à jour un produit", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const product = await productRepository.findOneBy({
        id: testData.testProduct.id,
      });

      if (product) {
        product.name = "Updated Product Name";
        product.description = "Updated description";
        const updatedProduct = await productRepository.save(product);

        expect(updatedProduct.name).toBe("Updated Product Name");
        expect(updatedProduct.description).toBe("Updated description");
      }
    });

    it("devrait supprimer un produit", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const product = await productRepository.findOneBy({
        id: testData.testProduct.id,
      });

      if (product) {
        await productRepository.remove(product);

        const deletedProduct = await productRepository.findOneBy({
          id: testData.testProduct.id,
        });

        expect(deletedProduct).toBeNull();
      }
    });
  });

  describe("Product Service Logic", () => {
    it("devrait implémenter la logique de création de produit", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const createProductService = async (productData: {
        name: string;
        EAN?: string;
        reference?: string;
        description?: string;
      }) => {
        try {
          // Vérifier si un produit avec le même EAN ou référence existe déjà
          if (productData.EAN) {
            const existingByEAN = await productRepository.findOneBy({
              EAN: productData.EAN,
            });
            if (existingByEAN) {
              throw new Error("Un produit avec cet EAN existe déjà");
            }
          }

          if (productData.reference) {
            const existingByRef = await productRepository.findOneBy({
              reference: productData.reference,
            });
            if (existingByRef) {
              throw new Error("Un produit avec cette référence existe déjà");
            }
          }

          const product = productRepository.create(productData);
          return await productRepository.save(product);
        } catch (error) {
          throw error;
        }
      };

      const newProduct = await createProductService({
        name: "Service Created Product",
        EAN: "5555555555555",
        reference: "SVC-001",
        description: "Created by service",
      });

      expect(newProduct).toBeDefined();
      expect(newProduct.name).toBe("Service Created Product");
      expect(newProduct.EAN).toBe("5555555555555");

      // Test du cas d'erreur avec EAN existant
      await expect(
        createProductService({
          name: "Duplicate EAN Product",
          EAN: "5555555555555",
          reference: "DUP-001",
        })
      ).rejects.toThrow("Un produit avec cet EAN existe déjà");

      // Test du cas d'erreur avec référence existante
      await expect(
        createProductService({
          name: "Duplicate Ref Product",
          EAN: "6666666666666",
          reference: "SVC-001",
        })
      ).rejects.toThrow("Un produit avec cette référence existe déjà");
    });

    it("devrait implémenter la logique de récupération de produit par différents critères", async () => {
      const productRepository = testDataSource.getRepository(Product);

      const getProductService = async (criteria: {
        id?: number;
        EAN?: string;
        reference?: string;
      }) => {
        try {
          let product = null;

          if (criteria.id) {
            product = await productRepository.findOneBy({ id: criteria.id });
          } else if (criteria.EAN) {
            product = await productRepository.findOneBy({ EAN: criteria.EAN });
          } else if (criteria.reference) {
            product = await productRepository.findOneBy({
              reference: criteria.reference,
            });
          }

          if (!product) {
            throw new Error("Produit non trouvé");
          }

          return product;
        } catch (error) {
          throw error;
        }
      };

      // Test par ID
      const productById = await getProductService({
        id: testData.testProduct.id,
      });
      expect(productById.id).toBe(testData.testProduct.id);

      // Test par EAN
      const productByEAN = await getProductService({
        EAN: testData.testProduct.EAN,
      });
      expect(productByEAN.EAN).toBe(testData.testProduct.EAN);

      // Test par référence
      const productByRef = await getProductService({
        reference: testData.testProduct.reference,
      });
      expect(productByRef.reference).toBe(testData.testProduct.reference);

      // Test du cas d'erreur
      await expect(getProductService({ id: 99999 })).rejects.toThrow(
        "Produit non trouvé"
      );
    });
  });
});
