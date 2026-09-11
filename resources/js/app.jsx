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

import { AuthProvider } from './hooks/useAuth.tsx';
import { PartnerProvider } from './context/PartnerContext.tsx';
import { ThemeProvider } from './components/theme/ThemeProvider.tsx';
import AppLayout from './components/layout/AppLayout.tsx';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <PartnerProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            
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
    root.render(<App />);
}
