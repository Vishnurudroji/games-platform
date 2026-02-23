import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Trophy, Users, School } from 'lucide-react';

const PublicRegistration = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Check if the URL came with pre-selected IDs from an Incharge's direct link
    const preCategory = searchParams.get('category') || '';

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedGameId, setSelectedGameId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState(preCategory);

    const [form, setForm] = useState({
        name: '', // Team Name
        captainName: '',
        branch: '',
        year: ''
    });

    // We start with 1 member for styling purposes here
    const [members, setMembers] = useState([{ name: '', branch: '', year: '' }]);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Fetch public data hierarchy
        api.get('/public/events').then(res => {
            setEvents(res.data);

            // If they came with a category link, automatically figure out the event and game
            if (preCategory) {
                for (const ev of res.data) {
                    for (const gm of ev.games) {
                        for (const cat of gm.categories) {
                            if (cat.id === preCategory) {
                                setSelectedEventId(ev.id);
                                setSelectedGameId(gm.id);
                                break;
                            }
                        }
                    }
                }
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [preCategory]);

    const activeEvent = events.find(e => e.id === selectedEventId);
    const activeGame = activeEvent?.games.find((g: any) => g.id === selectedGameId);
    const activeCategory = activeGame?.categories.find((c: any) => c.id === selectedCategoryId);

    const handleAddMember = () => setMembers([...members, { name: '', branch: '', year: '' }]);

    const handleRemoveMember = (idx: number) => {
        const copy = [...members];
        copy.splice(idx, 1);
        setMembers(copy);
    };

    const handleMemberChange = (idx: number, field: string, val: string) => {
        const copy: any = [...members];
        copy[idx][field] = val;
        setMembers(copy);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus('loading');
        setErrorMessage('');

        try {
            await api.post('/teams/register', {
                name: form.name,
                captainName: form.captainName,
                branch: form.branch,
                year: form.year,
                categoryId: selectedCategoryId,
                members
            });
            setSubmitStatus('success');
        } catch (err: any) {
            console.error(err);
            setSubmitStatus('error');
            setErrorMessage(err.response?.data?.message || 'Failed to submit registration');
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading registration form...</div>;
    }

    if (submitStatus === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg text-center border border-slate-100">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Registration Received!</h2>
                    <p className="text-slate-500 mb-8">
                        Your team <strong>{form.name}</strong> has been registered. The Game Incharge will review and approve your registration shortly.
                    </p>
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        View Live Leaderboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-6">
                        <Users size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Team Registration</h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        Select your event, fill out your team details, and secure your spot in the competition.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><School className="text-blue-600" /> Event Selection</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Event</label>
                                <select
                                    value={selectedEventId}
                                    onChange={e => { setSelectedEventId(e.target.value); setSelectedGameId(''); setSelectedCategoryId(''); }}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                >
                                    <option value="">-- Choose Event --</option>
                                    {events.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Game</label>
                                <select
                                    disabled={!selectedEventId}
                                    value={selectedGameId}
                                    onChange={e => { setSelectedGameId(e.target.value); setSelectedCategoryId(''); }}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">-- Choose Game --</option>
                                    {activeEvent?.games.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Category</label>
                                <select
                                    disabled={!selectedGameId}
                                    value={selectedCategoryId}
                                    onChange={e => setSelectedCategoryId(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">-- Choose Category --</option>
                                    {activeGame?.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name} (₹{c.entryFee})</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {selectedCategoryId && (
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-slate-800 mb-6">Team Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input required placeholder="Team Name or College Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <input required placeholder="Captain Name" value={form.captainName} onChange={e => setForm({ ...form, captainName: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <input required placeholder="Branch / Department" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                                    <input required placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">Team Members</h2>
                                    <button type="button" onClick={handleAddMember} className="text-blue-600 font-medium hover:text-blue-800 text-sm bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">+ Add Member</button>
                                </div>

                                <div className="space-y-4">
                                    {members.map((m, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
                                            <input required placeholder="Member Name" value={m.name} onChange={e => handleMemberChange(idx, 'name', e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                                            <input placeholder="Branch (Optional)" value={m.branch} onChange={e => handleMemberChange(idx, 'branch', e.target.value)} className="w-32 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                                            <input placeholder="Year" value={m.year} onChange={e => handleMemberChange(idx, 'year', e.target.value)} className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                                            {members.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveMember(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                    &times;
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{errorMessage}</div>
                            )}

                            <div className="border-t border-slate-100 pt-8 flex items-center justify-between">
                                <div className="text-slate-500">
                                    Total Entry Fee: <strong className="text-xl text-slate-800 font-bold ml-2">₹{activeCategory?.entryFee}</strong>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitStatus === 'loading'}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {submitStatus === 'loading' ? 'Registering...' : 'Submit Registration'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicRegistration;
