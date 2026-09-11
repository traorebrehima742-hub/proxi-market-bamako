# Proxi Market - Bamako (Mali)

Application moderne de commerce de proximité et mise en relation avec les artisans de quartier à Bamako.

---

## 🚀 Installation & Démarrage en local

### 1. Prérequis
- Node.js version 18 ou supérieure
- Gestionnaire de paquets : `npm` ou `yarn` ou `pnpm`

### 2. Installation des dépendances
Ouvrez un terminal dans ce dossier et lancez :
```bash
npm install
```

### 3. Lancement en mode développement
```bash
npm run dev
```
L'application est immédiatement accessible sur [http://localhost:3000](http://localhost:3000).

---

## 📦 Sortir du mode Démo & Mise en Production

### 1. Variables d'environnement
Copiez le fichier d'exemple :
```bash
cp .env.example .env
```
Renseignez vos clés d'API (Passerelle SMS/OTP, Wave Mali, Orange Money API, Firebase ou Cloud SQL selon vos besoins).

### 2. Compilation pour la production
```bash
npm run build
```
Les fichiers statiques optimisés sont générés dans le dossier `dist/`.

### 3. Déploiement
Ce projet peut être déployé en 1 clic sur :
- **Vercel** / **Netlify** / **Cloudflare Pages** : connectez votre dossier ou dépôt Git.
- **Google Cloud Run** / **Docker** : un conteneur Node.js standard.
- **Serveur VPS / Nginx** : servez simplement le dossier `dist/`.

---

## 📁 Structure du Projet

- `src/`
  - `components/` : Modales (Devis, Commandes, Auth 2FA, Chat, Assistant IA, Localisation, Détail produit).
  - `views/` : Vues principales (Accueil, Découvrir, Messages & Devis, Favoris, Profil & Paramètres).
  - `lib/` : Dictionnaires de traductions bilingues (Français / Anglais), gestion du thème sombre/clair.
  - `data/` : Données locales des marchés de Bamako (Marché Rose, Dibida, Médine, etc.), commerçants et artisans.
  - `types.ts` : Types TypeScript stricts.
- `public/` : Icônes PWA, manifeste web pour installation mobile (Android / iOS), assets.
- `vite.config.ts` : Configuration de compilation Vite et Tailwind CSS v4.
