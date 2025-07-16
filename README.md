# StockIt-Back

## Description
StockIt-Back est le backend du projet StockIt, une application de gestion des stocks. Ce projet est construit avec Node.js, TypeScript, et utilise TypeORM pour la gestion de la base de données PostgreSQL.

## Fonctionnalités
- **Authentification** : Inscription, connexion et gestion des tokens JWT.
- **Gestion des rôles** : Gérant et employé.
- **Gestion des utilisateurs** : Ajout d'employés par les gérants.
- **Gestion des entreprises** : Un utilisateur peut être lié à une entreprise.

**WORK IN PROGRESS** : Les autres fonctionnalités sont en cours de développement.

## Prérequis
- Node.js (version 22 ou supérieure)
- PostgreSQL

## Dépendances 
  - `express`
  - `typeorm`
  - `pg`
  - `bcrypt`
  - `jsonwebtoken`
  - `@dotenvx/dotenvx`
  - `ts-node-dev`
  - `typescript`
  - `@types/express`
  - `@types/jsonwebtoken`
  - `@types/cors`
  - `@types/bcrypt`

## Installation
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/Frezz68/stockIt-Back.git
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Configurez les variables d'environnement :
   Créez un fichier `.env` à la racine du projet et ajoutez les variables suivantes :
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=stockit_db
   JWT_SECRET=votre_secret_tres_securise
   ```

## Scripts
- **Démarrer en mode développement** :
  ```bash
  npm run dev
  ```
- **Construire le projet** :
  ```bash
  npm run build
  ```
- **Démarrer en production** :
  ```bash
  npm start
  ```
- **Exécuter les migrations** :
  ```bash
  npm run migrate
  ```

## Structure du projet
```
stockIt-Back/
├── src/
│   ├── config/          # Configuration de la base de données
│   ├── controllers/     # Logique métier
│   ├── entity/          # Entités TypeORM
│   ├── middleware/      # Middlewares Express
│   ├── routes/          # Définition des routes
│   └── index.ts         # Point d'entrée de l'application
├── migrations/          # Fichiers de migration TypeORM
├── package.json         # Dépendances et scripts
├── tsconfig.json        # Configuration TypeScript
└── README.md            # Documentation
```

## Licence
Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d'informations.
