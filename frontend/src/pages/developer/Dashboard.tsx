import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Plus, Building2, Calendar } from 'lucide-react';

interface Association {
    id: string;
    name: string;
    createdAt: string;
    events: any[];
}

const DeveloperDashboard = () => {
    const [associations, setAssociations] = useState<Association[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showAssocModal, setShowAssocModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);

    const [editingAssocId, setEditingAssocId] = useState<string | null>(null);

    const [newAssocName, setNewAssocName] = useState('');
    const [newEvent, setNewEvent] = useState({
        name: '', startDate: '', endDate: '', venue: '', associationId: '', adminName: '', adminEmail: '', adminPassword: ''
    });

    const fetchAssociations = async () => {
        try {
            const { data } = await api.get('/associations');
            setAssociations(data);
        } catch (err) {
            console.error('Failed to fetch associations', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssociations();
    }, []);

    const handleCreateAssoc = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAssocId) {
                await api.put(`/associations/${editingAssocId}`, { name: newAssocName });
            } else {
                await api.post('/associations', { name: newAssocName });
            }
            setNewAssocName('');
            setEditingAssocId(null);
            setShowAssocModal(false);
            fetchAssociations();
        } catch (err) {
            console.error(err);
            alert("Error saving association.");
        }
    };

    const handleDeleteAssoc = async (id: string) => {
        if (!confirm("Are you sure you want to delete this Association? ALL EVENTS, GAMES, CATEGORIES, TEAMS, and MATCHES under this association will be permanently deleted!")) return;
        try {
            await api.delete(`/associations/${id}`);
            fetchAssociations();
        } catch (err) {
            console.error(err);
            alert("Error deleting association.");
        }
    };

    const openEditAssoc = (assoc: Association) => {
        setEditingAssocId(assoc.id);
        setNewAssocName(assoc.name);
        setShowAssocModal(true);
    };

    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newEvent.associationId) return alert("Select an association first");
            await api.post('/events', newEvent);
            setShowEventModal(false);
            setNewEvent({ name: '', startDate: '', endDate: '', venue: '', associationId: '', adminName: '', adminEmail: '', adminPassword: '' });
            fetchAssociations(); // Refresh associations to show new event count
        } catch (err) {
            console.error(err);
            alert("Error creating event/admin.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Developer Hub</h1>
                    <p className="text-slate-500">Manage all associations and provision Admin events.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setEditingAssocId(null);
                            setNewAssocName('');
                            setShowAssocModal(true);
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center space-x-2 shadow-sm"
                    >
                        <Plus size={18} />
                        <span>New Association</span>
                    </button>
                    <button
                        onClick={() => setShowEventModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center space-x-2 shadow-sm"
                    >
                        <Calendar size={18} />
                        <span>Provision Event & Admin</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-slate-500">Loading initial data...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {associations.map((assoc) => (
                        <Card key={assoc.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="flex flex-col items-center text-center relative">
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button onClick={() => openEditAssoc(assoc)} className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded">Edit</button>
                                    <button onClick={() => handleDeleteAssoc(assoc.id)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors bg-red-50 px-2 py-1 rounded">Delete</button>
                                </div>
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 mt-2">
                                    <Building2 size={32} />
                                </div>
                                <h3 className="font-semibold text-lg text-slate-800">{assoc.name}</h3>
                                <p className="text-slate-500 text-sm mt-1">{assoc.events?.length || 0} Events configured</p>
                                <div className="mt-6 pt-4 border-t border-slate-100 w-full flex justify-between text-xs text-slate-400">
                                    <span>ID: {assoc.id.substring(0, 8)}...</span>
                                    <span>{new Date(assoc.createdAt).toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {associations.length === 0 && (
                        <div className="col-span-full p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            No associations constructed yet. Create one to begin.
                        </div>
                    )}
                </div>
            )}

            {/* Association Modal */}
            {showAssocModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <CardHeader title={editingAssocId ? "Update Association" : "Create Association"} subtitle={editingAssocId ? "Rename the selected organizational entity." : "Assign an organizational entity to group events."} />
                        <CardContent>
                            <form onSubmit={handleCreateAssoc} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Association Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAssocName}
                                        onChange={(e) => setNewAssocName(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. University Sports Council"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button type="button" onClick={() => setShowAssocModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors">
                                        {editingAssocId ? "Save Changes" : "Create"}
                                    </button>
                                </div>
                            </form>
                        </CardContent>
                    </div>
                </div>
            )}

            {/* Event & Admin Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-xl font-bold mb-2">Provision Event & Admin</h3>
                        <p className="text-sm text-slate-500 mb-6">Create an event and provision its managing Admin simultaneously.</p>

                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Association</label>
                                <select
                                    required
                                    value={newEvent.associationId}
                                    onChange={e => setNewEvent({ ...newEvent, associationId: e.target.value })}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Select Association --</option>
                                    {associations.map(assoc => (
                                        <option key={assoc.id} value={assoc.id}>{assoc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Event Name" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} />
                                <input type="text" placeholder="Venue" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} />
                                <input type="date" placeholder="Start Date" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" onChange={e => setNewEvent({ ...newEvent, startDate: e.target.value })} />
                                <input type="date" placeholder="End Date" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" onChange={e => setNewEvent({ ...newEvent, endDate: e.target.value })} />
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <h4 className="font-semibold text-sm mb-3 text-slate-700">Admin Account Credentials</h4>
                                <div className="space-y-3">
                                    <input type="text" placeholder="Admin Full Name" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" onChange={e => setNewEvent({ ...newEvent, adminName: e.target.value })} />
                                    <input type="email" placeholder="Admin Email (Login)" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" onChange={e => setNewEvent({ ...newEvent, adminEmail: e.target.value })} />
                                    <input type="password" placeholder="Admin Password" required className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 text-sm" onChange={e => setNewEvent({ ...newEvent, adminPassword: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">Provision</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default DeveloperDashboard;
