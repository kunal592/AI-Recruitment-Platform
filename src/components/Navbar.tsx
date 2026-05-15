import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

export const Navbar = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex items-center relative w-64 md:w-96">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search for jobs, skills..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </Button>
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>
        <div className="flex items-center">
            <span className="text-sm font-medium mr-3 hidden sm:block text-slate-600 dark:text-slate-400">Credits: 40</span>
            <Button variant="primary" size="sm" className="rounded-full">Upgrade</Button>
        </div>
      </div>
    </header>
  );
};

