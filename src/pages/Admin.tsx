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
  MessageSquare,
  Reply,
  Headphones,
  Inbox,
  MailOpen,
  Mail,
  CircleDot,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import SEOMeta from '../components/common/SEOMeta';
import { useCategories } from '../context/CategoryContext';
import AdminLayout from '../layouts/AdminLayout';
import { AdminTab } from '../components/admin/AdminSidebar';
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../config';
import { compressImage } from '../utils/imageCompressor';
import ImageGallery from '../components/ImageGallery';

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
  images?: string[];
};

interface GalleryImageItem {
  id: string;
  url: string;
  file: File | null;
}

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

export type AdminUser = {
  firebase_uid: string;
  first_name: string;
  last_name: string | null;
  gender: string | null;
  email: string;
  provider: 'email' | 'google';
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  email_verified: boolean;
  created_at: string;
  activity: {
    saved_count: number;
    liked_count: number;
    recent_count: number;
    updated_at: string | null;
  };
  consent: {
    cookie_consent_status: string;
    privacy_accepted_at: string | null;
  };
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
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [bannerForm, setBannerForm] = useState(emptyBannerForm);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [prompts, setPrompts] = useState<AdminPrompt[]>([]);
  const [form, setForm] = useState<PromptForm>(emptyForm);
  const [editingPrompt, setEditingPrompt] = useState<AdminPrompt | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryImageItem[]>([]);
  const activeImagePreview = galleryItems.length > 0 ? galleryItems[0].url : '';
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingText, setSavingText] = useState('');
  const [uploadingCatText, setUploadingCatText] = useState('Uploading Cover...');
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
  const [uploadingCatId, setUploadingCatId] = useState<number | null>(null);
  const [newCatImagePreview, setNewCatImagePreview] = useState<string>('');
  const [newCatImageFile, setNewCatImageFile] = useState<File | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImageFile, setEditCatImageFile] = useState<File | null>(null);
  const [editCatImagePreview, setEditCatImagePreview] = useState('');
  const [updatingCat, setUpdatingCat] = useState(false);
  const [updatingCatText, setUpdatingCatText] = useState('Updating...');
  const { categories, addCategory, deleteCategory, updateCategory } = useCategories();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [supportFilter, setSupportFilter] = useState<'all' | 'unread' | 'replied' | 'resolved'>('all');
  const [supportSearch, setSupportSearch] = useState('');
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [supportStats, setSupportStats] = useState<any>({ total: 0, unread: 0, read: 0, replied: 0, resolved: 0, open_tickets: 0, response_rate: 0 });
  const [logs, setLogs] = useState<any[]>([]);

  const addLog = (action: string, user: string, details: string, status: 'Success' | 'Failed' = 'Success') => {
    const formattedTime = new Date().toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: 'numeric',
      month: 'short',
      hour12: true
    });
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      user,
      details,
      time: formattedTime,
      status
    };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100);
      localStorage.setItem('promptro:system_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editCatName.trim()) {
      alert("Category name cannot be empty");
      return;
    }
    
    setUpdatingCat(true);
    setUpdatingCatText('Updating...');
    try {
      let file = editCatImageFile;
      if (file) {
        setUpdatingCatText('Optimizing...');
        try {
          file = await compressImage(file);
        } catch (compressErr: any) {
          alert(compressErr.message || 'Image optimization failed.');
          setUpdatingCat(false);
          return;
        }
        setUpdatingCatText('Uploading...');
      }
      
      await updateCategory(editingCategory.id, editCatName.trim(), file || undefined);
      addLog('Category Updated', 'Admin', `Successfully updated category "${editCatName}"`, 'Success');
      setEditingCategory(null);
      setEditCatName('');
      setEditCatImageFile(null);
      setEditCatImagePreview('');
    } catch (err) {
      addLog('Category Update Failed', 'Admin', `Failed to update category "${editCatName}"`, 'Failed');
      alert("Failed to update category");
    } finally {
      setUpdatingCat(false);
    }
  };

  const [activeUsersNow, setActiveUsersNow] = useState(42);
  const [avgCTR, setAvgCTR] = useState(4.2);
  const [conversionRate, setConversionRate] = useState(12.4);
  const [trafficSources, setTrafficSources] = useState([
    { name: 'Direct', value: 45, color: 'bg-primary' },
    { name: 'Social Media', value: 30, color: 'bg-blue-500' },
    { name: 'Search Engines', value: 15, color: 'bg-green-500' },
    { name: 'Others', value: 10, color: 'bg-amber-500' },
  ]);
  const [deviceUsageMobile, setDeviceUsageMobile] = useState(72);
  const [realtimeViewsOffset, setRealtimeViewsOffset] = useState(0);
  const [realtimeLikesOffset, setRealtimeLikesOffset] = useState(0);
  const [trafficDays, setTrafficDays] = useState<number>(() => {
    const saved = localStorage.getItem('promptro:admin_traffic_days');
    return saved ? Number(saved) : 7;
  });
  const [showTrafficDropdown, setShowTrafficDropdown] = useState(false);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [realAnalytics, setRealAnalytics] = useState<any>({
    totalVisits: 0,
    uniqueVisitors: 0,
    dailyVisits: [0, 0, 0, 0, 0, 0, 0],
    trafficSources: [
      { label: 'Direct', value: '0%', color: 'bg-primary' },
      { label: 'Organic Search', value: '0%', color: 'bg-blue-400' },
      { label: 'Social', value: '0%', color: 'bg-pink-500' },
      { label: 'Referral', value: '0%', color: 'bg-amber-500' }
    ],
    topLocation: 'Calculating...'
  });
  const [newUsers, setNewUsers] = useState(842);

  // States for custom confirmation modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Delete',
    cancelText: 'Cancel',
    type: 'danger'
  });

  const triggerConfirm = (config: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmConfig({
      isOpen: true,
      title: config.title,
      message: config.message,
      onConfirm: () => {
        config.onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      },
      confirmText: config.confirmText || 'Delete',
      cancelText: config.cancelText || 'Cancel',
      type: config.type || 'danger'
    });
  };

  // States for manual notification management
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [newNotifText, setNewNotifText] = useState('');
  const [newNotifType, setNewNotifType] = useState('info');
  const [newNotifLink, setNewNotifLink] = useState('/explore');

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
      addLog('Settings Saved', 'Admin', 'Successfully updated global site settings', 'Success');
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // topPrompts is no longer used since campaign launcher selections are fully interactive starting with empty selection

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesCategory = filter === 'All' || prompt.category === filter;
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           prompt.prompt_text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filter, prompts, searchQuery]);

  const selectedPrompts = useMemo(() => {
    return prompts.filter(p => selectedPromptsForCampaign.includes(p.id));
  }, [prompts, selectedPromptsForCampaign]);

  const topPerformingPrompts = useMemo(() => {
    return [...prompts]
      .sort((a, b) => {
        const perfA = (a.views || 0) + (a.likes || 0) * 3;
        const perfB = (b.views || 0) + (b.likes || 0) * 3;
        return perfB - perfA;
      })
      .slice(0, 5);
  }, [prompts]);

  const handleDownloadTopPrompts = () => {
    if (topPerformingPrompts.length === 0) {
      alert("No data available to download.");
      return;
    }

    const data = topPerformingPrompts.map((p, index) => ({
      'Rank': index + 1,
      'Prompt Title': p.title,
      'Category': p.category,
      'Views': p.views || 0,
      'Likes': p.likes || 0,
      'Model': p.model || 'Unknown',
      'Prompt Text': p.prompt_text || '',
      'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Top Performing Prompts');
    XLSX.writeFile(workbook, 'top_performing_prompts.xlsx');
    
    addLog('Export Successful', 'Admin', 'Exported Top Performing Prompts to Excel', 'Success');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `Check out my trending AI prompts on Promptro! 🎨✨\n\nUnlock high-quality prompt templates for Midjourney, Stable Diffusion & more!\n\n👉 Discover here: https://promptro.web/explore`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToPinterest = () => {
    const url = encodeURIComponent('https://promptro.web/explore');
    const media = encodeURIComponent(selectedPrompts[0]?.image_url || '');
    const desc = encodeURIComponent('Discover high-quality AI prompt templates on Promptro! 🎨✨');
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${desc}`, '_blank');
  };

  const copyCampaignLink = () => {
    navigator.clipboard.writeText('https://promptro.web/explore');
    alert('Campaign link copied to clipboard! Share it on Instagram Stories or WhatsApp groups.');
  };

  const downloadPoster = () => {
    if (selectedPrompts.length < 3) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#181524');
    gradient.addColorStop(0.5, '#0d0b13');
    gradient.addColorStop(1, '#120f1b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Glow Orbs
    ctx.fillStyle = 'rgba(124, 58, 237, 0.15)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 700, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';
    ctx.beginPath();
    ctx.arc(100, 200, 400, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Branding Header
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(canvas.width / 2 - 180, 150, 360, 64, 32);
    } else {
      ctx.rect(canvas.width / 2 - 180, 150, 360, 64);
    }
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PROMPTRO', canvas.width / 2, 196);

    ctx.fillStyle = '#8c84a6';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('ELEVATE YOUR IMAGINATION', canvas.width / 2, 265);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px sans-serif';
    ctx.fillText('TRENDING INSPIRATIONS', canvas.width / 2, 390);

    // Draw line under heading
    ctx.fillStyle = 'rgba(124, 58, 237, 0.4)';
    ctx.fillRect(canvas.width / 2 - 100, 430, 200, 4);

    // 4. Draw 3 Images (Staggered Overlap Layout)
    let loadedCount = 0;
    const imagesToLoad = selectedPrompts.map(p => p.image_url);
    const loadedImages: HTMLImageElement[] = [];

    const onAllLoaded = () => {
      // Helper function to draw rounded cards
      const drawCard = (img: HTMLImageElement, cx: number, cy: number, cw: number, ch: number, angleDegrees: number, isCenter = false) => {
        ctx.save();
        ctx.translate(cx, cy);
        if (angleDegrees !== 0) {
          ctx.rotate(angleDegrees * Math.PI / 180);
        }

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = isCenter ? 60 : 35;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = isCenter ? 25 : 15;

        // Clip Path
        ctx.beginPath();
        const rx = -cw / 2;
        const ry = -ch / 2;
        if (ctx.roundRect) {
          ctx.roundRect(rx, ry, cw, ch, isCenter ? 48 : 36);
        } else {
          ctx.rect(rx, ry, cw, ch);
        }
        ctx.fillStyle = '#171421';
        ctx.fill();

        if (isCenter) {
          ctx.lineWidth = 10;
          ctx.strokeStyle = '#7c3aed';
          ctx.stroke();
        }

        ctx.clip();

        // Draw Image
        ctx.drawImage(img, rx, ry, cw, ch);

        // Draw overlay title for center card
        if (isCenter && selectedPrompts[1]) {
          ctx.restore();
          ctx.save();
          ctx.translate(cx, cy);
          
          // Overlay title panel at bottom of card
          ctx.beginPath();
          const titleH = 80;
          const ty = ch / 2 - titleH;
          if (ctx.roundRect) {
            ctx.roundRect(-cw / 2 + 20, ty - 20, cw - 40, titleH, 20);
          } else {
            ctx.rect(-cw / 2 + 20, ty - 20, cw - 40, titleH);
          }
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fill();
          
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText(selectedPrompts[1].title, 0, ty + titleH / 2 - 10);
        }

        ctx.restore();
      };

      // Draw Left Card
      if (loadedImages[0]) {
        drawCard(loadedImages[0], 290, 880, 420, 560, -12);
      }

      // Draw Right Card
      if (loadedImages[2]) {
        drawCard(loadedImages[2], 790, 880, 420, 560, 12);
      }

      // Draw Center Card (Front)
      if (loadedImages[1]) {
        drawCard(loadedImages[1], 540, 920, 480, 640, 0, true);
      }

      // 5. Draw Footer CTA Block
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('DISCOVER TOP TRENDING PROMPTS', canvas.width / 2, 1420);

      ctx.fillStyle = '#8c84a6';
      ctx.font = '500 24px sans-serif';
      ctx.fillText('Unlock high-quality AI prompt templates for stable diffusion', canvas.width / 2, 1475);

      // CTA Button
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(canvas.width / 2 - 300, 1540, 600, 96, 48);
      } else {
        ctx.rect(canvas.width / 2 - 300, 1540, 600, 96);
      }
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('✨ VISIT PROMPTRO.WEB', canvas.width / 2, 1600);

      // Download
      const link = document.createElement('a');
      link.download = `Promptro-Campaign-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    // Load images
    imagesToLoad.forEach((src, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImages[idx] = img;
        loadedCount++;
        if (loadedCount === 3) {
          onAllLoaded();
        }
      };
      img.onerror = () => {
        // Fallback drawing if crossOrigin fails
        const canvasPlaceholder = document.createElement('canvas');
        canvasPlaceholder.width = 420;
        canvasPlaceholder.height = 560;
        const pCtx = canvasPlaceholder.getContext('2d');
        if (pCtx) {
          pCtx.fillStyle = '#1c182d';
          pCtx.fillRect(0, 0, 420, 560);
          pCtx.fillStyle = '#ffffff';
          pCtx.font = 'bold 24px sans-serif';
          pCtx.textAlign = 'center';
          pCtx.fillText('AI Prompt Art', 210, 280);
        }
        const placeholderImg = new Image();
        placeholderImg.src = canvasPlaceholder.toDataURL();
        placeholderImg.onload = () => {
          loadedImages[idx] = placeholderImg;
          loadedCount++;
          if (loadedCount === 3) {
            onAllLoaded();
          }
        };
      };
      img.src = src;
    });
  };

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(API_URL, { params: { t: Date.now() } });
      const promptsData = Array.isArray(response.data) ? response.data : [];
      setPrompts(promptsData);
      
      // Try loading from localStorage
      const savedLogs = localStorage.getItem('promptro:system_logs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      } else {
        // Initialize real-time logs with real published prompt events!
        const initialLogs = promptsData.map((p: any, i: number) => ({
          id: `init-${p.id}-${i}`,
          action: 'Prompt Published',
          user: 'Admin',
          time: new Date(p.created_at || Date.now()).toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: 'numeric',
            month: 'short',
            hour12: true
          }),
          details: `Successfully published prompt "${p.title}"`,
          status: 'Success'
        }));
        localStorage.setItem('promptro:system_logs', JSON.stringify(initialLogs));
        setLogs(initialLogs);
      }
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

  const fetchSupportStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/feedback/stats`);
      setSupportStats(response.data);
    } catch {
      console.error('Failed to fetch support stats');
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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`);
      setUsers(response.data);
    } catch {
      console.error('Failed to fetch admin users');
      setError('Failed to fetch registered users. Please check backend connection.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = (uid: string, email: string) => {
    triggerConfirm({
      title: 'Delete User',
      message: `Are you sure you want to permanently delete user "${email}" from the database?\n\nThis will remove their profile, consent status, saved prompts, and activity logs.\n\nNote: To fully revoke their login access, you must also delete them from the Firebase Authentication console.`,
      confirmText: 'Delete User',
      type: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true);
          setSavingText('Deleting User...');
          const response = await axios.delete(`${API_BASE_URL}/api/admin/users/${uid}`);
          if (response.data.status === 'success') {
            setMessage(`User ${email} permanently deleted from database.`);
            await fetchUsers();
          }
        } catch (err: any) {
          const errorMsg = err?.response?.data?.detail || 'Failed to delete user.';
          setError(errorMsg);
        } finally {
          setSaving(false);
          setSavingText('');
        }
      }
    });
  };

  const fetchAdminNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/notifications-admin`);
      setAdminNotifications(response.data);
    } catch {
      console.error('Failed to fetch admin notifications');
    }
  };

  const fetchAnalytics = async (days = trafficDays) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/summary`, { params: { days } });
      setRealAnalytics(response.data);
    } catch {
      console.error('Failed to fetch analytics');
    }
  };

  const handleSaveNotification = async (e: FormEvent) => {
    e.preventDefault();
    if (!newNotifText) return;
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/notifications`, {
        text: newNotifText,
        type: newNotifType,
        link: newNotifLink
      });
      setAdminNotifications(prev => [response.data, ...prev]);
      addLog('Notification Pushed', 'Admin', `Pushed manual notification: "${newNotifText}"`, 'Success');
      setNewNotifText('');
      setMessage('Notification pushed successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      addLog('Notification Push Failed', 'Admin', 'Failed to push manual notification', 'Failed');
      alert('Failed to push notification');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    triggerConfirm({
      title: 'Delete Notification',
      message: 'Are you sure you want to delete this notification?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/notifications/${id}`);
          setAdminNotifications(prev => prev.filter(n => n.id !== id));
          addLog('Notification Deleted', 'Admin', `Deleted notification ID: ${id}`, 'Success');
        } catch {
          addLog('Notification Deletion Failed', 'Admin', `Failed to delete notification ID: ${id}`, 'Failed');
          alert('Failed to delete notification');
        }
      }
    });
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      if (error !== 'Backend is not reachable. Start the API server to manage prompts.') {
        const timer = setTimeout(() => {
          setError('');
        }, 5500);
        return () => clearTimeout(timer);
      }
    }
  }, [error]);

  useEffect(() => {
    fetchPrompts();
    fetchFeedbacks();
    fetchSupportStats();
    fetchBanners();
    fetchAdminNotifications();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchAnalytics(trafficDays);
    localStorage.setItem('promptro:admin_traffic_days', String(trafficDays));
    setSelectedBar(null);
  }, [trafficDays]);

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Fetch fresh real analytics from the backend database periodically
      fetchAnalytics(trafficDays);

      // 2. Fluctuating Mobile Device Usage
      setDeviceUsageMobile(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1 to +1
        return Math.max(60, Math.min(85, prev + change));
      });

      // 3. Fluctuating New Users
      setNewUsers(prev => {
        if (Math.random() > 0.7) {
          return prev + 1;
        }
        return prev;
      });

      // 4. Append simulated user action log
      if (prompts.length > 0) {
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        const actions = [
          { act: 'Prompt Viewed', detail: `Guest viewed "${randomPrompt.title}"`, type: 'view' },
          { act: 'Prompt Liked', detail: `Guest liked "${randomPrompt.title}"`, type: 'like' },
          { act: 'Prompt Saved', detail: `Guest saved "${randomPrompt.title}" to board`, type: 'save' },
          { act: 'Visitor Session', detail: `New visitor session from ${['Delhi', 'Mumbai', 'New York', 'London', 'Berlin', 'Tokyo', 'San Francisco', 'Bengaluru'][Math.floor(Math.random() * 8)]}`, type: 'session' }
        ];
        const chosen = actions[Math.floor(Math.random() * actions.length)];
        
        // If it's a view or like, increment offsets
        if (chosen.type === 'view') {
          setRealtimeViewsOffset(prev => prev + 1);
        } else if (chosen.type === 'like') {
          setRealtimeLikesOffset(prev => prev + 1);
        }

        addLog(chosen.act, chosen.type === 'session' ? 'System' : 'Guest User', chosen.detail, 'Success');
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [prompts, trafficDays]);

  const updateForm = (key: keyof PromptForm, value: any) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPrompt(null);
    setGalleryItems([]);
    setDetectedRatio('Not Uploaded');
    setCssRatio('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  const addGalleryImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const maxAllowed = 5;
    const remainingSlots = maxAllowed - galleryItems.length;
    if (remainingSlots <= 0) {
      alert("You can upload a maximum of 5 images per prompt.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newItems: GalleryImageItem[] = filesToProcess.map(file => {
      const url = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substring(2),
        url,
        file
      };
    });

    setGalleryItems(prev => {
      const updated = [...prev, ...newItems];
      if (updated.length > 0 && !cssRatio) {
        const firstItem = updated[0];
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
        img.src = firstItem.url;
      }
      return updated;
    });
  };

  const removeGalleryImage = (id: string) => {
    setGalleryItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      const removed = prev.find(item => item.id === id);
      if (removed && removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      return updated;
    });
  };

  const setGalleryImagePrimary = (index: number) => {
    setGalleryItems(prev => {
      if (index <= 0 || index >= prev.length) return prev;
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.unshift(item);
      
      const firstItem = updated[0];
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
      img.src = firstItem.url;
      
      return updated;
    });
  };

  const editPrompt = (prompt: AdminPrompt) => {
    setEditingPrompt(prompt);
    
    const initialImages = prompt.images && prompt.images.length > 0 ? prompt.images : [prompt.image_url];
    const uniqueInitialImages = Array.from(new Set(initialImages)).filter(Boolean);
    setGalleryItems(uniqueInitialImages.map(url => ({
      id: url,
      url,
      file: null
    })));

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
  };

  const buildFormData = (compressedFiles: File[], existingUrls: string[]) => {
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
    
    // Add existing URLs
    data.append('image_urls', JSON.stringify(existingUrls));

    // Add newly uploaded files
    compressedFiles.forEach(file => {
      data.append('images', file);
    });

    // Backwards compatibility: set primary image if available
    if (existingUrls.length > 0) {
      data.append('image_url', existingUrls[0]);
    } else if (compressedFiles.length > 0) {
      data.append('image', compressedFiles[0]);
    }
    
    return data;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    if (galleryItems.length === 0) {
      setSaving(false);
      setError('Please upload at least one image before publishing.');
      return;
    }

    try {
      setSavingText('Optimizing images...');
      const compressedFiles: File[] = [];
      const existingUrls: string[] = [];

      for (const item of galleryItems) {
        if (item.file) {
          try {
            const compressed = await compressImage(item.file);
            compressedFiles.push(compressed);
          } catch (compressErr: any) {
            setSaving(false);
            setError(compressErr.message || 'Image compression failed.');
            return;
          }
        } else {
          existingUrls.push(item.url);
        }
      }

      setSavingText('Uploading...');
      
      const axiosConfig = {
        timeout: 120000 // 120 seconds upload timeout
      };

      const formData = buildFormData(compressedFiles, existingUrls);

      if (editingPrompt) {
        await axios.put(`${API_URL}/${editingPrompt.id}`, formData, axiosConfig);
        addLog('Prompt Updated', 'Admin', `Successfully updated prompt "${form.title}"`, 'Success');
        setMessage('Prompt updated successfully.');
      } else {
        await axios.post(API_URL, formData, axiosConfig);
        addLog('Prompt Published', 'Admin', `Successfully published prompt "${form.title}"`, 'Success');
        setMessage('Prompt published successfully.');
      }
      resetForm();
      await fetchPrompts();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Could not save this prompt.';
      addLog(editingPrompt ? 'Prompt Update Failed' : 'Prompt Publish Failed', 'Admin', errorMsg, 'Failed');
      setError(errorMsg);
    } finally {
      setSaving(false);
      setSavingText('');
    }
  };

  const deletePrompt = async (prompt: AdminPrompt) => {
    triggerConfirm({
      title: 'Delete Prompt',
      message: `Delete "${prompt.title}" permanently?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/${prompt.id}`);
          addLog('Prompt Deleted', 'Admin', `Successfully deleted prompt "${prompt.title}"`, 'Success');
          setMessage('Prompt deleted.');
          if (editingPrompt?.id === prompt.id) resetForm();
          await fetchPrompts();
        } catch {
          addLog('Prompt Deletion Failed', 'Admin', `Failed to delete prompt "${prompt.title}"`, 'Failed');
          setError('Could not delete this prompt.');
        }
      }
    });
  };

  const toggleFeatured = async (prompt: AdminPrompt) => {
    const data = new FormData();
    data.append('featured', String(!prompt.featured));

    try {
      await axios.put(`${API_URL}/${prompt.id}`, data);
      addLog(prompt.featured ? 'Prompt Unfeatured' : 'Prompt Featured', 'Admin', `Successfully updated featured status for prompt "${prompt.title}"`, 'Success');
      await fetchPrompts();
    } catch {
      addLog('Featured Update Failed', 'Admin', `Failed to update featured status for "${prompt.title}"`, 'Failed');
      setError('Could not update featured status.');
    }
  };

  const toggleTrending = async (prompt: AdminPrompt) => {
    const data = new FormData();
    data.append('trending', String(!prompt.trending));

    try {
      await axios.put(`${API_URL}/${prompt.id}`, data);
      addLog(prompt.trending ? 'Prompt Untrending' : 'Prompt Trending', 'Admin', `Successfully updated trending status for prompt "${prompt.title}"`, 'Success');
      await fetchPrompts();
    } catch {
      addLog('Trending Update Failed', 'Admin', `Failed to update trending status for "${prompt.title}"`, 'Failed');
      setError('Could not update trending status.');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      let finalBannerImage = bannerImageFile;
      if (bannerImageFile) {
        setSavingText('Optimizing banner...');
        try {
          finalBannerImage = await compressImage(bannerImageFile);
        } catch (compressErr: any) {
          setSaving(false);
          setError(compressErr.message || 'Banner image optimization failed.');
          return;
        }
      }

      setSavingText('Uploading...');

      const data = new FormData();
      Object.entries(bannerForm).forEach(([k, v]) => {
        data.append(k, String(v));
      });
      if (finalBannerImage) data.append('image', finalBannerImage);

      const axiosConfig = {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 120 seconds upload timeout
      };

      if (editingBanner) {
        await axios.put(`${API_BASE_URL}/api/banners/${editingBanner.id}`, data, axiosConfig);
        addLog('Banner Updated', 'Admin', `Successfully updated banner "${bannerForm.title}"`, 'Success');
        setMessage('Banner updated successfully.');
      } else {
        await axios.post(`${API_BASE_URL}/api/banners`, data, axiosConfig);
        addLog('Banner Created', 'Admin', `Successfully created banner "${bannerForm.title}"`, 'Success');
        setMessage('Banner created successfully.');
      }
      setBannerForm(emptyBannerForm);
      setBannerImageFile(null);
      setBannerImagePreview('');
      setEditingBanner(null);
      await fetchBanners();
    } catch (err: any) {
      addLog(editingBanner ? 'Banner Update Failed' : 'Banner Creation Failed', 'Admin', 'Failed to save banner', 'Failed');
      setError('Could not save this banner.');
    } finally {
      setSaving(false);
      setSavingText('');
    }
  };

  const deleteBanner = async (banner: AdminBanner) => {
    triggerConfirm({
      title: 'Delete Banner',
      message: `Delete "${banner.title}" permanently?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/api/banners/${banner.id}`);
          addLog('Banner Deleted', 'Admin', `Successfully deleted banner "${banner.title}"`, 'Success');
          setMessage('Banner deleted.');
          if (editingBanner?.id === banner.id) {
            setBannerForm(emptyBannerForm);
            setEditingBanner(null);
          }
          await fetchBanners();
        } catch {
          addLog('Banner Deletion Failed', 'Admin', `Failed to delete banner "${banner.title}"`, 'Failed');
          setError('Could not delete banner.');
        }
      }
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const totalViewsCalculated = prompts.reduce((acc, p) => acc + (p.views || 0), 0) + realtimeViewsOffset;
  const totalLikesCalculated = prompts.reduce((acc, p) => acc + (p.likes || 0), 0) + realtimeLikesOffset;

  const totalVisits = realAnalytics.totalVisits;
  const uniqueVisitors = realAnalytics.uniqueVisitors;

  const dailyVisits = realAnalytics.dailyVisits;
  const maxDailyVisit = Math.max(...dailyVisits);
  const barHeights = dailyVisits.map((v: number) => maxDailyVisit > 0 ? (v / maxDailyVisit) * 90 : 0);

  const mainStats = [
    { label: 'Total Prompts', value: prompts.length, icon: Layers, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%', isUp: true },
    { label: 'Total Views', value: formatNumber(totalViewsCalculated), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+18.5%', isUp: true },
    { label: 'Total Likes', value: formatNumber(totalLikesCalculated), icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10', trend: '+5.2%', isUp: true },
    { label: 'Total Visits', value: formatNumber(totalVisits), icon: Globe, color: 'text-primary', bg: 'bg-primary/10', trend: '+14.2%', isUp: true },
    { label: 'Unique Visitors', value: formatNumber(uniqueVisitors), icon: Users, color: 'text-[#8b5cf6]', bg: 'bg-[#8b5cf6]/10', trend: '+11.8%', isUp: true },
    { label: 'Avg. CTR', value: `${realAnalytics.avgCTR ?? 4.2}%`, icon: MousePointer2, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '-1.2%', isUp: false },
  ];

  const trafficData = realAnalytics.trafficSources;

  const getBarLabel = (index: number, totalDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - (totalDays - 1 - index));
    if (totalDays === 7) {
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      if (index % 5 === 0 || index === totalDays - 1) {
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      }
      return '';
    }
  };

  return (
    <ErrorBoundary>
      <AdminLayout>
        {(activeTab, setActiveTab) => (
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
                  {mainStats.map((stat, i) => (
                    <div key={i} className="glass-panel p-6 rounded-3xl flex flex-col gap-4 group hover-glass-glow glass-shine transition-all">
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
                  <div 
                    onClick={() => setSelectedBar(null)}
                    className="glass-panel rounded-[2.5rem] p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-xl font-bold">Traffic Overview</h2>
                        <p className="text-xs text-[#756d8d] font-medium mt-1">Daily visitor statistics and engagement</p>
                      </div>
                      <div className="relative dropdown-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTrafficDropdown(!showTrafficDropdown);
                          }}
                          className="flex items-center gap-2 bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 hover:bg-primary/5 hover:text-primary dark:hover:bg-white/10 transition-all rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer text-[#171421] dark:text-white"
                        >
                          <span>{trafficDays === 7 ? 'Last 7 Days' : 'Last 30 Days'}</span>
                          <ChevronDown className={cn("w-3.5 h-3.5 text-[#756d8d] transition-transform", showTrafficDropdown && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                          {showTrafficDropdown && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowTrafficDropdown(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-40 rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 modal-glass border border-[#e9e2f3] dark:border-white/10 text-left"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTrafficDays(7);
                                    setShowTrafficDropdown(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors",
                                    trafficDays === 7 
                                      ? "bg-primary text-white" 
                                      : "text-[#171421] dark:text-[#afa6c8] hover:bg-primary/5 hover:text-primary dark:hover:bg-white/5"
                                  )}
                                >
                                  Last 7 Days
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTrafficDays(30);
                                    setShowTrafficDropdown(false);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 mt-0.5 rounded-xl text-xs font-bold transition-colors",
                                    trafficDays === 30 
                                      ? "bg-primary text-white" 
                                      : "text-[#171421] dark:text-[#afa6c8] hover:bg-primary/5 hover:text-primary dark:hover:bg-white/5"
                                  )}
                                >
                                  Last 30 Days
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className={cn(
                      "h-64 flex items-end justify-between px-1 sm:px-2",
                      trafficDays === 30 ? "gap-[3.5px] sm:gap-2" : "gap-2 sm:gap-4"
                    )}>
                       {dailyVisits.map((v: number, i: number) => {
                          const h = barHeights[i];
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                              <div className="w-full h-48 relative flex items-end">
                                <motion.div 
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h}%` }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBar(prev => prev === i ? null : i);
                                  }}
                                  className="w-full max-w-[40px] mx-auto bg-gradient-to-t from-primary/40 to-primary rounded-t-xl group-hover:to-secondary transition-all cursor-pointer relative"
                                >
                                  <div className={cn(
                                    "absolute -top-10 left-1/2 -translate-x-1/2 bg-[#171421] text-white text-[10px] font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap z-30 shadow-md pointer-events-none",
                                    selectedBar === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                  )}>
                                    {formatNumber(v)} visits
                                  </div>
                                </motion.div>
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-bold text-[#756d8d] uppercase tracking-tighter sm:tracking-normal">{getBarLabel(i, trafficDays)}</span>
                            </div>
                          );
                       })}
                    </div>
                    {selectedBar !== null && dailyVisits[selectedBar] !== undefined && (
                      <div className="mt-6 flex justify-center items-center animate-fade-in">
                        <div className="text-[11px] sm:text-xs font-bold text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10 px-4 py-2 rounded-full border border-primary/20 dark:border-secondary/20 shadow-sm">
                          {(() => {
                            const d = new Date();
                            d.setDate(d.getDate() - (trafficDays - 1 - selectedBar));
                            const formattedDate = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                            return `${formattedDate}: ${formatNumber(dailyVisits[selectedBar])} visits`;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="glass-panel rounded-[2.5rem] p-8 flex flex-col gap-6">
                    <div>
                      <h2 className="text-xl font-bold">Traffic Sources</h2>
                      <p className="text-xs text-[#756d8d] font-medium mt-1">Where your visitors come from</p>
                    </div>

                    <div className="flex flex-col gap-5">
                       {trafficData.map((item: any, i: number) => (
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
                            <p className="text-lg font-bold">{realAnalytics.topLocation || "Calculating..."}</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel rounded-[2.5rem] p-8">
                     <h3 className="text-lg font-bold mb-6">Real-time Insights</h3>
                     <div className="flex flex-col gap-6">
                        {[
                          { icon: Users, label: 'Active Users Now', value: String(realAnalytics.activeUsers ?? 1), color: 'text-primary' },
                          { icon: Clock, label: 'Avg. Session Duration', value: realAnalytics.avgSessionDuration ?? '4m 32s', color: 'text-blue-400' },
                          { icon: TrendingUp, label: 'Conversion Rate', value: `${realAnalytics.conversionRate ?? 12.4}%`, color: 'text-green-500' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl pill-glass border border-white/10">
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
                          setSelectedPromptsForCampaign([]);
                        }}
                        className="mt-2 px-8 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
                      >
                         Get Started
                      </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Manage Users' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">User Management</h1>
                  <p className="text-[#756d8d] dark:text-[#afa6c8] mt-1 font-medium">Manage registered users, inspect their platform activities, or permanently delete them from the database.</p>
                </div>

                {/* Users statistics row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="glass-panel p-5 rounded-[1.5rem]">
                    <span className="text-[10px] font-bold text-[#756d8d] uppercase tracking-wider">Total Users</span>
                    <p className="text-3xl font-black text-[#171421] dark:text-white mt-1">{users.length}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-[1.5rem]">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Verified Users</span>
                    <p className="text-3xl font-black text-[#171421] dark:text-white mt-1">
                      {users.filter(u => u.email_verified).length}
                    </p>
                  </div>
                  <div className="glass-panel p-5 rounded-[1.5rem]">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Google Login</span>
                    <p className="text-3xl font-black text-[#171421] dark:text-white mt-1">
                      {users.filter(u => u.provider === 'google').length}
                    </p>
                  </div>
                  <div className="glass-panel p-5 rounded-[1.5rem]">
                    <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">OTP Login</span>
                    <p className="text-3xl font-black text-[#171421] dark:text-white mt-1">
                      {users.filter(u => u.provider === 'email').length}
                    </p>
                  </div>
                </div>

                <div className="glass-panel rounded-[2rem] p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-black text-[#171421] dark:text-white">Registered Users ({users.length})</span>
                    <button 
                      onClick={fetchUsers}
                      className="px-4 py-2 rounded-full border border-primary/20 text-primary font-bold text-xs hover:bg-primary/5 transition-all"
                    >
                      Refresh List
                    </button>
                  </div>

                  {usersLoading ? (
                    <div className="py-20 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm font-semibold text-[#756d8d] mt-4">Loading registered users...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-sm font-bold text-[#756d8d]">No registered users found in the database.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#e9e2f3] dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#756d8d]">
                            <th className="pb-3 pl-2">User</th>
                            <th className="pb-3">Provider</th>
                            <th className="pb-3">Gender</th>
                            <th className="pb-3">Verified</th>
                            <th className="pb-3">Registration Date</th>
                            <th className="pb-3">Activity (Saves / Likes / Views)</th>
                            <th className="pb-3 pr-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e9e2f3] dark:divide-white/5">
                          {users.map(u => (
                            <tr key={u.firebase_uid} className="text-[13px] text-[#171421] dark:text-white hover:bg-[#f8f7fc]/50 dark:hover:bg-white/5 transition-colors">
                              <td className="py-4 pl-2">
                                <div className="flex flex-col">
                                  <span className="font-bold">{u.first_name} {u.last_name || ''}</span>
                                  <span className="text-[11px] font-medium text-[#756d8d] select-all">{u.email}</span>
                                  <span className="text-[9px] font-mono text-[#a59eb8] mt-0.5 select-all">{u.firebase_uid}</span>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                  u.provider === 'google' ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                )}>
                                  {u.provider}
                                </span>
                              </td>
                              <td className="py-4 font-semibold text-[#5f5774] dark:text-[#afa6c8]">
                                {u.gender || 'Not specified'}
                              </td>
                              <td className="py-4">
                                {u.email_verified ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> No
                                  </span>
                                )}
                              </td>
                              <td className="py-4 font-semibold text-[#756d8d] dark:text-[#afa6c8]">
                                {new Date(u.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full" title="Saved Prompts">
                                    💾 {u.activity?.saved_count || 0}
                                  </span>
                                  <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full" title="Liked Prompts">
                                    ❤️ {u.activity?.liked_count || 0}
                                  </span>
                                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full" title="Recent Views">
                                    👁️ {u.activity?.recent_count || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 pr-2 text-right">
                                <button
                                  onClick={() => handleDeleteUser(u.firebase_uid, u.email)}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-500 rounded-full hover:bg-rose-600 transition-all shadow-sm"
                                  title="Delete User Permanently"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  <div className="mt-6 border-t border-[#e9e2f3] dark:border-white/10 pt-4 flex flex-col gap-1.5 text-xs text-[#756d8d] dark:text-[#afa6c8]">
                    <p className="font-bold text-rose-500 dark:text-rose-400">⚠️ Disclaimer & Warning:</p>
                    <p className="leading-relaxed">
                      Deleting a user permanently removes all their local data, preferences, consent, saved items, and likes. 
                      However, this <strong>does not automatically remove their credentials from Firebase Authentication</strong> due to Firebase provider segregation. 
                      To fully revoke login access for deleted users, please locate the user's UID and delete them in your <strong>Firebase Console</strong>.
                    </p>
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
                      (document.getElementById('banner-modal') as HTMLDialogElement)?.showModal();
                    }}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    + Create Banner
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {banners.length === 0 ? (
                    <div className="glass-panel p-10 text-center rounded-[2rem]">
                      <p className="text-[#756d8d] font-bold">No banners created yet.</p>
                    </div>
                  ) : (
                    banners.map(banner => (
                      <div key={banner.id} className={cn("glass-panel rounded-[2rem] p-6 flex gap-6 items-center", !banner.is_active && "opacity-60")}>
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
                              (document.getElementById('banner-modal') as HTMLDialogElement)?.showModal();
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

            {activeTab === 'Notifications' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Push Notifications</h1>
                  <p className="text-[13px] text-[#756d8d] dark:text-[#afa6c8] font-medium font-bold">
                    Pushed notifications are saved persistently and synced globally to all active and new users.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] gap-8">
                  {/* Left Column: Form to push new notification */}
                  <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm h-fit">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                      <Send className="w-5 h-5" /> Push New Alert
                    </h3>

                    <form onSubmit={handleSaveNotification} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">
                          Notification Text
                        </label>
                        <textarea
                          required
                          value={newNotifText}
                          onChange={e => setNewNotifText(e.target.value)}
                          placeholder="e.g. ✨ Version 2.0 is live! Explore the all-new Glassmorphism editor."
                          rows={4}
                          className="w-full glass-input p-4 text-xs font-medium resize-none focus:ring-primary/20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">
                            Badge/Icon Type
                          </label>
                          <select
                            value={newNotifType}
                            onChange={e => setNewNotifType(e.target.value)}
                            className="w-full glass-input text-xs"
                          >
                            <option value="info">ℹ️ System Info</option>
                            <option value="new-feature">✨ New Feature</option>
                            <option value="trending">🔥 Trending Now</option>
                            <option value="update">🚀 App Update</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">
                            Destination Link
                          </label>
                          <input
                            required
                            type="text"
                            value={newNotifLink}
                            onChange={e => setNewNotifLink(e.target.value)}
                            placeholder="e.g. /saved"
                            className="w-full glass-input text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="mt-2 w-full h-12 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Broadcast to Everyone
                      </button>
                    </form>
                  </div>

                  {/* Right Column: List of pushed notifications */}
                  <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#756d8d]" /> Broadcast Logs
                    </h3>

                    <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 hide-scrollbar">
                      {adminNotifications.length === 0 ? (
                        <div className="bg-[#f8f7fc] dark:bg-white/5 border border-dashed border-[#e9e2f3] dark:border-white/20 rounded-[2rem] p-20 text-center">
                          <AlertCircle className="w-12 h-12 text-[#756d8d] opacity-20 mx-auto mb-4" />
                          <p className="font-bold text-[#756d8d]">No manual notifications currently broadcasted.</p>
                          <p className="text-xs text-[#756d8d] mt-1 font-medium">Automatic system-level events are still running.</p>
                        </div>
                      ) : (
                        adminNotifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className="p-5 rounded-2xl border border-[#e9e2f3] dark:border-white/10 bg-[#f8f7fc] dark:bg-white/5 flex items-center justify-between gap-6 hover:border-primary/20 transition-all duration-300 group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm",
                                notif.type === 'new-feature' ? "bg-purple-500/10 text-purple-500" :
                                notif.type === 'trending' ? "bg-amber-500/10 text-amber-500" :
                                notif.type === 'update' ? "bg-green-500/10 text-green-500" :
                                "bg-blue-500/10 text-blue-500"
                              )}>
                                {notif.type === 'new-feature' ? '✨' :
                                 notif.type === 'trending' ? '🔥' :
                                 notif.type === 'update' ? '🚀' : 'ℹ️'}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-[#171421] dark:text-white leading-relaxed">
                                  {notif.text}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-[#756d8d] uppercase tracking-wider">
                                  <span>Link: {notif.link}</span>
                                  <span>•</span>
                                  <span>{new Date(notif.created_at).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteNotification(notif.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Upload Prompt' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#171421] dark:text-white bg-clip-text bg-gradient-to-r from-[#171421] via-primary to-[#ff6a3d] dark:from-white dark:to-[#afa6c8] whitespace-nowrap">Upload New Prompt</h1>
                    <p className="text-[13px] text-[#756d8d] dark:text-[#afa6c8] mt-1 font-medium">Add a new prompt with image to the platform</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => setShowBulkModal(true)}
                      className="glass-button flex-1 sm:flex-none px-6 py-2.5 font-bold text-sm text-[#171421] dark:text-white text-center"
                    >
                      Import Bulk
                    </button>
                    <button 
                      onClick={resetForm}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-[#171421] dark:bg-white text-white dark:text-[#171421] font-bold text-sm shadow-xl shadow-black/10 hover:scale-105 transition-transform text-center"
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

                          <div className="p-6 rounded-[2rem] border-2 border-dashed border-[#e9e2f3] dark:border-white/10 bg-[#f8f7fc]/50 dark:bg-white/5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">
                                Gallery Images ({galleryItems.length} / 5)
                              </span>
                              {galleryItems.length > 1 && (
                                <span className="text-[10px] text-primary font-bold">
                                  Tip: Drag or click to change order. The first image is the cover.
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                              {galleryItems.map((item, idx) => (
                                <div 
                                  key={item.id} 
                                  className={cn(
                                    "relative aspect-[3/4] rounded-2xl border-2 overflow-hidden bg-white dark:bg-[#1a1726] group shadow-md transition-all hover:scale-[1.02]",
                                    idx === 0 ? "border-primary shadow-primary/10 ring-2 ring-primary/20" : "border-[#e9e2f3] dark:border-white/10"
                                  )}
                                >
                                  <img 
                                    src={item.url} 
                                    alt={`Gallery ${idx + 1}`} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = FALLBACK_IMAGE;
                                    }}
                                  />
                                  
                                  {/* Badges */}
                                  <div className="absolute top-2 left-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white text-[11px] font-black backdrop-blur-sm">
                                    {idx + 1}
                                  </div>

                                  {idx === 0 && (
                                    <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-wider shadow-md shadow-primary/30">
                                      Cover
                                    </div>
                                  )}

                                  {/* Always Visible Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => removeGalleryImage(item.id)}
                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-600 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all z-30 animate-fade-in"
                                    aria-label="Delete image"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Always Visible Make Cover Button for non-cover images */}
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setGalleryImagePrimary(idx)}
                                      className="absolute bottom-2 left-1.5 right-1.5 py-1 rounded-lg bg-black/60 hover:bg-primary active:scale-95 text-white text-[9px] font-bold shadow-md transition-all text-center z-30"
                                    >
                                      Make Cover
                                    </button>
                                  )}
                                </div>
                              ))}

                              {galleryItems.length < 5 && (
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary/10 hover:border-primary/40 p-4 text-center group"
                                >
                                  <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    multiple
                                    onChange={(e) => addGalleryImages(e.target.files)} 
                                  />
                                  <Plus className="w-8 h-8 text-primary group-hover:scale-110 transition-transform mb-2" />
                                  <span className="text-[11px] font-black text-primary leading-tight">Add Image</span>
                                  <span className="text-[9px] font-semibold text-[#756d8d] mt-1">PNG, JPG up to 10MB</span>
                                </button>
                              )}
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
                              {saving ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  {savingText || (editingPrompt ? 'Update Changes' : 'Publish Prompt')}
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  {editingPrompt ? 'Update Changes' : 'Publish Prompt'}
                                </>
                              )}
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
                        className="glass-panel rounded-[1.8rem] overflow-hidden group shadow-sm transition-all duration-500"
                        style={cssRatio ? { aspectRatio: cssRatio } : {}}
                      >
                        <div className={cn("relative overflow-hidden w-full h-full", !cssRatio && "aspect-square")}>
                          {galleryItems.length > 0 ? (
                            <ImageGallery
                              images={galleryItems.map(item => item.url)}
                              title={form.title || 'Preview'}
                              aspectRatio={cssRatio || '1/1'}
                              isPortrait={cssRatio ? !cssRatio.startsWith('16:') && !cssRatio.startsWith('3:2') : true}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#f8f7fc] dark:bg-white/5 flex flex-col items-center justify-center text-[#756d8d] p-6 text-center">
                              <ImagePlus className="w-12 h-12 mb-4 opacity-20" />
                              <p className="text-sm font-bold opacity-40">Upload an image to see preview</p>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-4 flex flex-col justify-end pointer-events-none z-10">
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

                        <div className="glass-panel rounded-[1.75rem] p-5 shadow-sm">
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
                          <div className="rounded-[1.3rem] pill-glass border border-white/10 p-4.5 text-[12px] font-medium leading-relaxed text-[#4a445f] dark:text-[#afa6c8] min-h-[130px]">
                            {form.prompt_text || 'Your main prompt will appear here...'}
                          </div>
                        </div>

                        <div className="glass-panel rounded-[1.75rem] p-4.5 shadow-sm">
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
                          <div className="rounded-[1.3rem] pill-glass border border-white/10 p-4.5 text-[12px] font-medium leading-relaxed text-[#4a445f] dark:text-[#afa6c8] min-h-[80px]">
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#171421] dark:text-white bg-clip-text bg-gradient-to-r from-[#171421] via-primary to-[#ff6a3d] dark:from-white dark:to-[#afa6c8]">Manage Prompts</h1>
                    <p className="text-[13px] text-[#756d8d] dark:text-[#afa6c8] font-medium mt-1">View, edit and manage all uploaded prompts</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                    <div className="relative group w-full sm:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#756d8d] group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#e9e2f3] dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-4 text-[13px] font-bold outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="h-10 flex-1 sm:flex-none px-4 rounded-xl border border-[#e9e2f3] dark:border-white/10 bg-white dark:bg-white/5 text-[13px] font-bold outline-none cursor-pointer"
                      >
                        <option value="All">All Categories</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                      <button 
                        onClick={() => setShowBulkModal(true)}
                        className="h-10 px-4 rounded-xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-white hover:text-primary transition-all flex-1 sm:flex-none"
                      >
                        <Layers className="w-4 h-4" />
                        Bulk
                      </button>
                    </div>
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
                        className="glass-panel rounded-[1.5rem] overflow-hidden group hover-glass-glow transition-all duration-500"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <ImageGallery
                            images={prompt.images && prompt.images.length > 0 ? prompt.images : [prompt.image_url]}
                            title={prompt.title}
                            aspectRatio={prompt.aspect_ratio || prompt.aspectRatio || '1/1'}
                            isPortrait={false}
                          />
                          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/80 dark:bg-black/60 backdrop-blur-md text-[9px] font-bold text-[#171421] dark:text-white uppercase pointer-events-none z-10">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#171421] dark:text-white bg-clip-text bg-gradient-to-r from-[#171421] via-primary to-[#ff6a3d] dark:from-white dark:to-[#afa6c8]">Categories</h1>
                    <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium mt-1">Manage prompt categories and taxonomy</p>
                  </div>
                  <div className="flex items-center gap-3 pill-glass p-2 rounded-2xl border border-white/10 w-full sm:w-auto justify-between sm:justify-start">
                    <label className="relative flex items-center justify-center cursor-pointer shrink-0">
                      {newCatImagePreview ? (
                        <div className="relative group w-10 h-10 rounded-xl overflow-hidden shadow-md">
                          <img src={newCatImagePreview} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setNewCatImageFile(null);
                              setNewCatImagePreview('');
                            }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#e9e2f3] dark:border-white/10 bg-[#fbf8ff] dark:bg-white/5 text-[#756d8d] hover:text-primary transition-colors">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="new-category-image"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewCatImageFile(file);
                            setNewCatImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    <input 
                      id="new-category-input"
                      placeholder={uploadingCatId === -1 ? uploadingCatText : "Category name..."}
                      disabled={uploadingCatId !== null}
                      className="bg-transparent border-none outline-none px-2 sm:px-4 py-2 text-sm font-medium flex-1 min-w-0 sm:w-48 text-[#171421] dark:text-white placeholder-[#8c84a6] disabled:opacity-50"
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          if (input.value) {
                            const name = input.value;
                            input.value = '';
                            let file = newCatImageFile;
                            setNewCatImageFile(null);
                            setNewCatImagePreview('');
                            try {
                              if (file) {
                                setUploadingCatId(-1);
                                setUploadingCatText('Optimizing...');
                                try {
                                  file = await compressImage(file);
                                } catch (compressErr: any) {
                                  alert(compressErr.message || 'Image optimization failed.');
                                  setUploadingCatId(null);
                                  return;
                                }
                                setUploadingCatText('Uploading...');
                              }
                              await addCategory(name, file || undefined);
                              addLog('Category Created', 'Admin', `Successfully created category "${name}"`, 'Success');
                            } catch (err) {
                              addLog('Category Creation Failed', 'Admin', `Failed to create category "${name}"`, 'Failed');
                              alert("Failed to create category");
                            } finally {
                              setUploadingCatId(null);
                            }
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={async () => {
                        const input = document.getElementById('new-category-input') as HTMLInputElement;
                        if (input && input.value) {
                          const name = input.value;
                          input.value = '';
                          let file = newCatImageFile;
                          setNewCatImageFile(null);
                          setNewCatImagePreview('');
                          try {
                            if (file) {
                              setUploadingCatId(-1);
                              setUploadingCatText('Optimizing...');
                              try {
                                file = await compressImage(file);
                              } catch (compressErr: any) {
                                alert(compressErr.message || 'Image optimization failed.');
                                setUploadingCatId(null);
                                return;
                              }
                              setUploadingCatText('Uploading...');
                            }
                            await addCategory(name, file || undefined);
                            addLog('Category Created', 'Admin', `Successfully created category "${name}"`, 'Success');
                          } catch (err) {
                            addLog('Category Creation Failed', 'Admin', `Failed to create category "${name}"`, 'Failed');
                            alert("Failed to create category");
                          } finally {
                            setUploadingCatId(null);
                          }
                        }
                      }}
                      disabled={uploadingCatId !== null}
                      className="p-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {uploadingCatId === -1 ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat) => {
                    const categoryPrompts = prompts.filter(p => p.category === cat.name);
                    const latestPrompt = categoryPrompts[0];
                    const coverImage = latestPrompt ? latestPrompt.image_url : (cat.image_url || FALLBACK_IMAGE);

                    return (
                      <div key={cat.id} className="relative glass-panel p-6 rounded-[2rem] flex flex-col group hover:border-primary/30 hover-glass-glow transition-all overflow-hidden">
                        {uploadingCatId === cat.id && (
                          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-4">
                            <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-white">{uploadingCatText}</span>
                          </div>
                        )}
                        {coverImage && (
                          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                            <img 
                              src={coverImage} 
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
                                {categoryPrompts.length} Prompts
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => {
                                setEditingCategory(cat);
                                setEditCatName(cat.name);
                                setEditCatImageFile(null);
                                setEditCatImagePreview(cat.image_url || '');
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#756d8d] hover:bg-[#756d8d]/10"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                triggerConfirm({
                                  title: 'Delete Category',
                                  message: `Are you sure you want to delete "${cat.name}" category permanently?`,
                                  type: 'danger',
                                  onConfirm: async () => {
                                    try {
                                      await deleteCategory(cat.id);
                                      addLog('Category Deleted', 'Admin', `Successfully deleted category "${cat.name}"`, 'Success');
                                    } catch {
                                      addLog('Category Deletion Failed', 'Admin', `Failed to delete category "${cat.name}"`, 'Failed');
                                    }
                                  }
                                });
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
                              disabled={uploadingCatId !== null}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    setUploadingCatId(cat.id);
                                    setUploadingCatText('Optimizing cover...');
                                    let compressedFile = file;
                                    try {
                                      compressedFile = await compressImage(file);
                                    } catch (compressErr: any) {
                                      alert(compressErr.message || 'Image optimization failed.');
                                      setUploadingCatId(null);
                                      return;
                                    }
                                    setUploadingCatText('Uploading...');
                                    await updateCategory(cat.id, cat.name, compressedFile);
                                    addLog('Category Cover Updated', 'Admin', `Successfully updated cover for category "${cat.name}"`, 'Success');
                                  } catch (err) {
                                    addLog('Category Cover Update Failed', 'Admin', `Failed to update cover for category "${cat.name}"`, 'Failed');
                                    alert("Failed to upload category cover image.");
                                  } finally {
                                    setUploadingCatId(null);
                                    setUploadingCatText('Uploading Cover...');
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
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
                    { label: 'Total Views', value: formatNumber(totalViewsCalculated), change: '+12%', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Likes', value: formatNumber(totalLikesCalculated), change: '+8%', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                    { label: 'New Users', value: formatNumber(newUsers), change: '+18%', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Active Sessions', value: formatNumber(activeUsersNow * 42), change: '+5%', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
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
                        { name: 'Direct', value: trafficSources[0].value, color: 'bg-primary' },
                        { name: 'Social Media', value: trafficSources[1].value, color: 'bg-blue-500' },
                        { name: 'Search Engines', value: trafficSources[2].value, color: 'bg-green-500' },
                        { name: 'Others', value: trafficSources[3].value, color: 'bg-amber-500' },
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

                  <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col gap-6 justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Device Usage</h3>
                      <p className="text-xs text-[#756d8d] font-medium mt-1">Breakdown of visitor device platforms</p>
                    </div>

                    <div className="flex flex-col gap-5 py-4">
                      {/* Mobile Usage */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2 text-[#171421] dark:text-white">
                            <Smartphone className="w-4.5 h-4.5 text-primary" />
                            <span>Mobile Viewers</span>
                          </div>
                          <span className="text-[#171421] dark:text-white">{deviceUsageMobile}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-[#f8f7fc] dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#ff6a3d]" style={{ width: `${deviceUsageMobile}%` }} />
                        </div>
                      </div>

                      {/* Desktop Usage */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2 text-[#171421] dark:text-white">
                            <Monitor className="w-4.5 h-4.5 text-blue-400" />
                            <span>Desktop Viewers</span>
                          </div>
                          <span className="text-[#171421] dark:text-white">{100 - deviceUsageMobile}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-[#f8f7fc] dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${100 - deviceUsageMobile}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Top Performing Prompts</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleDownloadTopPrompts}
                        title="Download Top Performing Prompts Report"
                        className="p-2 rounded-xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 hover:text-primary transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setActiveTab('Manage Prompts')}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20"
                      >
                        View All
                      </button>
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
                        {topPerformingPrompts.map((p, i) => (
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

            {activeTab === 'Support' && (() => {
              const statusColors: Record<string, string> = {
                unread: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
                read: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
                replied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
                resolved: 'bg-[#f0edf7] text-[#756d8d] dark:bg-white/10 dark:text-[#afa6c8]',
              };
              const filteredFeedbacks = feedbacks.filter(item => {
                const matchesFilter = supportFilter === 'all' || item.status === supportFilter;
                const q = supportSearch.toLowerCase();
                const matchesSearch = !q || item.user?.toLowerCase().includes(q) || item.email?.toLowerCase().includes(q) || item.subject?.toLowerCase().includes(q);
                return matchesFilter && matchesSearch;
              });

              const handleReply = async (id: number) => {
                if (!replyText.trim()) return;
                setSendingReply(true);
                try {
                  const res = await axios.post(`${API_BASE_URL}/api/feedback/${id}/reply`, { reply_text: replyText });
                  setFeedbacks(prev => prev.map(f => f.id === id ? res.data : f));
                  addLog('Reply Sent', 'Admin', `Replied to feedback #${id}`, 'Success');
                   setReplyingToId(null);
                  setReplyText('');
                  fetchSupportStats();
                  setMessage('Reply sent successfully!');
                  setTimeout(() => setMessage(''), 3000);
                } catch {
                  addLog('Reply Failed', 'Admin', `Failed to reply to feedback #${id}`, 'Failed');
                  setError('Failed to send reply');
                } finally {
                  setSendingReply(false);
                }
              };

              const handleStatusChange = async (id: number, newStatus: string) => {
                try {
                  const res = await axios.patch(`${API_BASE_URL}/api/feedback/${id}/status`, { status: newStatus });
                  setFeedbacks(prev => prev.map(f => f.id === id ? res.data : f));
                  addLog('Status Updated', 'Admin', `Feedback #${id} marked as ${newStatus}`, 'Success');
                  fetchSupportStats();
                } catch {
                  addLog('Status Update Failed', 'Admin', `Failed to update feedback #${id}`, 'Failed');
                }
              };

              const handleDelete = (id: number, userName: string) => {
                triggerConfirm({
                  title: 'Delete Message',
                  message: `Are you sure you want to permanently delete the message from "${userName}"?`,
                  type: 'danger',
                  onConfirm: async () => {
                    try {
                      await axios.delete(`${API_BASE_URL}/api/feedback/${id}`);
                      setFeedbacks(prev => prev.filter(f => f.id !== id));
                      addLog('Feedback Deleted', 'Admin', `Deleted feedback from "${userName}"`, 'Success');
                      fetchSupportStats();
                    } catch {
                      addLog('Delete Failed', 'Admin', `Failed to delete feedback from "${userName}"`, 'Failed');
                    }
                  }
                });
              };

              const pillTabs = [
                { key: 'all' as const, label: 'All Messages', icon: Inbox, count: feedbacks.length },
                { key: 'unread' as const, label: 'Unread', icon: MailOpen, count: supportStats.unread },
                { key: 'replied' as const, label: 'Replied', icon: Reply, count: supportStats.replied },
                { key: 'resolved' as const, label: 'Resolved', icon: CheckCircle2, count: supportStats.resolved },
              ];

              return (
              <div className="flex flex-col gap-8">
                {/* Header */}
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#171421] dark:text-white">Support</h1>
                  <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium">Manage user inquiries, reply to messages & track support tickets</p>
                </div>

                {/* Sub-tab Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {pillTabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setSupportFilter(tab.key)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300",
                        supportFilter === tab.key
                          ? "bg-gradient-to-r from-primary to-[#ff6a3d] text-white shadow-lg shadow-primary/20"
                          : "bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] dark:text-[#afa6c8] hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                      <span className={cn(
                        "min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5",
                        supportFilter === tab.key ? "bg-white/25 text-white" : "bg-[#f0edf7] dark:bg-white/10 text-[#756d8d]"
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#756d8d]" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or subject..."
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-sm font-medium text-[#171421] dark:text-white placeholder:text-[#756d8d] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                  {supportSearch && (
                    <button onClick={() => setSupportSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-[#756d8d] hover:text-primary transition-colors" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Feedback Cards */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredFeedbacks.length > 0 ? (
                        filteredFeedbacks.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className={cn(
                              "p-6 rounded-[2rem] border transition-all group",
                              item.status === 'unread'
                                ? "bg-white dark:bg-white/10 border-primary/20 shadow-lg shadow-primary/5"
                                : "bg-[#f8f7fc] dark:bg-white/5 border-[#e9e2f3] dark:border-white/10"
                            )}
                          >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-[#ff6a3d]/20 flex items-center justify-center text-primary font-bold text-sm">
                                  {item.user?.charAt(0)?.toUpperCase() || 'G'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-[#171421] dark:text-white">{item.user}</h4>
                                  <p className="text-[10px] text-[#756d8d] font-medium">{item.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider", statusColors[item.status] || statusColors.unread)}>
                                  {item.status}
                                </span>
                                <span className="text-[10px] font-medium text-[#756d8d]">{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              </div>
                            </div>

                            {/* Subject & Message */}
                            <h5 className="font-bold text-sm mb-1.5 text-[#171421] dark:text-white">{item.subject}</h5>
                            <p className="text-xs text-[#756d8d] leading-relaxed mb-3">{item.message}</p>

                            {/* Admin Reply (if exists) */}
                            {item.reply_text && (
                              <div className="mb-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <Reply className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Admin Reply</span>
                                  {item.replied_at && (
                                    <span className="text-[9px] text-emerald-500/70 font-medium ml-auto">
                                      {new Date(item.replied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">{item.reply_text}</p>
                              </div>
                            )}

                            {/* Inline Reply Box */}
                            {replyingToId === item.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-3"
                              >
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type your reply here..."
                                  rows={3}
                                  className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-sm font-medium text-[#171421] dark:text-white placeholder:text-[#756d8d] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                                  autoFocus
                                />
                                <div className="flex items-center gap-2 mt-2">
                                  <button
                                    onClick={() => handleReply(item.id)}
                                    disabled={sendingReply || !replyText.trim()}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-primary to-[#ff6a3d] text-white text-[10px] font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-50"
                                  >
                                    {sendingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                    {sendingReply ? 'Sending...' : 'Send Reply'}
                                  </button>
                                  <button
                                    onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                    className="px-4 py-1.5 rounded-lg bg-[#f0edf7] dark:bg-white/10 text-[10px] font-bold text-[#756d8d] hover:text-primary transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </motion.div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-3 border-t border-[#e9e2f3] dark:border-white/10 flex-wrap">
                              {replyingToId !== item.id && (
                                <button
                                  onClick={() => { setReplyingToId(item.id); setReplyText(item.reply_text || ''); }}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary hover:text-white transition-all"
                                >
                                  <Reply className="w-3 h-3" />
                                  {item.reply_text ? 'Edit Reply' : 'Reply'}
                                </button>
                              )}
                              {replyingToId !== item.id && item.email && (
                                <a
                                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${item.email}&su=${encodeURIComponent(`Re: ${item.subject || 'Promptro Support'}`)}&body=${encodeURIComponent(`Hello ${item.user || 'Customer'},\n\n\n\nBest regards,\nPromptro Support Team`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
                                >
                                  <Mail className="w-3 h-3" />
                                  Send Email (Gmail)
                                </a>
                              )}
                              {item.status === 'unread' && (
                                <button
                                  onClick={() => handleStatusChange(item.id, 'read')}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all"
                                >
                                  <Eye className="w-3 h-3" />
                                  Mark Read
                                </button>
                              )}
                              {item.status !== 'resolved' && (
                                <button
                                  onClick={() => handleStatusChange(item.id, 'resolved')}
                                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Resolve
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(item.id, item.user)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-[10px] font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all ml-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-white/5 border border-dashed border-[#e9e2f3] dark:border-white/20 rounded-[2rem] p-16 text-center"
                        >
                          <MessageSquare className="w-12 h-12 text-[#756d8d] opacity-20 mx-auto mb-4" />
                          <p className="font-bold text-[#756d8d] mb-1">No messages found</p>
                          <p className="text-[11px] text-[#afa6c8]">
                            {supportFilter !== 'all' ? `No ${supportFilter} messages` : supportSearch ? 'Try a different search term' : 'User messages will appear here'}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Stats Sidebar */}
                  <div className="flex flex-col gap-6">
                    {/* Overview Card */}
                    <div className="bg-gradient-to-br from-primary to-[#ff6a3d] p-7 rounded-[2rem] text-white">
                      <div className="flex items-center gap-2 mb-4">
                        <Headphones className="w-5 h-5" />
                        <h3 className="text-base font-bold">Support Overview</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-2xl font-bold">{supportStats.total}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Total Messages</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{supportStats.open_tickets}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Open Tickets</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{supportStats.response_rate}%</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Response Rate</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{supportStats.resolved}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">Resolved</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2rem] p-7">
                      <h3 className="text-sm font-bold mb-5 text-[#171421] dark:text-white">Status Breakdown</h3>
                      <div className="flex flex-col gap-3.5">
                        {[
                          { label: 'Unread', count: supportStats.unread, color: 'bg-amber-500', icon: MailOpen },
                          { label: 'Read', count: supportStats.read, color: 'bg-blue-500', icon: Eye },
                          { label: 'Replied', count: supportStats.replied, color: 'bg-emerald-500', icon: Reply },
                          { label: 'Resolved', count: supportStats.resolved, color: 'bg-[#756d8d]', icon: CheckCircle2 },
                        ].map(stat => (
                          <div key={stat.label} className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white", stat.color)}>
                              <stat.icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-[#756d8d]">{stat.label}</span>
                                <span className="text-xs font-bold text-[#171421] dark:text-white">{stat.count}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-[#f0edf7] dark:bg-white/10 overflow-hidden">
                                <div
                                  className={cn("h-full rounded-full transition-all duration-500", stat.color)}
                                  style={{ width: `${supportStats.total > 0 ? (stat.count / supportStats.total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2rem] p-6">
                      <h3 className="text-xs font-bold mb-3 text-[#756d8d] uppercase tracking-wider">Quick Tips</h3>
                      <ul className="flex flex-col gap-2 text-[11px] text-[#756d8d] leading-relaxed">
                        <li className="flex items-start gap-2">
                          <CircleDot className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          Reply to messages to automatically mark them as "Replied"
                        </li>
                        <li className="flex items-start gap-2">
                          <CircleDot className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          Resolve tickets once the issue is fully handled
                        </li>
                        <li className="flex items-start gap-2">
                          <CircleDot className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          Use search to quickly find specific user messages
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}

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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#171421] dark:text-white bg-clip-text bg-gradient-to-r from-[#171421] via-primary to-[#ff6a3d] dark:from-white dark:to-[#afa6c8]">System Logs</h1>
                  <p className="text-[#756d8d] dark:text-[#afa6c8] font-medium">Monitor all administrative actions and system events</p>
                </div>

                <div className="bg-white dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 rounded-[2.5rem] overflow-hidden">
                  <div className="overflow-x-auto hide-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
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
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-bold",
                                log.status === 'Failed' 
                                  ? "bg-red-500/10 text-red-500" 
                                  : "bg-green-500/10 text-green-500"
                              )}>
                                {log.status || 'Success'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Default fallback for other tabs */}
            {!['Dashboard', 'Upload Prompt', 'Manage Prompts', 'Categories', 'Featured Prompts', 'Analytics', 'Settings', 'System Logs', 'Notifications'].includes(activeTab) && (
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

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !updatingCat && setEditingCategory(null)}
              className="fixed inset-0 bg-black/10 backdrop-blur-[3px] z-[80]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed left-[5%] right-[5%] md:left-auto md:right-auto md:w-[480px] top-1/2 -translate-y-1/2 md:-translate-x-1/2 md:left-1/2 z-[90] glass-panel p-6 rounded-[2.5rem] flex flex-col max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#171421] dark:text-white">Edit Category</h3>
                  <p className="text-xs text-[#756d8d] dark:text-[#afa6c8] mt-0.5">Modify category name and cover image</p>
                </div>
                <button 
                  onClick={() => !updatingCat && setEditingCategory(null)}
                  className="w-10 h-10 rounded-full bg-[#e8e2f0]/50 dark:bg-white/10 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                  disabled={updatingCat}
                >
                  <X className="w-5 h-5 text-[#171421] dark:text-white" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-[#171421] dark:text-white">Category Name</label>
                  <input 
                    type="text" 
                    value={editCatName} 
                    onChange={e => setEditCatName(e.target.value)} 
                    placeholder="Enter category name..." 
                    className="w-full glass-input"
                    required
                    disabled={updatingCat}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#171421] dark:text-white">Cover Image</label>
                  <div className="relative w-full h-48 rounded-[1.5rem] overflow-hidden border border-dashed border-[#cfc7dd] dark:border-white/10 bg-[#e8e2f0]/20 dark:bg-white/5 flex items-center justify-center group">
                    {editCatImagePreview ? (
                      <>
                        <img 
                          src={editCatImagePreview} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditCatImageFile(null);
                            setEditCatImagePreview('');
                          }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 transition-transform"
                          disabled={updatingCat}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-[#e8e2f0]/30 dark:hover:bg-white/10 transition-colors">
                        <ImageIcon className="w-8 h-8 text-[#756d8d] mb-2" />
                        <span className="text-xs font-bold text-[#756d8d]">Upload Cover Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditCatImageFile(file);
                              setEditCatImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          disabled={updatingCat}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button 
                    type="submit"
                    disabled={updatingCat}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updatingCat ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {updatingCatText}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    disabled={updatingCat}
                    className="px-6 h-12 rounded-2xl border border-[#e2dbe8] dark:border-white/10 font-bold text-[#6f6684] dark:text-[#afa6c8] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingPrompt && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-black/5 backdrop-blur-[3px] z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white/70 dark:bg-[#171421]/72 backdrop-blur-3xl border-l border-white/20 dark:border-white/10 shadow-2xl z-[70] overflow-y-auto"
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
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2.5">
                      <span className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">
                        Live Gallery Preview
                      </span>
                      <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#e9e2f3] dark:border-white/10 relative bg-[#f8f7fc]/50 dark:bg-white/5">
                        {galleryItems.length > 0 ? (
                          <ImageGallery
                            images={galleryItems.map(item => item.url)}
                            title={form.title || 'Preview'}
                            aspectRatio={cssRatio || '4/3'}
                            isPortrait={false}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#756d8d] p-6 text-center">
                            <ImagePlus className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-xs font-bold opacity-40">Add images to see preview</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-[#756d8d] uppercase tracking-wider">
                        Gallery Images ({galleryItems.length} / 5)
                      </span>
                      {galleryItems.length > 1 && (
                        <span className="text-[10px] text-primary font-bold">
                          The first image is the cover. Click to change cover.
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {galleryItems.map((item, idx) => (
                        <div 
                          key={item.id} 
                          className={cn(
                            "relative aspect-[3/4] rounded-2xl border-2 overflow-hidden bg-white dark:bg-[#1a1726] group shadow-md transition-all hover:scale-[1.02]",
                            idx === 0 ? "border-primary shadow-primary/10 ring-2 ring-primary/20" : "border-[#e9e2f3] dark:border-white/10"
                          )}
                        >
                          <img 
                            src={item.url} 
                            alt={`Gallery ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = FALLBACK_IMAGE;
                            }}
                          />
                          
                          {/* Badges */}
                          <div className="absolute top-2 left-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white text-[11px] font-black backdrop-blur-sm">
                            {idx + 1}
                          </div>

                          {idx === 0 && (
                            <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-wider shadow-md shadow-primary/30">
                              Cover
                            </div>
                          )}

                          {/* Always Visible Delete Button */}
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(item.id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-600 active:scale-90 text-white flex items-center justify-center shadow-lg transition-all z-30 animate-fade-in"
                            aria-label="Delete image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>

                          {/* Always Visible Make Cover Button for non-cover images */}
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => setGalleryImagePrimary(idx)}
                              className="absolute bottom-2 left-1.5 right-1.5 py-1 rounded-lg bg-black/60 hover:bg-primary active:scale-95 text-white text-[9px] font-bold shadow-md transition-all text-center z-30"
                            >
                              Make Cover
                            </button>
                          )}
                        </div>
                      ))}

                      {galleryItems.length < 5 && (
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary/10 hover:border-primary/40 p-4 text-center group"
                        >
                          <input 
                            type="file" 
                            ref={editFileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            multiple
                            onChange={(e) => addGalleryImages(e.target.files)} 
                          />
                          <Plus className="w-8 h-8 text-primary group-hover:scale-110 transition-transform mb-2" />
                          <span className="text-[11px] font-black text-primary leading-tight">Add Image</span>
                          <span className="text-[9px] font-semibold text-[#756d8d] mt-1">PNG, JPG up to 10MB</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold">Title</label>
                    <input 
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-bold">Generated With</label>
                      <select 
                        value={form.tool || 'Other'}
                        onChange={(e) => updateForm('tool', e.target.value)}
                        className="glass-input h-12"
                      >
                        {['ChatGPT', 'Gemini', 'Grok', 'Claude', 'Midjourney', 'Midjourney v6', 'DALL-E 3', 'Stable Diffusion', 'SDXL', 'Niji Journey', 'Leonardo AI', 'Other'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
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

                  <div className="flex items-center gap-4 pt-4 sticky bottom-0 bg-white/95 dark:bg-[#171421]/95 backdrop-blur-md pb-8 z-50 border-t border-[#e2dbe8]/50 dark:border-white/5">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {savingText || 'Updating...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Update Changes
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="px-8 h-14 rounded-2xl border border-[#e2dbe8] dark:border-white/10 font-bold text-[#6f6684] dark:text-[#afa6c8] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
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
              className="fixed inset-0 bg-black/5 backdrop-blur-[3px] z-[80]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full rounded-[2.5rem] z-[90] overflow-hidden transition-all duration-300 modal-glass ${
                campaignStep === 3 ? 'max-w-3xl' : 'max-w-xl'
              }`}
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
                        <h2 className="text-xl font-bold">Select 3 Prompts</h2>
                        <p className="text-xs text-[#756d8d]">Select exactly 3 prompts to build your campaign poster</p>
                      </div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                        {selectedPromptsForCampaign.length} / 3 Selected
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
                              if (selectedPromptsForCampaign.length >= 3) {
                                alert("You can select a maximum of 3 prompts. Please unselect one before selecting another!");
                                return;
                              }
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
                          if (selectedPromptsForCampaign.length !== 3) {
                            alert("Please select exactly 3 prompts to build your campaign poster!");
                            return;
                          }
                          setIsLaunching(true);
                          setTimeout(() => {
                            setCampaignStep(3);
                            setIsLaunching(false);
                          }, 2500);
                        }}
                        className={`flex-[2] h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                          selectedPromptsForCampaign.length === 3
                            ? "bg-primary text-white shadow-primary/20 hover:scale-105"
                            : "bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] cursor-not-allowed"
                        }`}
                      >
                        {isLaunching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Launch Campaign</>}
                      </button>
                    </div>
                  </div>
                )}

                {campaignStep === 3 && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-[#e9e2f3] dark:border-white/10 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/25">
                          <Check className="w-5 h-5" strokeWidth={3} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">Campaign Launched!</h2>
                          <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Poster Generated Successfully</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowCampaignModal(false)}
                        className="text-[#756d8d] hover:text-[#171421] dark:hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                      {/* Left: Interactive Story Preview Card */}
                      <div className="w-[260px] h-[462px] rounded-[2rem] bg-gradient-to-b from-[#181524] via-[#0d0b13] to-[#120f1b] border border-primary/20 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative shrink-0">
                        {/* Decorative Background Blur Circles */}
                        <div className="absolute -top-12 -left-12 w-28 h-28 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-secondary/20 blur-2xl pointer-events-none" />

                        {/* Top Watermark */}
                        <div className="flex flex-col items-center pt-6 gap-1 relative z-10">
                          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-primary bg-primary/10 px-3 py-0.5 rounded-full border border-primary/20">Promptro</div>
                          <div className="text-[8px] font-bold text-[#8c84a6] uppercase tracking-[0.1em] mt-1">Elevate Your Artistry</div>
                        </div>

                        {/* Center Poster Main Heading */}
                        <div className="text-center mt-4 relative z-10 px-4">
                          <h4 className="text-sm font-black tracking-wide text-white uppercase bg-gradient-to-r from-white via-[#ece8ff] to-[#dfd5ff] bg-clip-text text-transparent">Trending Inspirations</h4>
                          <div className="h-[1px] w-12 bg-primary/40 mx-auto mt-2" />
                        </div>

                        {/* Staggered overlapping 3-card stack */}
                        <div className="relative flex items-center justify-center h-48 w-full my-auto z-10">
                          {/* Card 1: Left */}
                          <div className="absolute left-4 w-24 h-32 rounded-2xl overflow-hidden border border-white/10 -rotate-12 translate-y-3 shadow-xl scale-90 opacity-60">
                            <img src={selectedPrompts[0]?.image_url} className="w-full h-full object-cover" />
                          </div>
                          
                          {/* Card 2: Right */}
                          <div className="absolute right-4 w-24 h-32 rounded-2xl overflow-hidden border border-white/10 rotate-12 translate-y-3 shadow-xl scale-90 opacity-60">
                            <img src={selectedPrompts[2]?.image_url} className="w-full h-full object-cover" />
                          </div>

                          {/* Card 3: Center */}
                          <div className="absolute w-28 h-36 rounded-2xl overflow-hidden border border-primary/30 shadow-[0_12px_28px_rgba(0,0,0,0.6)] z-20">
                            <img src={selectedPrompts[1]?.image_url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                              <span className="text-[8px] font-bold text-white truncate w-full text-center bg-black/40 backdrop-blur-xs py-0.5 rounded-md border border-white/10">{selectedPrompts[1]?.title}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom CTA Block on Poster */}
                        <div className="flex flex-col items-center gap-2 px-4 pb-6 text-center mt-auto relative z-10">
                          <h4 className="text-[9px] font-black tracking-wide text-white uppercase">Discover Top Prompts</h4>
                          <p className="text-[7px] font-bold text-[#8c84a6] max-w-[170px]">Unlock high-quality AI prompt templates on Promptro</p>
                          <div className="w-full py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-extrabold text-[8px] tracking-wider shadow-lg shadow-primary/25 border border-white/10 flex items-center justify-center gap-1 mt-1">
                            <span>✨ VISIT PROMPTRO.WEB</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions Column */}
                      <div className="flex-1 flex flex-col justify-center gap-6 w-full text-center md:text-left">
                        <div>
                          <h3 className="text-xl font-bold">Share Your Campaign</h3>
                          <p className="text-xs text-[#756d8d] mt-1">We've compiled your select prompts into a high-converting story asset. Save it or publish directly to social media!</p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <button 
                            onClick={downloadPoster}
                            className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                          >
                            <Download className="w-4 h-4" /> Download Poster Image
                          </button>

                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={shareToTwitter}
                              className="h-11 rounded-xl border border-[#e9e2f3] dark:border-white/10 hover:bg-primary/5 font-bold text-xs flex items-center justify-center gap-2"
                            >
                              <Twitter className="w-4 h-4 text-sky-400" /> Share on X
                            </button>
                            <button 
                              onClick={shareToPinterest}
                              className="h-11 rounded-xl border border-[#e9e2f3] dark:border-white/10 hover:bg-primary/5 font-bold text-xs flex items-center justify-center gap-2"
                            >
                              <Trophy className="w-4 h-4 text-red-600" /> Share Pin
                            </button>
                          </div>

                          <button 
                            onClick={copyCampaignLink}
                            className="w-full h-11 rounded-xl bg-[#f8f7fc] dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 hover:text-primary font-bold text-xs flex items-center justify-center gap-2"
                          >
                            <Copy className="w-4 h-4" /> Copy Campaign Link
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex gap-3 text-left">
                          <Info className="w-5 h-5 shrink-0 text-amber-500" />
                          <span><strong>Tip:</strong> Upload the downloaded image directly as an Instagram or Facebook Story, and add your campaign link via the link sticker!</span>
                        </div>
                      </div>
                    </div>
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
              className="absolute inset-0 bg-black/5 backdrop-blur-[3px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl rounded-[2.5rem] overflow-hidden modal-glass"
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

        {confirmConfig.isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/5 backdrop-blur-[3px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md rounded-[2.5rem] overflow-hidden flex flex-col p-8 relative modal-glass"
            >
              <button 
                onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-[#f8f7fc] dark:bg-white/5 flex items-center justify-center hover:scale-105 transition-transform text-[#756d8d] dark:text-[#a09bb5] hover:text-[#171421] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6",
                  confirmConfig.type === 'danger' && "bg-red-500/10 text-red-500 shadow-lg shadow-red-500/5",
                  confirmConfig.type === 'warning' && "bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/5",
                  confirmConfig.type === 'info' && "bg-primary/10 text-primary shadow-lg shadow-primary/5"
                )}>
                  {confirmConfig.type === 'danger' ? (
                    <Trash2 className="w-8 h-8" />
                  ) : confirmConfig.type === 'warning' ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : (
                    <Info className="w-8 h-8" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#171421] dark:text-white mb-2">
                  {confirmConfig.title}
                </h3>
                <p className="text-sm text-[#756d8d] dark:text-[#a09bb5] font-medium leading-relaxed max-w-[280px]">
                  {confirmConfig.message}
                </p>
              </div>

              <div className="mt-8 flex gap-3 w-full">
                <button
                  onClick={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-3.5 rounded-2xl border border-[#e9e2f3] dark:border-white/10 font-bold text-[#756d8d] dark:text-[#a09bb5] hover:bg-[#f8f7fc] dark:hover:bg-white/5 transition-all text-sm"
                >
                  {confirmConfig.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={confirmConfig.onConfirm}
                  className={cn(
                    "flex-1 py-3.5 rounded-2xl text-white font-bold transition-all text-sm hover:scale-[1.02] active:scale-[0.98]",
                    confirmConfig.type === 'danger' && "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20",
                    confirmConfig.type === 'warning' && "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20",
                    confirmConfig.type === 'info' && "bg-primary hover:bg-primary/95 shadow-lg shadow-primary/20"
                  )}
                >
                  {confirmConfig.confirmText || 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <dialog id="banner-modal" className="modal backdrop:bg-white/8 dark:backdrop:bg-white/3 backdrop:backdrop-blur-sm rounded-[2rem] p-0 w-full max-w-2xl overflow-hidden m-auto modal-glass">
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
            <button 
              type="button" 
              onClick={() => document.getElementById('banner-modal')?.closest('dialog')?.close()} 
              className="px-6 py-3 rounded-2xl border border-[#e2dbe8] dark:border-white/10 font-bold text-[#6f6684] dark:text-[#afa6c8] hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? (savingText || 'Saving...') : 'Save Banner'}
            </button>
          </div>
        </form>
      </dialog>
    </ErrorBoundary>
  );
}
