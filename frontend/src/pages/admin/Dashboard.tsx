import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [budget, setBudget] = useState<any[]>([]);
    const [associations, setAssociations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state (simplified for example)
    const [showEventModal, setShowEventModal] = useState(false);
    const [showGameModal, setShowGameModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    // New Entity States
    const [newEvent, setNewEvent] = useState({ name: '', startDate: '', endDate: '', venue: '', associationId: '' });
    const [newGame, setNewGame] = useState({ name: '' });
    const [newCategory, setNewCategory] = useState({ name: '', entryFee: '', gameId: '', inchargeName: '', inchargeEmail: '', inchargePassword: '' });
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

    // Basic Fetching
    const fetchData = async () => {
        try {
            const [eventsRes, budgetRes, assocRes] = await Promise.all([
                api.get('/events'),
                api.get('/dashboard/budget'),
                api.get('/associations')
            ]);
            // If admin, they only see events they created or are assigned to, assuming API filters this or we filter locally
            const myEvents = eventsRes.data.filter((e: any) => e.adminId === user?.id);
            setEvents(myEvents);
            setBudget(budgetRes.data);
            setAssociations(assocRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Typically associationId would be fetched from the admin's context, but we will assume they input it or it's implicitly linked.
            // Since this is a simple interface, we would need a dropdown of associations. Let's assume hard-coded associationId for a moment
            // Or we can just prompt the user if they have multiple.
            await api.post('/events', newEvent);
            setShowEventModal(false);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    }

    const handleCreateGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEventId) return;
        try {
            await api.post('/games', { name: newGame.name, eventId: selectedEventId });
            setShowGameModal(false);
            setNewGame({ name: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    }

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newCategory,
                name: newCategory.name || 'General',
                entryFee: Number(newCategory.entryFee)
            };
            if (editingCategoryId) {
                await api.put(`/categories/${editingCategoryId}`, payload);
            } else {
                await api.post('/categories', payload);
            }
            setShowCategoryModal(false);
            setEditingCategoryId(null);
            setNewCategory({ name: '', entryFee: '', gameId: '', inchargeName: '', inchargeEmail: '', inchargePassword: '' });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error saving category/incharge.");
        }
    }

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm("Are you sure you want to remove this price and incharge configuration? This might fail if teams are already registered under it.")) return;
        try {
            await api.delete(`/categories/${categoryId}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error deleting category.");
        }
    }

    const handleDeleteGame = async (gameId: string) => {
        if (!confirm("Are you sure you want to delete this game? All associated categories, teams, and matches will be deleted.")) return;
        try {
            await api.delete(`/games/${gameId}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error deleting game.");
        }
    }

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this EVENT? ALL associated games, categories, teams, and matches will be permanently deleted!")) return;
        try {
            await api.delete(`/events/${eventId}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error deleting event.");
        }
    }

    const openEditCategory = (eventId: string, gameId: string, category: any) => {
        setEditingCategoryId(category.id);
        setSelectedEventId(eventId);
        setNewCategory({
            name: category.name,
            entryFee: category.entryFee.toString(),
            gameId: gameId,
            inchargeName: '', // Budget API doesn't return incharge name currently, require user to re-enter if changing email
            inchargeEmail: category.inchargeEmail || '',
            inchargePassword: ''
        });
        setShowCategoryModal(true);
    };

    // Budget summary
    const totalRevenue = budget.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const totalTeams = budget.reduce((acc, curr) => acc + curr.totalTeams, 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                    <p className="text-slate-500">Manage events, games, and monitor platform budgets.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-slate-500 animate-pulse">Loading dashboard...</div>
            ) : (
                <>
                    {/* Budget Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
                            <CardContent className="p-8">
                                <h3 className="text-blue-100 font-medium text-lg">Total Revenue</h3>
                                <div className="text-4xl font-bold mt-2">₹ {totalRevenue.toLocaleString()}</div>
                                <p className="text-blue-200 text-sm mt-4">Calculated from approved team entry fees</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white">
                            <CardContent className="p-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-slate-500 font-medium text-lg">Total Teams</h3>
                                    <div className="text-4xl font-bold text-slate-800 mt-2">{totalTeams}</div>
                                    <p className="text-slate-400 text-sm mt-4">Across all active categories</p>
                                </div>
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Your Events</h2>
                        <button
                            onClick={() => setShowEventModal(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
                        >
                            Add Event
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {events.map(event => (
                            <Card key={event.id} className="border border-slate-200 gap-4">
                                <CardHeader
                                    title={
                                        <div className="flex justify-between items-center w-full pr-4">
                                            <span>{event.name}</span>
                                            <button onClick={() => handleDeleteEvent(event.id)} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-1 rounded-lg">Delete Event</button>
                                        </div>
                                    }
                                    subtitle={`${new Date(event.startDate).toLocaleDateString()} to ${new Date(event.endDate).toLocaleDateString()} — ${event.venue}`}
                                />
                                <CardContent className="bg-slate-50/50">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-600">Event ID: {event.id}</span>
                                        <div className="space-x-3 flex flex-wrap gap-2 justify-end">
                                            <button
                                                onClick={() => { setSelectedEventId(event.id); setShowGameModal(true); }}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                + Add Game (e.g. Cricket)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedEventId(event.id);
                                                    setEditingCategoryId(null);
                                                    setNewCategory({ name: '', entryFee: '', gameId: '', inchargeName: '', inchargeEmail: '', inchargePassword: '' });
                                                    setShowCategoryModal(true);
                                                }}
                                                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                                            >
                                                + Add Category, Price & Incharge
                                            </button>
                                            <button
                                                onClick={() => { setSelectedEventId(event.id); setShowBudgetModal(true); }}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                View Budget Details
                                            </button>
                                        </div>
                                    </div>

                                    {/* Display Games and Categories inline */}
                                    {(() => {
                                        const eventBudget = budget.find(b => b.id === event.id);
                                        if (!eventBudget || eventBudget.games.length === 0) return null;
                                        return (
                                            <div className="mt-6 pt-5 border-t border-slate-200">
                                                <h4 className="text-sm font-bold text-slate-700 mb-4 px-1">Configured Games & Categories</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {eventBudget.games.map((game: any) => {
                                                        const primaryCat = game.categories && game.categories.length > 0 ? game.categories[0] : null;
                                                        return (
                                                            <div key={game.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center relative">
                                                                <button onClick={() => handleDeleteGame(game.id)} className="absolute top-2 right-2 text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors">&times; Del Game</button>
                                                                <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3 mt-4">
                                                                    <div className="font-extrabold text-slate-800 tracking-tight">{game.name}</div>
                                                                    {primaryCat && (
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">₹{primaryCat.entryFee}</div>
                                                                            <div className="flex gap-2">
                                                                                <button onClick={() => openEditCategory(event.id, game.id, primaryCat)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
                                                                                <button onClick={() => handleDeleteCategory(primaryCat.id)} className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors">Del</button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {!primaryCat ? (
                                                                    <span className="text-sm text-slate-400 italic">Price & Incharge pending.</span>
                                                                ) : (
                                                                    <div className="text-sm flex flex-col gap-1">
                                                                        {primaryCat.inchargeEmail ? (
                                                                            <div className="text-slate-600 truncate" title={primaryCat.inchargeEmail}><span className="font-semibold text-slate-500">In-Charge:</span> {primaryCat.inchargeEmail}</div>
                                                                        ) : (
                                                                            <div className="text-slate-400 italic">No In-Charge assigned</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        ))}

                        {events.length === 0 && (
                            <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                No events assigned. Contact your developer to assign events.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Simplified Event Modal Placeholder */}
            {showEventModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Create New Event</h3>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <select
                                required
                                value={newEvent.associationId}
                                onChange={e => setNewEvent({ ...newEvent, associationId: e.target.value })}
                                className="w-full border rounded-lg p-2 text-sm"
                            >
                                <option value="">-- Select Association --</option>
                                {associations.map(assoc => (
                                    <option key={assoc.id} value={assoc.id}>{assoc.name}</option>
                                ))}
                            </select>
                            <input type="text" placeholder="Event Name" required className="w-full border rounded-lg p-2" onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} />
                            <input type="date" placeholder="Start Date" required className="w-full border rounded-lg p-2" onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} />
                            <input type="date" placeholder="End Date" required className="w-full border rounded-lg p-2" onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} />
                            <input type="text" placeholder="Venue" required className="w-full border rounded-lg p-2" onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showGameModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Add Game to Event</h3>
                        <form onSubmit={handleCreateGame} className="space-y-4">
                            <input type="text" placeholder="Game Name (e.g. Cricket)" required className="w-full border rounded-lg p-2" value={newGame.name} onChange={e => setNewGame({ name: e.target.value })} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowGameModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Game</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-xl font-bold mb-2">{editingCategoryId ? 'Update Game Price & Incharge' : 'Set Game Price & Incharge'}</h3>
                        <p className="text-sm text-slate-500 mb-6">{editingCategoryId ? 'Modify the existing price or reassign the In-charge.' : 'Select a game to configure its Entry Price and assign an In-charge.'}</p>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Game</label>
                                <select
                                    required
                                    value={newCategory.gameId}
                                    onChange={e => setNewCategory({ ...newCategory, gameId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Select Game --</option>
                                    {budget.find(b => b.id === selectedEventId)?.games?.map((g: any) => (
                                        <option key={g.id} value={g.id} disabled={!editingCategoryId && g.categories?.length > 0}>
                                            {g.name} {!editingCategoryId && g.categories?.length > 0 ? '(Already configured)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <input type="number" placeholder="Entry Fee (₹)" required min="0" className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" value={newCategory.entryFee} onChange={e => setNewCategory({ ...newCategory, entryFee: e.target.value })} />
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <h4 className="font-semibold text-sm mb-3 text-slate-700">Category Incharge Credentials</h4>
                                <div className="space-y-3">
                                    <input type="text" placeholder="Incharge Full Name" required={!editingCategoryId} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" value={newCategory.inchargeName} onChange={e => setNewCategory({ ...newCategory, inchargeName: e.target.value })} />
                                    <input type="email" placeholder="Incharge Email (Login)" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" value={newCategory.inchargeEmail} onChange={e => setNewCategory({ ...newCategory, inchargeEmail: e.target.value })} />
                                    <input type="password" placeholder={editingCategoryId ? "New Password (leave blank to keep current)" : "Incharge Password"} required={!editingCategoryId} className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" value={newCategory.inchargePassword} onChange={e => setNewCategory({ ...newCategory, inchargePassword: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors">{editingCategoryId ? 'Update' : 'Provision'}</button>
                            </div>                </form>
                    </div>
                </div>
            )}

            {showBudgetModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Budget Details</h3>
                            <button onClick={() => setShowBudgetModal(false)} className="text-slate-400 hover:text-slate-600">&times; Close</button>
                        </div>
                        {(() => {
                            const eventBudget = budget.find(b => b.id === selectedEventId);
                            if (!eventBudget) return <p className="text-slate-500">No budget data tracked yet.</p>;

                            return (
                                <div className="space-y-4">
                                    <div className="flex justify-between font-bold text-lg text-indigo-700 bg-indigo-50 p-4 rounded-xl">
                                        <span>Total Event Revenue</span>
                                        <span>₹ {eventBudget.totalRevenue.toLocaleString()}</span>
                                    </div>
                                    {eventBudget.games.map((game: any) => (
                                        <div key={game.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50 relative overflow-hidden">
                                            <h4 className="font-bold text-slate-700 mb-2 border-b pb-2">{game.name}</h4>
                                            {game.categories.length === 0 ? <p className="text-sm text-slate-400">No categories created yet.</p> : (
                                                <ul className="space-y-2">
                                                    {game.categories.map((cat: any) => (
                                                        <li key={cat.id} className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-600">{cat.name} <span className="text-slate-400 text-xs">({cat.approvedTeamsCount} teams @ ₹{cat.entryFee})</span></span>
                                                            <span className="font-medium text-slate-800">₹ {cat.revenue.toLocaleString()}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
