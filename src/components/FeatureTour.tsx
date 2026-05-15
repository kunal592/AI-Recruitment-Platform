import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    X, 
    ChevronRight, 
    ChevronLeft, 
    FileText, 
    Search, 
    BookOpen, 
    Zap, 
    MessageSquare,
    Sparkles
} from 'lucide-react';
import { Button } from './ui/Button';

const steps = [
    {
        title: "Welcome to HireAI",
        description: "Your AI-powered career co-pilot is ready. Let's show you how to land your dream job in 5 simple steps.",
        icon: <Sparkles className="w-12 h-12 text-primary-500" />,
        color: "bg-primary-50 dark:bg-primary-900/20",
    },
    {
        title: "1. Perfect Your Profile",
        description: "Upload your resume or enter your details manually. Our AI uses this to match you with the best opportunities.",
        icon: <FileText className="w-12 h-12 text-blue-500" />,
        color: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
        title: "2. Browse with AI Scores",
        description: "Browse the Jobs page. Every listing shows a personalized 'Match Score' calculated specifically for your profile.",
        icon: <Search className="w-12 h-12 text-emerald-500" />,
        color: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
        title: "3. Roadmap to Hiring",
        description: "Found a gap? Use 'Roadmap to Hiring' on any job detail page to generate a personalized study plan and master the required skills.",
        icon: <BookOpen className="w-12 h-12 text-purple-500" />,
        color: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
        title: "4. Automate Applications",
        description: "Ready to apply? Use 'Auto-Apply' to tailor your resume for the specific role and submit in one click.",
        icon: <Zap className="w-12 h-12 text-amber-500" />,
        color: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
        title: "5. Ace the Interview",
        description: "Nervous? Run an AI Mock Interview session tailored to that exact job to practice your answers and get instant feedback.",
        icon: <MessageSquare className="w-12 h-12 text-pink-500" />,
        color: "bg-pink-50 dark:bg-pink-900/20",
    }
];

export const FeatureTour = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenTour');
        if (!hasSeenTour) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <button 
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center text-center space-y-6"
                        >
                            <div className={`w-24 h-24 rounded-3xl ${steps[currentStep].color} flex items-center justify-center`}>
                                {steps[currentStep].icon}
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {steps[currentStep].title}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {steps[currentStep].description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-center gap-2 mt-10">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === currentStep ? 'w-8 bg-primary-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-4 mt-10">
                        <Button 
                            variant="secondary" 
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className={`flex-1 rounded-2xl h-14 font-black transition-opacity ${currentStep === 0 ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <ChevronLeft className="w-5 h-5 mr-2" /> Back
                        </Button>
                        <Button 
                            onClick={nextStep}
                            className="flex-1 rounded-2xl h-14 font-black bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20"
                        >
                            {currentStep === steps.length - 1 ? "Let's Go!" : "Next"} <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
