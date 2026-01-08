
![Sporty Logo](https://raw.githubusercontent.com/slouowzee/hackaton-2026/main/assets/images/Sporty-full.png)

# Sporty - "Tout Angers Bouge"

Application mobile développée pour le Hackathon 2026 du BTS SIO de Chevrollier. L'objectif est d'avoir une palteforme sur laquelle nous pouvons facilement trouver des installations sportive ainsi que les places de stationnement les plus proches de celles-ci.

## Fonctionnalités

*   **Carte interactive** : Visualisation des terrains de sport et des zones de stationnement (parkings voitures, arceaux vélos).
*   **Gestion des favoris** : Sauvegarde des installations sportives et association d'un parking préférentiel pour chaque lieu afin que vous retrouviez simplement vos terrains préféré.
*   **Widget Météo** : Affichage de la température et recommandations de mobilité en temps réel.

## Stack Technique

*   **Frontend** : [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
*   **Langage** : [TypeScript](https://www.typescriptlang.org/)
*   **Interface Utilisateur** : [Tamagui](https://tamagui.dev/)
*   **Backend** : [Supabase](https://supabase.com/)
*   **Cartographie** : [React Native Maps](https://github.com/react-native-maps/react-native-maps)

## Installation et Démarrage

### Prérequis
*   [Node.js (LTS)](https://nodejs.org/)
*   [Compte Expo](https://expo.dev/)
*   [Projet Supabase](https://supabase.com/)

### Instructions

1.  **Cloner le dépôt**
    ```bash
    git clone https://github.com/votre-user/hackaton-2026.git sporty
    cd sporty
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configuration des variables d'environnement**
    Dupliquer le fichier d'exemple et le renommer :
    ```bash
    cp .env.example .env
    ```
    Renseigner les clés d'API Supabase dans le fichier `.env` :
    ```env
    EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
    EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique
    ```

4.  **Initialisation de la base de données**
    Exécuter le script SQL situé dans le dossier `migrations/` via l'éditeur SQL de votre dashboard Supabase.

5.  **Lancement de l'application**
    ```bash
    npx expo start
    ```

## Sources de Données

Les données proviennent des portails OpenData officiels :
*   [Angers Loire Métropole - Installations sportives](https://angersloiremetropole.opendatasoft.com/explore/dataset/angers_stadium/information/)
*   [Angers Loire Métropole - Parkings Vélo](https://angersloiremetropole.opendatasoft.com/explore/dataset/parking-velo-angers/information/)
*   [Angers Loire Métropole - Stationnement](https://angersloiremetropole.opendatasoft.com/explore/dataset/angers_stationnement/information/)
*   [Open-Meteo API](https://open-meteo.com/)

---

Fait avec ❤️ par [@slouowzee](https://github.com/slouowzee)
