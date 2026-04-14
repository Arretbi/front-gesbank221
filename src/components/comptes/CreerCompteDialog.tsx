import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { banqueApi } from '@/api/banque';
import { toast } from 'sonner';
import type { TypeCompte } from '@/types/compte';

interface CreerCompteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TYPE_OPTIONS: { value: TypeCompte; label: string }[] = [
  { value: 'courant', label: 'Compte courant' },
  { value: 'epargne', label: 'Compte épargne' },
  { value: 'bloque', label: 'Compte bloqué' },
];

export function CreerCompteDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreerCompteDialogProps) {
  const [type, setType] = useState<TypeCompte>('courant');
  const [numero, setNumero] = useState('');
  const [titulaire, setTitulaire] = useState('');
  const [solde, setSolde] = useState('0');
  const [decouvert, setDecouvert] = useState('500');
  const [taux, setTaux] = useState('2.5');
  const [dateCreation, setDateCreation] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setType('courant');
    setNumero('');
    setTitulaire('');
    setSolde('0');
    setDecouvert('500');
    setTaux('2.5');
    setDateCreation('');
  };

  const handleOpenChange = (val: boolean) => {
    if (!loading) {
      if (!val) reset();
      onOpenChange(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'courant') {
        await banqueApi.creerCourant({
          type: 'courant',
          numero,
          titulaire,
          solde: parseFloat(solde) || 0,
          decouvert: parseFloat(decouvert),
        });
      } else if (type === 'epargne') {
        await banqueApi.creerEpargne({
          type: 'epargne',
          numero,
          titulaire,
          solde: parseFloat(solde) || 0,
          taux: parseFloat(taux),
        });
      } else {
        const dt = new Date(dateCreation);
        const formatted = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
        await banqueApi.creerBloque({
          type: 'bloque',
          numero,
          titulaire,
          solde: parseFloat(solde) || 0,
          date_creation: formatted,
        });
      }

      toast.success(`Compte ${numero} créé avec succès`);
      handleOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Nouveau compte
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations du nouveau compte bancaire.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
        >
          <div className="space-y-4 py-2">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de compte</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as TypeCompte)}
              >
                <SelectTrigger
                  id="type"
                  className="bg-muted/40 border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Numéro + Titulaire */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro de compte</Label>
                <Input
                  id="numero"
                  placeholder="123456"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="bg-muted/40 border-border font-mono"
                  required
                  pattern="\d{6,20}"
                  title="6 à 20 chiffres"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="solde-init">Solde initial (€)</Label>
                <Input
                  id="solde-init"
                  type="number"
                  min="0"
                  step="0.01"
                  value={solde}
                  onChange={(e) => setSolde(e.target.value)}
                  className="bg-muted/40 border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulaire">Titulaire</Label>
              <Input
                id="titulaire"
                placeholder="Jean Dupont"
                value={titulaire}
                onChange={(e) => setTitulaire(e.target.value)}
                className="bg-muted/40 border-border"
                required
              />
            </div>

            {/* Conditional fields */}
            {type === 'courant' && (
              <div className="space-y-2">
                <Label htmlFor="decouvert">Découvert autorisé (€)</Label>
                <Input
                  id="decouvert"
                  type="number"
                  min="0"
                  step="0.01"
                  value={decouvert}
                  onChange={(e) => setDecouvert(e.target.value)}
                  className="bg-muted/40 border-border"
                  required
                />
              </div>
            )}

            {type === 'epargne' && (
              <div className="space-y-2">
                <Label htmlFor="taux">Taux d'intérêt annuel (%)</Label>
                <Input
                  id="taux"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taux}
                  onChange={(e) => setTaux(e.target.value)}
                  className="bg-muted/40 border-border"
                  required
                />
              </div>
            )}

            {type === 'bloque' && (
              <div className="space-y-2">
                <Label htmlFor="date-creation">Date de création</Label>
                <Input
                  id="date-creation"
                  type="datetime-local"
                  value={dateCreation}
                  onChange={(e) => setDateCreation(e.target.value)}
                  className="bg-muted/40 border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Le compte sera bloqué 30 jours à partir de cette date.
                </p>
              </div>
            )}
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Création…' : 'Créer le compte'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
