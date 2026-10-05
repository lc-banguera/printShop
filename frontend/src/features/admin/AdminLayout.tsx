import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shared/ui/sidebar';
import { Topbar } from '@/shared/ui/topbar';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  return (
    <div className="admin-shell flex h-screen w-full overflow-hidden bg-[var(--background)]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-[var(--background)]">
          <Outlet context={{ sidebarCollapsed }} />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
