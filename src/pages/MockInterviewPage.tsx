import { useState } from 'react';
import { Send, Bot, User, Sparkles, RefreshCcw, Star, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { interviewService } from '../services/apiServices';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useEffect } from 'react';
import { fetchLatestStudyPlan } from '../redux/slices/aiSlice';
import { fetchProfile } from '../redux/slices/profileSlice';

export const MockInterviewPage = () => {
    const dispatch = useDispatch();
    const { studyPlan } = useSelector((state: RootState) => state.ai);
    const { profile } = useSelector((state: RootState) => state.profile);

    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your AI interviewer. Click 'Start Session' to begin a mock interview tailored to your target role." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (!studyPlan) dispatch(fetchLatestStudyPlan() as any);
        if (!profile) dispatch(fetchProfile() as any);
    }, [dispatch, studyPlan, profile]);

    const handleStartSession = async () => {
        setIsStarting(true);
        try {
            const targetRole = studyPlan?.target_role || profile?.job_title || 'Software Engineer';
            const res = await interviewService.startSession({
                job_title: targetRole,
                interview_type: 'mixed',
                num_questions: 5,
            });
            const data = res.data;
            setSessionId(data.session_id);
            setQuestions(data.questions);
            setCurrentQuestionIndex(0);
            setMessages([
                { role: 'ai', content: `Great! I've prepared ${data.questions.length} ${data.interview_type} questions for you. Let's begin!\n\n**Question 1:** ${data.questions[0]}` }
            ]);
            toast.success('Interview session started!');
        } catch (err: any) {
            toast.error(err.parsedMessage || "Failed to start interview session");
        } finally {
            setIsStarting(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !sessionId) return;

        const userAnswer = input;
        setMessages(prev => [...prev, { role: 'user', content: userAnswer }]);
        setInput('');
        setIsLoading(true);
        
        try {
            const res = await interviewService.evaluateAnswer({
                session_id: sessionId,
                question_index: currentQuestionIndex,
                answer: userAnswer,
            });
            const data = res.data;

            // Build feedback message
            let feedbackMsg = `**Score: ${data.score}/10** — ${data.evaluation}\n\n${data.feedback}`;
            if (data.model_answer) {
                feedbackMsg += `\n\n**Model Answer:** ${data.model_answer}`;
            }

            // Add next question if available
            const nextIndex = currentQuestionIndex + 1;
            if (nextIndex < questions.length) {
                feedbackMsg += `\n\n---\n\n**Question ${nextIndex + 1}:** ${questions[nextIndex]}`;
                setCurrentQuestionIndex(nextIndex);
            } else {
                feedbackMsg += `\n\n---\n\n🎉 **Interview complete!** You've answered all ${questions.length} questions. Click 'Reset' to start a new session.`;
                setSessionId(null);
            }

            setMessages(prev => [...prev, { role: 'ai', content: feedbackMsg }]);
        } catch (err: any) {
            toast.error(err.parsedMessage || "Failed to evaluate answer");
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't evaluate that answer. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSessionId(null);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setMessages([
            { role: 'ai', content: "Session reset! Click 'Start Session' to begin a new mock interview." }
        ]);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col gap-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">AI Mock Interviewer</h2>
                        <div className="flex items-center text-xs text-slate-500 font-medium">
                            Target Role: <span className="text-primary-600 ml-1">{studyPlan?.target_role || profile?.job_title || 'Not Set'}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-500">
                            <span className={`w-2 h-2 ${sessionId ? 'bg-green-500' : 'bg-slate-300'} rounded-full mr-2`}></span>
                            {sessionId ? `Active Session: Q${currentQuestionIndex + 1}/${questions.length}` : 'No active session'}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!sessionId ? (
                        <Button size="sm" onClick={handleStartSession} isLoading={isStarting}>
                            <Sparkles className="w-4 h-4 mr-2" /> Start Session
                        </Button>
                    ) : (
                        <Button variant="secondary" size="sm" onClick={handleReset}>
                            <RefreshCcw className="w-4 h-4 mr-2" /> Reset
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 px-2">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold border ${
                                m.role === 'ai' ? 'bg-primary-50 border-primary-100 text-primary-600' : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                                {m.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>
                            <div className={`p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                m.role === 'ai' ? 'bg-white border border-slate-100 text-slate-700 shadow-sm' : 'bg-primary-600 text-white shadow-lg'
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold border bg-primary-50 border-primary-100 text-primary-600">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-2 text-slate-400">
                                <Loader2 className="w-4 h-4 animate-spin" /> Evaluating your answer...
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder={sessionId ? "Type your answer here..." : "Start a session first to begin answering questions..."}
                    disabled={!sessionId || isLoading}
                    className="w-full p-4 pr-16 bg-white border border-slate-300 rounded-2xl shadow-xl focus:ring-2 focus:ring-primary-500 focus:border-none min-h-[100px] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button 
                    className="absolute bottom-4 right-4 h-10 w-10 rounded-full p-0" 
                    onClick={handleSend}
                    disabled={!input.trim() || !sessionId || isLoading}
                >
                    <Send className="w-5 h-5" />
                </Button>
            </div>
            
            <div className="flex justify-center gap-4 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <span className="flex items-center"><Sparkles className="w-3 h-3 mr-1 text-primary-400" /> Powered by HireAI Intelligence</span>
            </div>
        </div>
    );
};
