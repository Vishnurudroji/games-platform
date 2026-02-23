import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Users, CheckCircle, XCircle, Link as LinkIcon, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const InchargeDashboard = () => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'manage' | 'schedule' | 'teams'>('manage');

    // Schedule State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [newMatch, setNewMatch] = useState({ team1Id: '', team2Id: '', scheduledTime: '' });
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);

    // For this simple UI, we assume an Incharge might fetch their categories and then teams.
    // We can fetch all categories and filter locally for simplicity.
    const fetchData = async () => {
        try {
            // In a real app we'd fetch categories by incharge ID, but let's fetch all and filter
            const { data: allCategories } = await api.get('/categories');
            const { data: allTeams } = await api.get('/teams');
            const { data: allMatches } = await api.get('/matches');

            setCategories(allCategories);
            setTeams(allTeams);
            setMatches(allMatches);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStatus = async (teamId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/teams/${teamId}/status`, { status });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const pendingTeams = teams.filter(t => t.status === 'PENDING');
    const approvedTeams = teams.filter(t => t.status === 'APPROVED');

    // Extracting the assigned category dynamically if possible
    const myCategory = categories.find((c: any) => c.inchargeId === user?.id) || categories[0];

    const handleScheduleMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMatchId) {
                await api.put(`/matches/${editingMatchId}`, newMatch);
            } else {
                await api.post('/matches', { ...newMatch, categoryId: myCategory?.id });
            }
            setShowScheduleModal(false);
            setEditingMatchId(null);
            setNewMatch({ team1Id: '', team2Id: '', scheduledTime: '' });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to save match schedule.");
        }
    };

    const handleEditMatchClick = (match: any) => {
        setEditingMatchId(match.id);
        setNewMatch({
            team1Id: match.team1Id,
            team2Id: match.team2Id,
            // Convert ISO string back to local datetime format for input type="datetime-local"
            scheduledTime: new Date(match.scheduledTime).toISOString().slice(0, 16)
        });
        setShowScheduleModal(true);
    };

    const handleDeleteMatch = async (matchId: string) => {
        if (!window.confirm('Are you sure you want to delete this scheduled match?')) return;
        try {
            await api.delete(`/matches/${matchId}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Failed to delete match.");
        }
    };

    const handleCopyLink = () => {
        if (!myCategory) return;
        const url = `${window.location.origin}/register-team?category=${myCategory.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Incharge Panel {myCategory && `- ${myCategory.name}`}</h1>
                    <p className="text-slate-500">Manage team registrations and match schedules for your category.</p>
                </div>
                {myCategory && (
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-xl transition-colors"
                        title="Copy direct registration link for students"
                    >
                        {copied ? <CheckCircle size={18} /> : <LinkIcon size={18} />}
                        {copied ? 'Link Copied!' : 'Copy Public Link'}
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-slate-500 animate-pulse flex items-center justify-center p-12">Loading dashboard...</div>
            ) : (
                <>
                    {/* Tabs Navigation */}
                    <div className="flex border-b border-slate-200 mb-6">
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'manage'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Manage Teams
                        </button>
                        <button
                            onClick={() => setActiveTab('schedule')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'schedule'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Schedule Matches
                        </button>
                        <button
                            onClick={() => setActiveTab('teams')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'teams'
                                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            Teams Directory
                        </button>
                    </div>

                    {activeTab === 'manage' && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <Card className="bg-white">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-slate-500 font-medium">Pending Approvals</h3>
                                            <div className="text-3xl font-bold text-slate-800 mt-2">{pendingTeams.length}</div>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                                            <Users size={24} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-white">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-slate-500 font-medium">Approved Teams</h3>
                                            <div className="text-3xl font-bold text-slate-800 mt-2">{approvedTeams.length}</div>
                                        </div>
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle size={24} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Pending Team Registrations</h2>
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Team / Participant</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Branch / Year</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Submitted</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {pendingTeams.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No pending registrations.</td>
                                                </tr>
                                            ) : (
                                                pendingTeams.map(team => (
                                                    <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-800">{team.name}</div>
                                                            {team.captainName && <div className="text-sm text-slate-500">Capt: {team.captainName}</div>}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-slate-800">{team.branch}</div>
                                                            <div className="text-sm text-slate-500">Year {team.year}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-500">
                                                            {new Date(team.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleUpdateStatus(team.id, 'APPROVED')}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateStatus(team.id, 'REJECTED')}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Match Schedule</h2>
                                <button
                                    onClick={() => {
                                        setEditingMatchId(null);
                                        setNewMatch({ team1Id: '', team2Id: '', scheduledTime: '' });
                                        setShowScheduleModal(true);
                                    }}
                                    className="bg-slate-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                                >
                                    + Schedule New Match
                                </button>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                {matches.length === 0 ? (
                                    <div className="p-12 text-center text-slate-500">No matches scheduled yet for this category.</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                        {matches.map((match: any) => (
                                            <div key={match.id} className="border border-slate-100 p-4 rounded-xl bg-slate-50">
                                                <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-3">
                                                    <span>{new Date(match.scheduledTime).toLocaleString()}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 rounded-full ${match.result ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                                                            {match.result ? 'Completed' : 'Upcoming'}
                                                        </span>
                                                        {!match.result && (
                                                            <div className="flex gap-1 ml-1">
                                                                <button onClick={() => handleEditMatchClick(match)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Edit Schedule">
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button onClick={() => handleDeleteMatch(match.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Delete Match">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm mb-2">
                                                    <span className="font-bold text-slate-800">{match.team1?.name || 'TBD'}</span>
                                                </div>
                                                <div className="text-center text-sm font-bold text-slate-400 my-1">VS</div>
                                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                    <span className="font-bold text-slate-800">{match.team2?.name || 'TBD'}</span>
                                                </div>
                                                {match.result && (
                                                    <div className="mt-3 text-center text-sm font-medium text-indigo-600 bg-indigo-50 py-1.5 rounded-lg">
                                                        Result: {match.result}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'teams' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Teams Directory</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {teams.length === 0 ? (
                                    <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No teams registered yet.</div>
                                ) : (
                                    teams.map(team => (
                                        <div key={team.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-800">{team.name}</h3>
                                                    <p className="text-sm text-slate-500">{team.branch} - Year {team.year}</p>
                                                </div>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${team.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    team.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {team.status}
                                                </span>
                                            </div>
                                            <div className="p-5 flex-1">
                                                <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                                    <Users size={16} className="text-slate-400" />
                                                    Team Members ({team.members?.length || 0})
                                                </h4>
                                                <div className="space-y-2">
                                                    {team.members?.map((member: any) => (
                                                        <div key={member.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 transition-colors">
                                                            <span className="font-medium text-slate-700 flex items-center gap-2">
                                                                {member.name}
                                                                {member.name === team.captainName && (
                                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold" title="Team Captain">C</span>
                                                                )}
                                                            </span>
                                                            <span className="text-slate-500 text-xs">
                                                                {member.branch}{member.year ? ` - Yr ${member.year}` : ''}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {showScheduleModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-xl font-bold mb-4">{editingMatchId ? 'Edit Match Schedule' : 'Schedule a Match'}</h3>
                        <form onSubmit={handleScheduleMatch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Team 1</label>
                                <select required value={newMatch.team1Id} onChange={e => setNewMatch({ ...newMatch, team1Id: e.target.value })} className="w-full border rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors">
                                    <option value="">-- Select Team 1 --</option>
                                    {approvedTeams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.branch})</option>)}
                                </select>
                            </div>

                            <div className="text-center font-bold text-slate-300">VS</div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Team 2</label>
                                <select required value={newMatch.team2Id} onChange={e => setNewMatch({ ...newMatch, team2Id: e.target.value })} className="w-full border rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors">
                                    <option value="">-- Select Team 2 --</option>
                                    {approvedTeams.filter(t => t.id !== newMatch.team1Id).map(t => <option key={t.id} value={t.id}>{t.name} ({t.branch})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                                <input type="datetime-local" required value={newMatch.scheduledTime} onChange={e => setNewMatch({ ...newMatch, scheduledTime: e.target.value })} className="w-full border rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                                <button type="button" onClick={() => { setShowScheduleModal(false); setEditingMatchId(null); }} className="px-5 py-2 hover:bg-slate-100 text-slate-600 font-medium rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                                    {editingMatchId ? 'Save Changes' : 'Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InchargeDashboard;
