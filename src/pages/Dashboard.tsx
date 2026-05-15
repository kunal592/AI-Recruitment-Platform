import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Trophy, 
  Users, 
  Briefcase, 
  Search, 
  CheckCircle, 
  ArrowUpRight 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RootState, AppDispatch } from '../redux/store';
import { fetchRecommendations, fetchStats } from '../redux/slices/jobsSlice';
import { fetchProfile } from '../redux/slices/profileSlice';
import { fetchLatestStudyPlan } from '../redux/slices/aiSlice';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const data = [
  { name: 'Mon', apps: 4 },
  { name: 'Tue', apps: 7 },
  { name: 'Wed', apps: 5 },
  { name: 'Thu', apps: 9 },
  { name: 'Fri', apps: 12 },
  { name: 'Sat', apps: 8 },
  { name: 'Sun', apps: 6 },
];

export const Dashboard = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { recommendations, stats, loading } = useSelector((state: RootState) => state.jobs);
    const { profile } = useSelector((state: RootState) => state.profile);
    const { studyPlan } = useSelector((state: RootState) => state.ai);

    useEffect(() => {
        dispatch(fetchRecommendations());
        dispatch(fetchStats());
        dispatch(fetchProfile());
        dispatch(fetchLatestStudyPlan());
    }, [dispatch]);

    const displayName = user?.name || user?.full_name || 'there';
    const topRecs = recommendations.slice(0, 3);

    // Build skill match data from profile
    const matchData = (profile?.skills || []).slice(0, 5).map(skill => ({
        name: skill,
        val: Math.floor(Math.random() * 30) + 70, // Will be replaced with real ATS data
    }));
    const fallbackMatchData = [
      { name: 'React', val: 95 },
      { name: 'Node.js', val: 80 },
      { name: 'Python', val: 65 },
      { name: 'AWS', val: 70 },
      { name: 'UI Design', val: 90 },
    ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Welcome back, {displayName}! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your job search today.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
            onClick={() => toast.success("Preparing your career report...", { icon: '📊' })}
          >
            Download Report
          </Button>
          <Link to="/jobs">
            <Button onClick={() => toast.success("Scanning jobs for Quick Apply compatibility...", { icon: '⚡' })}>
              Quick Apply
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: stats?.total_applications || '0', icon: Briefcase, color: 'bg-blue-500', trend: stats?.application_trend || '+0%' },
          { label: 'Interviews Scheduled', value: stats?.interviews_scheduled || '0', icon: Users, color: 'bg-purple-500', trend: '+0' },
          { label: 'ATS Score Avg', value: stats?.ats_score_avg || '0', icon: Trophy, color: 'bg-amber-500', trend: '+0%' },
          { label: 'Profile Views', value: stats?.profile_views?.toLocaleString() || '0', icon: Search, color: 'bg-green-500', trend: '+0%' },
        ].map((stat, i) => (
          <Card key={i} className="dark:bg-slate-900 dark:border-slate-800 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center">
                  {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Application Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        backgroundColor: 'var(--tooltip-bg, #fff)',
                        color: 'var(--tooltip-color, #000)'
                    }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Area type="monotone" dataKey="apps" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-slate-100">Skill Match Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchData.length > 0 ? matchData : fallbackMatchData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={80} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="val" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <Card className="lg:col-span-2 dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="dark:text-slate-100">Recent Job Recommendations</CardTitle>
                <Link to="/jobs"><Button variant="ghost" size="sm" className="dark:text-slate-400 dark:hover:bg-slate-800">View All</Button></Link>
            </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : topRecs.length > 0 ? topRecs.map((job, i) => (
                        <Link to={`/jobs/${job.id}`} key={i} className="flex items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all group">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 mr-4 flex items-center justify-center font-bold text-slate-400 dark:text-slate-500">
                                {job.company?.[0] || 'J'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{job.company} • {job.location}</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold mb-1">
                                    {job.matchScore}% MATCH
                                </div>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{job.type || 'Full-time'}</p>
                            </div>
                        </Link>
                    )) : (
                        [
                            { title: 'Frontend Engineer', co: 'Google', location: 'Mountain View, CA', match: 98, type: 'Full-time' },
                            { title: 'Senior React Developer', co: 'Airbnb', location: 'Remote', match: 92, type: 'Contract' },
                            { title: 'Product UI Designer', co: 'Figma', location: 'San Francisco, CA', match: 89, type: 'Full-time' },
                        ].map((job, i) => (
                            <div key={i} className="flex items-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-900/50 transition-all group">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 mr-4 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{job.co} • {job.location}</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold mb-1">
                                        {job.match}% MATCH
                                    </div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{job.type}</p>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
        </Card>

        <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="dark:text-slate-100">Your Career Goal</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary-500 flex items-center justify-center font-bold text-slate-900 dark:text-slate-100 bg-primary-500/10">
                            {studyPlan ? '60%' : (profile?.skills?.length ? '40%' : '20%')}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 uppercase">
                                {studyPlan?.target_role || profile?.job_title || 'Target Role'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {studyPlan 
                                    ? `Learning ${studyPlan.missing_skills?.length || 0} missing skills.` 
                                    : (profile?.skills?.length 
                                        ? `${profile.skills.length} skills identified. Start a roadmap!` 
                                        : 'Upload resume to identify your skill gaps.')}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Next Recommended Action:</p>
                        <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                                    {studyPlan ? 'Daily Learning Task' : 'Generate Study Plan'}
                                </p>
                                <p className="text-xs text-primary-700 dark:text-primary-400 mt-1">
                                    {studyPlan 
                                        ? `Current Topic: ${studyPlan.plan?.[0]?.topic || 'Foundation'}`
                                        : 'Find a job and use "Roadmap to Hiring" to start.'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link to={studyPlan ? "/study-plan" : "/jobs"}>
                        <Button className="w-full shadow-lg shadow-primary-600/20">
                            {studyPlan ? 'View Roadmap' : 'Browse Jobs'}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );

};
