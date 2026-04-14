export type TypeCompte = 'courant' | 'epargne' | 'bloque';
export type OperationType = 'deposer' | 'retirer';

export interface Compte {
  numero: string;
  titulaire: string;
  solde: number;
  type: TypeCompte;
  decouvert?: number;
  taux?: number;
  date_creation?: string;
  date_deblocage?: string;
  est_bloque?: boolean;
}

export interface CompteCreateCourant {
  numero: string;
  titulaire: string;
  solde?: number;
  type: 'courant';
  decouvert: number;
}

export interface CompteCreateEpargne {
  numero: string;
  titulaire: string;
  solde?: number;
  type: 'epargne';
  taux: number;
}

export interface CompteCreateBloque {
  numero: string;
  titulaire: string;
  solde?: number;
  type: 'bloque';
  date_creation: string;
}

export type CompteCreate = CompteCreateCourant | CompteCreateEpargne | CompteCreateBloque;

export interface CompteUpdate {
  titulaire?: string;
  decouvert?: number;
  taux?: number;
}

export interface DepotRetraitPayload {
  montant: number;
}

export interface InteretsResponse {
  message: string;
  total_gains: number;
  comptes_mis_a_jour: number;
}

export interface ApiError {
  detail: string;
}
