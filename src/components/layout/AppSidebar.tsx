import { LayoutDashboard, Landmark, TrendingUp } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

const NAV_ITEMS = [
  { label: 'Tableau de bord', icon: LayoutDashboard, href: '#' },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
            <Landmark className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight group-data-[collapsible=icon]:hidden">
            BanqueAPI
          </span>
        </div>
      </SidebarHeader>

      <Separator className="opacity-30" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton isActive tooltip={item.label}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-primary" />
          <span>API v1.0.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
