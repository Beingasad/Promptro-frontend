import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  X, Mail, ShieldCheck, Clock, User, Sparkles, Loader2, 
  BadgeCheck, Edit3, Save, LogOut, Camera, Layers, AlertCircle, ChevronDown, Check, RefreshCw,
  GalleryVerticalEnd, Bookmark
} from 'lucide-react';
import axios from 'axios';
import { updateProfile } from 'firebase/auth';
import { API_BASE_URL } from '../config';
import { readLocalActivity, onActivityUpdated } from '../lib/activity';

interface BackendProfile {
  id: number;
  firebase_uid: string;
  first_name: string;
  last_name: string | null;
  gender: string | null;
  username: string | null;
  email: string;
  provider: string;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  email_verified: boolean;
  created_at: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  backendEmailVerified: boolean;
  setBackendEmailVerified: (val: boolean) => void;
  handleLogout: () => void;
  localAvatar: string;
  setLocalAvatar: (avatar: string) => void;
  profileInitial: string;
  profilePhoto: string;
  onProfileUpdated?: (firstName: string, lastName: string) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  backendEmailVerified,
  setBackendEmailVerified,
  handleLogout,
  localAvatar,
  setLocalAvatar,
  profileInitial,
  profilePhoto,
  onProfileUpdated
}: ProfileModalProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cropper states
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [startPinchDist, setStartPinchDist] = useState(0);
  const [startPinchZoom, setStartPinchZoom] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  
  // Form input fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [savedCount, setSavedCount] = useState(0);
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Prevent page scroll when the modal or cropping sub-modal is open
  useEffect(() => {
    if (isOpen || !!cropImageSrc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, cropImageSrc]);

  // Fetch saved prompts count and collections count
  useEffect(() => {
    setSavedCount(readLocalActivity().savedPrompts.length);
    setCollectionsCount(readLocalActivity().collections?.length || 0);
    return onActivityUpdated(() => {
      setSavedCount(readLocalActivity().savedPrompts.length);
      setCollectionsCount(readLocalActivity().collections?.length || 0);
    });
  }, []);

  // Load backend profile
  useEffect(() => {
    if (!currentUser || !isOpen) return;
    
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/profile/${currentUser.uid}`);
        if (res.data) {
          setProfile(res.data);
          setFirstName(res.data.first_name || '');
          setLastName(res.data.last_name || '');
          setUsername(res.data.username || '');
          setGender(res.data.gender || '');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            // Auto-register legacy/missing profile
            const displayNameClean = currentUser.displayName || 'User';
            const names = displayNameClean.trim().split(' ');
            const fName = names[0] || 'User';
            const lName = names.slice(1).join(' ') || null;
            const isGoogle = currentUser.providerData?.some((p: any) => p.providerId === 'google.com');
            
            const resReg = await axios.post(`${API_BASE_URL}/api/auth/register-profile`, {
              firebase_uid: currentUser.uid,
              first_name: fName,
              last_name: lName,
              email: currentUser.email,
              provider: isGoogle ? 'google' : 'email',
              terms_accepted: true
            });
            
            if (resReg.data) {
              setProfile(resReg.data);
              setFirstName(resReg.data.first_name || '');
              setLastName(resReg.data.last_name || '');
              setUsername(resReg.data.username || '');
              setGender(resReg.data.gender || '');
            }
          } catch (regErr) {
            console.error("Failed to auto-register missing user profile:", regErr);
            setError("Could not register profile in database.");
          }
        } else {
          console.error("Failed to load backend profile details:", err);
          setError("Could not load profile data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, isOpen]);

  // Photo selection file handler
  const handleAvatarFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (!src) return;
      
      const tempImg = new Image();
      tempImg.onload = () => {
        const containerSize = 256;
        let w = tempImg.width;
        let h = tempImg.height;
        
        const ratio = w / h;
        if (ratio > 1) {
          h = containerSize;
          w = containerSize * ratio;
        } else {
          w = containerSize;
          h = containerSize / ratio;
        }
        
        setImgDimensions({ width: w, height: h });
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setCropImageSrc(src);
      };
      tempImg.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition({ x: position.x, y: position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition({
      x: initialPosition.x + dx,
      y: initialPosition.y + dy
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsDragging(false);
      setIsPinching(true);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      setStartPinchDist(dist);
      setStartPinchZoom(zoom);
    } else if (e.touches.length === 1) {
      setIsPinching(false);
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY });
      setInitialPosition({ x: position.x, y: position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent background scrolling while zooming or dragging the crop image
    if (e.cancelable && (isPinching || isDragging)) {
      e.preventDefault();
    }
    if (e.touches.length === 2 && isPinching) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (startPinchDist > 0) {
        const factor = dist / startPinchDist;
        const nextZoom = Math.min(Math.max(startPinchZoom * factor, 1), 3);
        setZoom(nextZoom);
      }
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;
      setPosition({
        x: initialPosition.x + dx,
        y: initialPosition.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsPinching(false);
    setStartPinchDist(0);
  };

  // Canvas Crop & Save confirm handler
  const handleCropConfirm = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx && cropImageSrc) {
      ctx.beginPath();
      ctx.arc(200, 200, 200, 0, Math.PI * 2);
      ctx.clip();

      const img = new Image();
      img.onload = () => {
        const previewWidth = imgDimensions.width;
        const previewHeight = imgDimensions.height;
        const scaleFactor = 400 / 192; // 192px is diameter of w-48 preview circle
        
        const dx = position.x * scaleFactor;
        const dy = position.y * scaleFactor;
        const sWidth = previewWidth * zoom * scaleFactor;
        const sHeight = previewHeight * zoom * scaleFactor;
        
        ctx.drawImage(
          img,
          200 + dx - sWidth / 2,
          200 + dy - sHeight / 2,
          sWidth,
          sHeight
        );

        // Quality set to 0.85 jpeg to optimize storage space
        const base64Cropped = canvas.toDataURL('image/jpeg', 0.85);
        localStorage.setItem(`promptro:avatar:${currentUser.uid}`, base64Cropped);
        setLocalAvatar(base64Cropped);
        setCropImageSrc(null);
      };
      img.src = cropImageSrc;
    }
  };

  // Form submit handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      // 1. Save changes to DB
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile/${currentUser.uid}`, {
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        username: username.trim() || null,
        gender: gender || null
      });

      // 2. Sync Firebase auth display name
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile(currentUser, { displayName: fullName });
      
      // Update local profile state
      setProfile(res.data);
      setIsEditing(false);

      if (onProfileUpdated) {
        onProfileUpdated(firstName.trim(), lastName.trim());
      }
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.detail || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    if (!currentUser) return;
    setVerificationLoading(true);
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-verification`, {
        email: currentUser.email,
        firebase_uid: currentUser.uid,
      });
      setVerificationSuccess(true);
      setTimeout(() => setVerificationSuccess(false), 6000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send verification email.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short'
    });
  };

  // Check if any fields are missing
  const isProfileIncomplete = !firstName.trim() || !lastName.trim() || !username.trim() || !gender;

  if (!currentUser) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.button
              type="button"
              className="fixed inset-0 bg-[#0d0b14]/40 dark:bg-black/50 backdrop-blur-md cursor-default w-full h-full border-none outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-label="Close modal backdrop"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[22rem] overflow-hidden rounded-[2.5rem] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-[#171421]/80 p-6 text-center shadow-[0_22px_54px_rgba(72,56,118,0.18)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-3xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center text-primary">
                <User className="h-9 w-9" />
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-[#171421] dark:text-white">Welcome to Promptro</h3>
              <p className="mt-1.5 text-xs text-[#756d8d] dark:text-[#afa6c8] leading-relaxed">
                Connect your account to save prompts, customize your style, and join the Promptro creator community.
              </p>
              <a
                href="/auth"
                onClick={onClose}
                className="mt-5 flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-xs font-bold text-white shadow-md shadow-primary/20 hover:scale-102 transition-transform"
              >
                Login / Sign Up
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.button
            type="button"
            className="fixed inset-0 backdrop-blur-[2px] cursor-default w-full h-full border-none outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close modal backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col w-full max-w-[26rem] max-h-[85vh] sm:max-h-[90vh] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-white/50 dark:border-white/10 bg-white/75 dark:bg-[#171421]/80 p-5 sm:p-7 shadow-[0_22px_54px_rgba(72,56,118,0.18)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur-3xl dark:text-white"
          >
            {/* Ambient background glows */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_25%_0%,rgba(139,92,246,0.16),transparent_44%),radial-gradient(circle_at_85%_0%,rgba(255,106,61,0.12),transparent_42%)]" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#e9e2f3] dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#756d8d] dark:text-[#afa6c8] transition-transform hover:scale-105 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {loading ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-xs text-[#756d8d] dark:text-[#afa6c8] font-bold uppercase tracking-wider">Syncing Details...</p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col gap-4 overflow-y-auto hide-scrollbar min-h-0 pr-1">
                {/* Top Section */}
                <div className="flex flex-col items-center text-center mt-1">
                  {/* Large Avatar with camera upload edit overlay */}
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 select-none">
                    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/80 dark:border-white/10 bg-[#f8f7fc] dark:bg-[#201c31] shadow-[0_12px_28px_rgba(72,56,118,0.12)]">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt={firstName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-[#ff6a3d] text-2xl sm:text-3xl font-black text-white">
                          {profileInitial}
                        </span>
                      )}
                    </div>
                    {/* Camera Upload Trigger */}
                    <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all">
                      <Camera className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFileSelected} />
                    </label>
                  </div>

                  {/* Full Name & Username */}
                  <h3 className="text-lg sm:text-xl font-black text-[#171421] dark:text-white mt-2 leading-snug">
                    {firstName} {lastName}
                  </h3>
                  
                  {username ? (
                    <p className="text-xs font-bold text-primary dark:text-[#a78bfa] mt-0.5">@{username}</p>
                  ) : (
                    <p className="text-xs font-semibold text-[#8a819d] italic mt-0.5">No username set</p>
                  )}

                  {/* Email & Verified Badge */}
                  <div className="flex items-center justify-center gap-1.5 mt-1.5 bg-white/40 dark:bg-white/5 px-3 py-1 rounded-full border border-white/60 dark:border-white/5">
                    <Mail className="h-3.5 w-3.5 text-[#8a819d] shrink-0" />
                    <span className="text-xs font-medium text-[#5f5774] dark:text-[#c4bed6] truncate max-w-[12rem]">{currentUser.email}</span>
                    {backendEmailVerified ? (
                      <span className="inline-flex items-center text-[10px] font-black text-emerald-500 ml-1">
                        <BadgeCheck className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold text-amber-500 ml-1">
                        !
                      </span>
                    )}
                  </div>
                </div>

                {isProfileIncomplete && !isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 items-start p-3 bg-gradient-to-r from-primary/8 to-secondary/4 border border-primary/15 rounded-xl text-[11px] font-semibold text-[#5f5774] dark:text-[#c4bed6]"
                  >
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-[#171421] dark:text-white block">Complete Your Profile</span>
                      <p className="opacity-85 leading-normal mt-0.5">
                        Please set your username, last name, and gender to personalize your Promptro dashboard!
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="mt-2 text-[10px] font-black text-primary hover:underline uppercase tracking-wider flex items-center gap-1"
                      >
                        Complete Profile Now →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Info Display / Edit Form */}
                <div className="min-h-0">
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.form
                        key="edit-form"
                        onSubmit={handleSave}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-col gap-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8a819d] ml-1 block mb-1">First Name</span>
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="First Name"
                              className="glass-input text-xs font-semibold h-11 py-0 w-full"
                              required
                            />
                          </label>

                          <label className="block text-left">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#8a819d] ml-1 block mb-1">Last Name</span>
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Last Name"
                              className="glass-input text-xs font-semibold h-11 py-0 w-full"
                            />
                          </label>
                        </div>

                        <label className="block text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8a819d] ml-1 block mb-1">Username</span>
                          <span className="relative flex items-center">
                            <span className="absolute left-3.5 text-xs font-bold text-primary">@</span>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                              placeholder="username"
                              className="glass-input text-xs font-semibold h-11 py-0 pl-7 w-full"
                            />
                          </span>
                        </label>

                        <label className="block text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8a819d] ml-1 block mb-1">Gender</span>
                          <div className="relative">
                            <select
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="glass-input text-xs font-semibold h-11 py-0 appearance-none pr-8 bg-transparent w-full"
                            >
                              <option value="" disabled className="bg-[#14111f]">Select Gender</option>
                              <option value="Male" className="bg-[#14111f]">Male</option>
                              <option value="Female" className="bg-[#14111f]">Female</option>
                              <option value="Other" className="bg-[#14111f]">Other</option>
                              <option value="Prefer not to say" className="bg-[#14111f]">Prefer not to say</option>
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a819d] pointer-events-none" />
                          </div>
                        </label>

                        {error && (
                          <div className="flex gap-2 items-center text-rose-500 font-bold text-[11px] p-2.5 bg-rose-500/10 border border-rose-500/15 rounded-xl">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        <div className="flex gap-2.5 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setError(null);
                              // Reset values to profile data
                              if (profile) {
                                setFirstName(profile.first_name || '');
                                setLastName(profile.last_name || '');
                                setUsername(profile.username || '');
                                setGender(profile.gender || '');
                              }
                            }}
                            className="flex-1 h-10 rounded-full border border-[#e9e2f3] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white transition-all hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 h-10 rounded-full bg-primary text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 hover:scale-102 disabled:opacity-60"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="profile-stats"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-col gap-4"
                      >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Stat 1: Verification */}
                          <div className="bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center">
                            {backendEmailVerified ? (
                              <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            )}
                            <span className={`text-xs font-bold mt-1.5 ${backendEmailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                              {backendEmailVerified ? 'Verified' : 'Unverified'}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a819d] opacity-60 mt-0.5">Verification</span>
                          </div>

                          {/* Stat 2: Joined Date */}
                          <div className="bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center">
                            <Clock className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-xs font-bold text-[#171421] dark:text-white mt-1.5">
                              {profile ? formatDate(profile.created_at) : 'N/A'}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a819d] opacity-60 mt-0.5">Joined Date</span>
                          </div>

                          {/* Stat 3: Saved Count */}
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate('/saved');
                            }}
                            className="bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center transition-all hover:scale-102 active:scale-98 cursor-pointer hover:bg-white/60 dark:hover:bg-white/10"
                          >
                            <Bookmark className="w-5 h-5 text-[#ff6a3d] shrink-0" />
                            <span className="text-xs font-bold text-[#171421] dark:text-white mt-1.5">
                              {savedCount}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a819d] opacity-60 mt-0.5">Saved Prompts</span>
                          </button>

                          {/* Stat 4: Collections Count */}
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate('/collections');
                            }}
                            className="bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5 rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center text-center transition-all hover:scale-102 active:scale-98 cursor-pointer hover:bg-white/60 dark:hover:bg-white/10"
                          >
                            <GalleryVerticalEnd className="w-5 h-5 text-violet-500 shrink-0" />
                            <span className="text-xs font-bold text-[#171421] dark:text-white mt-1.5">
                              {collectionsCount}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a819d] opacity-60 mt-0.5">Collections</span>
                          </button>
                        </div>

                        {/* Verification notice if not verified */}
                        {!backendEmailVerified && profile?.provider === 'email' && (
                          <div className="flex flex-col gap-2 p-3.5 bg-amber-500/5 border border-amber-500/15 rounded-2xl text-left">
                            <div className="flex gap-2 items-start text-xs font-semibold text-amber-700 dark:text-amber-400">
                              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                              <p>Email address not verified yet. Verify your account to secure your boards.</p>
                            </div>
                            {verificationSuccess && (
                              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                ✓ Verification email sent! Please check your inbox.
                              </div>
                            )}
                            {error && (
                              <div className="text-[11px] font-bold text-rose-500 mt-1">
                                {error}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleSendVerification}
                              disabled={verificationLoading}
                              className="mt-1 inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-primary-hover w-max"
                            >
                              {verificationLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                              Send Verification Email
                            </button>
                          </div>
                        )}

                        {/* Display list of details in minimal layout */}
                        <div className="flex flex-col gap-2.5 mt-1 border-t border-[#e9e2f3] dark:border-white/5 pt-4 text-left text-xs font-semibold text-[#5f5774] dark:text-[#c4bed6]">
                          <div className="flex justify-between">
                            <span className="text-[#8a819d]">Gender</span>
                            <span className="font-bold text-[#171421] dark:text-white">{gender || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8a819d]">Login Provider</span>
                            <span className="font-bold text-[#171421] dark:text-white uppercase tracking-wider">{profile?.provider || 'email'}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2.5 mt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-white/70 dark:bg-white/5 border border-[#e9e2f3] dark:border-white/10 text-xs font-bold text-primary shadow-sm hover:scale-101 hover:bg-white/90 active:scale-99 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit Profile Details
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-rose-500/10 hover:bg-rose-500/18 text-xs font-bold text-rose-500 border border-rose-500/10 active:scale-99 transition-all cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sub-Modal for Image Cropping/Zooming */}
          <AnimatePresence>
            {cropImageSrc && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0d0b14]/75 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-[20rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/94 dark:border-white/10 dark:bg-[#14111f]/94 p-5 text-center shadow-2xl backdrop-blur-xl"
                >
                  <h4 className="text-sm font-black text-[#171421] dark:text-white uppercase tracking-wider mb-4">Adjust Photo</h4>
                  
                  <div className="flex flex-col items-center gap-4">
                    {/* Cropper Box */}
                    <div 
                      className="relative w-64 h-64 bg-black/40 rounded-[1.75rem] overflow-hidden cursor-move select-none border border-[#e9e2f3] dark:border-white/10"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <img
                        src={cropImageSrc}
                        alt="Crop preview"
                        className="absolute pointer-events-none max-w-none origin-center"
                        style={{
                          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                          left: '50%',
                          top: '50%',
                          width: imgDimensions.width,
                          height: imgDimensions.height,
                          marginLeft: -imgDimensions.width / 2,
                          marginTop: -imgDimensions.height / 2,
                        }}
                      />
                      {/* Circular Cutout Overlay with beautiful shadow border */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-white pointer-events-none shadow-[0_0_0_999px_rgba(13,11,20,0.6)]" />
                    </div>

                    {/* Slider zoom control */}
                    <div className="w-full flex items-center gap-3 px-1.5 mt-2">
                      <span className="text-xs font-bold text-[#8a819d]">-</span>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.02" 
                        value={zoom} 
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="flex-1 h-1.5 bg-[#e9e2f3] dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-xs font-bold text-primary">+</span>
                    </div>
                    
                    <p className="text-[10px] text-[#8a819d] font-semibold">Drag to position, use slider to zoom</p>

                    {/* Buttons */}
                    <div className="flex gap-2.5 w-full mt-2">
                      <button
                        type="button"
                        onClick={() => setCropImageSrc(null)}
                        className="flex-1 h-10 rounded-full border border-[#e9e2f3] dark:border-white/10 text-xs font-bold text-[#242033] dark:text-white transition-all hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCropConfirm}
                        className="flex-1 h-10 rounded-full bg-primary text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 hover:scale-102"
                      >
                        <Check className="w-4 h-4" />
                        Crop & Save
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
