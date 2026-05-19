import { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, ChevronDown, CheckCircle2, AlertCircle, LogOut, User, Settings as SettingsIcon, MessageSquare, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { cn } from '../../utils/cn';

interface AdminNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeTab: string;
}

export function AdminNavbar({ isSidebarOpen, onToggleSidebar, activeTab }: AdminNavbarProps) {
  const [isDark, setIsDark] = useState(() => {
    const localTheme = localStorage.getItem('promptro:theme');
    if (localTheme) return localTheme === 'Dark';
    return document.documentElement.classList.contains('dark') || 
           document.documentElement.dataset.theme === 'dark';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/feedback`);
        const recentFeedbacks = Array.isArray(response.data) ? response.data.slice(0, 5) : [];
        
        const mapped = recentFeedbacks.map((f: any) => ({
          id: f.id,
          text: `New feedback: ${f.subject}`,
          time: new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'feedback',
          icon: MessageSquare
        }));

        if (mapped.length > 0) {
          setNotifications(mapped);
          setHasUnread(true);
        } else {
          // Fallback if no feedback exists
          setNotifications([
            { id: 'd1', text: 'Welcome to Promptro Admin', time: 'Just now', type: 'info', icon: CheckCircle2 }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = () => {
    setHasUnread(false);
    setShowNotifications(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/asad87/login';
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.dataset.theme = 'dark';
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('promptro:theme', 'Dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.dataset.theme = 'light';
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('promptro:theme', 'Light');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('storage'));
  }, [isDark]);

  return (
    <header className="h-16 flex items-center justify-between px-2 mb-8 mt-2 relative z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] dark:text-[#afa6c8] hover:bg-primary/10 hover:text-primary transition-all shadow-sm",
            isSidebarOpen ? "lg:hidden" : "lg:flex"
          )}
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#171421] dark:text-white tracking-tight hidden sm:block">{activeTab}</h2>
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block sm:hidden">{activeTab}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#f8f7fc] dark:hover:bg-white/5 transition-colors group"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-[#756d8d] group-hover:text-amber-500 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 text-[#756d8d] group-hover:text-primary transition-colors" />
          )}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#f8f7fc] dark:hover:bg-white/5 transition-colors relative group"
          >
            <Bell className="w-5 h-5 text-[#756d8d] group-hover:text-primary transition-colors" />
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0d0b14]">{notifications.length}</span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1c1a26] border border-[#e9e2f3] dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-5 border-b border-[#e9e2f3] dark:border-white/10 flex items-center justify-between">
                    <h3 className="font-bold">Notifications</h3>
                    {hasUnread && (
                      <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-primary uppercase hover:opacity-80 transition-opacity">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col max-h-[350px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 flex items-start gap-3 hover:bg-[#f8f7fc] dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-[#e9e2f3] dark:border-white/10 last:border-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                          n.type === 'feedback' ? 'bg-primary/10 text-primary' :
                          n.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {n.type === 'warning' ? <AlertCircle className="w-4 h-4" /> : 
                           n.type === 'feedback' ? <MessageSquare className="w-4 h-4" /> :
                           <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#171421] dark:text-white">{n.text}</p>
                          <p className="text-[10px] text-[#756d8d] mt-1 font-medium">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <div 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1 pr-3 rounded-xl border border-[#e9e2f3] dark:border-white/10 bg-white dark:bg-white/5 transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&auto=format&fit=crop" 
                alt="Admin" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block leading-none">
              <p className="text-[13px] font-bold text-[#171421] dark:text-white">Asad</p>
              <p className="text-[10px] font-medium text-[#756d8d] mt-0.5">Super Admin</p>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-[#756d8d] transition-transform", showProfileMenu && "rotate-180")} />
          </div>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#1c1a26] border border-[#e9e2f3] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
                >
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/5 transition-colors text-left group text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-bold">Sign Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
