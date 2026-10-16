import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Persisted user sidebar preference (default: normal / expanded)
  const [userSidebarCollapsed, setUserSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const location = useLocation();

  const isDesignerRoute = location.pathname.includes('/designer');
  const isEventConfigRoute = /\/events\/[^/]+\/config(\/.*)?$/.test(location.pathname);
  const isAutoCollapsedRoute = isDesignerRoute || isEventConfigRoute;

  // Store previous sidebar state in memory before entering auto-collapsed route
  const prevSidebarStateRef = useRef<boolean | null>(null);

  // Allow temporary manual toggle while inside auto-collapsed route without altering pre-route memory
  const [inRouteOverride, setInRouteOverride] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAutoCollapsedRoute) {
      if (prevSidebarStateRef.current === null) {
        prevSidebarStateRef.current = userSidebarCollapsed;
      }
      setInRouteOverride(null);
    } else {
      if (prevSidebarStateRef.current !== null) {
        setUserSidebarCollapsed(prevSidebarStateRef.current);
        try {
          localStorage.setItem('sidebar_collapsed', String(prevSidebarStateRef.current));
        } catch {}
        prevSidebarStateRef.current = null;
      }
      setInRouteOverride(null);
    }
  }, [isAutoCollapsedRoute]);

  const toggleSidebarCollapse = () => {
    if (isAutoCollapsedRoute) {
      const current = inRouteOverride !== null ? inRouteOverride : true;
      setInRouteOverride(!current);
    } else {
      setUserSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  const effectiveCollapsed = isAutoCollapsedRoute
    ? (inRouteOverride !== null ? inRouteOverride : true)
    : userSidebarCollapsed;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={effectiveCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {!isDesignerRoute && (
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onToggleCollapse={toggleSidebarCollapse}
            isCollapsed={effectiveCollapsed}
          />
        )}
        <main className={`flex-1 flex flex-col min-h-0 ${isDesignerRoute ? 'p-0 overflow-hidden' : 'p-4 md:p-6 lg:p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
