
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Trophy, Users, Activity, LogIn } from 'lucide-react';

const Layout = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [];

    if (isAuthenticated && user) {
        if (user.role === 'DEVELOPER') {
            navItems.push({ label: 'Developer Hub', path: '/developer', icon: Activity });
        } else if (user.role === 'ADMIN') {
            navItems.push({ label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard });
        } else if (user.role === 'INCHARGE') {
            navItems.push({ label: 'Incharge Panel', path: '/incharge', icon: Users });
        }
    }

    navItems.push({ label: 'Leaderboard', path: '/leaderboard', icon: Trophy });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        College Sports Pro
                    </h1>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    {isAuthenticated ? (
                        <div className="flex items-center justify-between px-2">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-200">{user?.name}</span>
                                <span className="text-xs text-slate-500">{user?.role}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </Link>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm border-b border-slate-200 p-4 md:hidden flex justify-between items-center">
                    <h1 className="font-bold text-lg">College Sports Pro</h1>
                    {/* Mobile menu button could go here */}
                </header>
                <div className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
