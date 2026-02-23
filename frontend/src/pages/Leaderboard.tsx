import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Trophy, Medal, Award, CalendarDays, Clock, Search } from 'lucide-react';

const Leaderboard = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedGameId, setSelectedGameId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'schedule'>('leaderboard');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch hierarchical events data
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/public/events');
                setEvents(data);

                // Pre-select the first available event, game, and category if possible
                if (data.length > 0) {
                    setSelectedEventId(data[0].id);
                    if (data[0].games.length > 0) {
                        setSelectedGameId(data[0].games[0].id);
                        if (data[0].games[0].categories.length > 0) {
                            setSelectedCategoryId(data[0].games[0].categories[0].id);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const activeEvent = events.find(e => e.id === selectedEventId);
    const activeGame = activeEvent?.games.find((g: any) => g.id === selectedGameId);

    // Fetch leaderboard and matches when category changes
    useEffect(() => {
        const fetchCategoryData = async () => {
            if (!selectedCategoryId) {
                setLeaderboard([]);
                setMatches([]);
                return;
            }
            try {
                // Fetch leaderboard
                const lbRes = await api.get(`/leaderboard/${selectedCategoryId}`);
                setLeaderboard(lbRes.data);

                // Fetch matches for this category
                const matchRes = await api.get(`/matches?categoryId=${selectedCategoryId}`);

                // Sort matches: upcoming first (by date), then completed (by date descending)
                const sortedMatches = matchRes.data.sort((a: any, b: any) => {
                    if (a.result && !b.result) return 1;
                    if (!a.result && b.result) return -1;
                    const timeA = new Date(a.scheduledTime).getTime();
                    const timeB = new Date(b.scheduledTime).getTime();
                    return a.result ? timeB - timeA : timeA - timeB;
                });

                setMatches(sortedMatches);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategoryData();
    }, [selectedCategoryId]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4 py-8">
                <div className="inline-flex items-center justify-center p-4 bg-amber-50 rounded-full text-amber-500 mb-2">
                    <Trophy size={48} />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Tournament Leaderboard</h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    See the top performers across all our sports categories in real-time.
                </p>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 animate-pulse">Loading tournament data...</div>
            ) : (
                <>
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tournament Event</label>
                                <select
                                    value={selectedEventId}
                                    onChange={e => { setSelectedEventId(e.target.value); setSelectedGameId(''); setSelectedCategoryId(''); }}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none transition-all"
                                >
                                    <option value="">-- Choose Event --</option>
                                    {events.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Sport / Game</label>
                                <select
                                    disabled={!selectedEventId}
                                    value={selectedGameId}
                                    onChange={e => { setSelectedGameId(e.target.value); setSelectedCategoryId(''); }}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                >
                                    <option value="">-- Choose Game --</option>
                                    {activeEvent?.games.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                <select
                                    disabled={!selectedGameId}
                                    value={selectedCategoryId}
                                    onChange={e => setSelectedCategoryId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                                >
                                    <option value="">-- Choose Category --</option>
                                    {activeGame?.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-center border-t border-slate-100 pt-6">
                            <div className="inline-flex bg-slate-100 p-1.5 rounded-xl">
                                <button
                                    onClick={() => setActiveTab('leaderboard')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${activeTab === 'leaderboard' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <Trophy size={16} /> Leaderboard
                                </button>
                                <button
                                    onClick={() => setActiveTab('schedule')}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${activeTab === 'schedule' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                        }`}
                                >
                                    <CalendarDays size={16} /> Match Schedule
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto relative mb-8">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Find specific team or branch/college..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-700 placeholder-slate-400 text-sm rounded-xl pl-12 pr-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {activeTab === 'leaderboard' && (
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="px-6 py-4 font-semibold text-slate-600 w-24 text-center">Rank</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600">Team Name</th>
                                        <th className="px-6 py-4 font-semibold text-slate-600 text-right">Points / Wins</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {leaderboard.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                                No matches played yet for this category.
                                            </td>
                                        </tr>
                                    ) : (
                                        leaderboard
                                            .filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map((team, index) => (
                                                <tr key={team.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-5 text-center">
                                                        {index === 0 ? (
                                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600">
                                                                <Trophy size={16} />
                                                            </div>
                                                        ) : index === 1 ? (
                                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600">
                                                                <Medal size={16} />
                                                            </div>
                                                        ) : index === 2 ? (
                                                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
                                                                <Award size={16} />
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-500 font-medium">{index + 1}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-bold text-slate-800 text-lg">{team.name}</div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-mono font-bold text-xl text-blue-600">
                                                        {team.wins}
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                    {leaderboard.filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && leaderboard.length > 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                                No teams found matching "{searchQuery}".
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-6">
                            {matches.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center text-slate-500">
                                    <CalendarDays size={48} className="mx-auto mb-4 text-slate-300" />
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Matches Scheduled</h3>
                                    <p>The schedule for this category has not been published yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {matches
                                        .filter(match =>
                                            (match.team1?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (match.team2?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (match.team1?.branch || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (match.team2?.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((match: any) => {
                                            const matchDate = new Date(match.scheduledTime);
                                            const isCompleted = !!match.result;

                                            return (
                                                <div key={match.id} className={`bg-white rounded-2xl overflow-hidden border transition-all hover:shadow-lg ${isCompleted ? 'border-slate-200 shadow-md opacity-90' : 'border-blue-100 shadow-xl shadow-blue-900/5'
                                                    }`}>
                                                    <div className={`px-6 py-4 flex justify-between items-center ${isCompleted ? 'bg-slate-50 border-b border-slate-100' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100'
                                                        }`}>
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                                            <Clock size={16} className={isCompleted ? 'text-slate-400' : 'text-blue-500'} />
                                                            {matchDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                        </div>
                                                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${isCompleted ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {isCompleted ? 'Final' : 'Upcoming'}
                                                        </span>
                                                    </div>

                                                    <div className="p-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex-1 text-center bg-slate-50 py-4 px-2 rounded-xl border border-slate-100">
                                                                <div className="font-extrabold text-lg text-slate-800 truncate px-2" title={match.team1?.name || 'TBD'}>
                                                                    {match.team1?.name || 'TBD'}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1">{match.team1?.branch || '-'}</div>
                                                            </div>

                                                            <div className="px-4 text-slate-400 font-black italic">VS</div>

                                                            <div className="flex-1 text-center bg-slate-50 py-4 px-2 rounded-xl border border-slate-100">
                                                                <div className="font-extrabold text-lg text-slate-800 truncate px-2" title={match.team2?.name || 'TBD'}>
                                                                    {match.team2?.name || 'TBD'}
                                                                </div>
                                                                <div className="text-xs text-slate-500 mt-1">{match.team2?.branch || '-'}</div>
                                                            </div>
                                                        </div>

                                                        {isCompleted && (
                                                            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                                                                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm">
                                                                    <Trophy size={16} />
                                                                    Match Result: {match.result}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                    {matches.filter(match =>
                                        (match.team1?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (match.team2?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (match.team1?.branch || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (match.team2?.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length === 0 && matches.length > 0 && (
                                            <div className="col-span-full py-12 text-center text-slate-500">
                                                No matches found for teams matching "{searchQuery}".
                                            </div>
                                        )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Leaderboard;
