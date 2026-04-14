import { useState } from 'react';
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ComptesTable } from '@/components/comptes/ComptesTable';
import { CreerCompteDialog } from '@/components/comptes/CreerCompteDialog';
import { useComptes } from '@/hooks/useComptes';
import { banqueApi } from '@/api/banque';
import { toast } from 'sonner';

export function Dashboard() {
  const { comptes, loading, error, refresh } = useComptes();
  const [createOpen, setCreateOpen] = useState(false);
  const [applyingInterets, setApplyingInterets] = useState(false);

  const handleAppliquerInterets = async () => {
    setApplyingInterets(true);
    try {
      const result = await banqueApi.appliquerInterets();
      toast.success(
        `Intérêts appliqués : +${result.total_gains.toFixed(2)} € sur ${result.comptes_mis_a_jour} compte(s)`,
        { duration: 5000 }
      );
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur application des intérêts');
    } finally {
      setApplyingInterets(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-10 shadow-xs">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="h-5 opacity-30" />
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-foreground leading-none">
            Tableau de bord
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestion des comptes bancaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { void handleAppliquerInterets(); }}
            disabled={applyingInterets}
            className="text-muted-foreground hover:text-foreground h-8 text-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            {applyingInterets ? 'Application…' : 'Appliquer intérêts'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { void refresh(); }}
            disabled={loading}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Rafraîchir"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-8 text-xs bg-primary hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouveau compte
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 space-y-5">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            ⚠ Erreur de connexion à l'API : {error}. Assurez-vous que le backend est démarré sur{' '}
            <span className="font-mono">http://localhost:8000</span>.
          </div>
        )}

        <StatsCards comptes={comptes} loading={loading} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Comptes ({comptes.length})
            </h2>
          </div>
          <ComptesTable
            comptes={comptes}
            loading={loading}
            onRefresh={refresh}
          />
        </div>
      </main>

      <CreerCompteDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => { void refresh(); }}
      />
    </div>
  );
}
