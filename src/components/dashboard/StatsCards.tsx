import { Wallet, TrendingUp, CreditCard, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import type { Compte } from '@/types/compte';

interface StatsCardsProps {
  comptes: Compte[];
  loading: boolean;
}

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}

function StatCard({ card }: { card: StatCard }) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {card.label}
            </p>
            <p className="text-2xl font-semibold text-foreground leading-tight">
              {card.value}
            </p>
            {card.sub && (
              <p className="text-xs text-muted-foreground">{card.sub}</p>
            )}
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: card.accent + '22', color: card.accent }}
          >
            <card.icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ comptes, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalBalance = comptes.reduce((s, c) => s + c.solde, 0);
  const courants = comptes.filter((c) => c.type === 'courant').length;
  const epargnes = comptes.filter((c) => c.type === 'epargne').length;
  const bloques = comptes.filter((c) => c.type === 'bloque').length;

  const cards: StatCard[] = [
    {
      label: 'Total comptes',
      value: comptes.length,
      sub: `${courants} courant · ${epargnes} épargne · ${bloques} bloqué`,
      icon: Wallet,
      accent: '#F97316',
    },
    {
      label: 'Solde total',
      value: formatCurrency(totalBalance),
      sub: 'Tous comptes confondus',
      icon: TrendingUp,
      accent: '#D97706',
    },
    {
      label: 'Comptes épargne',
      value: epargnes,
      sub: 'Avec intérêts applicables',
      icon: CreditCard,
      accent: '#10B981',
    },
    {
      label: 'Comptes bloqués',
      value: bloques,
      sub: bloques > 0 ? 'Vérifier les dates de déblocage' : 'Aucun compte bloqué',
      icon: Lock,
      accent: '#DC2626',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} card={card} />
      ))}
    </div>
  );
}
