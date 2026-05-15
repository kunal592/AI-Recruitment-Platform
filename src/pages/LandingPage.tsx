import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Search, 
  Clock, 
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary-600">HireAI</div>
          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#solution" className="hover:text-primary-600 transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-primary-600 transition-colors">Pricing</a>
            <Link to="/login" className="hover:text-primary-600 transition-colors">Login</Link>
            <Link to="/register">
              <Button size="sm" className="rounded-full px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Revolutionizing Job Search with AI
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Land Your Dream Job <span className="text-primary-600">10x Faster</span> with AI Automation
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Analyze resumes, automate job applications, practice mock interviews, and generate study roadmaps—all powered by state-of-the-art AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto rounded-full text-lg px-10 h-14">
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto rounded-full text-lg px-10 h-14">
                Watch Demo
              </Button>
            </div>
            <div className="mt-10 flex gap-8 items-center text-slate-500">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200"></div>
                ))}
              </div>
              <p className="text-sm font-medium">Joined by 10,000+ candidates</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="glass rounded-3xl p-6 shadow-2xl overflow-hidden">
               {/* Mock Dashboard Preview */}
               <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                       <div className="h-4 w-32 bg-slate-200 rounded animate-pulse"></div>
                       <div className="h-3 w-48 bg-slate-100 rounded"></div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary-100"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white rounded-lg border border-slate-100 p-3 space-y-3">
                        <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
                        <div className="h-6 w-1/2 bg-primary-50 rounded"></div>
                    </div>
                    <div className="h-24 bg-white rounded-lg border border-slate-100 p-3 space-y-3">
                        <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
                        <div className="h-6 w-1/2 bg-green-50 rounded"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-white rounded-lg border border-slate-100"></div>
               </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 h-24 w-24 bg-primary-600 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-blue-600 rounded-full blur-[80px] opacity-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24">
          {[
            { label: 'Success Rate', val: '94%' },
            { label: 'Jobs Found', val: '500k+' },
            { label: 'Time Saved', val: '80%' }
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.val}</div>
              <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">All-in-One Career Copilot</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to automate your job search and stand out from the competition.</p>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'AI Resume Parsing', desc: 'Instantly extract data from any resume and calculate your ATS score.' },
            { icon: Search, title: 'Smart Job Matching', desc: 'Get jobs tailored exactly to your skills and experience level.' },
            { icon: Sparkles, title: 'AI Resume Customizer', desc: 'Automatically adapt your resume for every single job description.' },
            { icon: Clock, title: 'Auto Apply', desc: 'Save hundreds of hours by automating the application process.' },
            { icon: GraduationCap, title: 'Study Roadmaps', desc: 'AI-generated learning paths to fill your skill gaps for any role.' },
            { icon: BarChart3, title: 'Application Tracker', desc: 'Keep track of every stage from application to offer letter.' }
          ].map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-primary-200 transition-all shadow-sm hover:shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                <f.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-12 border-t border-slate-200 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <div className="text-2xl font-bold text-primary-600 mb-2">HireAI</div>
            <p className="text-slate-500 text-sm">Building the future of recruitment automation.</p>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-primary-600">Privacy</a>
            <a href="#" className="hover:text-primary-600">Terms</a>
            <a href="#" className="hover:text-primary-600">Contact</a>
          </div>
          <div className="text-slate-400 text-sm">
            © 2026 HireAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
