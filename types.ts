
export interface Luminaire {
  id: string;
  quantite: number;
  numero_type: string;
  type_luminaire: string;
  situation_pose: string;
  type_support: string;
  type_source_lumineuse: string;
  affectation_luminaire: string;
  moyen_levage: string;
}

export interface Local {
  id: string;
  nom: string;
  luminaires: Luminaire[];
}

export interface Etage {
  id: string;
  nom: string;
  locaux: Local[];
}

export interface Ecole {
  id: string;
  nom: string;
  etages: Etage[];
}

export interface RootData {
  ecoles: Ecole[];
}

export type EntityType = 'ecole' | 'etage' | 'local' | 'luminaire';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
}
