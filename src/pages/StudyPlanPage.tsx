import { useState, useEffect } from 'react';
import { 
    Play, 
    BookOpen, 
    Code, 
    ExternalLink, 
    CheckCircle2, 
    Circle,
    ArrowRight,
    Loader2,
    Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { aiService } from '../services/apiServices';
import toast from 'react-hot-toast';

export const StudyPlanPage = () => {
    const [plan, setPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
    const [targetRole, setTargetRole] = useState('');
    const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

    const fetchLatestPlan = async () => {
        try {
            setLoading(true);
            const response = await aiService.getLatestStudyPlan();
            setPlan(response.data);
            if (response.data) {
                setTargetRole(response.data.target_role);
                // Load completed tasks from localStorage if available
                const saved = localStorage.getItem(`plan_${response.data.id}_tasks`);
                if (saved) setCompletedTasks(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error fetching study plan:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetRole) return;
        
        try {
            setIsGenerating(true);
            const response = await aiService.getStudyPlan({
                target_role: targetRole,
                duration_days: 30
            });
            setPlan(response.data);
            setCompletedTasks({}); // Reset tasks for new plan
            setIsModalOpen(false);
            toast.success('Your personalized study plan is ready!');
        } catch (error) {
            toast.error('Failed to generate study plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleTask = (stepIndex: number, taskIndex: number) => {
        const key = `${stepIndex}-${taskIndex}`;
        const newTasks = { ...completedTasks, [key]: !completedTasks[key] };
        setCompletedTasks(newTasks);
        if (plan?.id) {
            localStorage.setItem(`plan_${plan.id}_tasks`, JSON.stringify(newTasks));
        }
    };

    const markGoalComplete = () => {
        const newTasks: Record<string, boolean> = {};
        plan.plan.forEach((step: any, i: number) => {
            (step.tasks || []).forEach((_: any, j: number) => {
                newTasks[`${i}-${j}`] = true;
            });
        });
        setCompletedTasks(newTasks);
        toast.success('Congratulations! Goal marked as completed.');
    };

    const handleResourceClick = (res: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const match = res.match(urlRegex);
        if (match) {
            window.open(match[0], '_blank');
        } else {
            // Search Google if no URL
            window.open(`https://www.google.com/search?q=${encodeURIComponent(res)}`, '_blank');
        }
    };

    useEffect(() => {
        fetchLatestPlan();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                <p className="text-slate-500 font-medium">Loading your personalised roadmap...</p>
            </div>
        );
    }

    if (!plan && !isModalOpen) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">No Study Plan Yet</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Head over to the Dashboard or Jobs page to generate a custom roadmap based on your target role!
                    </p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-2xl px-8 h-14 font-black shadow-xl shadow-primary-600/20"
                >
                    Generate My First Roadmap
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {plan && (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-full">AI Powered</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Personalised Roadmap</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Strategic plan for <span className="text-slate-900 dark:text-slate-100 font-bold">"{plan.target_role}"</span> over {plan.duration_days} days.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" className="rounded-xl h-12 px-6 font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700" onClick={() => setIsModalOpen(true)}>
                                <Sparkles className="w-4 h-4 mr-2" /> New Roadmap
                            </Button>
                            <Button 
                                variant="secondary" 
                                className="rounded-xl h-12 px-6 font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                                onClick={markGoalComplete}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Goal as Completed
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        <div className="lg:col-span-3 space-y-10">
                            {plan.plan.map((step: any, i: number) => (
                                <div key={i} className="relative pl-10 border-l-2 border-slate-100 dark:border-slate-800">
                                    <div className={`absolute top-0 left-0 -translate-x-[calc(50%+1px)] w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                                        i === 0 ? 'bg-primary-600 border-primary-100 dark:border-primary-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                    }`}>
                                        {i === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                                    </div>
                                    
                                    <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg w-fit ${
                                            i === 0 ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        }`}>
                                            Step {i + 1}
                                        </span>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{step.topic || step.theme}</h3>
                                    </div>

                                    <Card className={`overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none ${i === 0 ? 'border-primary-200 dark:border-primary-900/30 dark:bg-slate-900' : 'dark:bg-slate-900 dark:border-slate-800'}`}>
                                        <CardContent className="p-8">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Key Tasks</p>
                                                    <div className="space-y-3">
                                                        {(step.tasks || []).map((task: string, j: number) => {
                                                            const isDone = completedTasks[`${i}-${j}`];
                                                            return (
                                                                <div 
                                                                    key={j} 
                                                                    className={`flex items-start text-sm gap-3 group cursor-pointer transition-all font-medium ${
                                                                        isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-600 dark:text-slate-300 hover:text-primary-600'
                                                                    }`}
                                                                    onClick={() => toggleTask(i, j)}
                                                                >
                                                                    {isDone ? (
                                                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                                                                    ) : (
                                                                        <Circle className="w-4 h-4 mt-0.5 text-slate-200 dark:text-slate-700 group-hover:text-primary-400 flex-shrink-0" />
                                                                    )}
                                                                    {task}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Learning Resources</p>
                                                    <div className="space-y-3">
                                                        {(step.resources || []).map((res: string, j: number) => (
                                                            <div 
                                                                key={j} 
                                                                className="flex items-center text-sm text-primary-600 dark:text-primary-400 gap-3 group cursor-pointer hover:underline font-bold bg-primary-50/50 dark:bg-primary-900/10 px-4 py-2 rounded-xl border border-primary-100/50 dark:border-primary-900/20"
                                                                onClick={() => handleResourceClick(res)}
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                                <span className="truncate">{res.split(': http')[0]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {i === 0 && (
                                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${(Object.keys(completedTasks).filter(k => k.startsWith('0-')).length / (step.tasks?.length || 1)) * 100}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Current Focus</p>
                                                    </div>
                                                    <Button 
                                                        className="rounded-xl h-11 px-6 font-black shadow-lg shadow-primary-600/10"
                                                        onClick={() => {
                                                            const firstRes = step.resources?.[0];
                                                            if (firstRes) handleResourceClick(firstRes);
                                                            else toast.success('Starting your first lesson!');
                                                        }}
                                                    >
                                                        Start Learning
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-8">
                            <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                                <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-b dark:border-slate-800">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Skills to Acquire</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {(plan.missing_skills || []).map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 dark:bg-slate-950 text-white border-none shadow-2xl overflow-hidden group">
                                <CardContent className="p-8 relative">
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                                            <Sparkles className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <h3 className="font-black text-xl mb-3 tracking-tight">Need a Mentor?</h3>
                                        <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">Schedule a 15-min deep-dive with an expert in <span className="text-white">{plan.target_role}</span>.</p>
                                        <Button 
                                            className="w-full bg-white text-slate-900 hover:bg-slate-100 border-none h-14 rounded-2xl font-black group"
                                            onClick={() => setIsMentorModalOpen(true)}
                                        >
                                            Book Session <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20 group-hover:opacity-40 transition-opacity"></div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
            
            {/* Generation Modal */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Generate Personalised Roadmap"
            >
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/20 flex items-start gap-4">
                        <Sparkles className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-primary-900 dark:text-primary-100 font-medium leading-relaxed">
                            HireAI will analyze your current skills and compare them with the requirements of your target role to build a custom {targetRole ? 'roadmap' : 'roadmap for you'}.
                        </p>
                    </div>

                    <Input 
                        label="Target Job Role" 
                        placeholder="e.g. Senior React Developer" 
                        required
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="h-14 rounded-2xl"
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Plan Duration</label>
                        <select className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 font-bold text-slate-700 dark:text-slate-200 outline-none">
                            <option value="30">30 Days (Recommended)</option>
                            <option value="14">14 Days (Fast Track)</option>
                            <option value="60">60 Days (Deep Dive)</option>
                        </select>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full rounded-2xl h-14 font-black shadow-xl shadow-primary-600/20" 
                        isLoading={isGenerating}
                    >
                        {isGenerating ? 'Building Your Path...' : 'Generate My Roadmap'}
                    </Button>
                </form>
            </Modal>

            {/* Mentor Modal (Coming Soon) */}
            <Modal
                isOpen={isMentorModalOpen}
                onClose={() => setIsMentorModalOpen(false)}
                title="1-on-1 Mentorship"
            >
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                    <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-primary-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">Coming Soon!</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                            We're partnering with industry experts to bring you high-quality mentorship. Stay tuned!
                        </p>
                    </div>
                    <Button 
                        onClick={() => setIsMentorModalOpen(false)}
                        className="rounded-2xl px-10 h-14 font-black"
                    >
                        Got it!
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
