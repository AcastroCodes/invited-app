import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Index from './pages/Index.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Users from './pages/Users.tsx';
import Partners from './pages/Partners.tsx';
import EventList from './pages/events/EventList.tsx';
import EventForm from './pages/events/EventForm.tsx';
import EventConfig from './pages/events/EventConfig.tsx';
import GuestList from './pages/events/GuestList.tsx';
import TableList from './pages/events/TableList.tsx';
import InvitationDesigner from './pages/events/InvitationDesigner.tsx';
import InvitationViewer from './pages/events/InvitationViewer.tsx';

import { AuthProvider } from './hooks/useAuth.tsx';
import { PartnerProvider } from './context/PartnerContext.tsx';
import { ThemeProvider } from './components/theme/ThemeProvider.tsx';
import AppLayout from './components/layout/AppLayout.tsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', fontFamily: 'monospace' }}>
          <h2>Something went wrong in React:</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>{this.state.error && this.state.error.toString()}</summary>
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <PartnerProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/v/:id" element={<InvitationViewer />} />
                            
                            <Route element={<AppLayout />}>
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/users" element={<Users />} />
                                <Route path="/partners" element={<Partners />} />
                                <Route path="/events" element={<EventList />} />
                                <Route path="/events/new" element={<EventForm />} />
                                <Route path="/events/:id/edit" element={<EventForm />} />
                                <Route path="/events/:id/config" element={<EventConfig />} />
                                <Route path="/events/:id/invitations/:invitationId/designer" element={<InvitationDesigner />} />
                                <Route path="/events/:id/guests" element={<GuestList />} />
                                <Route path="/events/:id/tables" element={<TableList />} />
                            </Route>
                            
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </PartnerProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
}
