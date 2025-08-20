# Tests Unitaires Backend - Stock-It

## Vue d'ensemble

Cette documentation décrit la suite complète de tests unitaires créée pour le backend de l'application Stock-It. Les tests utilisent Jest et une base de données SQLite en mémoire pour assurer une isolation complète.

## Structure des Tests

### Configuration globale

- **Fichier de configuration** : `jest.config.json`
- **Setup global** : `src/__tests__/setup.ts`
- **Base de données de test** : SQLite en mémoire (`:memory:`)

### Fichiers de tests créés

1. **`src/__tests__/user.controller.test.ts`** - Tests pour UserController
2. **`src/__tests__/product.controller.test.ts`** - Tests pour ProductController
3. **`src/__tests__/productCompany.controller.test.ts`** - Tests pour ProductCompanyController
4. **`src/__tests__/company.controller.test.ts`** - Tests pour CompanyController
5. **`src/__tests__/stockMovement.controller.test.ts`** - Tests pour StockMovementController

## Configuration Jest

### Scripts package.json

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Dépendances ajoutées

- `jest`: Framework de tests
- `ts-jest`: Support TypeScript pour Jest
- `@types/jest`: Types TypeScript pour Jest
- `supertest`: Tests d'intégration HTTP
- `@types/supertest`: Types TypeScript pour Supertest
- `sqlite3`: Driver SQLite pour tests

## Tests par contrôleur

### UserController

**Fonctions testées** :

- `register` : Inscription d'un nouvel utilisateur
- `login` : Connexion d'un utilisateur
- `passwordReset` : Réinitialisation de mot de passe
- `getEmployees` : Récupération des employés
- `addEmployeeAccount` : Ajout d'un compte employé
- `deleteEmployee` : Suppression d'un employé

**Scénarios de test** :

- ✅ Cas de succès
- ❌ Validation des données (champs manquants)
- ❌ Gestion des erreurs (utilisateur inexistant, mot de passe incorrect)
- ❌ Contrôles d'autorisation

### ProductController

**Fonctions testées** :

- `createProduct` : Création d'un produit
- `getAllProducts` : Récupération de tous les produits
- `getProductById` : Récupération d'un produit par ID
- `updateProduct` : Mise à jour d'un produit
- `deleteProduct` : Suppression d'un produit
- `getProductByEAN` : Recherche par code EAN
- `getProductByReference` : Recherche par référence

**Scénarios de test** :

- ✅ Opérations CRUD complètes
- ❌ Validation des données
- ❌ Gestion des doublons
- ❌ Produits inexistants

### ProductCompanyController

**Fonctions testées** :

- `createProductCompany` : Association produit-entreprise
- `getAllProductCompanies` : Liste des associations
- `getProductCompanyById` : Récupération par ID composite
- `updateProductCompany` : Mise à jour d'association
- `updateAmount` : Modification des quantités
- `deleteProductCompany` : Suppression d'association

**Particularités** :

- Gestion des clés primaires composites (`productId`, `companyId`)
- Tests des opérations de stock (augmentation/diminution)
- Validation des quantités disponibles

### CompanyController

**Fonctions testées** :

- `getCompanyInfoById` : Informations d'entreprise
- `updateCompany` : Mise à jour d'entreprise

### StockMovementController

**Fonctions testées** :

- `getAllStockMovements` : Historique des mouvements
- `createStockMovement` : Création de mouvement (méthode utilitaire)

**Types de mouvements** :

- `IN` : Entrée de stock
- `OUT` : Sortie de stock
- `ADJUSTMENT` : Ajustement
- `DELETE` : Suppression

## Exécution des tests

### Commandes disponibles

```bash
# Exécuter tous les tests
npm test

# Exécuter en mode watch
npm run test:watch

# Exécuter avec couverture de code
npm run test:coverage

# Exécuter un fichier de test spécifique
npx jest --testPathPatterns=user.controller.test.ts
```

### Structure d'un test type

```typescript
describe("ControllerName", () => {
  beforeEach(async () => {
    // Setup des données de test
  });

  describe("methodName", () => {
    it("devrait réussir dans le cas nominal", async () => {
      // Arrange
      const mockReq = {
        /* ... */
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Act
      await Controller.method(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(/* ... */);
    });

    it("devrait retourner une erreur si...", async () => {
      // Test des cas d'erreur
    });
  });
});
```

## Couverture de code

Les tests couvrent :

- ✅ Toutes les méthodes publiques des contrôleurs
- ✅ Les cas de succès et d'échec
- ✅ La validation des données d'entrée
- ✅ La gestion des erreurs
- ✅ Les contrôles d'autorisation

## Problèmes résolus

1. **Support SQLite** : Conversion des enums vers varchar
2. **Contraintes FK** : Désactivation pour les tests
3. **Isolation des tests** : Nettoyage automatique entre tests
4. **Mocking** : Configuration correcte des mocks Express
5. **Types TypeScript** : Correction des types pour les tests

## Utilisation

### Ajout de nouveaux tests

1. Créer un fichier `*.test.ts` dans `src/__tests__/`
2. Importer la configuration de test depuis `./setup`
3. Suivre le pattern existant pour les mocks et assertions
4. Assurer l'isolation avec `beforeEach` et nettoyage

### Maintenance

- Les tests sont automatiquement exécutés avant chaque commit
- La base de données de test est isolée et éphémère
- Aucune configuration externe requise
- Compatible avec CI/CD

## Commandes rapides

```bash
# Installation des dépendances de test
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest sqlite3

# Exécution rapide d'un contrôleur
npm test -- --testPathPatterns=user.controller.test.ts

# Debug d'un test spécifique
npm test -- --testNamePattern="devrait créer un utilisateur"
```

Cette suite de tests garantit la fiabilité et la maintenabilité du backend Stock-It avec une couverture complète des fonctionnalités critiques.
