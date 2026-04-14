import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { banqueApi } from '@/api/banque';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import type { Compte, OperationType } from '@/types/compte';

interface OperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compte: Compte | null;
  type: OperationType;
  onSuccess: () => void;
}

export function OperationDialog({
  open,
  onOpenChange,
  compte,
  type,
  onSuccess,
}: OperationDialogProps) {
  const [montant, setMontant] = useState('');
  const [loading, setLoading] = useState(false);

  const isDeposit = type === 'deposer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compte) return;

    const amount = parseFloat(montant);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Montant invalide');
      return;
    }

    setLoading(true);
    try {
      const fn = isDeposit ? banqueApi.deposer : banqueApi.retirer;
      const updated = await fn(compte.numero, amount);
      toast.success(
        isDeposit
          ? `Dépôt de ${formatCurrency(amount)} effectué. Nouveau solde : ${formatCurrency(updated.solde)}`
          : `Retrait de ${formatCurrency(amount)} effectué. Nouveau solde : ${formatCurrency(updated.solde)}`
      );
      setMontant('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur opération');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (!loading) {
      setMontant('');
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDeposit ? (
              <ArrowDownCircle className="h-5 w-5 text-bank-epargne" />
            ) : (
              <ArrowUpCircle className="h-5 w-5 text-destructive" />
            )}
            {isDeposit ? 'Déposer des fonds' : 'Retirer des fonds'}
          </DialogTitle>
          <DialogDescription>
            Compte{' '}
            <span className="font-mono text-foreground">
              {compte?.numero}
            </span>{' '}
            — {compte?.titulaire}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/60 px-4 py-3 space-y-0.5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Solde actuel
              </p>
              <p className="text-xl font-semibold text-foreground">
                {compte ? formatCurrency(compte.solde) : '—'}
              </p>
              {compte?.type === 'courant' && compte.decouvert !== undefined && (
                <p className="text-xs text-muted-foreground">
                  Découvert autorisé : {formatCurrency(compte.decouvert)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">Montant (€)</Label>
              <Input
                id="montant"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                className="bg-muted/40 border-border"
                required
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !montant}
              variant={isDeposit ? 'default' : 'destructive'}
            >
              {loading
                ? 'En cours…'
                : isDeposit
                ? 'Déposer'
                : 'Retirer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
