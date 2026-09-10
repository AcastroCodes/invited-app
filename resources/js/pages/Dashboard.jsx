import React, { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import { LogOut, LayoutDashboard, Users, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.tsx';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Invited.</h1>
                </div>
                <div className="flex-1 py-6 px-4 space-y-2">
                    <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link to="/dashboard/partners" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Users className="w-5 h-5 mr-3 text-slate-400" />
                        Partners
                    </Link>
                    <Link to="/dashboard/users" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Users className="w-5 h-5 mr-3 text-slate-400" />
                        Usuarios
                    </Link>
                    <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                        Eventos
                    </Link>
                    <Link to="/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                        <Settings className="w-5 h-5 mr-3 text-slate-400" />
                        Configuración
                    </Link>
                </div>
                <div className="p-4 border-t border-slate-200">
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="text-xl font-semibold text-slate-800">Panel de Control</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.role === 'admin' ? 'Administrador' : 'Partner'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 overflow-hidden">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                </header>
                
                <div className="p-8 flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
