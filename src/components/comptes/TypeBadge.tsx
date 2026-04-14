import { Badge } from '@/components/ui/badge';
import { labelType } from '@/lib/formatters';
import type { TypeCompte } from '@/types/compte';

interface TypeBadgeProps {
  type: TypeCompte;
  bloque?: boolean;
}

export function TypeBadge({ type, bloque }: TypeBadgeProps) {
  const badgeClass =
    type === 'courant'
      ? 'badge-courant'
      : type === 'epargne'
      ? 'badge-epargne'
      : 'badge-bloque';

  return (
    <div className="flex items-center gap-1.5">
      <Badge
        variant="outline"
        className={`text-xs font-medium border ${badgeClass}`}
      >
        {labelType(type)}
      </Badge>
      {bloque && (
        <Badge variant="outline" className="text-xs badge-bloque border">
          Bloqué
        </Badge>
      )}
    </div>
  );
}
