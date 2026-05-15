import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import { UserPlus, CheckCircle2, Briefcase, Zap, ShieldCheck } from 'lucide-react';
import { registerUser } from '../../redux/slices/authSlice';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AppDispatch, RootState } from '../../redux/store';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export const RegisterPage = () => {
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
    const result = await dispatch(
      registerUser({
        full_name: data.name,
        email: data.email,
        password: data.password,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      toast.success('Welcome aboard! Your account is ready.');
      // Navigation happens via useEffect
    } else {
      toast.error((result.payload as string) || 'Could not create account.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Branding & Features (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="text-3xl font-black text-white tracking-tighter flex items-center">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary-600/20">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            HireAI
          </Link>
        </div>

        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-extrabold text-white leading-tight mb-8"
          >
            Your AI-powered <br />
            <span className="text-primary-400">Career Transformation</span> <br />
            starts here.
          </motion.h1>

          <div className="space-y-6">
            {[
              { icon: Zap, title: "ATS Optimization", desc: "Instantly tailor your resume to any job description." },
              { icon: Briefcase, title: "Auto-Apply", desc: "Let our AI fill and submit applications for you." },
              { icon: ShieldCheck, title: "Mock Interviews", desc: "Practice with AI and get real-time feedback." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start"
              >
                <div className="p-2 bg-white/10 rounded-lg mr-4 mt-1">
                  <item.icon className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center text-slate-400 text-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-primary-500" />
          Join 5,000+ candidates landing jobs today.
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden">
             <Link to="/" className="text-2xl font-black text-primary-600 tracking-tighter">HireAI</Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-2">Get started for free. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
               label="Full Name"
               type="text"
               placeholder="Enter your name"
               error={errors.name?.message as string}
               {...register('name', { required: 'Name is required' })}
            />
            
            <Input
               label="Email Address"
               type="email"
               placeholder="you@example.com"
               error={errors.email?.message as string}
               {...register('email', { 
                 required: 'Email is required',
                 pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
               })}
            />

            <Input
               label="Password"
               type="password"
               placeholder="Min. 8 characters"
               error={errors.password?.message as string}
               {...register('password', { 
                 required: 'Password is required',
                 minLength: { value: 8, message: 'Password must be at least 8 characters' }
               })}
            />

            <div className="flex items-center space-x-2 py-2">
              <input 
                type="checkbox" 
                id="terms" 
                required 
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                I agree to the <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
              </label>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center"
              >
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3 shrink-0"></div>
                {error}
              </motion.div>
            )}

            <Button 
              type="submit" 
              size="lg"
              className="w-full text-base font-bold shadow-xl shadow-primary-600/20" 
              isLoading={loading}
            >
              Start Your Journey
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-sm">
            Already have an account? {' '}
            <Link to="/login" className="font-extrabold text-primary-600 hover:text-primary-700 underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

