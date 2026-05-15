import { useState, useEffect } from 'react';
import { 
    Search, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Calendar,
    ChevronRight,
    MapPin,
    ArrowUpRight,
    Plus,
    Loader2,
    Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { jobService } from '../services/apiServices';
import toast from 'react-hot-toast';

const statusConfig = {
    applied: { color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400', label: 'Applied', icon: Clock },
    interviewing: { color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400', label: 'Interviewing', icon: Calendar },
    offer: { color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400', label: 'Offer Received', icon: CheckCircle2 },
    rejected: { color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400', label: 'Rejected', icon: XCircle },
};

export const ApplicationsPage = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        status: 'applied',
        notes: ''
    });

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = await jobService.getSavedJobs();
            // Filter only applied jobs or show all saved? 
            // The model has "applied" boolean.
            const allJobs = response.data.saved_jobs || [];
            setApplications(allJobs);
        } catch (error) {
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAddManual = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await jobService.addManualApplication(formData);
            toast.success('Application added successfully');
            setIsModalOpen(false);
            setFormData({ title: '', company: '', location: '', status: 'applied', notes: '' });
            fetchApplications();
        } catch (error) {
            toast.error('Failed to add application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await jobService.updateApplicationStatus(id, newStatus);
            toast.success(`Status updated to ${newStatus}`);
            fetchApplications();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;
        try {
            await jobService.deleteApplication(id);
            toast.success('Application removed');
            fetchApplications();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-slate-500 font-medium">Syncing your applications...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Application Tracker</h1>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">You have {applications.length} active processes in your pipeline.</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-2xl h-12 px-6 font-black shadow-xl shadow-primary-600/20 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Manual Entry
                </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statusConfig).map(([key, config]) => (
                    <Card key={key} className="border-none bg-white dark:bg-slate-900 shadow-sm dark:shadow-none dark:border dark:border-slate-800">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${config.color}`}>
                                    <config.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{config.label}</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                                        {applications.filter(a => a.status === key).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card className="dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    {applications.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No applications found. Start applying!</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Role & Company</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Applied Date</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Location</th>
                                    <th className="px-8 py-5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {applications.map((app) => {
                                    const cfg = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.applied;
                                    const job = app.job_data || {};
                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-slate-100 text-base">{job.title || app.title}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{job.company || app.company}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select 
                                                    value={app.status}
                                                    onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black outline-none border-none cursor-pointer appearance-none ${cfg.color}`}
                                                >
                                                    <option value="applied" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Applied</option>
                                                    <option value="interviewing" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Interviewing</option>
                                                    <option value="offer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Offer Received</option>
                                                    <option value="rejected" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Rejected</option>
                                                </select>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-300">
                                                {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                    <MapPin className="w-4 h-4 mr-2 text-slate-300 dark:text-slate-600" />
                                                    {job.location || app.location}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => {
                                                        setSelectedApp(app);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                    className="rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity dark:text-slate-400 dark:hover:text-white"
                                                >
                                                    Details <ArrowUpRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Manual Entry Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Manual Application">
                <form onSubmit={handleAddManual} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Job Title" 
                            placeholder="e.g. Senior Frontend Engineer" 
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                        <Input 
                            label="Company Name" 
                            placeholder="e.g. Google" 
                            required
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Location" 
                            placeholder="e.g. Remote / NYC" 
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
                            <select 
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold text-slate-700 dark:text-slate-200 outline-none"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="applied">Applied</option>
                                <option value="interviewing">Interviewing</option>
                                <option value="offer">Offer Received</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Notes</label>
                        <textarea 
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 font-medium text-slate-700 dark:text-slate-200 outline-none min-h-[100px]"
                            placeholder="Add any specific details about the application process..."
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                    </div>
                    <Button type="submit" className="w-full rounded-2xl h-14 font-black" isLoading={submitting}>
                        Add to Tracker
                    </Button>
                </form>
            </Modal>

            {/* Application Details Modal */}
            <Modal 
                isOpen={isDetailsOpen} 
                onClose={() => setIsDetailsOpen(false)} 
                title="Application Details"
            >
                {selectedApp && (
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1">
                                {selectedApp.job_data?.title || selectedApp.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold mb-4">
                                {selectedApp.job_data?.company || selectedApp.company}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm font-medium">
                                <span className="flex items-center text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 mr-1.5 opacity-50" />
                                    {selectedApp.job_data?.location || selectedApp.location}
                                </span>
                                <span className="flex items-center text-slate-600 dark:text-slate-300">
                                    <Calendar className="w-4 h-4 mr-1.5 opacity-50" />
                                    Applied: {selectedApp.applied_at ? new Date(selectedApp.applied_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Current Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleStatusUpdate(selectedApp.id, key)}
                                        className={`px-4 py-3 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-between ${
                                            selectedApp.status === key 
                                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg' 
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        {config.label}
                                        {selectedApp.status === key && <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Application Notes</label>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl min-h-[100px] text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
                                {selectedApp.notes || "No notes added for this application."}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            {!selectedApp.is_manual && (
                                <Link 
                                    to={`/jobs/${selectedApp.job_data?.external_id || selectedApp.job_id}`}
                                    className="flex-1"
                                >
                                    <Button variant="secondary" className="w-full h-12 rounded-xl font-bold">
                                        View Job Description
                                    </Button>
                                </Link>
                            )}
                            <Button 
                                variant="ghost" 
                                className="h-12 px-6 rounded-xl font-bold text-red-500 hover:bg-red-50"
                                onClick={() => {
                                    handleDelete(selectedApp.id);
                                    setIsDetailsOpen(false);
                                }}
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
