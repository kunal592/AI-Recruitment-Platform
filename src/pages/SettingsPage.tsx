import { useState, useEffect } from 'react';
import { Settings, Bell, Shield, Wallet, Monitor, Moon, Sun, Lock, Trash2, CheckCircle, Smartphone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

type TabType = 'General' | 'Notifications' | 'Security' | 'Subscription';

export const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('General');
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [isLoading, setIsLoading] = useState(false);

    // AI Preferences State
    const [aiConfig, setAiConfig] = useState({
        autoApply: false,
        optimizationLevel: 'Balanced',
        matchThreshold: 90
    });

    const toggleTheme = (mode: 'light' | 'dark') => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        }
    };

    const handleSaveAI = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success('AI preferences updated!');
        }, 800);
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Security settings updated!');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-2xl text-primary-600 dark:text-primary-400">
                        <Settings className="w-8 h-8" />
                    </div>
                    Account Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium ml-14">
                    Manage your account preferences, security, and AI automation settings.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'General', icon: Monitor, label: 'General' },
                        { id: 'Notifications', icon: Bell, label: 'Notifications' },
                        { id: 'Security', icon: Shield, label: 'Security' },
                        { id: 'Subscription', icon: Wallet, label: 'Subscription' },
                    ].map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id as TabType)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                                activeTab === item.id 
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20 translate-x-2' 
                                    : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-800'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-8">
                    {activeTab === 'General' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Appearance Card */}
                            <Card className="dark:bg-slate-900 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <Monitor className="w-5 h-5 text-primary-500" />
                                        Appearance & Experience
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base font-black text-slate-900 dark:text-slate-100">Display Theme</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Switch between light and dark visual styles.</p>
                                        </div>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <button 
                                                onClick={() => toggleTheme('light')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${!isDarkMode ? 'bg-white text-amber-600 shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                <Sun className="w-4 h-4" /> Light
                                            </button>
                                            <button 
                                                onClick={() => toggleTheme('dark')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${isDarkMode ? 'bg-slate-700 text-primary-400 shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                <Moon className="w-4 h-4" /> Dark
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Preferences */}
                            <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        HireAI Automation
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between group">
                                        <div>
                                            <p className="text-base font-black text-slate-900 dark:text-slate-100">Auto-Apply Mode</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Automatically apply to jobs that match 95%+ of your skills.</p>
                                        </div>
                                        <div 
                                            onClick={() => setAiConfig({...aiConfig, autoApply: !aiConfig.autoApply})}
                                            className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${aiConfig.autoApply ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${aiConfig.autoApply ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div>
                                            <p className="text-base font-black text-slate-900 dark:text-slate-100">Resume Optimization</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">How aggressively should AI tailor your resume per job?</p>
                                        </div>
                                        <select 
                                            value={aiConfig.optimizationLevel}
                                            onChange={(e) => setAiConfig({...aiConfig, optimizationLevel: e.target.value})}
                                            className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200 focus:border-primary-500 outline-none transition-all"
                                        >
                                            <option>Minimal</option>
                                            <option>Balanced</option>
                                            <option>Aggressive</option>
                                        </select>
                                    </div>
                                    <Button className="w-full rounded-2xl h-14 font-black mt-4" onClick={handleSaveAI} isLoading={isLoading}>
                                        Save AI Preferences
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border-red-100 dark:border-red-900/30 bg-red-50/10 dark:bg-red-900/10 overflow-hidden">
                                <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
                                    <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-3">
                                        <Trash2 className="w-5 h-5" /> Danger Zone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div className="max-w-md">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">Delete Account Permanently</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            This action is irreversible. All your resume data, applications, and study plans will be deleted.
                                        </p>
                                    </div>
                                    <Button variant="danger" className="rounded-xl px-6 h-12 font-black shadow-xl shadow-red-600/10 transition-all hover:scale-105">
                                        Delete
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-indigo-500" />
                                        Password & Authentication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
                                        <Input label="Current Password" type="password" placeholder="••••••••" required />
                                        <Input label="New Password" type="password" placeholder="••••••••" required />
                                        <Input label="Confirm New Password" type="password" placeholder="••••••••" required />
                                        <Button type="submit" className="w-full rounded-2xl h-14 font-black">
                                            Update Password
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="dark:bg-slate-900 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <CardHeader className="bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <Smartphone className="w-5 h-5 text-sky-500" />
                                        Two-Factor Authentication
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 flex items-center justify-between">
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-slate-100">Two-Factor Auth (2FA)</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Protect your account with an extra layer of security.</p>
                                    </div>
                                    <Button variant="secondary" className="rounded-xl px-6 h-12 font-black dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                                        Enable 2FA
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {(activeTab === 'Notifications' || activeTab === 'Subscription') && (
                        <div className="py-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                <Monitor className="w-10 h-10 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{activeTab} coming soon!</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto mt-2">
                                    We're working hard to bring advanced {activeTab.toLowerCase()} controls to HireAI. Stay tuned!
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

