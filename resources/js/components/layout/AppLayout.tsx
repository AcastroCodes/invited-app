import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSidebarCollapsed, setUserSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isDesignerRoute = location.pathname.includes('/designer');

  // Store previous sidebar state in memory before entering designer
  const prevSidebarStateRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (isDesignerRoute) {
      if (prevSidebarStateRef.current === null) {
        prevSidebarStateRef.current = userSidebarCollapsed;
      }
    } else {
      if (prevSidebarStateRef.current !== null) {
        setUserSidebarCollapsed(prevSidebarStateRef.current);
        prevSidebarStateRef.current = null;
      }
    }
  }, [isDesignerRoute]);

  const effectiveCollapsed = isDesignerRoute ? true : userSidebarCollapsed;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={effectiveCollapsed}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        {!isDesignerRoute && <Header onMenuClick={() => setSidebarOpen(true)} />}
        <main className={`flex-1 flex flex-col ${isDesignerRoute ? 'p-0 overflow-hidden' : 'p-4 md:p-6 lg:p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
