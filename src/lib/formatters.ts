export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateOnly(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTaux(taux: number): string {
  return `${taux.toFixed(2)} %`;
}

export function formatDecouvert(decouvert: number): string {
  return formatCurrency(decouvert);
}

export function labelType(type: string): string {
  switch (type) {
    case 'courant': return 'Courant';
    case 'epargne': return 'Épargne';
    case 'bloque': return 'Bloqué';
    default: return type;
  }
}
