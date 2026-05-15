import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Building2, 
    MapPin, 
    Briefcase, 
    Sparkles, 
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Zap,
    Mail,
    BookOpen,
    Send,
    Loader2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { customizeResume, generateEmail, generateStudyPlan, autoApply } from '../redux/slices/aiSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export const JobDetailsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { loading: aiLoading, resumeOptimization, generatedEmail: emailResult, autoApplyResult } = useSelector((state: RootState) => state.ai);
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const jobDescription = `We are looking for a highly skilled Senior Frontend Engineer to join our Core UI team. 
    You will be responsible for building high-performance, scalable web applications that serve millions of users daily. 
    Experience with React, TypeScript, and modern frontend architecture required.`;

    const handleCustomizeResume = async () => {
        setActiveAction('resume');
        const result = await dispatch(customizeResume({ job_description: jobDescription }));
        if (customizeResume.fulfilled.match(result)) {
            toast.success('Resume customized successfully!');
        } else {
            toast.error((result.payload as string) || 'Resume customization failed');
        }
        setActiveAction(null);
    };

    const handleGenerateEmail = async () => {
        setActiveAction('email');
        const result = await dispatch(generateEmail({
            email_type: 'application',
            job_title: 'Senior Frontend Engineer',
            company_name: 'Meta',
            job_description: jobDescription,
        }));
        if (generateEmail.fulfilled.match(result)) {
            toast.success('Email generated successfully!');
        } else {
            toast.error((result.payload as string) || 'Email generation failed');
        }
        setActiveAction(null);
    };

    const handleGenerateStudyPlan = async () => {
        setActiveAction('study');
        const result = await dispatch(generateStudyPlan({
            target_role: 'Senior Frontend Engineer',
            duration_days: 30,
        }));
        if (generateStudyPlan.fulfilled.match(result)) {
            toast.success('Study plan generated! Check Study Plan page.');
        } else {
            toast.error((result.payload as string) || 'Study plan generation failed');
        }
        setActiveAction(null);
    };

    const handleAutoApply = async () => {
        setActiveAction('apply');
        const result = await dispatch(autoApply({
            job_url: `https://example.com/jobs/${id}`,
            submit: false, 
        }));
        if (autoApply.fulfilled.match(result)) {
            toast.success(result.payload.message || 'Auto-apply completed!');
        } else {
            toast.error((result.payload as string) || 'Auto-apply failed');
        }
        setActiveAction(null);
    };

    return (
        <div className="space-y-8 pb-20">
            <Link to="/jobs" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary-600 transition-all group">
                <div className="p-1 rounded-full group-hover:bg-primary-50 mr-2">
                   <ArrowLeft className="w-4 h-4" /> 
                </div>
                Back to Job Search
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/60">
                        <div className="h-32 bg-gradient-to-r from-primary-600 to-blue-500"></div>
                        <CardContent className="p-8 -mt-12">
                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
                                <div className="flex gap-6 items-end">
                                    <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-3xl font-black text-primary-600 border-4 border-white">
                                        ME
                                    </div>
                                    <div className="pb-2">
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Senior Frontend Engineer</h1>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
                                                <Building2 className="w-4 h-4 mr-1.5 text-primary-500" /> Meta
                                            </div>
                                            <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
                                                <MapPin className="w-4 h-4 mr-1.5 text-primary-500" /> Menlo Park, CA
                                            </div>
                                            <div className="flex items-center text-slate-500 dark:text-slate-400 font-medium">
                                                <Briefcase className="w-4 h-4 mr-1.5 text-primary-500" /> Remote
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-primary-600 rounded-3xl shadow-lg shadow-primary-600/20 min-w-[150px]">
                                    <div className="text-3xl font-black text-white leading-none">98%</div>
                                    <div className="text-[10px] font-black text-primary-100 uppercase tracking-[0.2em] mt-2">AI Score</div>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center">
                                        <div className="w-1.5 h-6 bg-primary-600 rounded-full mr-3"></div>
                                        Job Description
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base font-medium">
                                        {jobDescription}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center">
                                        <div className="w-1.5 h-6 bg-primary-600 rounded-full mr-3"></div>
                                        Core Responsibilities
                                    </h3>
                                    <ul className="grid md:grid-cols-2 gap-4 list-none p-0">
                                        {['Develop modular, reusable React components', 'Optimize application performance', 'Maintain design system consistency', 'Mentor junior engineers'].map(item => (
                                            <li key={item} className="flex items-start p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                                                <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm leading-tight">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader><CardTitle className="text-xl font-black">AI Match Analysis</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-green-50/50 dark:bg-green-900/10 rounded-3xl border border-green-100/50 dark:border-green-900/20">
                                <h4 className="text-xs font-black text-green-700 dark:text-green-400 mb-6 uppercase tracking-widest">Matching Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['React', 'TypeScript', 'Tailwind CSS', 'Redux', 'System Design'].map(s => (
                                        <span key={s} className="px-4 py-2 bg-white dark:bg-slate-900 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold shadow-sm border border-green-100 dark:border-green-900/30 flex items-center">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100/50 dark:border-red-900/20">
                                <h4 className="text-xs font-black text-red-700 dark:text-red-400 mb-6 uppercase tracking-widest">Skill Gaps</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['GraphQL', 'Testing Library'].map(s => (
                                        <span key={s} className="px-4 py-2 bg-white dark:bg-slate-900 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold shadow-sm border border-red-100 dark:border-red-900/30 flex items-center">
                                            <XCircle className="w-3.5 h-3.5 mr-2" /> {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Results Section with Animations */}
                    <AnimatePresence>
                        {resumeOptimization && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="border-2 border-primary-100 dark:border-primary-900/30 shadow-xl overflow-hidden">
                                    <div className="bg-primary-600 px-6 py-3 flex justify-between items-center">
                                        <CardTitle className="text-white text-base">✨ Optimized Resume Content</CardTitle>
                                        <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-black text-white">ATS: {resumeOptimization.ats_score}/100</div>
                                    </div>
                                    <CardContent className="p-0">
                                        <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-8 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed">
                                            {resumeOptimization.optimized_resume_text}
                                        </pre>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-24 border-none shadow-2xl shadow-primary-600/10 bg-slate-900 dark:bg-slate-950">
                        <CardHeader><CardTitle className="text-white font-black tracking-tight">AI Power Tools</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Button 
                                className="w-full justify-start h-14 text-base font-bold bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 border-none" 
                                onClick={handleCustomizeResume}
                                disabled={aiLoading}
                            >
                                {activeAction === 'resume' ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Sparkles className="w-5 h-5 mr-3" />}
                                Tailor My Resume
                            </Button>
                            
                            <Button 
                                variant="secondary" 
                                className="w-full justify-start h-14 text-base font-bold bg-white/10 hover:bg-white/20 text-white border-white/10" 
                                onClick={handleGenerateEmail}
                                disabled={aiLoading}
                            >
                                {activeAction === 'email' ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Mail className="w-5 h-5 mr-3 text-primary-400" />}
                                Draft Cover Email
                            </Button>

                            <Button 
                                variant="secondary" 
                                className="w-full justify-start h-14 text-base font-bold bg-white/10 hover:bg-white/20 text-white border-white/10" 
                                onClick={handleGenerateStudyPlan}
                                disabled={aiLoading}
                            >
                                {activeAction === 'study' ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <BookOpen className="w-5 h-5 mr-3 text-primary-400" />}
                                Roadmap to Hiring
                            </Button>

                            <div className="pt-6 border-t border-white/10 mt-6">
                                <Button 
                                    className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-base shadow-xl" 
                                    onClick={handleAutoApply}
                                    disabled={aiLoading}
                                >
                                    {activeAction === 'apply' ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-primary-600" /> : <Send className="w-5 h-5 mr-3 text-primary-600" />}
                                    Auto-Apply Now
                                </Button>
                                <p className="text-[10px] text-center text-slate-500 mt-4 font-bold uppercase tracking-widest">Requires 1 Credit</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                        <CardHeader><CardTitle className="text-lg font-black">Company Perks</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {['Hybrid Remote', 'Health Insurance', 'Equity Options', 'Learning Budget'].map(perk => (
                                <div key={perk} className="flex items-center text-sm text-slate-700 dark:text-slate-300 font-bold">
                                    <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg mr-3">
                                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    {perk}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

