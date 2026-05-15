import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, DollarSign, Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { fetchJobs, searchJobs } from '../redux/slices/jobsSlice';
import { jobService } from '../services/apiServices';
import toast from 'react-hot-toast';

export const JobsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [experience, setExperience] = useState('All Levels');
    const dispatch = useDispatch<AppDispatch>();
    const { list: jobs, loading: isLoading, error } = useSelector((state: RootState) => state.jobs);

    useEffect(() => {
        dispatch(fetchJobs());
    }, [dispatch]);

    const handleSearch = async () => {
        dispatch(searchJobs({
            q: searchQuery,
            location: location !== '' ? location : undefined,
            experience: experience !== 'All Levels' ? experience : undefined
        }));
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setLocation('');
        setExperience('All Levels');
        dispatch(fetchJobs());
    };

    const handleSaveJob = async (job: any) => {
        try {
            // Backend expects { job_data: dict, notes?: string }
            await jobService.saveJob({
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                apply_url: job.apply_url,
                external_id: job.external_id || job.id,
                source: job.source,
            });
            toast.success("Job bookmarked!");
        } catch (err: any) {
            toast.error(err.parsedMessage || "Failed to save job");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
                    <div className="lg:col-span-1 space-y-2">
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Role or Keyword</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="e.g. Frontend Engineer"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
                                className="w-full h-14 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="lg:col-span-1 space-y-2">
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="raipur"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()}
                                className="w-full h-14 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:border-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-2">
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Experience</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select 
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="w-full h-14 pl-11 pr-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:border-primary-500 outline-none transition-all appearance-none"
                            >
                                <option>All Levels</option>
                                <option>Junior</option>
                                <option>Mid-Level</option>
                                <option>Senior</option>
                                <option>Lead</option>
                            </select>
                        </div>
                    </div>

                    <Button 
                        className="h-14 w-full rounded-2xl font-black text-base shadow-xl shadow-primary-600/20" 
                        onClick={handleSearch} 
                        isLoading={isLoading}
                    >
                        <Search className="w-5 h-5 mr-2" /> Search Jobs
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors">
                        {jobs.length > 0 ? `Found ${jobs.length} Jobs` : 'No matches found'}
                    </h2>
                    {(searchQuery || location || experience !== 'All Levels') && (
                        <button 
                            onClick={handleClearFilters}
                            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                        <Filter className="w-4 h-4 mr-2" /> Sort by: Newest
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">No matching jobs found</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-8">
                        We couldn't find any jobs matching your current filters. Try removing some keywords or expanding your location.
                    </p>
                    <Button 
                        variant="secondary" 
                        onClick={handleClearFilters}
                        className="rounded-2xl px-8 h-12 font-bold dark:bg-slate-800 dark:text-white dark:border-slate-700"
                    >
                        Clear All Filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {jobs.map((job) => (
                        <Card key={job.id} className="group overflow-hidden dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center p-2 text-sm font-bold text-slate-400 dark:text-slate-500">
                                                {job.company?.[0] || 'J'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{job.company}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleSaveJob(job)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Bookmark className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mb-6">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                            <MapPin className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                            <Briefcase className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                                            {job.type}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                            <DollarSign className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                                            {job.salary}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(job.tags || job.skills || []).slice(0, 5).map((tag: string) => (
                                            <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200/50 dark:border-slate-700/50">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center">
                                                    <Sparkles className="w-4 h-4 text-emerald-500 mr-1.5" />
                                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{job.matchScore}% Match</span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mt-1">
                                                    <div 
                                                        className="h-full bg-emerald-500 rounded-full" 
                                                        style={{ width: `${job.matchScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <Link to={`/jobs/${job.id}`}>
                                            <Button variant="secondary" size="sm" className="rounded-full px-5 group dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700">
                                                Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
