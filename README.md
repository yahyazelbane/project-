# CampusFlow — Gestion des étudiants

Application React + Vite avec authentification sécurisée par Supabase, tableau de bord, gestion des étudiants, recherche, filtre et export CSV.

## 1. Installation

```bash
npm install
npm run dev
```

## 2. Configurer Supabase

1. Créez un projet sur https://supabase.com.
2. Dans **Project Settings → API**, copiez l'URL du projet et la clé publique `anon` / `publishable`.
3. Copiez `.env.example` vers `.env.local`.
4. Remplissez les variables :

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

5. Dans Supabase, ouvrez **SQL Editor** et exécutez le contenu de `supabase/schema.sql`.
6. Dans **Authentication → Users**, créez votre utilisateur administrateur avec l'adresse e-mail et le mot de passe de votre choix.
7. Désactivez l'inscription publique dans Authentication si vous souhaitez que seul l'administrateur que vous avez créé puisse se connecter.

## 3. Déploiement Vercel

- Importez le dépôt GitHub dans Vercel.
- Dans **Project → Settings → Environment Variables**, ajoutez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
- Redéployez le projet après avoir ajouté les variables.

## Sécurité

- Aucun mot de passe n'est codé en dur dans le frontend.
- L'authentification est gérée par Supabase Auth.
- La clé `service_role` ne doit JAMAIS être ajoutée à Vite, à GitHub ou à une variable `VITE_`.
- Le SQL active RLS et limite les opérations aux utilisateurs authentifiés.
- Pour un vrai système multi-rôle, ajoutez une table de rôles et des politiques RLS basées sur ces rôles.

## Fonctionnalités

- Connexion / déconnexion administrateur
- Tableau de bord avec statistiques
- Ajout, modification et suppression d'étudiants
- Recherche par nom, prénom, e-mail et filière
- Filtre par niveau
- Export CSV
- Interface responsive pour mobile et ordinateur
