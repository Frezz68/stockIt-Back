# 🔧 Manuel de Mise à Jour - Stock-It Backend

## 📋 Vue d'ensemble

Ce guide détaille la procédure de mise à jour sécurisée du backend Stock-It (Node.js/TypeScript).

## 📦 Mise à jour des dépendances

### 🔍 Vérification préliminaire

```bash
cd stockIt-Back

# Vérifier l'état actuel
node --version
npm --version

# Analyser les dépendances obsolètes
npm outdated

# Audit de sécurité
npm audit

# Sauvegarder l'état actuel
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
```

### 🛠️ Mise à jour progressive

#### 1. Dépendances de développement (faible risque)

```bash
# TypeScript et outils de build
npm update typescript ts-node ts-node-dev

# Types
npm update @types/node @types/express @types/jsonwebtoken @types/cors @types/bcrypt @types/multer

# Tests
npm update jest ts-jest @types/jest supertest @types/supertest

# Linting et formatage
npm update eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

#### 2. Dépendances de production (risque modéré)

```bash
# Framework Express
npm update express cors

# Base de données
npm update typeorm pg sqlite3

# Sécurité
npm update bcrypt jsonwebtoken

# Utilitaires
npm update multer @dotenvx/dotenvx

# PDF et QR codes
npm update jspdf qrcode
```

## 🧪 Tests et validation

### Suite de tests complète

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm test -- --coverage

# Tests d'intégration spécifiques
npm test -- src/__tests__/integration/

# Tests de performance (si configurés)
npm run test:performance
```

## 🔧 Configuration post-mise à jour

### Variables d'environnement

Vérifier et mettre à jour le fichier `.env` :

```bash
# Copier l'exemple si nécessaire
cp .env.example .env

# Vérifier les nouvelles variables requises
cat .env.example
```

### Mise à jour de sécurité (immédiate)

```bash
# Corriger les vulnérabilités critiques
npm audit fix --force

# Tester immédiatement
npm test
```

### Mise à jour majeure (trimestrielle)

1. **Node.js** : Mise à jour vers la version LTS
2. **TypeScript** : Mise à jour majeure
3. **Express** : Nouvelles versions majeures
4. **TypeORM** : Migration vers nouvelles versions

## 📝 Documentation

Après chaque mise à jour majeure, mettre à jour :

- `README.md` - Instructions d'installation
- `TESTS.md` - Procédures de test

