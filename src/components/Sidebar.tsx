import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  GraduationCap, 
  History, 
  User, 
  Settings,
  X,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Jobs', path: '/jobs' },
  { icon: FileText, label: 'Resume', path: '/resume/upload' },
  { icon: MessageSquare, label: 'Mock Interview', path: '/mock-interview' },
  { icon: GraduationCap, label: 'Study Plan', path: '/study-plan' },
  { icon: History, label: 'Applications', path: '/applications' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const displayName = user?.name || user?.full_name || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform lg:static lg:translate-x-0 transition-all",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-500">HireAI</span>
            <button onClick={onClose} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                  isActive 
                    ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  "group-hover:text-primary-600 dark:group-hover:text-primary-400"
                )} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs uppercase">
                {initials}
              </div>
              <div className="ml-3 overflow-hidden flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

    </>
  );
};
