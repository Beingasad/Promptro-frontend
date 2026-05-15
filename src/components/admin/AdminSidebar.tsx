import { LayoutDashboard, ImagePlus, Grid, Tag, Star, BarChart3, Settings, LogOut, Upload, Layers, Eye, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export type AdminTab = 'Dashboard' | 'Banners' | 'Upload Prompt' | 'Manage Prompts' | 'Categories' | 'Featured Prompts' | 'Analytics' | 'Settings' | 'System Logs' | 'Help & Feedback';

import { Megaphone } from 'lucide-react';

const contentItems = [
  { icon: LayoutDashboard, label: 'Dashboard' as AdminTab },
  { icon: Megaphone, label: 'Banners' as AdminTab },
  { icon: Upload, label: 'Upload Prompt' as AdminTab },
  { icon: Grid, label: 'Manage Prompts' as AdminTab },
  { icon: Tag, label: 'Categories' as AdminTab },
  { icon: Star, label: 'Featured Prompts' as AdminTab },
  { icon: BarChart3, label: 'Analytics' as AdminTab },
];

const otherItems = [
  { icon: HelpCircle, label: 'Help & Feedback' as AdminTab },
  { icon: Layers, label: 'System Logs' as AdminTab },
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="w-72 h-full bg-white dark:bg-[#0d0b14] border-r border-[#e9e2f3] dark:border-white/5 flex flex-col p-5 z-50 overflow-y-auto hide-scrollbar shrink-0">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5">
            <img src="/brand/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#171421] dark:text-white block">Promptro</span>
            <span className="text-[9px] font-bold text-[#756d8d] uppercase tracking-widest block -mt-1">Admin Panel</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-6">
        <div>
          <p className="text-[9px] font-bold text-[#756d8d] uppercase tracking-wider mb-2 px-4">Content</p>
          <div className="flex flex-col gap-0.5">
            {contentItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onTabChange(item.label)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 group text-left",
                  activeTab === item.label 
                    ? "bg-gradient-to-r from-primary to-[#ff6a3d] text-white shadow-lg shadow-primary/20" 
                    : "text-[#756d8d] dark:text-[#afa6c8] hover:bg-primary/5 hover:text-primary"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.label ? "text-white" : "text-current")} />
                <span className="font-bold text-[13px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-bold text-[#756d8d] uppercase tracking-wider mb-2 px-4">Other</p>
          <div className="flex flex-col gap-0.5">
            {otherItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onTabChange(item.label)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl transition-all group text-left",
                  activeTab === item.label
                    ? "bg-gradient-to-r from-primary to-[#ff6a3d] text-white shadow-lg shadow-primary/20"
                    : "text-[#756d8d] dark:text-[#afa6c8] hover:bg-primary/5 hover:text-primary"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.label ? "text-white" : "text-current")} />
                <span className="font-bold text-[13px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 rounded-2xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10">
          <p className="text-[9px] font-bold text-[#756d8d] uppercase tracking-wider mb-3">System Status</p>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#756d8d]">Server</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#756d8d]">Database</span>
              <span className="text-[10px] font-bold text-[#171421] dark:text-white">Healthy</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-4 flex flex-col gap-2">
        <div className="p-4 rounded-[1.25rem] bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 flex flex-col gap-2 relative overflow-hidden group">
          <div className="flex items-center gap-2 text-primary">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Preview Live</span>
          </div>
          <div className="flex gap-1">
             <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop" className="w-full h-full object-cover" />
             </div>
             <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=100&h=100&fit=crop" className="w-full h-full object-cover" />
             </div>
          </div>
          <a 
            href="/" 
            target="_blank"
            className="mt-1 w-full py-1.5 rounded-lg border border-primary/20 text-primary font-bold text-[10px] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Open Preview <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}
