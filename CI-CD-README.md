# 🚀 CI/CD Backend - Stock-It

## 📋 Vue d'ensemble

Ce workflow GitHub Actions fournit une pipeline CI/CD complète pour le backend Stock-It avec :

- ✅ **Tests automatisés** (unitaires & intégration)
- 🐳 **Build Docker**
- 🚀 **Déploiement automatique** (staging & production)

## 🔧 Configuration requise

### 1. Secrets GitHub à configurer

Dans `Settings > Secrets and variables > Actions`, ajouter :

```bash
# Docker Hub (optionnel)
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password

# Déploiement (à adapter selon votre infrastructure)
STAGING_SERVER_HOST=staging.stock-it.com
STAGING_SERVER_USER=deploy
STAGING_SSH_KEY=your-private-ssh-key

PRODUCTION_SERVER_HOST=api.stock-it.com
PRODUCTION_SERVER_USER=deploy
PRODUCTION_SSH_KEY=your-private-ssh-key

# Base de données de production (si nécessaire)
PROD_DB_PASSWORD=your-production-db-password
```

### 2. Variables d'environnement

Le workflow utilise ces variables par défaut :

```yaml
NODE_VERSION: '20'           # Version Node.js
DB_HOST: localhost          # Host PostgreSQL (tests)
DB_PORT: 5432              # Port PostgreSQL (tests)
DB_USERNAME: stockit_test  # User PostgreSQL (tests)
DB_PASSWORD: test_password # Password PostgreSQL (tests)
DB_DATABASE: stockit_test  # Database PostgreSQL (tests)
```

## 📦 Scripts npm requis

Ajoutez ces scripts dans votre `package.json` :

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:integration": "jest --testPathPattern=integration",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "format:check": "prettier --check src/**/*.ts",
    "format": "prettier --write src/**/*.ts",
    "migrate": "typeorm migration:run",
    "migrate:revert": "typeorm migration:revert"
  }
}
```

## 🔄 Fonctionnement du Pipeline

### 1. **Déclencheurs**

```yaml
# Push sur main/develop
on:
  push:
    branches: [main, develop]
  # Pull requests vers main/develop  
  pull_request:
    branches: [main, develop]
```

### 2. **Jobs exécutés**

#### 🧪 **Tests & Build** 
- Tests sur Node.js 18 & 20
- PostgreSQL en service
- Migration de base de données
- Tests unitaires + intégration
- Build TypeScript

#### 🐳 **Docker Build**
- Construction image Docker
- Test de démarrage du conteneur

#### 🚀 **Déploiement**

##### Staging (branche `develop`)
- Build optimisé
- Déploiement automatique

##### Production (branche `main`)
- Environnement protégé
- Approbation manuelle possible

## 🎯 Exemples d'utilisation

### Développement normal

```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et commiter
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# 3. Pousser la branche
git push origin feature/nouvelle-fonctionnalite

# 4. Créer une Pull Request vers develop
# → Déclenche : lint, security-audit, test, docker-build
```

### Déploiement staging

```bash
# 1. Merger la PR vers develop
git checkout develop
git merge feature/nouvelle-fonctionnalite

# 2. Pousser vers develop
git push origin develop

# → Déclenche : Pipeline complet + déploiement staging
```

### Déploiement production

```bash
# 1. Merger develop vers main
git checkout main
git merge develop

# 2. Créer un tag de version
git tag v1.2.0
git push origin main --tags

# → Déclenche : Pipeline complet + déploiement production
```


## 🔗 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [Workflow Security](https://docs.github.com/en/actions/security-guides)

---


**🔐 Sécurité** : Ne jamais exposer de secrets dans les logs ou le code.
