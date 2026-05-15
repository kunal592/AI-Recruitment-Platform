import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, MapPin, Briefcase, GraduationCap, Github, Linkedin, Globe, Edit2, Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchProfile, updateProfile, updateSkills } from '../redux/slices/profileSlice';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { profile, loading } = useSelector((state: RootState) => state.profile);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'summary' | 'skills' | 'experience' | 'education' | 'basics' | null>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        dispatch(fetchProfile());
    }, [dispatch]);

    const displayName = user?.name || user?.full_name || 'User';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const openModal = (type: 'summary' | 'skills' | 'experience' | 'education' | 'basics') => {
        setModalType(type);
        setFormData(profile || {});
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            if (modalType === 'skills') {
                const skillsList = typeof formData.skills === 'string' 
                    ? formData.skills.split(',').map((s: string) => s.trim()) 
                    : formData.skills;
                await dispatch(updateSkills(skillsList)).unwrap();
            } else {
                await dispatch(updateProfile(formData)).unwrap();
            }
            toast.success('Profile updated successfully!');
            setIsModalOpen(false);
        } catch (err: any) {
            toast.error(err || 'Failed to update profile');
        }
    };

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sidebar Card */}
                <Card className="w-full md:w-1/3 dark:bg-slate-900 dark:border-slate-800 transition-colors">
                    <CardContent className="p-8 text-center">
                        <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-900/20 mx-auto mb-6 flex items-center justify-center text-4xl font-bold text-primary-600 dark:text-primary-400 border-4 border-white dark:border-slate-800 shadow-xl relative">
                            {initials}
                            <button 
                                onClick={() => openModal('basics')}
                                className="absolute bottom-1 right-1 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all transform hover:scale-110"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{displayName}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {profile?.preferred_job_titles?.[0] || 'Job Seeker'}
                        </p>
                        
                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                <Mail className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                                {user?.email || 'Not set'}
                            </div>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                <MapPin className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                                {profile?.location || 'Location not set'}
                            </div>
                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                <Briefcase className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                                {profile?.experience_years ? `${profile.experience_years}+ Years Experience` : 'Experience not set'}
                            </div>
                            {profile?.phone && (
                                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                    <UserIcon className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500" />
                                    {profile.phone}
                                </div>
                            )}
                        </div>

                        <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4">
                            {[
                                { Icon: Github, url: profile?.github_url },
                                { Icon: Linkedin, url: profile?.linkedin_url },
                                { Icon: Globe, url: profile?.portfolio_url },
                            ].map(({ Icon, url }, i) => (
                                <a 
                                    key={i} 
                                    href={url || '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 transition-all ${url ? 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20' : 'text-slate-300 dark:text-slate-700 cursor-default'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="flex-1 space-y-8 w-full">
                    {/* Summary Card */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="dark:text-slate-100">Professional Summary</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => openModal('summary')} className="dark:text-slate-400 dark:hover:bg-slate-800">
                                <Edit2 className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {profile?.bio || 'No bio set yet. Update your profile to add a professional summary.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Skills Card */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="dark:text-slate-100">Skills</CardTitle>
                            <Button variant="secondary" size="sm" onClick={() => openModal('skills')} className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                Edit Skills
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {(profile?.skills || []).length > 0 ? profile!.skills.map((skill: string) => (
                                    <span key={skill} className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-bold border border-primary-100 dark:border-primary-900/30">
                                        {skill}
                                    </span>
                                )) : <p className="text-sm text-slate-400 italic">No skills added yet.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Experience Card */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="dark:text-slate-100">Experience</CardTitle>
                            <Button variant="secondary" size="sm" onClick={() => openModal('experience')} className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                <Plus className="w-4 h-4 mr-2" /> Add Experience
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {(profile?.experience || []).length > 0 ? (
                                profile!.experience.map((exp: any, i: number) => (
                                    <div key={i} className="flex gap-6 relative group">
                                        {i !== (profile!.experience.length - 1) && <div className="absolute top-10 left-3 w-0.5 h-full bg-slate-100 dark:bg-slate-800"></div>}
                                        <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-sm shrink-0 z-10">
                                            <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-base font-black text-slate-900 dark:text-slate-100">{exp.role || exp.title}</p>
                                                <button className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-primary-600 dark:text-primary-400 font-black uppercase tracking-wider mb-3">
                                                {exp.company} {exp.start_date ? `• ${exp.start_date}` : ''} {exp.end_date ? `– ${exp.end_date}` : '– Present'}
                                            </p>
                                            {exp.description && <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{exp.description}</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No experience added yet. Click "Add Experience" to start.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Education Card */}
                    <Card className="dark:bg-slate-900 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="dark:text-slate-100">Education</CardTitle>
                            <Button variant="secondary" size="sm" onClick={() => openModal('education')} className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                <Plus className="w-4 h-4 mr-2" /> Add Education
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(profile?.education || []).length > 0 ? (
                                profile!.education.map((edu: any, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 shrink-0 border border-slate-100 dark:border-slate-700">
                                            <GraduationCap className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-base font-black text-slate-900 dark:text-slate-100">{edu.degree || edu.qualification}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-tight">
                                                {edu.institution} {edu.start_year ? `• ${edu.start_year}` : ''} {edu.end_year ? `– ${edu.end_year}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No education added yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalType === 'summary' ? 'Edit Summary' : modalType === 'skills' ? 'Edit Skills' : modalType === 'basics' ? 'Profile Basics' : `Manage ${modalType}`}
            >
                <div className="space-y-6">
                    {modalType === 'summary' && (
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Professional Summary</label>
                            <textarea 
                                className="w-full h-40 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={formData.bio || ''}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                placeholder="Describe your professional background..."
                            />
                        </div>
                    )}

                    {modalType === 'skills' && (
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Skills (Comma separated)</label>
                            <textarea 
                                className="w-full h-32 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''}
                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                placeholder="React, TypeScript, Node.js, AWS..."
                            />
                        </div>
                    )}

                    {modalType === 'basics' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Phone Number" 
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+1 234 567 890"
                            />
                            <Input 
                                label="Location" 
                                value={formData.location || ''}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="City, Country"
                            />
                            <Input 
                                label="GitHub URL" 
                                value={formData.github_url || ''}
                                onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                                placeholder="https://github.com/username"
                            />
                            <Input 
                                label="LinkedIn URL" 
                                value={formData.linkedin_url || ''}
                                onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>
                    )}

                    {(modalType === 'experience' || modalType === 'education') && (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-slate-500 dark:text-slate-400">Detailed {modalType} forms are coming soon in the next update. For now, use the Resume Parser to auto-fill these sections!</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button className="flex-1 rounded-2xl h-12 font-black" onClick={handleSave} isLoading={loading}>
                            Save Changes
                        </Button>
                        <Button variant="secondary" className="px-6 rounded-2xl h-12 dark:bg-slate-800 dark:text-white dark:border-slate-700" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
