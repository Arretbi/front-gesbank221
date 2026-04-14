import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Dashboard } from '@/pages/Dashboard';

function App() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Dashboard />
        </SidebarInset>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default App;
