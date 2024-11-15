export type Category = {
  id: string;
  name: string;
  description?: string;
}

export const PREDEFINED_CATEGORIES: Category[] = [
  { 
    id: 'actualites', 
    name: 'Actualités', 
    description: 'Les dernières nouvelles du football' 
  },
  { 
    id: 'tactique', 
    name: 'Tactique', 
    description: 'Analyses tactiques et stratégies de jeu' 
  },
  { 
    id: 'equipe-de-france', 
    name: 'Équipe de France', 
    description: 'Tout sur les Bleus' 
  },
  { 
    id: 'ligue1', 
    name: 'Ligue 1', 
    description: 'Championnat de France de football' 
  },
  { 
    id: 'champions-league', 
    name: 'Ligue des Champions', 
    description: 'Compétition européenne des clubs' 
  },
  { 
    id: 'transferts', 
    name: 'Transferts', 
    description: 'Mercato et transferts des joueurs' 
  },
  { 
    id: 'entrainement', 
    name: 'Entraînement', 
    description: 'Conseils et techniques d\'entraînement' 
  },
  { 
    id: 'jeunes', 
    name: 'Formation', 
    description: 'Football des jeunes et formation' 
  },
  { 
    id: 'international', 
    name: 'International', 
    description: 'Football international et compétitions' 
  },
  { 
    id: 'interviews', 
    name: 'Interviews', 
    description: 'Entretiens avec les acteurs du football' 
  },
  { 
    id: 'histoire', 
    name: 'Histoire', 
    description: 'Histoire et légendes du football' 
  },
  { 
    id: 'amateur', 
    name: 'Football Amateur', 
    description: 'Actualités du football amateur' 
  }
]; 