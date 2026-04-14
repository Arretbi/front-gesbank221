import { useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TypeBadge } from './TypeBadge';
import { OperationDialog } from './OperationDialog';
import { CompteDetailSheet } from './CompteDetailSheet';
import { banqueApi } from '@/api/banque';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import type { Compte, OperationType } from '@/types/compte';

type TabValue = 'tous' | 'courant' | 'epargne' | 'bloque';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'courant', label: 'Courant' },
  { value: 'epargne', label: 'Épargne' },
  { value: 'bloque', label: 'Bloqué' },
];

interface ComptesTableProps {
  comptes: Compte[];
  loading: boolean;
  onRefresh: () => void;
}

export function ComptesTable({ comptes, loading, onRefresh }: ComptesTableProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('tous');
  const [selectedCompte, setSelectedCompte] = useState<Compte | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [operationType, setOperationType] = useState<OperationType>('deposer');
  const [operationOpen, setOperationOpen] = useState(false);
  const [operationCompte, setOperationCompte] = useState<Compte | null>(null);
  const [deleteCompte, setDeleteCompte] = useState<Compte | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered =
    activeTab === 'tous' ? comptes : comptes.filter((c) => c.type === activeTab);

  const openOperation = (e: React.MouseEvent, compte: Compte, type: OperationType) => {
    e.stopPropagation();
    setOperationCompte(compte);
    setOperationType(type);
    setOperationOpen(true);
  };

  const openDetail = (compte: Compte) => {
    setSelectedCompte(compte);
    setDetailOpen(true);
  };

  const confirmDelete = (e: React.MouseEvent, compte: Compte) => {
    e.stopPropagation();
    setDeleteCompte(compte);
  };

  const handleDelete = async () => {
    if (!deleteCompte) return;
    setDeleting(true);
    try {
      await banqueApi.supprimer(deleteCompte.numero);
      toast.success(`Compte ${deleteCompte.numero} supprimé`);
      setDeleteCompte(null);
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="bg-muted/40 border border-border/60">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
                {tab.value !== 'tous' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({comptes.filter((c) => c.type === tab.value).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="rounded-xl border border-border/60 overflow-hidden">
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-medium w-32">
                    Numéro
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                    Titulaire
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-medium w-28">
                    Type
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-medium text-right w-36">
                    Solde
                  </TableHead>
                  <TableHead className="text-xs uppercase tracking-widest text-muted-foreground font-medium w-36">
                    Détail
                  </TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground text-sm"
                    >
                      Aucun compte trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((compte) => (
                    <TableRow
                      key={compte.numero}
                      className="border-border/40 cursor-pointer hover:bg-muted/30 transition-colors group"
                      onClick={() => openDetail(compte)}
                    >
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {compte.numero}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {compte.titulaire}
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={compte.type} bloque={compte.est_bloque} />
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold text-sm tabular-nums ${
                          compte.solde < 0 ? 'text-destructive' : 'text-foreground'
                        }`}
                      >
                        {formatCurrency(compte.solde)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {compte.type === 'courant' && compte.decouvert !== undefined && (
                          <span>Décvt: {formatCurrency(compte.decouvert)}</span>
                        )}
                        {compte.type === 'epargne' && compte.taux !== undefined && (
                          <span>Taux: {compte.taux}%</span>
                        )}
                        {compte.type === 'bloque' && compte.est_bloque !== undefined && (
                           <span className={compte.est_bloque ? 'text-bank-bloque' : 'text-bank-epargne'}>
                            {compte.est_bloque ? '🔒 Bloqué' : '✓ Débloqué'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {compte.type !== 'bloque' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-bank-epargne hover:text-bank-epargne hover:bg-bank-epargne/10"
                                onClick={(e) => openOperation(e, compte, 'deposer')}
                                title="Déposer"
                              >
                                <ArrowDownCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                onClick={(e) => openOperation(e, compte, 'retirer')}
                                title="Retirer"
                              >
                                <ArrowUpCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => confirmDelete(e, compte)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      {/* Operation Dialog */}
      <OperationDialog
        open={operationOpen}
        onOpenChange={setOperationOpen}
        compte={operationCompte}
        type={operationType}
        onSuccess={onRefresh}
      />

      {/* Detail Sheet */}
      <CompteDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        compte={selectedCompte}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteCompte}
        onOpenChange={(open) => {
          if (!open) setDeleteCompte(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte{' '}
              <span className="font-mono text-foreground">
                {deleteCompte?.numero}
              </span>{' '}
              de <strong>{deleteCompte?.titulaire}</strong> sera définitivement
              supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { void handleDelete(); }}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
