import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TypeBadge } from './TypeBadge';
import { banqueApi } from '@/api/banque';
import { formatCurrency, formatDate, formatTaux } from '@/lib/formatters';
import { toast } from 'sonner';
import { Pencil, Check, X } from 'lucide-react';
import type { Compte } from '@/types/compte';

interface CompteDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compte: Compte | null;
  onSuccess: () => void;
}

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </p>
      <div className="text-sm text-foreground font-medium">{value}</div>
    </div>
  );
}

export function CompteDetailSheet({
  open,
  onOpenChange,
  compte,
  onSuccess,
}: CompteDetailSheetProps) {
  const [editing, setEditing] = useState(false);
  const [titulaire, setTitulaire] = useState('');
  const [decouvert, setDecouvert] = useState('');
  const [taux, setTaux] = useState('');
  const [loading, setLoading] = useState(false);

  const startEdit = () => {
    if (!compte) return;
    setTitulaire(compte.titulaire);
    setDecouvert(String(compte.decouvert ?? ''));
    setTaux(String(compte.taux ?? ''));
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    if (!compte) return;
    setLoading(true);
    try {
      const payload: Record<string, string | number> = {};
      if (titulaire && titulaire !== compte.titulaire) payload.titulaire = titulaire;
      if (compte.type === 'courant' && decouvert !== '' && parseFloat(decouvert) !== compte.decouvert) {
        payload.decouvert = parseFloat(decouvert);
      }
      if (compte.type === 'epargne' && taux !== '' && parseFloat(taux) !== compte.taux) {
        payload.taux = parseFloat(taux);
      }
      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }
      await banqueApi.modifier(compte.numero, payload);
      toast.success('Compte mis à jour');
      setEditing(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur modification');
    } finally {
      setLoading(false);
    }
  };

  if (!compte) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">
              {compte.titulaire}
            </SheetTitle>
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEdit}
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <SheetDescription className="font-mono text-xs">
            #{compte.numero}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Balance highlight */}
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Solde
            </p>
            <p
              className={`text-3xl font-bold ${compte.solde < 0 ? 'text-destructive' : 'text-foreground'}`}
            >
              {formatCurrency(compte.solde)}
            </p>
          </div>

          <Separator className="opacity-30" />

          {/* Info fields */}
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-titulaire">Titulaire</Label>
                <Input
                  id="edit-titulaire"
                  value={titulaire}
                  onChange={(e) => setTitulaire(e.target.value)}
                  className="bg-muted/40 border-border"
                />
              </div>
              {compte.type === 'courant' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-decouvert">Découvert autorisé (€)</Label>
                  <Input
                    id="edit-decouvert"
                    type="number"
                    min="0"
                    step="0.01"
                    value={decouvert}
                    onChange={(e) => setDecouvert(e.target.value)}
                    className="bg-muted/40 border-border"
                  />
                </div>
              )}
              {compte.type === 'epargne' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-taux">Taux d'intérêt (%)</Label>
                  <Input
                    id="edit-taux"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taux}
                    onChange={(e) => setTaux(e.target.value)}
                    className="bg-muted/40 border-border"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="flex-1"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={() => { void handleSave(); }}
                  disabled={loading}
                  className="flex-1"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  {loading ? 'Sauvegarde…' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FieldRow label="Type" value={<TypeBadge type={compte.type} bloque={compte.est_bloque} />} />
              <FieldRow label="Numéro" value={<span className="font-mono">{compte.numero}</span>} />
              <FieldRow label="Titulaire" value={compte.titulaire} />

              {compte.type === 'courant' && compte.decouvert !== undefined && (
                <FieldRow
                  label="Découvert autorisé"
                  value={formatCurrency(compte.decouvert)}
                />
              )}
              {compte.type === 'epargne' && compte.taux !== undefined && (
                <FieldRow
                  label="Taux d'intérêt"
                  value={formatTaux(compte.taux)}
                />
              )}
              {compte.type === 'bloque' && (
                <>
                  {compte.date_creation && (
                    <FieldRow
                      label="Date de création"
                      value={formatDate(compte.date_creation)}
                    />
                  )}
                  {compte.date_deblocage && (
                    <FieldRow
                      label="Date de déblocage"
                      value={formatDate(compte.date_deblocage)}
                    />
                  )}
                  <FieldRow
                    label="Statut"
                    value={
                      compte.est_bloque ? (
                        <span className="text-bank-bloque text-sm">Bloqué</span>
                      ) : (
                        <span className="text-bank-epargne text-sm">Débloqué</span>
                      )
                    }
                  />
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
