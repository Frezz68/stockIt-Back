import { testDataSource } from "./setup";
import { Company } from "../entity/Company";
import { createMockResponse, createMockRequest } from "./helpers/mockHelpers";
import { createTestData } from "./helpers/testDataHelper";

describe("Company Repository and Service Tests", () => {
  let testData: any;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe("Company Repository", () => {
    it("devrait créer une entreprise", async () => {
      const companyRepository = testDataSource.getRepository(Company);

      const company = companyRepository.create({
        name: "New Company",
      });

      const savedCompany = await companyRepository.save(company);

      expect(savedCompany.id).toBeDefined();
      expect(savedCompany.name).toBe("New Company");
    });

    it("devrait récupérer une entreprise par ID", async () => {
      const companyRepository = testDataSource.getRepository(Company);

      const foundCompany = await companyRepository.findOneBy({
        id: testData.testCompany.id,
      });

      expect(foundCompany).toBeTruthy();
      expect(foundCompany?.name).toBe(testData.testCompany.name);
    });

    it("devrait mettre à jour une entreprise", async () => {
      const companyRepository = testDataSource.getRepository(Company);

      const company = await companyRepository.findOneBy({
        id: testData.testCompany.id,
      });

      if (company) {
        company.name = "Updated Company Name";
        const updatedCompany = await companyRepository.save(company);

        expect(updatedCompany.name).toBe("Updated Company Name");
      }
    });

    it("devrait retourner null si l'entreprise n'existe pas", async () => {
      const companyRepository = testDataSource.getRepository(Company);

      const nonExistentCompany = await companyRepository.findOneBy({
        id: 99999,
      });

      expect(nonExistentCompany).toBeNull();
    });
  });

  describe("Company Service Logic", () => {
    it("devrait implémenter la logique de récupération d'entreprise par ID", async () => {
      const companyRepository = testDataSource.getRepository(Company);

      // Simulation de la logique du service
      const getCompanyByIdService = async (id: number) => {
        try {
          const company = await companyRepository.findOneBy({ id });
          if (!company) {
            throw new Error("Company not found");
          }
          return company;
        } catch (error) {
          throw error;
        }
      };

      const company = await getCompanyByIdService(testData.testCompany.id);

      expect(company).toBeDefined();
      expect(company.id).toBe(testData.testCompany.id);
      expect(company.name).toBe(testData.testCompany.name);

      // Test du cas d'erreur
      await expect(getCompanyByIdService(99999)).rejects.toThrow(
        "Company not found"
      );
    });

    it("devrait implémenter la logique de mise à jour d'entreprise", async () => {
      const companyRepository = testDataSource.getRepository(Company);

      // Simulation de la logique du service
      const updateCompanyService = async (
        id: number,
        updateData: { name?: string }
      ) => {
        try {
          const company = await companyRepository.findOneBy({ id });
          if (!company) {
            throw new Error("Company not found");
          }

          Object.assign(company, updateData);
          return await companyRepository.save(company);
        } catch (error) {
          throw error;
        }
      };

      const updatedCompany = await updateCompanyService(
        testData.testCompany.id,
        {
          name: "Service Updated Company",
        }
      );

      expect(updatedCompany.name).toBe("Service Updated Company");
      expect(updatedCompany.id).toBe(testData.testCompany.id);

      // Test du cas d'erreur
      await expect(
        updateCompanyService(99999, { name: "Test" })
      ).rejects.toThrow("Company not found");
    });
  });

  describe("Mock Response Tests for Company Controller", () => {
    it("devrait simuler getCompanyInfoById avec succès", async () => {
      const mockReq = createMockRequest({
        params: { id: testData.testCompany.id.toString() },
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const companyRepository = testDataSource.getRepository(Company);
      const company = await companyRepository.findOneBy({
        id: parseInt(mockReq.params.id),
      });

      if (company) {
        mockRes.status(200);
        mockRes.json(company);
      } else {
        mockRes.status(404);
        mockRes.json({ message: "Company not found" });
      }

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: testData.testCompany.id,
          name: testData.testCompany.name,
        })
      );
    });

    it("devrait simuler getCompanyInfoById avec erreur 404", async () => {
      const mockReq = createMockRequest({
        params: { id: "99999" },
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const companyRepository = testDataSource.getRepository(Company);
      const company = await companyRepository.findOneBy({
        id: parseInt(mockReq.params.id),
      });

      if (company) {
        mockRes.status(200);
        mockRes.json(company);
      } else {
        mockRes.status(404);
        mockRes.json({ message: "Company not found" });
      }

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Company not found",
      });
    });

    it("devrait simuler updateCompany avec succès", async () => {
      const updateData = { name: "Mock Updated Company" };
      const mockReq = createMockRequest({
        params: { id: testData.testCompany.id.toString() },
        body: updateData,
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const companyRepository = testDataSource.getRepository(Company);
      const company = await companyRepository.findOneBy({
        id: parseInt(mockReq.params.id),
      });

      if (company) {
        Object.assign(company, mockReq.body);
        const updatedCompany = await companyRepository.save(company);
        mockRes.status(200);
        mockRes.json(updatedCompany);
      } else {
        mockRes.status(404);
        mockRes.json({ message: "Company not found" });
      }

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: testData.testCompany.id,
          name: "Mock Updated Company",
        })
      );
    });

    it("devrait simuler updateCompany avec erreur 404", async () => {
      const updateData = { name: "Non-existent Company" };
      const mockReq = createMockRequest({
        params: { id: "99999" },
        body: updateData,
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const companyRepository = testDataSource.getRepository(Company);
      const company = await companyRepository.findOneBy({
        id: parseInt(mockReq.params.id),
      });

      if (company) {
        Object.assign(company, mockReq.body);
        const updatedCompany = await companyRepository.save(company);
        mockRes.status(200);
        mockRes.json(updatedCompany);
      } else {
        mockRes.status(404);
        mockRes.json({ message: "Company not found" });
      }

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Company not found",
      });
    });
  });
});
