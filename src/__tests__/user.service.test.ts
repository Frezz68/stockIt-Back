import { testDataSource } from "./setup";
import { User } from "../entity/User";
import { Role, RoleType } from "../entity/Role";
import { Company } from "../entity/Company";
import { createMockResponse, createMockRequest } from "./helpers/mockHelpers";
import { createTestData } from "./helpers/testDataHelper";

describe("User Repository and Service Tests", () => {
  let testData: any;

  beforeEach(async () => {
    testData = await createTestData();
  });

  describe("User Repository", () => {
    it("devrait créer un utilisateur", async () => {
      const userRepository = testDataSource.getRepository(User);

      const user = userRepository.create({
        firstname: "New",
        lastname: "User",
        email: "newuser@test.com",
        password: "hashedpassword123",
        company: testData.testCompany,
        role: testData.testRole,
      });

      const savedUser = await userRepository.save(user);

      expect(savedUser.id).toBeDefined();
      expect(savedUser.firstname).toBe("New");
      expect(savedUser.lastname).toBe("User");
      expect(savedUser.email).toBe("newuser@test.com");
    });

    it("devrait récupérer un utilisateur par email", async () => {
      const userRepository = testDataSource.getRepository(User);

      const foundUser = await userRepository.findOne({
        where: { email: testData.testUser.email },
        relations: ["company", "role"],
      });

      expect(foundUser).toBeTruthy();
      expect(foundUser?.email).toBe(testData.testUser.email);
      expect(foundUser?.company.id).toBe(testData.testCompany.id);
      expect(foundUser?.role.id).toBe(testData.testRole.id);
    });

    it("devrait récupérer un utilisateur par ID", async () => {
      const userRepository = testDataSource.getRepository(User);

      const foundUser = await userRepository.findOneBy({
        id: testData.testUser.id,
      });

      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(testData.testUser.id);
    });

    it("devrait récupérer tous les utilisateurs d'une entreprise", async () => {
      const userRepository = testDataSource.getRepository(User);

      // Créer un utilisateur supplémentaire pour la même entreprise
      const additionalUser = userRepository.create({
        firstname: "Another",
        lastname: "Employee",
        email: "employee@test.com",
        password: "password123",
        company: testData.testCompany,
        role: testData.testRole,
      });
      await userRepository.save(additionalUser);

      const companyUsers = await userRepository.find({
        where: { company: { id: testData.testCompany.id } },
        relations: ["company", "role"],
      });

      expect(companyUsers.length).toBeGreaterThanOrEqual(2);
      expect(
        companyUsers.every((u) => u.company.id === testData.testCompany.id)
      ).toBeTruthy();
    });

    it("devrait mettre à jour les informations d'un utilisateur", async () => {
      const userRepository = testDataSource.getRepository(User);

      const user = await userRepository.findOneBy({
        id: testData.testUser.id,
      });

      if (user) {
        user.firstname = "Updated";
        user.lastname = "Name";
        user.lastConnection = new Date();

        const updatedUser = await userRepository.save(user);

        expect(updatedUser.firstname).toBe("Updated");
        expect(updatedUser.lastname).toBe("Name");
        expect(updatedUser.lastConnection).toBeDefined();
      }
    });

    it("devrait vérifier l'unicité de l'email", async () => {
      const userRepository = testDataSource.getRepository(User);

      const duplicateUser = userRepository.create({
        firstname: "Duplicate",
        lastname: "User",
        email: testData.testUser.email,
        password: "password123",
        company: testData.testCompany,
        role: testData.testRole,
      });

      // Cela devrait lever une erreur à cause de la contrainte unique
      await expect(userRepository.save(duplicateUser)).rejects.toThrow();
    });
  });

  describe("Role Repository", () => {
    it("devrait créer un rôle", async () => {
      const roleRepository = testDataSource.getRepository(Role);

      const role = roleRepository.create({
        name: RoleType.EMPLOYE,
      });

      const savedRole = await roleRepository.save(role);

      expect(savedRole.id).toBeDefined();
      expect(savedRole.name).toBe(RoleType.EMPLOYE);
    });

    it("devrait récupérer un rôle par nom", async () => {
      const roleRepository = testDataSource.getRepository(Role);

      const foundRole = await roleRepository.findOneBy({
        name: testData.testRole.name,
      });

      expect(foundRole).toBeTruthy();
      expect(foundRole?.name).toBe(testData.testRole.name);
    });

    it("devrait récupérer tous les rôles", async () => {
      const roleRepository = testDataSource.getRepository(Role);

      // Créer un rôle supplémentaire
      const employeeRole = roleRepository.create({
        name: RoleType.EMPLOYE,
      });
      await roleRepository.save(employeeRole);

      const allRoles = await roleRepository.find();

      expect(allRoles.length).toBeGreaterThanOrEqual(2);
      expect(allRoles.some((r) => r.name === RoleType.GERANT)).toBeTruthy();
      expect(allRoles.some((r) => r.name === RoleType.EMPLOYE)).toBeTruthy();
    });
  });

  describe("User Service Logic", () => {
    it("devrait implémenter la logique d'inscription", async () => {
      const userRepository = testDataSource.getRepository(User);
      const roleRepository = testDataSource.getRepository(Role);
      const companyRepository = testDataSource.getRepository(Company);

      const registerService = async (userData: {
        firstname: string;
        lastname: string;
        email: string;
        password: string;
        companyName: string;
      }) => {
        try {
          // Vérifier si l'email existe déjà
          const existingUser = await userRepository.findOneBy({
            email: userData.email,
          });
          if (existingUser) {
            throw new Error("Cet email est déjà utilisé");
          }

          // Créer ou récupérer l'entreprise
          let company = await companyRepository.findOneBy({
            name: userData.companyName,
          });
          if (!company) {
            company = companyRepository.create({
              name: userData.companyName,
            });
            await companyRepository.save(company);
          }

          // Récupérer le rôle GERANT
          const role = await roleRepository.findOneBy({
            name: RoleType.GERANT,
          });
          if (!role) {
            throw new Error("Rôle non trouvé");
          }

          // Créer l'utilisateur
          const user = userRepository.create({
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            password: userData.password,
            company,
            role,
          });

          return await userRepository.save(user);
        } catch (error) {
          throw error;
        }
      };

      const newUser = await registerService({
        firstname: "Service",
        lastname: "User",
        email: "service@test.com",
        password: "hashedpassword",
        companyName: "Service Company",
      });

      expect(newUser).toBeDefined();
      expect(newUser.email).toBe("service@test.com");
      expect(newUser.company.name).toBe("Service Company");
      expect(newUser.role.name).toBe(RoleType.GERANT);

      // Test erreur email existant
      await expect(
        registerService({
          firstname: "Duplicate",
          lastname: "User",
          email: "service@test.com",
          password: "password",
          companyName: "Another Company",
        })
      ).rejects.toThrow("Cet email est déjà utilisé");
    });

    it("devrait implémenter la logique de connexion", async () => {
      const userRepository = testDataSource.getRepository(User);

      const loginService = async (email: string, password: string) => {
        try {
          const user = await userRepository.findOne({
            where: { email },
            relations: ["company", "role"],
          });

          if (!user) {
            throw new Error("Email ou mot de passe incorrect");
          }

          // En réalité, il faudrait comparer avec bcrypt
          if (user.password !== password) {
            throw new Error("Email ou mot de passe incorrect");
          }

          // Mettre à jour la dernière connexion
          user.lastConnection = new Date();
          await userRepository.save(user);

          return user;
        } catch (error) {
          throw error;
        }
      };

      const loggedUser = await loginService(
        testData.testUser.email,
        testData.testUser.password
      );

      expect(loggedUser).toBeDefined();
      expect(loggedUser.email).toBe(testData.testUser.email);
      expect(loggedUser.lastConnection).toBeDefined();

      // Test erreur email inexistant
      await expect(
        loginService("nonexistent@test.com", "password")
      ).rejects.toThrow("Email ou mot de passe incorrect");

      // Test erreur mot de passe incorrect
      await expect(
        loginService(testData.testUser.email, "wrongpassword")
      ).rejects.toThrow("Email ou mot de passe incorrect");
    });

    it("devrait implémenter la logique d'ajout d'employé", async () => {
      const userRepository = testDataSource.getRepository(User);
      const roleRepo1 = testDataSource.getRepository(Role);

      const addEmployeeService = async (
        employeeData: {
          firstname: string;
          lastname: string;
          email: string;
          password: string;
        },
        companyId: number
      ) => {
        try {
          // Vérifier si l'email existe déjà
          const existingUser = await userRepository.findOneBy({
            email: employeeData.email,
          });
          if (existingUser) {
            throw new Error("Cet email est déjà utilisé");
          }

          // Récupérer le rôle EMPLOYE
          const roleRepo = testDataSource.getRepository(Role);
          const role = await roleRepo.findOneBy({
            name: RoleType.EMPLOYE,
          });
          if (!role) {
            throw new Error("Rôle employé non trouvé");
          }

          // Créer l'employé
          const employee = userRepository.create({
            ...employeeData,
            company: { id: companyId } as Company,
            role,
          });

          return await userRepository.save(employee);
        } catch (error) {
          throw error;
        }
      };

      // Créer d'abord le rôle EMPLOYE
      const roleRepo2 = testDataSource.getRepository(Role);
      const employeeRole = roleRepo2.create({
        name: RoleType.EMPLOYE,
      });
      await roleRepo2.save(employeeRole);

      const newEmployee = await addEmployeeService(
        {
          firstname: "New",
          lastname: "Employee",
          email: "newemployee@test.com",
          password: "employeepassword",
        },
        testData.testCompany.id
      );

      expect(newEmployee).toBeDefined();
      expect(newEmployee.email).toBe("newemployee@test.com");
      expect(newEmployee.role.name).toBe(RoleType.EMPLOYE);

      // Test erreur email existant
      await expect(
        addEmployeeService(
          {
            firstname: "Another",
            lastname: "Employee",
            email: "newemployee@test.com",
            password: "password",
          },
          testData.testCompany.id
        )
      ).rejects.toThrow("Cet email est déjà utilisé");
    });
  });

  describe("Mock Response Tests for User Controller", () => {
    it("devrait simuler register avec succès", async () => {
      const userData = {
        firstname: "Mock",
        lastname: "User",
        email: "mockuser@test.com",
        password: "mockpassword",
        companyName: "Mock Company",
      };

      const mockReq = createMockRequest({ body: userData });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const userRepository = testDataSource.getRepository(User);
      const companyRepository = testDataSource.getRepository(Company);
      const roleRepository = testDataSource.getRepository(Role);

      if (
        !mockReq.body.firstname ||
        !mockReq.body.lastname ||
        !mockReq.body.email ||
        !mockReq.body.password ||
        !mockReq.body.companyName
      ) {
        mockRes.status(400);
        mockRes.json({ message: "Tous les champs sont requis" });
      } else {
        const existingUser = await userRepository.findOneBy({
          email: mockReq.body.email,
        });

        if (existingUser) {
          mockRes.status(400);
          mockRes.json({ message: "Cet email est déjà utilisé" });
        } else {
          // Créer l'entreprise
          const company = companyRepository.create({
            name: mockReq.body.companyName,
          });
          await companyRepository.save(company);

          // Créer l'utilisateur
          const user = userRepository.create({
            firstname: mockReq.body.firstname,
            lastname: mockReq.body.lastname,
            email: mockReq.body.email,
            password: mockReq.body.password,
            company,
            role: testData.testRole,
          });

          const savedUser = await userRepository.save(user);
          mockRes.status(201);
          mockRes.json({
            message: "Utilisateur créé avec succès",
            user: {
              id: savedUser.id,
              firstname: savedUser.firstname,
              lastname: savedUser.lastname,
              email: savedUser.email,
            },
          });
        }
      }

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Utilisateur créé avec succès",
          user: expect.objectContaining({
            firstname: "Mock",
            lastname: "User",
            email: "mockuser@test.com",
          }),
        })
      );
    });

    it("devrait simuler login avec succès", async () => {
      const loginData = {
        email: testData.testUser.email,
        password: testData.testUser.password,
      };

      const mockReq = createMockRequest({ body: loginData });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const userRepository = testDataSource.getRepository(User);

      if (!mockReq.body.email || !mockReq.body.password) {
        mockRes.status(400);
        mockRes.json({ message: "Email et mot de passe requis" });
      } else {
        const user = await userRepository.findOne({
          where: { email: mockReq.body.email },
          relations: ["company", "role"],
        });

        if (!user || user.password !== mockReq.body.password) {
          mockRes.status(401);
          mockRes.json({ message: "Email ou mot de passe incorrect" });
        } else {
          user.lastConnection = new Date();
          await userRepository.save(user);

          mockRes.status(200);
          mockRes.json({
            message: "Connexion réussie",
            user: {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              company: user.company,
              role: user.role,
            },
            token: "mock-jwt-token",
          });
        }
      }

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Connexion réussie",
          user: expect.objectContaining({
            email: testData.testUser.email,
          }),
          token: "mock-jwt-token",
        })
      );
    });

    it("devrait simuler addEmployee avec succès", async () => {
      // Créer d'abord le rôle EMPLOYE
      const roleRepository = testDataSource.getRepository(Role);
      const employeeRole = roleRepository.create({
        name: RoleType.EMPLOYE,
      });
      await roleRepository.save(employeeRole);

      const employeeData = {
        firstname: "Mock",
        lastname: "Employee",
        email: "mockemployee@test.com",
        password: "employeepassword",
      };

      const mockReq = createMockRequest({
        body: employeeData,
        user: { company: testData.testCompany },
      });
      const mockRes = createMockResponse();

      // Simulation de la logique du contrôleur
      const userRepository = testDataSource.getRepository(User);

      if (
        !mockReq.body.firstname ||
        !mockReq.body.lastname ||
        !mockReq.body.email ||
        !mockReq.body.password
      ) {
        mockRes.status(400);
        mockRes.json({ message: "Tous les champs sont requis" });
      } else {
        const existingUser = await userRepository.findOneBy({
          email: mockReq.body.email,
        });

        if (existingUser) {
          mockRes.status(400);
          mockRes.json({ message: "Cet email est déjà utilisé" });
        } else {
          const employee = userRepository.create({
            ...mockReq.body,
            company: mockReq.user.company,
            role: employeeRole,
          });

          const savedEmployee = await userRepository.save(employee);
          // S'assurer que savedEmployee est un objet unique, pas un tableau
          const employeeData = Array.isArray(savedEmployee)
            ? savedEmployee[0]
            : savedEmployee;

          mockRes.status(201);
          mockRes.json({
            message: "Employé ajouté avec succès",
            employee: {
              id: employeeData.id,
              firstname: employeeData.firstname,
              lastname: employeeData.lastname,
              email: employeeData.email,
            },
          });
        }
      }

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Employé ajouté avec succès",
          employee: expect.objectContaining({
            firstname: "Mock",
            lastname: "Employee",
            email: "mockemployee@test.com",
          }),
        })
      );
    });
  });
});
