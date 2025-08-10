import { testDataSource } from "../setup";
import { Company } from "../../entity/Company";
import { User } from "../../entity/User";
import { Role, RoleType } from "../../entity/Role";
import { Product } from "../../entity/Product";
import { ProductCompany } from "../../entity/ProductCompany";

export const createTestData = async () => {
  const companyRepository = testDataSource.getRepository(Company);
  const userRepository = testDataSource.getRepository(User);
  const roleRepository = testDataSource.getRepository(Role);
  const productRepository = testDataSource.getRepository(Product);
  const productCompanyRepository = testDataSource.getRepository(ProductCompany);

  // Créer un rôle de test
  const testRole = roleRepository.create({
    name: RoleType.GERANT,
  });
  await roleRepository.save(testRole);

  // Créer une entreprise de test
  const testCompany = companyRepository.create({
    name: "Test Company",
  });
  await companyRepository.save(testCompany);

  // Créer un utilisateur de test
  const testUser = userRepository.create({
    firstname: "Test",
    lastname: "User",
    email: "test@test.com",
    password: "hashedpassword",
    company: testCompany,
    role: testRole,
  });
  await userRepository.save(testUser);

  // Créer un produit de test
  const testProduct = productRepository.create({
    name: "Test Product",
    EAN: "1234567890123",
    reference: "TEST-001",
  });
  await productRepository.save(testProduct);

  // Créer une relation produit-entreprise de test
  const testProductCompany = productCompanyRepository.create({
    product: testProduct,
    company: testCompany,
    amount: 100,
  });
  await productCompanyRepository.save(testProductCompany);

  return {
    testCompany,
    testUser,
    testRole,
    testProduct,
    testProductCompany,
  };
};
