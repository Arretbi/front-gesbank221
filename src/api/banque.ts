import type {
  Compte,
  TypeCompte,
  CompteCreateCourant,
  CompteCreateEpargne,
  CompteCreateBloque,
  CompteUpdate,
  InteretsResponse,
} from '@/types/compte';

const BASE_URL = 'http://localhost:8000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const err = await res.json() as { detail?: string };
      if (err.detail) message = err.detail;
    } catch {
      // ignore json parse errors
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export const banqueApi = {
  getComptes: () =>
    apiFetch<Compte[]>('/comptes'),

  getComptesByType: (type: TypeCompte) =>
    apiFetch<Compte[]>(`/comptes/type/${type}`),

  getCompte: (numero: string) =>
    apiFetch<Compte>(`/comptes/${numero}`),

  creerCourant: (payload: CompteCreateCourant) =>
    apiFetch<Compte>('/comptes/courant', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  creerEpargne: (payload: CompteCreateEpargne) =>
    apiFetch<Compte>('/comptes/epargne', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  creerBloque: (payload: CompteCreateBloque) =>
    apiFetch<Compte>('/comptes/bloque', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deposer: (numero: string, montant: number) =>
    apiFetch<Compte>(`/comptes/${numero}/deposer`, {
      method: 'POST',
      body: JSON.stringify({ montant }),
    }),

  retirer: (numero: string, montant: number) =>
    apiFetch<Compte>(`/comptes/${numero}/retirer`, {
      method: 'POST',
      body: JSON.stringify({ montant }),
    }),

  appliquerInterets: () =>
    apiFetch<InteretsResponse>('/comptes/interets', { method: 'POST' }),

  modifier: (numero: string, payload: CompteUpdate) =>
    apiFetch<Compte>(`/comptes/${numero}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  supprimer: (numero: string) =>
    apiFetch<{ message: string }>(`/comptes/${numero}`, { method: 'DELETE' }),
};
