import { Link } from 'react-router-dom';
import { Trophy, Users, ArrowRight, ShieldCheck } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Navigation Bar */}
            <nav className="fixed w-full z-50 px-6 py-4 backdrop-blur-md bg-slate-900/50 border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Trophy size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">CampusGames</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/leaderboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">Leaderboards</Link>
                        <Link to="/register-team" className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">Register Team</Link>
                        <Link to="/login" className="text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/5 flex items-center gap-2">
                            <ShieldCheck size={16} />
                            <span>Staff Login</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        The Ultimate Sports Platform
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
                        Elevate Your <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                            Campus Tournaments
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Seamlessly manage registrations, organize brackets, track budgets, and broadcast live leaderboards to your entire university.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/leaderboard"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group hover:scale-105"
                        >
                            <span>View Leaderboards</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/register-team"
                            className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 hover:scale-105"
                        >
                            <Users size={18} />
                            <span>Register a Team</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Banners */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl">
                            🏆
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Live Leaderboards</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Watch match results, team standings, and category champions update in real-time. Accessible by all students instantly.
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl">
                            📅
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Match Scheduling</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Event incharges can draw fixtures, schedule times, and instantly notify participants about upcoming clash dates.
                        </p>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm hover:bg-slate-800 transition-colors group">
                        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl">
                            💼
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Budget Tracking</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Admins get full visibility over registration fees. Track exactly how many teams paid and calculate total event revenue securely.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-10 mt-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <Trophy size={16} />
                        <span className="font-semibold text-slate-400">CampusGames Platform</span>
                    </div>
                    <p>© {new Date().getFullYear()} All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
