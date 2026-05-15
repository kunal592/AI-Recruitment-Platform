import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Sparkles, BrainCircuit, Search, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { resumeService, profileService } from '../services/apiServices';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export const ResumeUploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isParsed, setIsParsed] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const ext = selectedFile.name.split('.').pop()?.toLowerCase();
            const validExtensions = ['pdf', 'docx'];
            const validMimes = [
                'application/pdf', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword'
            ];

            if (validExtensions.includes(ext || '') || validMimes.includes(selectedFile.type)) {
                setFile(selectedFile);
                setIsParsed(false);
                setExtractedData(null);
                setUploadProgress(0);
            } else {
                toast.error('Unsupported file type. Please upload a PDF or DOCX resume.');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        
        setIsUploading(true);
        setUploadProgress(0);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => prev < 90 ? prev + 10 : prev);
        }, 500);

        try {
            const response = await resumeService.upload(file);
            const data = response.data;
            setUploadProgress(100);
            setExtractedData(data);
            
            // If data is empty, we don't mark as "Parsed Successfully" in a way that blocks retry
            if (data.parsed_name || (data.parsed_skills && data.parsed_skills.length > 0)) {
                setIsParsed(true);
                toast.success("Resume parsed successfully!");
            } else {
                setIsParsed(false); // Allow retry
                toast.error("AI returned empty results. Please try again.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to parse resume");
            setIsParsed(false);
        } finally {
            clearInterval(interval);
            setIsUploading(false);
        }
    };


    const handleConfirmSync = async () => {
        if (!extractedData) return;
        setIsSyncing(true);
        try {
            // Map keys back to what profile expects
            const syncPayload = {
                name: extractedData.parsed_name,
                phone: extractedData.parsed_phone,
                skills: extractedData.parsed_skills,
                summary: extractedData.parsed_summary,
                experience: extractedData.parsed_experience,
                education: extractedData.parsed_education,
                projects: extractedData.parsed_projects,
                certifications: extractedData.parsed_certifications,
            };
            await profileService.syncResumeToProfile(syncPayload);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to sync profile");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
            <div className="text-center space-y-3">
                <div className="inline-flex items-center px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-full text-primary-700 dark:text-primary-400 text-xs font-black uppercase tracking-widest border border-primary-100 dark:border-primary-900/30">
                    <BrainCircuit className="w-4 h-4 mr-2" /> Powered by Gemini AI
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Resume AI Parser</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
                    Upload your resume to instantly extract structured data and get AI-powered insights for your applications.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Upload Section */}
                <div className="lg:col-span-5">
                    <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden dark:bg-slate-900">
                        <CardHeader className="bg-slate-900 dark:bg-slate-950 text-white border-b dark:border-slate-800">
                            <CardTitle className="text-lg flex items-center">
                                <Upload className="w-5 h-5 mr-3 text-primary-400" />
                                {file ? 'Ready to Analyze' : 'Upload Resume'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {!file ? (
                                <div 
                                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/10 transition-all cursor-pointer group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 flex items-center justify-center mb-6 transition-colors">
                                        <FileText className="w-10 h-10 text-slate-400 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Drag & Drop</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">PDF or DOCX (Max 10MB)</p>
                                    <Button variant="secondary" className="rounded-xl px-6 font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700">Select File</Button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        className="hidden" 
                                        accept=".pdf,.docx" 
                                        onChange={handleFileChange} 
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/20 mr-4">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-black text-slate-900 dark:text-slate-100 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.name.split('.').pop()?.toUpperCase()}
                                            </p>
                                        </div>
                                        <button 
                                            disabled={isUploading}
                                            onClick={() => { setFile(null); setIsParsed(false); setExtractedData(null); }} 
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    {isUploading && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                                <span>AI Analysis in progress...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                                                <motion.div 
                                                    className="h-full bg-primary-600 rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <Button 
                                        className="w-full rounded-2xl h-14 text-base font-black shadow-xl shadow-primary-600/20" 
                                        onClick={handleUpload} 
                                        isLoading={isUploading}
                                        disabled={isParsed}
                                    >
                                        {isParsed ? 'Analysis Complete' : 'Analyze with HireAI'}
                                    </Button>

                                    {isParsed && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-center text-sm text-green-600 dark:text-green-400 font-bold py-2">
                                                <CheckCircle className="w-5 h-5 mr-2" /> Data Extracted Successfully
                                            </div>
                                            
                                            {(!extractedData?.parsed_name && (!extractedData?.parsed_skills || extractedData.parsed_skills.length === 0)) && (
                                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
                                                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-start gap-2">
                                                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                                        AI failed to extract structured data. This usually happens if the Gemini API key is invalid or the PDF format is complex.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-start">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-4 mt-1 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">Why parse your resume?</h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                                Our AI extracts key data points to auto-complete job applications, calculate ATS matching scores, and suggest tailored improvements for specific roles.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {!isParsed ? (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px] bg-slate-50/50 dark:bg-slate-900/50 rounded-[40px] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center p-12"
                            >
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-400 dark:text-slate-300">Analysis Results</h3>
                                <p className="text-sm text-slate-400 dark:text-slate-400 mt-2 max-w-xs">
                                    Upload your resume to see the AI-extracted information and skills here.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                {/* Core Info Header */}
                                <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none dark:bg-slate-900 dark:border dark:border-slate-800">
                                    <CardContent className="p-8">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-4">
                                                <div>
                                                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                                        {extractedData.parsed_name || 'Candidate Name'}
                                                    </h2>
                                                    <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase text-xs mt-1">
                                                        {extractedData.parsed_email || 'No Email Found'}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(extractedData.parsed_skills || []).slice(0, 8).map((skill: string) => (
                                                        <span key={skill} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-xs font-black uppercase tracking-wider border border-primary-100 dark:border-primary-900/30">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {(extractedData.parsed_skills || []).length > 8 && (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-bold p-1">+{extractedData.parsed_skills.length - 8} more</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-600/30">
                                                {extractedData.parsed_name?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Professional Summary */}
                                    <Card className="border-none shadow-lg dark:shadow-none dark:bg-slate-900 dark:border dark:border-slate-800">
                                        <CardHeader className="pb-2"><CardTitle className="text-base font-black dark:text-slate-100">Professional Summary</CardTitle></CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                {extractedData.parsed_summary || 'No summary extracted.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Work Experience */}
                                    <Card className="border-none shadow-lg dark:shadow-none dark:bg-slate-900 dark:border dark:border-slate-800">
                                        <CardHeader className="pb-2"><CardTitle className="text-base font-black dark:text-slate-100">Key Experience</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            {(extractedData.parsed_experience || []).slice(0, 3).map((exp: any, i: number) => (
                                                <div key={i} className="relative pl-6 border-l-2 border-primary-100 dark:border-primary-900/30 py-1">
                                                    <div className="absolute top-2 -left-[5px] w-2 h-2 rounded-full bg-primary-500"></div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">{exp.role || exp.title}</p>
                                                    <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 tracking-wide uppercase">{exp.company}</p>
                                                </div>
                                            ))}
                                            {(extractedData.parsed_experience || []).length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500">No experience found.</p>}
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="flex gap-4">
                                    <Button 
                                        className="flex-1 rounded-2xl h-14 text-base font-black bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20" 
                                        onClick={handleConfirmSync}
                                        isLoading={isSyncing}
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" /> Confirm & Update Profile
                                    </Button>
                                    <Button 
                                        variant="secondary"
                                        className="rounded-2xl h-14 px-6 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                                        onClick={() => { setFile(null); setIsParsed(false); setExtractedData(null); }}
                                    >
                                        Discard
                                    </Button>
                                </div>

                                {/* Raw Text Preview */}
                                <Card className="border-none shadow-lg dark:shadow-none overflow-hidden dark:bg-slate-900 dark:border dark:border-slate-800">
                                    <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                        <CardTitle className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Extracted Raw Text</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <pre className="p-6 text-xs font-mono text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/50 max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                            {extractedData.raw_text}
                                        </pre>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

