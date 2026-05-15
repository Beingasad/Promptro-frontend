import { FormEvent, useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import {
  Info,
  ChevronDown,
  Users,
  TrendingUp,
  MousePointer2,
  Globe,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  Eye,
  Heart,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  ImagePlus,
  Plus,
  Edit3,
  Star,
  Flame,
  Save,
  Loader2,
  Upload,
  Bookmark,
  Search,
  Filter,
  Trash2,
  Sparkles,
  Minus,
  Copy,
  Check,
  Instagram,
  Twitter,
  Share2,
  Send,
  Trophy,
  FileSpreadsheet,
  Download,
  Grid,
  Settings,
} from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useCategories } from '../context/CategoryContext';
import AdminLayout from '../layouts/AdminLayout';
import { AdminTab } from '../components/admin/AdminSidebar';
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../config';

type AdminPrompt = {
  id: string;
  title: string;
  image_url: string;
  prompt_text: string;
  negative_prompt?: string | null;
  category: string;
  tags?: string[];
  model: string;
  likes: number;
  views: number;
  featured: boolean;
  trending?: boolean;
  aspectRatio?: string;
  aspect_ratio?: string;
  visibility?: 'Public' | 'Hidden';
  tool?: string;
};

type PromptForm = {
  title: string;
  category: string;
  model: string;
  prompt_text: string;
  negative_prompt: string;
  tags: string;
  featured: boolean;
  trending: boolean;
  visibility: 'Public' | 'Hidden';
  tool: string;
};

const API_URL = `${API_BASE_URL}/api/prompts`;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1000&auto=format&fit=crop';
const STATIC_CATEGORIES = ['Cinematic', 'Anime', 'Fantasy', 'Sci-Fi', 'Nature', 'Architecture', 'Luxury', 'Thumbnails'];
const DEFAULT_MODEL = 'Promptro';

const emptyForm: PromptForm = {
  title: '',
  category: 'Cinematic',
  model: 'Midjourney v6',
  prompt_text: '',
  negative_prompt: '',
  tags: '',
  featured: false,
  trending: false,
  visibility: 'Public',
  tool: 'Midjourney',
};

export type AdminBanner = {
  id: number;
  tag_text: string;
  tag_icon: string | null;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string | null;
  bg_gradient: string;
  is_active: boolean;
  created_at: string;
};

const emptyBannerForm = {
  tag_text: '',
  tag_icon: '',
  title: '',
  subtitle: '',
  button_text: '',
  button_link: '',
  bg_gradient: 'from-[#e0e7ff] to-[#ede9fe]',
  is_active: true,
};

export default function Admin() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [prompts, setPrompts] = useState<AdminPrompt[]>([]);
  const [form, setForm] = useState<PromptForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingPrompt, setEditingPrompt] = useState<AdminPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedRatio, setDetectedRatio] = useState('Not Uploaded');
  const [cssRatio, setCssRatio] = useState('');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [campaignStep, setCampaignStep] = useState(1);
  const [selectedPromptsForCampaign, setSelectedPromptsForCampaign] = useState<string[]>([]);
  const [isLaunching, setIsLaunching] = useState(false);
  const { categories, addCategory, deleteCategory, updateCategory } = useCategories();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const logs = useMemo(() => {
    return prompts.slice(0, 5).map((p, i) => ({
      id: i,
      action: 'Prompt Published',
      user: 'Admin',
      time: new Date(p.created_at || Date.now()).toLocaleDateString(),
      details: p.title
    }));
  }, [prompts]);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const textarea = document.getElementById('bulk-json-input') as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = JSON.stringify(data, null, 2);
      }
    };
    reader.readAsBinaryString(file);
  };
  
  const [settingsForm, setSettingsForm] = useState(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? JSON.parse(saved) : {
      siteName: 'Promptro',
      siteDesc: 'Premium AI Prompt Sharing Platform',
      contactEmail: 'admin@promptro.com',
      maintenanceMode: false,
      publicUploads: true,
    };
  });

  const handleSaveSettings = () => {
    setIsLaunching(true); // Reusing isLaunching for a saving spinner
    setTimeout(() => {
      localStorage.setItem('siteSettings', JSON.stringify(settingsForm));
      setIsLaunching(false);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const topPrompts = useMemo(() => {
    return [...prompts]
      .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
      .slice(0, 3);
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesCategory = filter === 'All' || prompt.category === filter;
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           prompt.prompt_text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filter, prompts, searchQuery]);

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(API_URL, { params: { limit: 100, t: Date.now() } });
      setPrompts(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError('Backend is not reachable. Start the API server to manage prompts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/feedback`);
      setFeedbacks(response.data);
    } catch {
      console.error('Failed to fetch feedbacks');
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/banners`);
      setBanners(response.data);
    } catch {
      console.error('Failed to fetch banners');
    }
  };

  useEffect(() => {
    fetchPrompts();
    fetchFeedbacks();
    fetchBanners();
  }, []);

  const updateForm = (key: keyof PromptForm, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setEditingPrompt(null);
    setDetectedRatio('Not Uploaded');
    setCssRatio('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectImage = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);

      // Detect Aspect Ratio
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        let ratioText = '';
        if (Math.abs(ratio - 1) < 0.1) ratioText = '1:1 (Square)';
        else if (Math.abs(ratio - 0.66) < 0.1) ratioText = '2:3 (Portrait)';
        else if (Math.abs(ratio - 0.75) < 0.1) ratioText = '3:4 (Portrait)';
        else if (Math.abs(ratio - 1.5) < 0.1) ratioText = '3:2 (Landscape)';
        else if (Math.abs(ratio - 1.77) < 0.1) ratioText = '16:9 (Landscape)';
        else if (ratio > 1.1) ratioText = 'Landscape';
        else if (ratio < 0.9) ratioText = 'Portrait';
        else ratioText = 'Custom';
        
        setDetectedRatio(`${img.width}x${img.height} • ${ratioText}`);
        setCssRatio(`${img.width} / ${img.height}`);
      };
      img.src = url;
    }
  };

  const editPrompt = (prompt: AdminPrompt) => {
    setEditingPrompt(prompt);
    setImageFile(null);
    setImagePreview(prompt.image_url);
    const ratio = prompt.aspect_ratio || prompt.aspectRatio;
    if (ratio) {
       setCssRatio(ratio);
       setDetectedRatio(ratio.replace(' / ', 'x'));
    }
    setForm({
      title: prompt.title,
      category: prompt.category,
      model: prompt.model,
      prompt_text: prompt.prompt_text,
      negative_prompt: prompt.negative_prompt || '',
      tags: prompt.tags?.join(', ') || '',
      featured: Boolean(prompt.featured),
      trending: Boolean(prompt.trending),
      visibility: prompt.visibility || 'Public',
      tool: prompt.model,
    });
    // Removed window.scrollTo since we use a side panel now
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append('title', form.title.trim());
    data.append('category', form.category);
    data.append('model', form.tool || form.model || DEFAULT_MODEL);
    data.append('prompt_text', form.prompt_text.trim());
    data.append('negative_prompt', form.negative_prompt.trim());
    data.append('tags', form.tags.trim());
    data.append('featured', String(form.featured));
    data.append('trending', String(form.trending));
    data.append('visibility', form.visibility);
    if (cssRatio) data.append('aspectRatio', cssRatio);
    
    if (imageFile) {
      data.append('image', imageFile);
    } else if (imagePreview && !imagePreview.startsWith('blob:')) {
      data.append('image_url', imagePreview);
    }
    
    return data;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    if (!editingPrompt && !imageFile) {
      setSaving(false);
      setError('Please upload an image before publishing a new prompt.');
      return;
    }

    try {
      if (editingPrompt) {
        await axios.put(`${API_URL}/${editingPrompt.id}`, buildFormData());
        setMessage('Prompt updated successfully.');
      } else {
        await axios.post(API_URL, buildFormData());
        setMessage('Prompt published successfully.');
      }
      resetForm();
      await fetchPrompts();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Could not save this prompt.';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const deletePrompt = async (prompt: AdminPrompt) => {
    if (!window.confirm(`Delete "${prompt.title}" permanently?`)) return;
    try {
      await axios.delete(`${API_URL}/${prompt.id}`);
      setMessage('Prompt deleted.');
      if (editingPrompt?.id === prompt.id) resetForm();
      await fetchPrompts();
    } catch {
      setError('Could not delete this prompt.');
    }
  };

  const toggleFeatured = async (prompt: AdminPrompt) => {
    const data = new FormData();
    data.append('featured', String(!prompt.featured));

    try {
      await axios.put(`${API_URL}/${prompt.id}`, data);
      await fetchPrompts();
    } catch {
      setError('Could not update featured status.');
    }
  };

  const toggleTrending = async (prompt: AdminPrompt) => {
    const data = new FormData();
    data.append('trending', String(!prompt.trending));

    try {
      await axios.put(`${API_URL}/${prompt.id}`, data);
      await fetchPrompts();
    } catch {
      setError('Could not update trending status.');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const data = new FormData();
      Object.entries(bannerForm).forEach(([k, v]) => {
        data.append(k, String(v));
      });
      if (bannerImageFile) data.append('image', bannerImageFile);

      if (editingBanner) {
        await axios.put(`${API_BASE_URL}/api/banners/${editingBanner.id}`, data);
        setMessage('Banner updated successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/api/banners`, data);
        setMessage('Banner created successfully.');
      }
      setBannerForm(emptyBannerForm);
      setBannerImageFile(null);
      setBannerImagePreview('');
      setEditingBanner(null);
      await fetchBanners();
    } catch (err: any) {
      setError('Could not save this banner.');
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (banner: AdminBanner) => {
    if (!window.confirm(`Delete "${banner.title}" permanently?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/banners/${banner.id}`);
      setMessage('Banner deleted.');
      if (editingBanner?.id === banner.id) {
        setBannerForm(emptyBannerForm);
        setEditingBanner(null);
      }
      await fetchBanners();
    } catch {
      setError('Could not delete banner.');
    }
  };

  const mainStats = [
    { label: 'Total Prompts', value: prompts.length, icon: Layers, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%', isUp: true },
    { label: 'Total Views', value: prompts.reduce((acc, p) => acc + (p.views || 0), 0), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+18.5%', isUp: true },
    { label: 'Total Likes', value: prompts.reduce((acc, p) => acc + (p.likes || 0), 0), icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', trend: '+5.2%', isUp: true },
    { label: 'Avg. CTR', value: '4.2%', icon: MousePointer2, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '-1.2%', isUp: false },
  ];

  const trafficData = [
    { label: 'Direct', value: '45%', color: 'bg-primary' },
    { label: 'Organic Search', value: '30%', color: 'bg-blue-400' },
    { label: 'Social', value: '15%', color: 'bg-pink-500' },
    { label: 'Referral', value: '10%', color: 'bg-amber-500' },
  ];

  return (
    <ErrorBoundary>
      <AdminLayout>
        {(activeTab: AdminTab) => (
          <div className="flex flex-col gap-8 pb-20">
            <AnimatePresence>
              {(message || error) && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold shadow-sm mb-4",
                    error ? "border-red-100 bg-red-50 text-red-600" : "border-green-100 bg-green-50 text-green-600"
                  )}
                >
                  {error ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                  {error || message}
                  <button onClick={() => { setMessage(''); setError(''); }} className="ml-auto">
                    <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === 'Dashboard' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-1">
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Welcome back, Asad!</h1>
                  <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium">Here's what's happening with your platform today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mainStats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 p-6 rounded-3xl flex flex-col gap-4 group hover:shadow-xl hover:shadow-primary/5 transition-all">
                      <div className="flex items-center justify-between">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", stat.bg, stat.color)}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div className={cn("flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg", stat.isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                          {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {stat.trend}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-[#171421] dark:text-white mt-1">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                  <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold">Traffic Overview</h2>
                        <p className="text-xs text-[#756d8d] font-medium mt-1">Daily visitor statistics and engagement</p>
                      </div>
                      <select className="bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                      </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                       {[65, 45, 75, 55, 90, 70, 85].map((h, i) => (
                         <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                           <div className="w-full relative">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                className="w-full max-w-[40px] mx-auto bg-gradient-to-t from-primary/40 to-primary rounded-t-xl group-hover:to-secondary transition-all cursor-pointer relative"
                              >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#171421] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {Math.floor(h * 123)} visits
                                </div>
                              </motion.div>
                           </div>
                           <span className="text-[10px] font-bold text-[#756d8d] uppercase">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-bold">Traffic Sources</h2>
                      <p className="text-xs text-[#756d8d] font-medium mt-1">Where your visitors come from</p>
                    </div>

                    <div className="flex flex-col gap-5">
                       {trafficData.map((item, i) => (
                         <div key={i} className="flex flex-col gap-2">
                           <div className="flex items-center justify-between text-[11px] font-bold">
                             <span className="text-[#171421] dark:text-white">{item.label}</span>
                             <span className="text-[#756d8d]">{item.value}</span>
                           </div>
                           <div className="h-2 w-full bg-[#f8f7fc] dark:bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: item.value }}
                               className={cn("h-full rounded-full", item.color)} 
                             />
                           </div>
                         </div>
                       ))}
                    </div>

                    <div className="mt-4 pt-6 border-t border-[#e9e2f3] dark:border-white/10">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center">
                            <Globe className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">Top Location</p>
                            <p className="text-lg font-bold">United States (34%)</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-8">
                     <h3 className="text-lg font-bold mb-6">Real-time Insights</h3>
                     <div className="flex flex-col gap-6">
                        {[
                          { icon: Users, label: 'Active Users Now', value: '42', color: 'text-primary' },
                          { icon: Clock, label: 'Avg. Session Duration', value: '4m 32s', color: 'text-blue-400' },
                          { icon: TrendingUp, label: 'Conversion Rate', value: '12.4%', color: 'text-green-500' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#f8f7fc] dark:bg-white/5">
                            <div className="flex items-center gap-4">
                               <div className={cn("w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center", item.color)}>
                                  <item.icon className="w-5 h-5" />
                               </div>
                               <span className="text-sm font-bold text-[#756d8d]">{item.label}</span>
                            </div>
                            <span className="text-lg font-bold">{item.value}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10 flex flex-col items-center justify-center text-center gap-4">
                     <div className="w-20 h-20 rounded-3xl bg-white dark:bg-white/10 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                        <Zap className="w-10 h-10" />
                     </div>
                     <div>
                       <h3 className="text-xl font-bold">Launch a Campaign</h3>
                       <p className="text-sm text-[#756d8d] mt-2 max-w-xs">Promote your top-performing prompts to social media with one click.</p>
                     </div>
                      <button 
                        onClick={() => {
                          setShowCampaignModal(true);
                          setCampaignStep(1);
                          setSelectedPromptsForCampaign(topPrompts.map(p => p.id));
                        }}
                        className="mt-2 px-8 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                      >
                         Get Started
                      </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Banners' && (
              <div className="flex flex-col gap-8">
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Homepage Banners</h1>
                    <p className="text-[#756d8d] dark:text-[#afa6c8] mt-1 font-medium">Manage promotional banners on the desktop homepage.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setBannerForm(emptyBannerForm);
                      setEditingBanner(null);
                      setBannerImageFile(null);
                      setBannerImagePreview('');
                      document.getElementById('banner-modal')?.showModal();
                    }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    + Create Banner
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {banners.length === 0 ? (
                    <div className="p-10 text-center rounded-[2rem] border border-[#e9e2f3] dark:border-white/10 bg-white/50 dark:bg-white/5">
                      <p className="text-[#756d8d] font-bold">No banners created yet.</p>
                    </div>
                  ) : (
                    banners.map(banner => (
                      <div key={banner.id} className={cn("rounded-[2rem] border border-[#e9e2f3] dark:border-white/10 p-6 flex gap-6 items-center", banner.is_active ? "bg-white dark:bg-[#1c1a26]" : "bg-[#f8f7fc] opacity-60")}>
                        {banner.image_url ? (
                          <div className={cn("w-32 h-20 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center overflow-hidden", banner.bg_gradient)}>
                            <img src={banner.image_url} alt="banner" className="h-[90%] w-auto object-contain drop-shadow-2xl" />
                          </div>
                        ) : (
                          <div className={cn("w-32 h-20 rounded-xl bg-gradient-to-br flex-shrink-0 flex items-center justify-center", banner.bg_gradient)}>
                             <span className="text-xl font-bold text-[#171421]/50">Banner</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {banner.tag_icon && <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full font-bold">{banner.tag_icon}</span>}
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{banner.tag_text}</span>
                          </div>
                          <h3 className="text-xl font-bold text-[#171421] dark:text-white">{banner.title}</h3>
                          <p className="text-sm font-medium text-[#756d8d] mt-1 line-clamp-1">{banner.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-bold", banner.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                            {banner.is_active ? "Active" : "Inactive"}
                          </span>
                          <button
                            onClick={() => {
                              setEditingBanner(banner);
                              setBannerForm({
                                tag_text: banner.tag_text,
                                tag_icon: banner.tag_icon || '',
                                title: banner.title,
                                subtitle: banner.subtitle,
                                button_text: banner.button_text,
                                button_link: banner.button_link,
                                bg_gradient: banner.bg_gradient,
                                is_active: banner.is_active
                              });
                              setBannerImagePreview(banner.image_url || '');
                              document.getElementById('banner-modal')?.showModal();
                            }}
                            className="w-10 h-10 rounded-full border border-[#e9e2f3] flex items-center justify-center hover:bg-[#f8f7fc] text-[#756d8d]"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBanner(banner)}
                            className="w-10 h-10 rounded-full border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Upload Prompt' && (
              <div className="flex flex-col gap-8">
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Upload New Prompt</h1>
                    <p className="text-[#756d8d] dark:text-[#afa6c8] mt-1 font-medium">Add a new prompt with image to the platform</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowBulkModal(true)}
                      className="glass-button px-6 py-2.5 font-bold text-sm text-[#171421] dark:text-white"
                    >
                      Import Bulk
                    </button>
                    <button 
                      onClick={resetForm}
                      className="px-6 py-2.5 rounded-full bg-[#171421] dark:bg-white text-white dark:text-[#171421] font-bold text-sm shadow-xl shadow-black/10 hover:scale-105 transition-transform"
                    >
                      Reset Form
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
                  <div className="flex flex-col gap-8">
                    <section className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm">
                      <div className="flex flex-col gap-10">
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <ImagePlus className="w-4 h-4" />
                              </div>
                              1. Image Details
                            </h3>
                            <Info className="w-4 h-4 text-[#756d8d] opacity-40" />
                          </div>

                          <div className="p-4 rounded-[2rem] border-2 border-dashed border-[#e9e2f3] dark:border-white/10 bg-[#f8f7fc]/50 dark:bg-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-8 items-center">
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={cn(
                                  "h-24 rounded-2xl border-2 border-white dark:border-white/10 shadow-xl shadow-primary/5 cursor-pointer group relative overflow-hidden flex flex-col items-center justify-center bg-white dark:bg-white/10 transition-all hover:scale-[1.02]",
                                  imagePreview ? "ring-2 ring-primary/20" : ""
                                )}
                              >
                                {imagePreview ? (
                                  <div className="relative w-full h-full group/preview">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImageFile(null);
                                        setImagePreview('');
                                        setDetectedRatio('Not Uploaded');
                                        setCssRatio('');
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                      }}
                                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all shadow-lg hover:scale-110"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center text-center p-2">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-3">
                                      <Plus className="w-6 h-6" />
                                    </div>
                                    <p className="text-[11px] font-bold text-[#171421] dark:text-white">Click to upload</p>
                                    <p className="text-[9px] font-medium text-[#756d8d] mt-1 uppercase">PNG, JPG up to 10MB</p>
                                  </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => selectImage(e.target.files?.[0] || null)} />
                              </div>

                              <div className="flex flex-col gap-4">
                                <div>
                                  <p className="text-sm font-bold text-[#171421] dark:text-white">PNG, JPG up to 10MB</p>
                                  <p className="text-[11px] font-medium text-[#756d8d] mt-2">Recommended size:<br />1024x1536 or higher</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="h-12 rounded-2xl border border-[#e9e2f3] dark:border-white/10 flex items-center justify-between px-5 bg-white dark:bg-white/5">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="text-[11px] font-bold">Detected: {detectedRatio}</span>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                          <h3 className="text-lg font-bold flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                              <Edit3 className="w-4 h-4" />
                            </div>
                            2. Prompt Details
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider">Title</label>
                              <input 
                                value={form.title}
                                onChange={(e) => updateForm('title', e.target.value)}
                                placeholder="Enter prompt title..."
                                className="glass-input h-12 text-sm"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider">Category</label>
                              <div className="relative">
                                <select 
                                  value={form.category}
                                  onChange={(e) => updateForm('category', e.target.value)}
                                  className="glass-input h-12 text-sm appearance-none pr-10"
                                >
                                  <option value="">Select category</option>
                                  {(categories.length > 0 ? categories : STATIC_CATEGORIES.map((name, id) => ({ id, name }))).map((c: any) => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756d8d]" />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider">Prompt</label>
                            <div className="relative">
                              <textarea 
                                value={form.prompt_text}
                                onChange={(e) => updateForm('prompt_text', e.target.value)}
                                placeholder="Enter your main prompt..."
                                rows={4}
                                className="glass-input p-5 text-sm resize-none"
                                required
                              />
                              <span className="absolute bottom-4 right-5 text-[10px] font-bold opacity-30">{form.prompt_text.length} / 2000</span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider">Negative Prompt</label>
                              <span className="text-[10px] font-medium opacity-40">(Optional)</span>
                            </div>
                            <div className="relative">
                              <textarea 
                                value={form.negative_prompt}
                                onChange={(e) => updateForm('negative_prompt', e.target.value)}
                                placeholder="Enter negative prompt (things to avoid)..."
                                rows={3}
                                className="glass-input p-5 text-sm resize-none"
                              />
                              <span className="absolute bottom-4 right-5 text-[10px] font-bold opacity-30">{form.negative_prompt.length} / 2000</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider">Visibility</label>
                              <div className="relative">
                                <select 
                                  value={form.visibility}
                                  onChange={(e) => updateForm('visibility', e.target.value)}
                                  className="glass-input h-12 text-sm appearance-none pr-10"
                                >
                                  <option value="Public">Public</option>
                                  <option value="Hidden">Hidden</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756d8d]" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider">Generated With</label>
                              <div className="relative">
                                <select 
                                  value={form.tool || 'Other'}
                                  onChange={(e) => updateForm('tool', e.target.value)}
                                  className="glass-input h-12 text-sm appearance-none pr-10"
                                >
                                  {['ChatGPT', 'Gemini', 'Grok', 'Claude', 'Midjourney', 'Midjourney v6', 'DALL-E 3', 'Stable Diffusion', 'SDXL', 'Niji Journey', 'Leonardo AI', 'Other'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756d8d]" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] font-bold text-[#171421] dark:text-white uppercase tracking-wider">Tags</label>
                              <input 
                                value={form.tags}
                                onChange={(e) => updateForm('tags', e.target.value)}
                                placeholder="Add tags..."
                                className="glass-input h-12 text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div 
                              onClick={() => updateForm('featured', !form.featured)}
                              className="bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:border-primary/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", form.featured ? "bg-primary text-white" : "bg-white dark:bg-white/10 text-[#756d8d]")}>
                                  <Star className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-bold">Featured</span>
                                  <span className="text-[10px] font-medium text-[#756d8d]">Show on homepage</span>
                                </div>
                              </div>
                              <div className={cn("w-10 h-5 rounded-full relative transition-colors duration-300", form.featured ? "bg-primary" : "bg-gray-200 dark:bg-white/10")}>
                                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm", form.featured ? "left-6" : "left-1")} />
                              </div>
                            </div>

                            <div 
                              onClick={() => updateForm('trending', !form.trending)}
                              className="bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all hover:border-primary/30"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", form.trending ? "bg-orange-500 text-white" : "bg-white dark:bg-white/10 text-[#756d8d]")}>
                                  <Flame className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[13px] font-bold">Trending</span>
                                  <span className="text-[10px] font-medium text-[#756d8d]">Mark as trending</span>
                                </div>
                              </div>
                              <div className={cn("w-10 h-5 rounded-full relative transition-colors duration-300", form.trending ? "bg-primary" : "bg-gray-200 dark:bg-white/10")}>
                                <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm", form.trending ? "left-6" : "left-1")} />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4">
                            <button 
                              type="button"
                              className="flex-1 h-12 rounded-xl border border-[#e9e2f3] dark:border-white/10 font-bold text-primary hover:bg-[#f8f7fc] dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Draft
                            </button>
                            <button 
                              type="submit"
                              disabled={saving}
                              className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-4 h-4" />}
                              {editingPrompt ? 'Update Changes' : 'Publish Prompt'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </section>
                  </div>

                  <div className="flex flex-col gap-8">
                    <section className="flex flex-col gap-4">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold">Live Preview</h3>
                        <p className="text-[10px] font-medium text-[#756d8d]">See how it looks on homepage</p>
                      </div>
                      
                      <div 
                        className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[1.8rem] overflow-hidden group shadow-sm transition-all duration-500"
                        style={cssRatio ? { aspectRatio: cssRatio } : {}}
                      >
                        <div className={cn("relative overflow-hidden w-full h-full", !cssRatio && "aspect-square")}>
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = FALLBACK_IMAGE;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#f8f7fc] dark:bg-white/5 flex flex-col items-center justify-center text-[#756d8d] p-6 text-center">
                              <ImagePlus className="w-12 h-12 mb-4 opacity-20" />
                              <p className="text-sm font-bold opacity-40">Upload an image to see preview</p>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                            <div className="flex items-center justify-between gap-3 mb-2">
                               <h4 className="text-sm font-bold text-white truncate flex-1">{form.title || 'Your Prompt Title'}</h4>
                               <div className="px-2 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold uppercase">
                                 {form.category}
                               </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-white/80 text-[10px] font-bold">
                                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> 2.4K</span>
                                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 342</span>
                              </div>
                              <Bookmark className="w-4 h-4 text-white/60" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-6 mt-2">
                        <div className="px-1">
                          <h2 className="text-xl font-bold tracking-tight text-[#171421] dark:text-white line-clamp-2">
                            {form.title || 'Your Prompt Title'}
                          </h2>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-widest">
                              <Sparkles className="w-3 h-3" />
                              Generated with {form.tool}
                            </p>
                            {form.tags && form.tags.split(',').map((tag, i) => (
                              <span key={i} className="text-[10px] font-bold text-[#756d8d] dark:text-[#afa6c8] uppercase tracking-widest opacity-60">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5 shadow-sm backdrop-blur-xl">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img src="/brand/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                              <h3 className="text-[15px] font-bold text-[#3a344c] dark:text-white">Prompt</h3>
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-[#e8e2f5] dark:border-white/10 bg-white/70 dark:bg-white/10 px-4 py-1.5 text-[11px] font-bold text-primary">
                              <Copy className="h-4 w-4" />
                              Copy
                            </div>
                          </div>
                          <div className="rounded-[1.3rem] border border-[#ebe6f4] dark:border-white/5 bg-white/50 dark:bg-black/20 p-4.5 text-[12px] font-medium leading-relaxed text-[#4a445f] dark:text-[#afa6c8] min-h-[130px]">
                            {form.prompt_text || 'Your main prompt will appear here...'}
                          </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-white/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4.5 shadow-sm backdrop-blur-xl">
                          <div className="mb-3.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f05aa8]/12 text-[#f05aa8]">
                                <Minus className="h-3.5 w-3.5" />
                              </span>
                              <h3 className="text-[14px] font-bold text-[#3a344c] dark:text-white">Negative Prompt</h3>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full border border-[#e8e2f5] dark:border-white/10 bg-white/70 dark:bg-white/10 px-3.5 py-1 text-[11px] font-bold text-primary">
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </div>
                          </div>
                          <div className="rounded-[1.3rem] border border-[#ebe6f4] dark:border-white/5 bg-white/50 dark:bg-black/20 p-4.5 text-[12px] font-medium leading-relaxed text-[#4a445f] dark:text-[#afa6c8] min-h-[80px]">
                            {form.negative_prompt || 'No negative prompt provided...'}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="glass-panel p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 overflow-hidden relative">
                      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                      <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                        <Flame className="w-4 h-4" />
                        Next Milestone
                      </h4>
                      <p className="text-xs font-bold text-[#171421] dark:text-white mb-4">Get 50 total prompts to unlock "Elite Contributor" badge.</p>
                      <div className="h-2 w-full bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min((prompts.length / 50) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-[#756d8d] mt-2 text-right">{prompts.length} / 50 Prompts</p>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Manage Prompts' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Manage Prompts</h1>
                    <p className="text-[13px] text-[#756d8d] dark:text-[#afa6c8] font-medium">View, edit and manage all uploaded prompts</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#756d8d] group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 rounded-xl border border-[#e9e2f3] dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-4 text-[13px] font-bold outline-none focus:ring-2 focus:ring-primary/20 w-64"
                      />
                    </div>
                    <select 
                      value={filter} 
                      onChange={(e) => setFilter(e.target.value)}
                      className="h-10 px-4 rounded-xl border border-[#e9e2f3] dark:border-white/10 bg-white dark:bg-white/5 text-[13px] font-bold outline-none"
                    >
                      <option value="All">All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <button 
                      onClick={() => setShowBulkModal(true)}
                      className="h-10 px-5 rounded-xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] text-[13px] font-bold flex items-center gap-2 hover:bg-white hover:text-primary transition-all"
                    >
                      <Layers className="w-4 h-4" />
                      Bulk Import
                    </button>
                    <button className="h-10 px-5 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="font-bold text-[#756d8d]">Fetching your masterpiece gallery...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-5">
                    {filteredPrompts.map((prompt, index) => (
                      <motion.article 
                        key={prompt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[1.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src={prompt.image_url} 
                            alt={prompt.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = FALLBACK_IMAGE;
                            }}
                          />
                          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/80 dark:bg-black/60 backdrop-blur-md text-[9px] font-bold text-[#171421] dark:text-white uppercase">
                            {prompt.category}
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="font-bold text-[#171421] dark:text-white truncate text-sm leading-tight mb-3">
                            {prompt.title}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-[10px] font-bold text-[#756d8d] mb-4">
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              {prompt.views || 0}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5" />
                              {prompt.likes || 0}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 border-t border-[#e9e2f3] dark:border-white/5 pt-3">
                            <button onClick={() => editPrompt(prompt)} className="flex flex-col items-center gap-1 group/btn">
                              <div className="w-8 h-8 rounded-lg bg-[#f8f7fc] dark:bg-white/5 flex items-center justify-center text-[#756d8d] group-hover/btn:bg-primary group-hover/btn:text-white transition-all">
                                <Edit3 className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[8px] font-bold uppercase text-[#756d8d]">Edit</span>
                            </button>
                            <button onClick={() => toggleFeatured(prompt)} className="flex flex-col items-center gap-1 group/btn">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", prompt.featured ? "bg-amber-100 text-amber-500" : "bg-[#f8f7fc] dark:bg-white/5 text-[#756d8d] group-hover/btn:bg-amber-500 group-hover/btn:text-white")}>
                                <Star className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[8px] font-bold uppercase text-[#756d8d]">Feature</span>
                            </button>
                            <button onClick={() => toggleTrending(prompt)} className="flex flex-col items-center gap-1 group/btn">
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", prompt.trending ? "bg-orange-100 text-orange-500" : "bg-[#f8f7fc] dark:bg-white/5 text-[#756d8d] group-hover/btn:bg-orange-500 group-hover/btn:text-white")}>
                                <div className="relative">
                                  <Flame className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <span className="text-[8px] font-bold uppercase text-[#756d8d]">Trending</span>
                            </button>
                            <button onClick={() => deletePrompt(prompt)} className="flex flex-col items-center gap-1 group/btn">
                              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 group-hover/btn:bg-red-500 group-hover/btn:text-white transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[8px] font-bold uppercase text-[#756d8d]">Delete</span>
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Categories' && (
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Categories</h1>
                    <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium">Manage prompt categories and taxonomy</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-2xl border border-[#e9e2f3] dark:border-white/10 shadow-sm">
                    <label className="flex items-center gap-2 cursor-pointer px-2 text-[#756d8d] hover:text-primary transition-colors">
                      <ImageIcon className="w-5 h-5" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="new-category-image"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const label = e.currentTarget.parentElement;
                            if (label) label.classList.add('text-primary');
                          }
                        }}
                      />
                    </label>
                    <input 
                      id="new-category-input"
                      placeholder="Category name..."
                      className="bg-transparent border-none outline-none px-4 py-2 text-sm font-medium w-48"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          const fileInput = document.getElementById('new-category-image') as HTMLInputElement;
                          if (input.value) {
                            addCategory(input.value, fileInput.files?.[0]);
                            input.value = '';
                            fileInput.value = '';
                            fileInput.parentElement?.classList.remove('text-primary');
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-category-input') as HTMLInputElement;
                        const fileInput = document.getElementById('new-category-image') as HTMLInputElement;
                        if (input.value) {
                          addCategory(input.value, fileInput.files?.[0]);
                          input.value = '';
                          fileInput.value = '';
                          fileInput.parentElement?.classList.remove('text-primary');
                        }
                      }}
                      className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat) => (
                    <div key={cat.id} className="relative bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 p-6 rounded-[2rem] flex flex-col group hover:border-primary/30 transition-all overflow-hidden">
                      {cat.image_url && (
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                          <img 
                            src={cat.image_url} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = FALLBACK_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#171421] to-transparent" />
                        </div>
                      )}
                      <div className="relative z-10 flex items-center justify-between w-full mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                            {cat.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#171421] dark:text-white">{cat.name}</p>
                            <p className="text-[10px] font-bold text-[#756d8d] uppercase tracking-wider">
                              {prompts.filter(p => p.category === cat.name).length} Prompts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => {
                              const newName = prompt('Enter new name for ' + cat.name, cat.name);
                              if (newName && newName !== cat.name) updateCategory(cat.id, newName);
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#756d8d] hover:bg-[#756d8d]/10"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete ' + cat.name + '?')) {
                                deleteCategory(cat.id);
                              }
                            }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="relative z-10">
                        <label className="text-xs font-bold text-primary flex items-center gap-2 cursor-pointer w-max hover:underline">
                          <ImageIcon className="w-4 h-4" />
                          Update Cover
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateCategory(cat.id, cat.name, file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Featured Prompts' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Featured Content</h1>
                  <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium">Manage items currently showcased on the homepage</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {prompts.filter(p => p.featured).map((prompt) => (
                    <div key={prompt.id} className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2rem] overflow-hidden group">
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img 
                          src={prompt.image_url} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between gap-3">
                        <p className="font-bold text-sm truncate">{prompt.title}</p>
                        <button 
                          onClick={() => toggleFeatured(prompt)}
                          className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all"
                        >
                          Unfeature
                        </button>
                      </div>
                    </div>
                  ))}
                  {prompts.filter(p => p.featured).length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <Star className="w-16 h-16 text-[#756d8d] opacity-20 mx-auto mb-4" />
                      <p className="font-bold text-[#756d8d]">No featured prompts yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}



            {activeTab === 'Analytics' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Analytics</h1>
                  <p className="text-[13px] text-[#756d8d] dark:text-[#afa6c8] font-medium">Deep dive into your platform's performance metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Views', value: '124.5k', change: '+12%', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Likes', value: '12.8k', change: '+8%', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                    { label: 'New Users', value: '842', change: '+18%', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Active Sessions', value: '2.1k', change: '+5%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
                  ].map((stat, i) => (stat && (
                    <div key={i} className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 p-6 rounded-[2rem] hover:border-primary/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-[#756d8d] uppercase tracking-wider">{stat.label}</p>
                      <h3 className="text-2xl font-bold mt-1 text-[#171421] dark:text-white">{stat.value}</h3>
                    </div>
                  )))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 p-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold">Traffic Source</h3>
                      <button className="text-[10px] font-bold text-primary uppercase">View Details</button>
                    </div>
                    <div className="flex flex-col gap-6">
                      {[
                        { name: 'Direct', value: 45, color: 'bg-primary' },
                        { name: 'Social Media', value: 30, color: 'bg-blue-500' },
                        { name: 'Search Engines', value: 15, color: 'bg-green-500' },
                        { name: 'Others', value: 10, color: 'bg-amber-500' },
                      ].map((source, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-[#756d8d]">{source.name}</span>
                            <span>{source.value}%</span>
                          </div>
                          <div className="h-2 w-full bg-[#f8f7fc] dark:bg-white/5 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", source.color)} style={{ width: `${source.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 p-8 rounded-[2.5rem]">
                    <h3 className="text-xl font-bold mb-8">Device Usage</h3>
                    <div className="flex items-center justify-center py-4">
                      <div className="relative w-48 h-48 rounded-full border-8 border-primary flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold">72%</p>
                          <p className="text-[10px] font-bold text-[#756d8d] uppercase">Mobile</p>
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-t-blue-500 rounded-full rotate-45" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-8 mt-8">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-[11px] font-bold">Mobile (72%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-[11px] font-bold">Desktop (28%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 p-8 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Top Performing Prompts</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 hover:text-primary transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">View All</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-bold text-[#756d8d] uppercase tracking-wider border-b border-[#e9e2f3] dark:border-white/10">
                          <th className="pb-4 pl-2">Prompt</th>
                          <th className="pb-4 text-center">Category</th>
                          <th className="pb-4 text-center">Views</th>
                          <th className="pb-4 text-center">Likes</th>
                          <th className="pb-4 text-right pr-2">Growth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e9e2f3] dark:divide-white/5">
                        {prompts.slice(0, 5).map((p, i) => (
                          <tr key={i} className="group hover:bg-primary/5 transition-colors">
                            <td className="py-4 pl-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                  <img 
                                    src={p.image_url} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = FALLBACK_IMAGE;
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-bold truncate max-w-[200px]">{p.title}</span>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-[10px] font-bold bg-[#f8f7fc] dark:bg-white/5 px-2 py-1 rounded-md text-[#756d8d]">
                                {p.category}
                              </span>
                            </td>
                            <td className="py-4 text-center text-sm font-bold">{p.views || 0}</td>
                            <td className="py-4 text-center text-sm font-bold text-pink-500">{p.likes || 0}</td>
                            <td className="py-4 text-right pr-2">
                              <span className="text-[11px] font-bold text-green-500">+{Math.floor(Math.random() * 50) + 10}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Help & Feedback' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Help & Feedback</h1>
                  <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium">Manage user inquiries and platform feedback</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    {feedbacks.length > 0 ? (
                      feedbacks.map((item) => (
                        <div key={item.id} className={cn("p-6 rounded-[2rem] border transition-all cursor-pointer group", 
                          item.status === 'unread' ? "bg-white dark:bg-white/10 border-primary/20 shadow-lg shadow-primary/5" : "bg-[#f8f7fc] dark:bg-white/5 border-[#e9e2f3] dark:border-white/10")}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {item.user.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm">{item.user}</h4>
                                <p className="text-[10px] text-[#756d8d] font-medium">{item.email}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-[#756d8d]">{new Date(item.created_at).toLocaleString()}</span>
                          </div>
                          <h5 className="font-bold text-sm mb-2 text-[#171421] dark:text-white">{item.subject}</h5>
                          <p className="text-xs text-[#756d8d] leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                            {item.message}
                          </p>
                          <div className="mt-4 flex items-center gap-3 pt-4 border-t border-[#e9e2f3] dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="px-4 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold">Reply</button>
                            <button 
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await axios.delete(`${API_BASE_URL}/api/feedback/${item.id}`);
                                  setFeedbacks(feedbacks.filter(f => f.id !== item.id));
                                } catch {
                                  alert('Failed to archive feedback');
                                }
                              }}
                              className="px-4 py-1.5 rounded-lg bg-white dark:bg-white/10 text-[10px] font-bold"
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white dark:bg-white/5 border border-dashed border-[#e9e2f3] dark:border-white/20 rounded-[2rem] p-20 text-center">
                         <HelpCircle className="w-12 h-12 text-[#756d8d] opacity-20 mx-auto mb-4" />
                         <p className="font-bold text-[#756d8d]">No feedback messages found</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-8">
                    <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-[2.5rem] text-white">
                      <h3 className="text-lg font-bold mb-1">Feedback Score</h3>
                      <p className="text-white/70 text-xs font-medium mb-6">Based on user satisfaction ratings.</p>
                      <div className="flex items-center justify-between">
                         <div>
                            <p className="text-3xl font-bold">4.8/5</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Avg Rating</p>
                         </div>
                         <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center">
                            <Heart className="w-8 h-8 fill-current" />
                         </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-8">
                      <h3 className="text-sm font-bold mb-4">Support Stats</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#756d8d]">Open Tickets</span>
                          <span className="text-xs font-bold">12</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#756d8d]">Avg Response Time</span>
                          <span className="text-xs font-bold">45m</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#756d8d]">Resolved Today</span>
                          <span className="text-xs font-bold">24</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Settings' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Site Settings</h1>
                  <p className="text-[13px] text-[#756d8d] dark:text-[#afa6c8] font-medium">Configure your platform's global settings</p>
                </div>

                <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-10 max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Site Name</label>
                        <input 
                          value={settingsForm.siteName}
                          onChange={(e) => setSettingsForm({...settingsForm, siteName: e.target.value})}
                          className="glass-input" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Site Description</label>
                        <textarea 
                          value={settingsForm.siteDesc}
                          onChange={(e) => setSettingsForm({...settingsForm, siteDesc: e.target.value})}
                          className="glass-input min-h-[100px] py-4" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Contact Email</label>
                        <input 
                          value={settingsForm.contactEmail}
                          onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})}
                          className="glass-input" 
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-8">
                      <div className="p-6 rounded-3xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 flex flex-col gap-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#756d8d]">Visibility & Access</h3>
                        
                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm font-bold">Maintenance Mode</span>
                          <input 
                            type="checkbox" 
                            checked={settingsForm.maintenanceMode}
                            onChange={(e) => setSettingsForm({...settingsForm, maintenanceMode: e.target.checked})}
                            className="w-5 h-5 accent-primary" 
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer">
                          <span className="text-sm font-bold">Allow Public Uploads</span>
                          <input 
                            type="checkbox" 
                            checked={settingsForm.publicUploads}
                            onChange={(e) => setSettingsForm({...settingsForm, publicUploads: e.target.checked})}
                            className="w-5 h-5 accent-primary" 
                          />
                        </label>
                      </div>

                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={handleSaveSettings}
                          className="w-full h-14 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                        >
                          {isLaunching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Save Changes
                        </button>
                        <button className="w-full h-14 rounded-2xl border border-[#e9e2f3] dark:border-white/10 font-bold text-[#756d8d] hover:bg-white/5 transition-colors">
                          Restore Defaults
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'System Logs' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">System Logs</h1>
                  <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium">Monitor all administrative actions and system events</p>
                </div>

                <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8f7fc] dark:bg-white/5">
                        <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-[#756d8d]">Action</th>
                        <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-[#756d8d]">Admin</th>
                        <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-[#756d8d]">Details</th>
                        <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-[#756d8d]">Time</th>
                        <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-[#756d8d]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e9e2f3] dark:divide-white/5">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-primary/5 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold text-[#171421] dark:text-white">{log.action}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">A</div>
                              <span className="text-sm font-medium">{log.user}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-[#756d8d]">{log.details}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-medium text-[#756d8d]">{log.time}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">Success</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Default fallback for other tabs */}
            {!['Dashboard', 'Upload Prompt', 'Manage Prompts', 'Categories', 'Featured Prompts', 'Analytics', 'Settings', 'System Logs'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <div className="w-20 h-20 rounded-3xl bg-[#f8f7fc] dark:bg-white/5 flex items-center justify-center text-[#756d8d]">
                    <Layers className="w-10 h-10 opacity-20" />
                 </div>
                 <h2 className="text-xl font-bold">{activeTab} Section</h2>
                 <p className="text-[#756d8d]">This module is coming soon in the next update.</p>
              </div>
            )}
          </div>
        )}
      </AdminLayout>

      <AnimatePresence>
        {editingPrompt && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-[#171421] shadow-2xl z-[70] overflow-y-auto"
            >
              <div className="p-8 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Edit Prompt</h2>
                    <p className="text-sm text-[#756d8d]">Update the prompt details and image</p>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full group/edit-preview">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setImagePreview('');
                            setDetectedRatio('Not Uploaded');
                            setCssRatio('');
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/edit-preview:opacity-100 transition-all shadow-lg hover:scale-110 z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/edit-preview:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                          Change Image
                        </div>
                      </div>
                    ) : (
                      <Upload className="w-8 h-8 text-primary" />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold">Title</label>
                    <input 
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold">Category</label>
                      <select 
                        value={form.category}
                        onChange={(e) => updateForm('category', e.target.value)}
                        className="glass-input h-12"
                      >
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold">Visibility</label>
                      <select 
                        value={form.visibility}
                        onChange={(e) => updateForm('visibility', e.target.value)}
                        className="glass-input h-12"
                      >
                        <option value="Public">Public</option>
                        <option value="Hidden">Hidden</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold">Prompt</label>
                    <textarea 
                      value={form.prompt_text}
                      onChange={(e) => updateForm('prompt_text', e.target.value)}
                      rows={5}
                      className="glass-input resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold">Negative Prompt</label>
                    <textarea 
                      value={form.negative_prompt}
                      onChange={(e) => updateForm('negative_prompt', e.target.value)}
                      rows={3}
                      className="glass-input resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold">Tags</label>
                    <input 
                      value={form.tags}
                      onChange={(e) => updateForm('tags', e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.featured} 
                        onChange={(e) => updateForm('featured', e.target.checked)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-bold">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={form.trending} 
                        onChange={(e) => updateForm('trending', e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <span className="text-sm font-bold">Trending</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-white dark:bg-[#171421] pb-8">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Update Changes
                    </button>
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="px-6 h-14 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Campaign Launcher Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLaunching && setShowCampaignModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[80]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-[#171421] rounded-[2.5rem] shadow-2xl z-[90] overflow-hidden"
            >
              <div className="p-8">
                {campaignStep === 1 && (
                  <div className="flex flex-col gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                        <Share2 className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold">Choose Platform</h2>
                      <p className="text-sm text-[#756d8d] mt-1 text-balance">Where would you like to promote your best prompts today?</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'ig', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                        { id: 'x', name: 'X / Twitter', icon: Twitter, color: 'text-black dark:text-white', bg: 'bg-gray-100 dark:bg-white/10' },
                        { id: 'pi', name: 'Pinterest', icon: Trophy, color: 'text-red-600', bg: 'bg-red-600/10' },
                      ].map((p) => (
                        <button 
                          key={p.id}
                          onClick={() => setCampaignStep(2)}
                          className="flex flex-col items-center gap-3 p-6 rounded-3xl border border-[#e9e2f3] dark:border-white/10 hover:border-primary/30 transition-all hover:bg-primary/5 group"
                        >
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", p.bg, p.color)}>
                            <p.icon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-bold">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {campaignStep === 2 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Select Prompts</h2>
                        <p className="text-xs text-[#756d8d]">We've pre-selected your top performers</p>
                      </div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                        {selectedPromptsForCampaign.length} Selected
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                      {prompts.slice(0, 10).map((prompt) => (
                        <div 
                          key={prompt.id}
                          onClick={() => {
                            if (selectedPromptsForCampaign.includes(prompt.id)) {
                              setSelectedPromptsForCampaign(prev => prev.filter(id => id !== prompt.id));
                            } else {
                              setSelectedPromptsForCampaign(prev => [...prev, prompt.id]);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-2xl border transition-all cursor-pointer",
                            selectedPromptsForCampaign.includes(prompt.id)
                              ? "border-primary bg-primary/5"
                              : "border-[#e9e2f3] dark:border-white/10"
                          )}
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={prompt.image_url} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{prompt.title}</p>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-[#756d8d] mt-0.5">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {prompt.views}</span>
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {prompt.likes}</span>
                            </div>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                            selectedPromptsForCampaign.includes(prompt.id)
                              ? "bg-primary border-primary text-white"
                              : "border-[#e9e2f3] dark:border-white/10"
                          )}>
                            {selectedPromptsForCampaign.includes(prompt.id) && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button 
                        onClick={() => setCampaignStep(1)}
                        className="flex-1 h-12 rounded-2xl border border-[#e9e2f3] dark:border-white/10 font-bold text-sm"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => {
                          setIsLaunching(true);
                          setTimeout(() => {
                            setCampaignStep(3);
                            setIsLaunching(false);
                          }, 2500);
                        }}
                        className="flex-[2] h-12 rounded-2xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                      >
                        {isLaunching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Launch Campaign</>}
                      </button>
                    </div>
                  </div>
                )}

                {campaignStep === 3 && (
                  <div className="flex flex-col items-center gap-6 py-10 text-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-24 h-24 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/30"
                    >
                      <Check className="w-12 h-12" strokeWidth={3} />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold">Campaign Launched!</h2>
                      <p className="text-[#756d8d] mt-2 max-w-xs mx-auto">Your top prompts are now being promoted across your selected platforms.</p>
                    </div>
                    <button 
                      onClick={() => setShowCampaignModal(false)}
                      className="mt-4 px-10 py-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold hover:scale-105 transition-transform"
                    >
                      Awesome!
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#1c1a26] rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#e9e2f3] dark:border-white/10"
            >
              <div className="p-8 border-b border-[#e9e2f3] dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Bulk Import</h3>
                  <p className="text-xs text-[#756d8d] font-medium mt-1">Paste JSON or upload an Excel/CSV file to import prompts.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 cursor-pointer hover:bg-primary/5 transition-all">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-[#756d8d]">Upload Excel</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls, .csv" 
                      className="hidden" 
                      onChange={handleExcelImport}
                    />
                  </label>
                  <button onClick={() => setShowBulkModal(false)} className="w-10 h-10 rounded-xl bg-[#f8f7fc] dark:bg-white/5 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-8">
                <textarea 
                  id="bulk-json-input"
                  rows={12}
                  placeholder='[{"title": "Sample", "image_url": "...", "prompt_text": "...", "category": "Anime", "tool": "ChatGPT", "tags": "neon, dark", "visibility": "public"}]'
                  className="w-full glass-input p-6 text-xs font-mono resize-none focus:ring-primary/20"
                />
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={() => setShowBulkModal(false)} className="px-6 py-3 rounded-xl font-bold text-[#756d8d]">Cancel</button>
                    <button 
                    onClick={async () => {
                      const input = document.getElementById('bulk-json-input') as HTMLTextAreaElement;
                      try {
                        const data = JSON.parse(input.value);
                        if (Array.isArray(data)) {
                          setIsLaunching(true);
                          let successCount = 0;
                          
                          for (const item of data) {
                            try {
                              const formData = new FormData();
                              formData.append('title', item.title || 'Untitled');
                              formData.append('category', item.category || 'Cinematic');
                              formData.append('model', item.tool || item.model || 'Promptro');
                              formData.append('prompt_text', item.prompt_text || item.prompt || '');
                              formData.append('negative_prompt', item.negative_prompt || '');
                              formData.append('tags', Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || ''));
                              formData.append('visibility', item.visibility || 'Public');
                              
                              // Note: Bulk import with URLs requires backend to support URL-based upload
                              // or frontend to fetch and proxy. For now, we assume these are existing prompts
                              // if they have an image_url, or we fail if no image.
                              if (item.image_url) {
                                formData.append('image_url', item.image_url);
                              } else if (item.image) {
                                formData.append('image_url', item.image);
                              }

                              await axios.post(API_URL, formData);
                              successCount++;
                            } catch (err) {
                              console.error('Failed to import one prompt:', item.title, err);
                            }
                          }

                          await fetchPrompts();
                          setIsLaunching(false);
                          setShowBulkModal(false);
                          setMessage(`Successfully imported ${successCount} prompts to database!`);
                          setTimeout(() => setMessage(''), 3000);
                        }
                      } catch (e) {
                        alert('Invalid JSON format!');
                        setIsLaunching(false);
                      }
                    }}
                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform flex items-center gap-2"
                    >
                      {isLaunching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Persist to Database'}
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <dialog id="banner-modal" className="modal backdrop:bg-black/60 backdrop:backdrop-blur-sm rounded-[2rem] p-0 w-full max-w-2xl bg-white dark:bg-[#1c1a26] shadow-2xl overflow-hidden border border-[#e9e2f3] dark:border-white/10 m-auto">
        <form method="dialog" className="p-8 border-b border-[#e9e2f3] dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{editingBanner ? 'Edit Banner' : 'Create Banner'}</h3>
            <p className="text-xs text-[#756d8d] font-medium mt-1">Design a premium homepage banner.</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-[#f8f7fc] dark:bg-white/5 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </form>
        <form onSubmit={(e) => {
          handleSaveBanner(e).then(() => {
            document.getElementById('banner-modal')?.closest('dialog')?.close();
          });
        }} className="p-8 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Tag Text</label>
              <input required type="text" value={bannerForm.tag_text} onChange={e => setBannerForm({...bannerForm, tag_text: e.target.value})} placeholder="+ NEW UPDATE" className="w-full glass-input" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Tag Icon (Emoji)</label>
              <input type="text" value={bannerForm.tag_icon} onChange={e => setBannerForm({...bannerForm, tag_icon: e.target.value})} placeholder="🔥" className="w-full glass-input" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Title</label>
              <input required type="text" value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} placeholder="Cinematic Style Pack Added!" className="w-full glass-input font-bold" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Subtitle</label>
              <textarea required value={bannerForm.subtitle} onChange={e => setBannerForm({...bannerForm, subtitle: e.target.value})} placeholder="Create stunning cinematic images..." className="w-full glass-input resize-none h-20" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Button Text</label>
              <input required type="text" value={bannerForm.button_text} onChange={e => setBannerForm({...bannerForm, button_text: e.target.value})} placeholder="Explore Now >" className="w-full glass-input" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Button Link</label>
              <input required type="text" value={bannerForm.button_link} onChange={e => setBannerForm({...bannerForm, button_link: e.target.value})} placeholder="/categories/cinematic" className="w-full glass-input" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Background Gradient</label>
              <select value={bannerForm.bg_gradient} onChange={e => setBannerForm({...bannerForm, bg_gradient: e.target.value})} className="w-full glass-input">
                <option value="from-[#e0e7ff] to-[#ede9fe]">Purple to Blue (Light)</option>
                <option value="from-[#ffedd5] to-[#fce7f3]">Orange to Pink (Light)</option>
                <option value="from-[#dcfce7] to-[#e0e7ff]">Green to Blue (Light)</option>
                <option value="from-primary/10 to-secondary/10">Brand Gradient (Light)</option>
                <option value="from-[#1e1b4b] to-[#312e81]">Deep Indigo (Dark)</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
               <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block w-full">Status</label>
               <label className="relative inline-flex items-center cursor-pointer mt-4">
                  <input type="checkbox" checked={bannerForm.is_active} onChange={e => setBannerForm({...bannerForm, is_active: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                  <span className="ml-3 text-sm font-bold">{bannerForm.is_active ? 'Active' : 'Hidden'}</span>
                </label>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider mb-2 block">Banner Image</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl border-[#e9e2f3] dark:border-white/10 bg-white/50 dark:bg-white/5 cursor-pointer hover:bg-[#f8f7fc] dark:hover:bg-white/10 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {bannerImagePreview ? (
                    <img src={bannerImagePreview} alt="Preview" className="h-24 w-auto object-contain rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-primary/60" />
                      <p className="text-sm font-bold text-[#756d8d]">Click to upload image</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBannerImageFile(file);
                    setBannerImagePreview(URL.createObjectURL(file));
                  }
                }} />
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3 pt-6 border-t border-[#e9e2f3] dark:border-white/10">
            <button type="button" onClick={() => document.getElementById('banner-modal')?.closest('dialog')?.close()} className="px-6 py-2.5 rounded-full font-bold text-[#756d8d] hover:bg-[#f8f7fc] transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="px-8 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Banner'}
            </button>
          </div>
        </form>
      </dialog>
    </ErrorBoundary>
  );
}
