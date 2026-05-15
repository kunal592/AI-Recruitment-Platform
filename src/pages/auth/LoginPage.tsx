import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { LogIn, Zap, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { loginUser } from '../../redux/slices/authSlice';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppDispatch, RootState } from '../../redux/store';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: any) => {
    const result = await dispatch(loginUser({ email: data.email, password: data.password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
    } else {
      toast.error((result.payload as string) || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Branding & Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="text-3xl font-black text-white tracking-tighter flex items-center">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center mr-3">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            HireAI
          </Link>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md"
          >
            <h1 className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Ready to land your <br />
              <span className="text-blue-100 underline decoration-blue-300/30">dream role?</span>
            </h1>
            <p className="text-primary-100 text-lg mb-10 leading-relaxed font-medium">
              Log in to continue your automated job search journey. Your personalized AI agents are waiting.
            </p>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4">
               <div className="flex items-center text-white">
                 <ShieldCheck className="w-5 h-5 mr-3 text-blue-200" />
                 <span className="text-sm font-semibold tracking-wide uppercase">Secure & Private Data</span>
               </div>
               <div className="flex items-center text-white">
                 <Sparkles className="w-5 h-5 mr-3 text-blue-200" />
                 <span className="text-sm font-semibold tracking-wide uppercase">Real-time AI Recommendations</span>
               </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center text-primary-100 text-sm font-medium">
          <div className="flex -space-x-2 mr-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-600 bg-slate-200 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
              </div>
            ))}
          </div>
          Trusted by over 12,000 active users.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#fafafa]">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="mb-10 lg:hidden text-center">
             <Link to="/" className="text-2xl font-black text-primary-600 tracking-tighter">HireAI</Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 mt-2 font-medium">Welcome back to your career dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
               label="Work Email"
               type="email"
               placeholder="name@company.com"
               error={errors.email?.message as string}
               {...register('email', { 
                 required: 'Email is required',
                 pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
               })}
            />
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-primary-600 hover:text-primary-700">
                  Forgot?
                </Link>
              </div>
              <Input
                 type="password"
                 placeholder="••••••••"
                 error={errors.password?.message as string}
                 {...register('password', { 
                   required: 'Password is required'
                 })}
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center"
              >
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3 shrink-0"></div>
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              size="lg"
              className="w-full text-base font-bold h-12 shadow-lg shadow-primary-600/20" 
              isLoading={loading}
            >
              Sign In to HireAI
            </Button>
          </form>

          <p className="mt-10 text-center text-slate-600 text-sm">
            New to HireAI? {' '}
            <Link to="/register" className="font-extrabold text-primary-600 hover:text-primary-700 underline underline-offset-4">
              Create an account
            </Link>
          </p>

          <div className="mt-10 flex items-center justify-center">
            <Link to="/" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3 mr-2" /> Back to Website
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

