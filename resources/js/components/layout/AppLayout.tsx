import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isDesignerRoute = location.pathname.includes('/designer/');

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isDesignerRoute} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className={`flex-1 flex flex-col ${isDesignerRoute ? 'p-0 overflow-hidden' : 'p-4 md:p-6 lg:p-8 overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
