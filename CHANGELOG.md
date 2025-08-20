# Changelog - Stock-It Backend

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet respecte le [Versioning Sémantique](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Ajout du workflow CI/CD GitHub Actions complet
- Configuration Docker multi-stage pour déploiement
- Tests d'intégration automatisés avec PostgreSQL
- Documentation complète du processus de mise à jour

### Security
- Audit automatique des dépendances npm
- Configuration des secrets GitHub Actions
- Mise en place des environnements protégés

---

## [1.0.0] - 2025-04-03

### Fixed
- **Mouvements de stock** : Élimination d'un double-comptage lors de mises à jour concurrentes
- **Produit-société (PUT /:productId)** : Mise à jour partielle corrigée (les champs non fournis ne sont plus écrasés par null/undefined)
- **Suppression produit-société (DELETE /:productId)** : Création fiable du mouvement DELETE si amount > 0 (corrige un cas sans traçabilité)
- **Recherche produit (/product/search)** : Gestion des espaces/majuscules/accents, retour 400 si aucun critère et 404 si introuvable (cohérence des statuts)
- **PDF QR** : Correction de cas d'échec sur certains libellés (encodage & police intégrée), fermeture correcte des streams pour éviter des fuites mémoire
- **Société (PUT /company/:id)** : Validation et messages d'erreur uniformisés, gestion de conflits propre
- **Journalisation** : Niveaux de logs harmonisés (erreurs non critiques ne polluent plus les logs error), ajout du request_id dans les traces existantes

---

## [0.0.7] - 2025-02-28

### Added
- **Génération de QR code par produit** : GET /api/pdf/qr-codes/:productId qui produit un PDF unitaire contenant le QR du produit (URL absolue vers …/scan/:productId) + libellé (nom/référence)
- **Intégration UI** : Bouton "QR" dans l'écran Gestion du stock pour déclencher la génération au niveau de chaque ligne produit

### Security
- Accès protégé par JWT contrôle d'appartenance à la société (seuls les produits de la société de l'utilisateur sont autorisés)

---

## [0.0.6] - 2025-02-05

### Added
- **Journalisation des transactions de stock** (audit trail complet) :
  - Enregistrement automatique des mouvements IN / OUT / SET / DELETE avec : userId, companyId, productId, quantity, previous_amount, new_amount, type, createdAt
  - Traçage déclenché par :
    - POST /api/product-company/ (ajout au stock)
    - PUT /api/product-company/:productId (maj attributs dont amount)
    - PUT /api/product-company/:productId/amount (opérations stock)
    - DELETE /api/product-company/:productId (sortie totale avant suppression)
  - Consultation : GET /api/stock-movement/ (historique trié par date desc)

### Changed
- Mise à jour et ajout des tests unitaires couvrant l'ensemble du cycle de vie des produits

### Security
- Accès protégé JWT, périmètre restreint à la société de l'utilisateur

---

## [0.0.4] - 2025-01-23

### Added
- **Routes pour la gestion des produits liés à une entreprise** (module ProductCompany) :
  - GET /api/product-company/ – lister les produits de la société
  - GET /api/product-company/:id – détail d'un produit-société
  - POST /api/product-company/ – associer un produit à la société { productId, amount }
  - PUT /api/product-company/:productId – MAJ des attributs { amount?, price?, min_stock? }
  - PUT /api/product-company/:productId/amount – opérations stock { operation: increment|decrement|set, value }
  - DELETE /api/product-company/:productId – retirer un produit du stock (mouvement DELETE si amount > 0)
- **Traçabilité** : Création automatique de mouvements de stock (IN/OUT/SET/DELETE/AJUSTEMENT) lors des modifications
- Ajout des tests unitaires couvrant l'ensemble du cycle de vie des produits

### Security
- Routes protégées par JWT et contrôle d'appartenance à la société

---

## [0.0.3] - 2025-01-12

### Added
- **Routes pour la gestion des entreprises** : Récupération et mise à jour des informations société (GET/PUT /api/company/:id)
- **Début d'implémentation des produits** : Création et liste de base (POST /api/product/, GET /api/product/) + recherche (GET /api/product/search)
- Ajout des tests unitaires qui couvrent la gestion d'entreprise

---

## [0.0.2] - 2025-01-06

### Added
- **Ajout des rôles et des nouvelles routes pour les utilisateurs** : Contrôle d'accès basé sur les rôles (manager/employé, listing, ajout/suppression d'employé, reset mot de passe)

### Changed
- Mise à jour des tests unitaires qui couvrent l'authentification

---

## [0.0.1] - 2025-01-03

### Added
- **Mise en place des fonctionnalités d'authentification** : Inscription, connexion, gestion JWT
- **Ajout d'un middleware de sécurité** pour la validation des requêtes
- Ajout des tests unitaires qui couvrent l'authentification

---

## Légende des Types de Modifications

- **Added** : Nouvelles fonctionnalités, endpoints, écrans
- **Changed** : Modifications de comportements existants
- **Fixed** : Anomalies corrigées, régressions
- **Security** : Mises à jour de sécurité, politiques, audits CI
- **Deprecated** : Éléments annoncés obsolètes
- **Removed** : Éléments retirés
