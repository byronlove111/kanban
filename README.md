# Kanban Simple

Kanban avec tableaux imbriqués. Cliquez sur une carte pour ouvrir son sous-tableau.

## Installation

```bash
npm install
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog dropdown-menu
npm run dev
```

## Fonctionnalités

- ✅ Drag & drop (comme Trello)
- ✅ Tableaux imbriqués infinis
- ✅ Export/Import JSON
- ✅ localStorage automatique
- ✅ Design minimaliste

## Stack

- Next.js 14
- shadcn/ui
- Zustand
- @dnd-kit
- Tailwind CSS

## Utilisation

1. **Créer une carte** : Cliquez "Ajouter" dans une colonne
2. **Ouvrir un sous-tableau** : Cliquez sur n'importe quelle carte
3. **Revenir** : Bouton flèche en haut à gauche
4. **Drag & drop** : Glissez-déposez les cartes
5. **Sauvegarder** : Menu (⋮) > Exporter > fichier JSON
6. **Restaurer** : Menu > Importer > sélectionnez votre JSON

## Données

- Sauvegarde automatique dans localStorage
- Export manuel en JSON pour backup
- Import pour restaurer ou partager

## License

MIT
