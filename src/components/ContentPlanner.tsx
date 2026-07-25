import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Calendar, Film, Image, Image as ImageIcon, FileText, CheckCircle, Clock, Trash2, Zap,
  Video, Eye, Play, X, UploadCloud, ChevronRight, BarChart3, AlertCircle, Sparkles, Filter, Edit2,
  ClipboardList, Paperclip, FolderOpen, Instagram, Heart, Bookmark, MessageCircle, Send,
  List, Smartphone, Tv, Monitor, Rotate3d, Layers, Globe, PlayCircle, Lock, ShieldCheck, GripVertical, Link,
  ExternalLink, Copy, Check, Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentPlan } from '../types';
import { launchGooglePicker } from '../lib/googlePicker';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface ContentPlannerProps {
  plans: ContentPlan[];
  onAddPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt'>) => void;
  onUpdatePlanStatus: (id: string, status: ContentPlan['status']) => void;
  onDeletePlan: (id: string) => void;
  onUpdatePlan: (plan: ContentPlan) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  currentUser?: string;
  permissionLevel?: 'viewer' | 'editor';
  searchQuery?: string;
  uiMode?: 'human' | 'ai';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook'];
const TYPES = ['Video', 'Image', 'Article', 'Campaign', 'Story'] as const;

const getMonthDetails = (monthName: string, selectedYear: number = 2026) => {
  const monthIndex = MONTHS.indexOf(monthName);
  if (monthIndex === -1) return { totalDays: 30, startDayOfWeek: 0 };
  const firstDay = new Date(selectedYear, monthIndex, 1);
  const startDayOfWeek = firstDay.getDay(); // 0-6
  const totalDays = new Date(selectedYear, monthIndex + 1, 0).getDate();
  return { totalDays, startDayOfWeek };
};

const PRELOADED_TEMPLATES = [
  {
    title: "Swanaya Brand Anthem Reveal",
    type: "Video" as const,
    platform: "YouTube" as const,
    description: "Cinematic, high-production introduction video showcasing our brand evolution, custom workspace automation, and core mission.",
    suggestedStatus: "Planned" as const
  },
  {
    title: "Behind the Scenes Design Sprint",
    type: "Story" as const,
    platform: "Instagram" as const,
    description: "An authentic, raw look at our creative team brainstorming and assembling custom media dashboards.",
    suggestedStatus: "In Progress" as const
  },
  {
    title: "Node.js Container Deployment Deep Dive",
    type: "Article" as const,
    platform: "LinkedIn" as const,
    description: "Comprehensive technical guide on optimizing container cold-starts and bundling server files cleanly with esbuild.",
    suggestedStatus: "Planned" as const
  },
  {
    title: "Client Workspace Tour",
    type: "Video" as const,
    platform: "TikTok" as const,
    description: "Fast-paced, high-energy walkthrough showing how a client uses our Attendance & Content Planner nodes.",
    suggestedStatus: "Completed" as const
  },
  {
    title: "Interactive Live Q&A Stream",
    type: "Campaign" as const,
    platform: "YouTube" as const,
    description: "Direct livestream session addressing custom content strategies, workflow automation, and client metrics tracking.",
    suggestedStatus: "Review" as const
  },
  {
    title: "Customer Success Carousel",
    type: "Image" as const,
    platform: "Instagram" as const,
    description: "Multi-slide showcase highlighting the attendance logging efficiency improvements achieved in Q2.",
    suggestedStatus: "Planned" as const
  },
  {
    title: "Enterprise Media Pipeline Playbook",
    type: "Article" as const,
    platform: "LinkedIn" as const,
    description: "Case study illustrating how the SWANAYA custom scheduler improves digital campaign consistency by 40%.",
    suggestedStatus: "Planned" as const
  },
  {
    title: "Interactive Productivity Poll",
    type: "Story" as const,
    platform: "Facebook" as const,
    description: "Engagement post soliciting audience feedback on workspace setups, clock-in schedules, and focus techniques.",
    suggestedStatus: "Planned" as const
  }
];

interface AssignedTask {
  id: string;
  name: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  period: 'Monthly' | 'Yearly';
  role?: string;
  priority?: 'High' | 'Medium' | 'Low';
  googleSynced?: boolean;
  aiDescription?: string;
  aiTags?: string[];
  aiSeoKeywords?: string[];
  aiSeoDescription?: string;
  tags?: string;
  createdBy?: string;
}

export default function ContentPlanner({ 
  plans, 
  onAddPlan, 
  onUpdatePlanStatus, 
  onDeletePlan,
  onUpdatePlan,
  addLog,
  currentUser = 'aadithyan',
  permissionLevel = 'editor',
  searchQuery = '',
  uiMode = 'ai'
}: ContentPlannerProps) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'entity-manager' | 'under-development' | 'accounts-registry'>('monthly');
  const [formDirectMediaUrl, setFormDirectMediaUrl] = useState('');
  
  // Dynamic Year Changer state (supports range 2023-2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Dynamic Instagram Accounts Registry State
  const [instagramAccounts, setInstagramAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_instagram_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading instagram accounts', e);
      }
    }
    return [
      {
        id: '1',
        handle: '@swanaya_enterprises',
        name: 'Swanaya Media Enterprises',
        followers: '45.2K',
        bio: 'Official media workspace. Direct content planner, automation pipelines, and high-performance digital campaign logs. 🚀🎬✨',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80',
        category: 'Media Production',
        registeredYear: 2026,
        platform: 'Instagram'
      },
      {
        id: '2',
        handle: '@chai_with_aadi',
        name: 'Chai with Aadithyan (Instagram)',
        followers: '108K',
        bio: 'Weekly podcasts about future design paradigms, tech automation, and digital media craft. Hosted by Aadithyan. ☕🎙️💡',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
        category: 'Tech Podcast',
        registeredYear: 2026,
        platform: 'Instagram'
      },
      {
        id: '3',
        handle: '@youtube_chai_podcasts',
        name: 'Chai with Aadithyan (YouTube Channel)',
        followers: '240K',
        bio: 'Official YouTube Podcast Channel featuring long-form video interviews, technical teardowns, and design keynotes. ☕🔴📺',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
        category: 'YouTube Podcast Studio',
        registeredYear: 2026,
        platform: 'YouTube'
      },
      {
        id: '4',
        handle: '@youtube_official_channel',
        name: 'Swanaya YouTube Main Studio',
        followers: '500K',
        bio: 'Primary YouTube Channel for official brand anthems, tech releases, and product launches. 🔴🎬🚀',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=80',
        category: 'Official YouTube Channel',
        registeredYear: 2026,
        platform: 'YouTube'
      },
      {
        id: '5',
        handle: '@youtube_shorts_studio',
        name: 'YouTube Shorts Studio',
        followers: '180K',
        bio: 'High-speed vertical shorts, tech tips, and rapid clip previews. ⚡🔴🔥',
        avatar: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=80',
        category: 'YouTube Shorts',
        registeredYear: 2026,
        platform: 'YouTube'
      },
      {
        id: '6',
        handle: '@come_along_title',
        name: 'Come Along with Title',
        followers: '82.5K',
        bio: 'Exclusive behind-the-scenes title sequences, cinematic storyboards, and episodic creative previews. 🎬✨🎨',
        avatar: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=80',
        category: 'Creative Series',
        registeredYear: 2026,
        platform: 'Instagram'
      },
      {
        id: '7',
        handle: '@instagram_meta_ads',
        name: 'Instagram Meta Ads',
        followers: '250K',
        bio: 'Meta Ads Manager & Sponsored Campaign Registry. Direct automated multi-format ad deployment. 📣📊🎯',
        avatar: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=80',
        category: 'Sponsored Meta Ads',
        registeredYear: 2026,
        platform: 'Instagram'
      },
      {
        id: '8',
        handle: '@facebook_ad_registry',
        name: 'Facebook Ad Registry',
        followers: '1.2M',
        bio: 'Official Facebook & Meta Transparency Ad Archive and Verified Ad Registry. 🛡️📑🌐',
        avatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=80',
        category: 'Ad Transparency Registry',
        registeredYear: 2026,
        platform: 'Facebook'
      },
      {
        id: '9',
        handle: '@instagram_reels_official',
        name: 'Instagram Reels Studio',
        followers: '320K',
        bio: 'Dedicated short-form video portal, trending audio syncs, and viral reel series. 🎬⚡🔥',
        avatar: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=80',
        category: 'Reels Creator Studio',
        registeredYear: 2026,
        platform: 'Instagram'
      },
      {
        id: '10',
        handle: '@instagram_carousels_hub',
        name: 'Instagram Carousel Studio',
        followers: '95K',
        bio: 'Multi-slide visual storyboards, carousel infographic sequences, and swipeable tutorials. 🎠📊✨',
        avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=80',
        category: 'Carousel Infographics',
        registeredYear: 2026,
        platform: 'Instagram'
      },
      {
        id: '11',
        handle: '@instagram_single_images',
        name: 'Instagram Single Image Showcase',
        followers: '68K',
        bio: 'High-res single image photography, visual aesthetics, and brand poster showcase. 🖼️🎨✨',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=80',
        category: 'Visual Showcase',
        registeredYear: 2026,
        platform: 'Instagram'
      },
      {
        id: '12',
        handle: '@chai',
        name: 'Chai Masterclass',
        followers: '12K',
        bio: 'Official training hub for corporate media planning and generative workspace tools. 🍃🤖📖',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=80',
        category: 'Education Hub',
        registeredYear: 2024,
        platform: 'Instagram'
      }
    ];
  });
  const [activeInstaAccountId, setActiveInstaAccountId] = useState('1');
  const activeInstagramAccount = instagramAccounts.find(a => a.id === activeInstaAccountId) || instagramAccounts[0];

  // Sync accounts to localStorage
  useEffect(() => {
    localStorage.setItem('swanaya_instagram_accounts', JSON.stringify(instagramAccounts));
  }, [instagramAccounts]);

  // Account registry editor states
  const [isEditingInstaAccount, setIsEditingInstaAccount] = useState(false);
  const [editedInstaHandle, setEditedInstaHandle] = useState('');
  const [editedInstaName, setEditedInstaName] = useState('');
  const [editedInstaBio, setEditedInstaBio] = useState('');
  const [editedInstaFollowers, setEditedInstaFollowers] = useState('');
  const [editedInstaCategory, setEditedInstaCategory] = useState('');
  const [editedInstaYear, setEditedInstaYear] = useState(2026);

  // States to add a new account
  const [isAddingInstaAccount, setIsAddingInstaAccount] = useState(false);
  const [newInstaHandle, setNewInstaHandle] = useState('');
  const [newInstaName, setNewInstaName] = useState('');
  const [newInstaBio, setNewInstaBio] = useState('');
  const [newInstaFollowers, setNewInstaFollowers] = useState('10K');
  const [newInstaCategory, setNewInstaCategory] = useState('Media Production');
  const [newInstaYear, setNewInstaYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [plannerViewMode, setPlannerViewMode] = useState<'list' | 'calendar'>('list');
  const [viewingPostPlan, setViewingPostPlan] = useState<ContentPlan | null>(null);
  const [multi3dModel, setMulti3dModel] = useState<'smartphone' | 'cinema' | 'hologram' | 'billboard'>('smartphone');
  const [multi3dRotation, setMulti3dRotation] = useState<number>(15);
  const [multi3dGlow, setMulti3dGlow] = useState<number>(40);
  const [multi3dPerspective, setMulti3dPerspective] = useState<number>(800);

  // Recent Development Deployments & Live Applications
  const [recentDevelopments, setRecentDevelopments] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_recent_developments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const exists = parsed.some((item: any) => item.url?.includes('planora-odessesy.netlify.app'));
        if (!exists) {
          return [
            {
              id: 'planora-odyssey',
              name: 'Planora Odyssey',
              url: 'https://planora-odessesy.netlify.app/',
              description: 'Interactive content roadmap & Planora Odyssey web application platform deployed live on Netlify.',
              status: 'LIVE DEPLOYMENT',
              platform: 'Netlify',
              category: 'Web Application / Live Platform',
              addedAt: '2026-07-25',
              isFeatured: true
            },
            ...parsed
          ];
        }
        return parsed;
      } catch (e) {
        console.error('Error loading recent developments', e);
      }
    }
    return [
      {
        id: 'planora-odyssey',
        name: 'Planora Odyssey',
        url: 'https://planora-odessesy.netlify.app/',
        description: 'Interactive content roadmap & Planora Odyssey web application platform deployed live on Netlify.',
        status: 'LIVE DEPLOYMENT',
        platform: 'Netlify',
        category: 'Web Application / Live Platform',
        addedAt: '2026-07-25',
        isFeatured: true
      },
      {
        id: 'meta-graph-publisher',
        name: 'Meta Graph API Direct Auto-Publisher',
        url: 'https://developers.facebook.com/docs/instagram-api/',
        description: 'OAuth token exchange and direct scheduled posting gateway for Instagram Reels & FB Pages.',
        status: 'IN DEVELOPMENT (65%)',
        platform: 'Meta Cloud API',
        category: 'Backend Pipeline',
        addedAt: '2026-07-24',
        isFeatured: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('swanaya_recent_developments', JSON.stringify(recentDevelopments));
  }, [recentDevelopments]);

  const [isAddingDev, setIsAddingDev] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [newDevUrl, setNewDevUrl] = useState('');
  const [newDevDesc, setNewDevDesc] = useState('');
  const [newDevStatus, setNewDevStatus] = useState('LIVE DEPLOYMENT');
  const [newDevCategory, setNewDevCategory] = useState('Web App / Netlify');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewIframeUrl, setPreviewIframeUrl] = useState<string | null>(null);

  const isSystemAdmin = currentUser?.toLowerCase() === 'aadithyan' || currentUser?.toLowerCase() === 'administrator';
  const [workspaceMode, setWorkspaceMode] = useState<'private' | 'all'>('private');

  // Filter plans for individual workspace isolation: users can ONLY see content they created or assigned to them
  const visiblePlans = plans.filter(p => {
    if (isSystemAdmin && workspaceMode === 'all') return true;
    if (!p.createdBy) return true;
    const cleanUser = currentUser?.toLowerCase() || '';
    const isOwner = p.createdBy?.toLowerCase() === cleanUser;
    const isAssigned = p.assignee?.toLowerCase() === cleanUser;
    return isOwner || isAssigned;
  });

  // Drag & Drop States
  const [draggedPlanId, setDraggedPlanId] = useState<string | null>(null);
  const [dragOverPlanId, setDragOverPlanId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // Drag & Drop Handlers for Reordering and Calendar Rescheduling
  const handleDragStartPlan = (e: React.DragEvent, planId: string) => {
    if (permissionLevel === 'viewer') return;
    e.dataTransfer.setData('text/plain', planId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedPlanId(planId);
  };

  const handleDragOverPlan = (e: React.DragEvent, planId: string) => {
    if (permissionLevel === 'viewer' || !draggedPlanId || draggedPlanId === planId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPlanId(planId);
  };

  const handleDropOnPlan = (e: React.DragEvent, targetPlan: ContentPlan) => {
    e.preventDefault();
    if (permissionLevel === 'viewer' || !draggedPlanId) return;

    const sourcePlan = plans.find(p => p.id === draggedPlanId);
    if (!sourcePlan || sourcePlan.id === targetPlan.id) {
      setDraggedPlanId(null);
      setDragOverPlanId(null);
      return;
    }

    // Reorder/swap source and target plan dates
    const updatedSource: ContentPlan = {
      ...sourcePlan,
      day: targetPlan.day,
      month: targetPlan.month,
      assignedDate: targetPlan.assignedDate
    };
    const updatedTarget: ContentPlan = {
      ...targetPlan,
      day: sourcePlan.day,
      month: sourcePlan.month,
      assignedDate: sourcePlan.assignedDate
    };

    onUpdatePlan(updatedSource);
    onUpdatePlan(updatedTarget);

    addLog(`Drag & Drop: Swapped position/schedule of "${sourcePlan.title}" (Day ${sourcePlan.day}) and "${targetPlan.title}" (Day ${targetPlan.day})`, 'action');

    setDraggedPlanId(null);
    setDragOverPlanId(null);
  };

  const handleDragOverDay = (e: React.DragEvent, dayNum: number) => {
    if (permissionLevel === 'viewer' || !draggedPlanId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDay(dayNum);
  };

  const handleDropOnCalendarDay = (e: React.DragEvent, dayNum: number) => {
    e.preventDefault();
    if (permissionLevel === 'viewer' || !draggedPlanId) return;

    const sourcePlan = plans.find(p => p.id === draggedPlanId);
    if (sourcePlan && sourcePlan.day !== dayNum) {
      let updatedAssignedDate = sourcePlan.assignedDate;
      if (updatedAssignedDate) {
        const mIdx = MONTHS.indexOf(selectedMonth) + 1;
        const formattedMonth = mIdx < 10 ? `0${mIdx}` : `${mIdx}`;
        const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
        const timePart = updatedAssignedDate.includes('T') ? updatedAssignedDate.split('T')[1] : '12:00';
        updatedAssignedDate = `${selectedYear}-${formattedMonth}-${formattedDay}T${timePart}`;
      }

      const updatedPlan: ContentPlan = {
        ...sourcePlan,
        day: dayNum,
        month: selectedMonth,
        assignedDate: updatedAssignedDate
      };

      onUpdatePlan(updatedPlan);
      addLog(`Drag & Drop: Rescheduled "${sourcePlan.title}" to ${selectedMonth} Day ${dayNum}`, 'action');
    }

    setDraggedPlanId(null);
    setDragOverDay(null);
  };

  // Instagram Hub Live Simulator states
  const [instaSelectorMode, setInstaSelectorMode] = useState<'reels' | 'image' | 'carousel' | 'meta_ads' | 'ad_registry' | 'chai_with_aadi' | 'come_along_title' | 'story'>('reels');
  const [instaCaption, setInstaCaption] = useState('Swanaya Media Enterprises official Instagram post preview. Direct media scheduling, automated workflows, and high-performance multi-platform campaign logs. 🚀🎬✨');
  const [newInstaComment, setNewInstaComment] = useState('');
  const [instaComments, setInstaComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    { id: 'c-1', user: 'creative_director', text: 'This dashboard makes post planning so much easier! 👏🔥', time: '12m' },
    { id: 'c-2', user: 'swanaya_editor', text: 'Instagram interface simulation looking flawless. 🤩', time: '1h' },
    { id: 'c-3', user: 'marketing_maven', text: 'Ready to deploy these campaigns into production. 🚀📈', time: '3h' }
  ]);
  const [hashtagCategory, setHashtagCategory] = useState('Media');

  // Content Assigning System states
  const [assignerPeriod, setAssignerPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [assignerTaskName, setAssignerTaskName] = useState('');
  const [assignerDueDate, setAssignerDueDate] = useState('2026-07-09');
  const [assignerRole, setAssignerRole] = useState('Designer');
  const [assignerPriority, setAssignerPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [assignerGoogleSync, setAssignerGoogleSync] = useState(false);
  const [assignerTags, setAssignerTags] = useState('');
  const [isOptimizingTags, setIsOptimizingTags] = useState(false);

  // AI & SEO Co-Pilot states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    description: string;
    tags: string[];
    timelineDays: number;
    seoKeywords: string[];
    seoDescription: string;
  } | null>(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiError, setAiError] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(() => {
    const saved = localStorage.getItem('swanaya_assigned_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('swanaya_assigned_tasks', JSON.stringify(assignedTasks));
  }, [assignedTasks]);

  const visibleAssignedTasks = assignedTasks.filter(task => {
    if (isSystemAdmin && workspaceMode === 'all') return true;
    if (!task.createdBy) return true;
    const cleanUser = currentUser?.toLowerCase() || '';
    const isOwner = task.createdBy?.toLowerCase() === cleanUser;
    const isAssigned = task.role?.toLowerCase() === cleanUser || (task as any).assignee?.toLowerCase() === cleanUser;
    return isOwner || isAssigned;
  });

  const handleAiAutofill = async () => {
    if (!assignerTaskName.trim()) {
      addLog('AI System: Please enter a Task Name first to use Smart Autofill.', 'warning');
      setAiError('Please enter a Task Name first.');
      return;
    }

    setIsAiLoading(true);
    setAiError('');
    setAiSuggestions(null);
    addLog(`AI System: Requesting SEO & content generation for task "${assignerTaskName.trim()}"...`, 'info');

    try {
      const response = await fetch('/api/autofill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskName: assignerTaskName.trim(),
          assigneeRole: assignerRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiSuggestions(data);
      setShowAiSuggestions(true);
      
      // Auto-set the recommended due date based on timelineDays!
      const days = data.timelineDays || 3;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      setAssignerDueDate(`${yyyy}-${mm}-${dd}`);

      addLog(`AI System: Successfully generated SEO & execution plan for [${assignerRole}] with ${days}-day timeline.`, 'success');
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Failed to fetch AI suggestions.');
      addLog(`AI System Error: ${err.message || 'Failed to fetch AI suggestions.'}`, 'warning');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOptimizeTags = async () => {
    if (!assignerTaskName.trim()) {
      addLog('AI System: Please enter a Task Name first to optimize tags.', 'warning');
      return;
    }

    setIsOptimizingTags(true);
    addLog(`AI System: Generating SEO tags and hashtags for "${assignerTaskName.trim()}"...`, 'info');

    try {
      const response = await fetch('/api/optimize-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskName: assignerTaskName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.tags && Array.isArray(data.tags)) {
        setAssignerTags(data.tags.join(', '));
        addLog(`AI System: Populated tags input field with SEO keywords and hashtags.`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      addLog(`AI System Error: ${err.message || 'Failed to optimize tags.'}`, 'warning');
    } finally {
      setIsOptimizingTags(false);
    }
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignerTaskName.trim()) {
      addLog('Validation Error: Task description cannot be empty', 'warning');
      return;
    }
    if (!assignerDueDate) {
      addLog('Validation Error: Please select a valid target due date', 'warning');
      return;
    }

    const linkedGoogle = localStorage.getItem('swanaya_google_oauth_linked') === 'true';

    const newTask: AssignedTask = {
      id: `task-${Date.now()}`,
      name: assignerTaskName.trim(),
      dueDate: assignerDueDate,
      status: 'Pending',
      period: assignerPeriod,
      role: assignerRole,
      priority: assignerPriority,
      googleSynced: assignerGoogleSync && linkedGoogle,
      aiDescription: aiSuggestions?.description,
      aiTags: aiSuggestions?.tags,
      aiSeoKeywords: aiSuggestions?.seoKeywords,
      aiSeoDescription: aiSuggestions?.seoDescription,
      tags: assignerTags.trim(),
      createdBy: currentUser || 'aadithyan'
    };

    setAssignedTasks(prev => [newTask, ...prev]);
    setAssignerTaskName('');
    setAssignerTags('');
    
    // Clear suggestions
    setAiSuggestions(null);
    setShowAiSuggestions(false);
    
    addLog(`Assigning System: Appended new task "${newTask.name}" for ${newTask.period} schedule to [${newTask.role}]`, 'success');
    
    if (assignerGoogleSync && linkedGoogle) {
      addLog(`Google OAuth: Automatically synced Calendar Event "${newTask.name}" with aadithyanmmenon@gmail.com`, 'success');
    }
  };

  const handleTaskFileUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMB} MB`;

    setAssignedTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          fileName: file.name,
          fileSize: sizeStr,
          fileUrl: undefined // Clear drive link if replaced by local
        };
      }
      return t;
    }));

    addLog(`File Pipeline: Uploaded "${file.name}" (${sizeStr}) to task registry`, 'upload');
  };

  const handleTaskGooglePicker = (taskId: string) => {
    addLog('Google Picker: Initializing secure Drive file loader...', 'info');
    launchGooglePicker(
      (file) => {
        const sizeInMB = (file.sizeBytes / (1024 * 1024)).toFixed(1);
        const sizeStr = file.sizeBytes > 0 ? `${sizeInMB} MB` : 'Google Drive Resource';
        setAssignedTasks(prev => prev.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              fileName: `GDrive: ${file.name}`,
              fileSize: sizeStr,
              fileUrl: file.url
            };
          }
          return t;
        }));
        addLog(`Google Picker: Successfully attached "${file.name}" to task registry`, 'upload');
      },
      () => {
        addLog('Google Picker: User canceled file selection', 'info');
      },
      (err) => {
        addLog(`Google Picker Error: ${err.message || err}`, 'warning');
      }
    );
  };

  const handleVideoGooglePicker = () => {
    addLog('Google Picker: Initializing secure Drive video selector...', 'info');
    launchGooglePicker(
      (file) => {
        const sizeInMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
        const sizeStr = file.sizeBytes > 0 ? `${sizeInMB} MB` : 'Google Drive Video';
        
        setStagedVideoFileForForm({
          isGoogleDrive: true,
          driveUrl: file.url,
          driveName: `GDrive: ${file.name}`,
          driveSize: sizeStr
        });
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        setVideoFormTitle(baseName);
        setVideoFormDescription('');
        setVideoFormTags('');
        setUploadProgress(0);
        setIsUploading(false);
        setShowVideoMetadataForm(true);

        addLog(`Media: Video file "${file.name}" staged from Google Drive`, 'info');
      },
      () => {
        addLog('Google Picker: User canceled video selection', 'info');
      },
      (err) => {
        addLog(`Google Picker Error: ${err.message || err}`, 'warning');
      }
    );
  };

  const handleVideoUploadInModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (permissionLevel === 'viewer') {
      alert("Permission Denied: You have Read-Only (Viewer) access.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please upload a video file only.');
      return;
    }
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const videoUrl = URL.createObjectURL(file);
    const updated: ContentPlan = {
      ...viewingPostPlan!,
      videoUrl,
      videoName: file.name,
      videoSize: `${sizeInMB} MB`
    };
    onUpdatePlan(updated);
    setViewingPostPlan(updated);
    addLog(`Media: Video file "${file.name}" uploaded directly inside View Node for "${viewingPostPlan!.title}"`, 'upload');
  };

  const handleVideoPickerInModal = () => {
    if (permissionLevel === 'viewer') {
      alert("Permission Denied: You have Read-Only (Viewer) access.");
      return;
    }
    addLog('Google Picker: Launching secure drive file selector in View Node...', 'info');
    launchGooglePicker(
      (file) => {
        const sizeInMB = file.sizeBytes > 0 ? (file.sizeBytes / (1024 * 1024)).toFixed(1) : 'G-Drive';
        const updated: ContentPlan = {
          ...viewingPostPlan!,
          videoUrl: file.url,
          videoName: `GDrive: ${file.name}`,
          videoSize: file.sizeBytes > 0 ? `${sizeInMB} MB` : 'G-Drive Video'
        };
        onUpdatePlan(updated);
        setViewingPostPlan(updated);
        addLog(`Media: Staged Google Drive video "${file.name}" in View Node for "${viewingPostPlan!.title}"`, 'upload');
      },
      () => {
        addLog('Google Picker: Canceled by user', 'warning');
      }
    );
  };

  const handleStatusChange = (newStatus: ContentPlan['status']) => {
    if (permissionLevel === 'viewer') {
      alert("Permission Denied: You have Read-Only (Viewer) access.");
      return;
    }
    onUpdatePlanStatus(viewingPostPlan!.id, newStatus);
    setViewingPostPlan(prev => prev ? { ...prev, status: newStatus } : null);
    addLog(`System: Changed campaign [${viewingPostPlan!.title}] status to [${newStatus}] via Interactive View Node`, 'action');
  };

  const toggleTaskStatus = (taskId: string) => {
    setAssignedTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Pending' ? 'Completed' : 'Pending';
        addLog(`Registry Sync: Task status changed to ${nextStatus}`, 'info');
        return {
          ...t,
          status: nextStatus
        };
      }
      return t;
    }));
  };

  const handleDeleteAssignedTask = (taskId: string) => {
    const matched = assignedTasks.find(t => t.id === taskId);
    setAssignedTasks(prev => prev.filter(t => t.id !== taskId));
    if (matched) {
      addLog(`Assigning System: Purged task "${matched.name}" from schedule`, 'warning');
    }
  };
  
  // Entity form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContentPlan['type']>('Video');
  const [description, setDescription] = useState('');
  const [formMonth, setFormMonth] = useState(MONTHS[new Date().getMonth()]);
  const [formDay, setFormDay] = useState<number>(new Date().getDate());
  const [formPlatform, setFormPlatform] = useState<ContentPlan['platform']>('YouTube');
  const [formAccountHandle, setFormAccountHandle] = useState<string>('@chai_with_aadi');
  const [formStatus, setFormStatus] = useState<ContentPlan['status']>('Planned');
  const [formAssignee, setFormAssignee] = useState('');
  // Metrics & Link states for creation form
  const [formViews, setFormViews] = useState<number>(12500);
  const [formLikes, setFormLikes] = useState<number>(840);
  const [formComments, setFormComments] = useState<number>(120);
  const [formShares, setFormShares] = useState<number>(65);
  const [formExternalLink, setFormExternalLink] = useState<string>('');

  // Bidirectional Date Sync helpers
  const parseDateString = (dateStr: string) => {
    if (!dateStr) return { year: selectedYear, month: 'October', day: 15 };
    // Try standard Date parsing first for accuracy
    const cleanedStr = dateStr.replace(' ', 'T');
    const dateObj = new Date(cleanedStr);
    if (!isNaN(dateObj.getTime())) {
      return {
        year: dateObj.getFullYear(),
        month: MONTHS[dateObj.getMonth()],
        day: dateObj.getDate()
      };
    }
    const parts = dateStr.split('-');
    const y = parseInt(parts[0]) || selectedYear;
    const mIndex = (parseInt(parts[1]) || 10) - 1;
    const d = parseInt(parts[2]) || 15;
    return {
      year: y,
      month: MONTHS[mIndex] || 'October',
      day: d
    };
  };

  const formatDateComponents = (year: number, monthName: string, day: number) => {
    const mIndex = MONTHS.indexOf(monthName);
    const mStr = String(mIndex !== -1 ? mIndex + 1 : 10).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const formatPlanDateTime = (plan: ContentPlan) => {
    const raw = plan.assignedDate || formatDateComponents(selectedYear, plan.month, plan.day);
    const cleaned = raw.replace(' ', 'T');
    const dateObj = new Date(cleaned);
    if (!isNaN(dateObj.getTime())) {
      if (raw.includes('T') || raw.includes(' ')) {
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        return `${dateStr} @ ${timeStr}`;
      }
      return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return raw;
  };

  const getInitialDateTimeString = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
  };

  const [formDateTime, setFormDateTime] = useState<string>(getInitialDateTimeString);
  const [isAssigned, setIsAssigned] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const getBestUploadTiming = (platform: ContentPlan['platform']) => {
    switch (platform) {
      case 'YouTube':
        return { text: "Thursday or Friday between 2:00 PM - 5:00 PM (Local)", time: "15:00" };
      case 'Instagram':
        return { text: "Wednesday at 11:00 AM or Friday at 10:00 AM", time: "11:00" };
      case 'TikTok':
        return { text: "Tuesday at 9:00 AM or Thursday at 12:00 PM", time: "09:00" };
      case 'LinkedIn':
        return { text: "Tuesday through Thursday between 9:00 AM - 12:00 PM", time: "10:00" };
      case 'Facebook':
        return { text: "Monday through Wednesday at 12:00 PM", time: "12:00" };
      default:
        return { text: "Weekdays at 12:00 PM", time: "12:00" };
    }
  };

  const ensureDateTimeString = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) {
      return dateStr;
    }
    if (dateStr.includes(' ')) {
      return dateStr.replace(' ', 'T');
    }
    return `${dateStr}T12:00`;
  };

  const handleDateTimeChange = (val: string) => {
    setFormDateTime(val);
    const dateObj = new Date(val);
    if (!isNaN(dateObj.getTime())) {
      setFormMonth(MONTHS[dateObj.getMonth()]);
      setFormDay(dateObj.getDate());
    }
  };

  useEffect(() => {
    // Sync formDateTime when formMonth or formDay change (e.g. clicked in calendar cell)
    const currentMonthIndex = MONTHS.indexOf(formMonth);
    const mStr = String(currentMonthIndex !== -1 ? currentMonthIndex + 1 : 10).padStart(2, '0');
    const dStr = String(formDay).padStart(2, '0');
    
    const currentTime = formDateTime.split('T')[1] || '12:00';
    const newDateTime = `${selectedYear}-${mStr}-${dStr}T${currentTime}`;
    
    if (formDateTime.slice(0, 10) !== `${selectedYear}-${mStr}-${dStr}`) {
      setFormDateTime(newDateTime);
    }
  }, [formMonth, formDay, selectedYear]);

  // Editing modal states
  const [editingPlan, setEditingPlan] = useState<ContentPlan | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPlatform, setEditPlatform] = useState<ContentPlan['platform']>('YouTube');
  const [editAccountHandle, setEditAccountHandle] = useState<string>('@chai_with_aadi');
  const [editType, setEditType] = useState<ContentPlan['type']>('Video');
  const [editStatus, setEditStatus] = useState<ContentPlan['status']>('Planned');
  const [editAssignee, setEditAssignee] = useState('');
  const [editViews, setEditViews] = useState<number>(0);
  const [editLikes, setEditLikes] = useState<number>(0);
  const [editComments, setEditComments] = useState<number>(0);
  const [editShares, setEditShares] = useState<number>(0);
  const [editExternalLink, setEditExternalLink] = useState<string>('');

  const openEditModal = (plan: ContentPlan) => {
    setEditingPlan(plan);
    setEditTitle(plan.title);
    setEditDescription(plan.description);
    setEditDate(ensureDateTimeString(plan.assignedDate || formatDateComponents(selectedYear, plan.month, plan.day)));
    setEditPlatform(plan.platform);
    setEditAccountHandle(plan.accountHandle || '@chai_with_aadi');
    setEditType(plan.type);
    setEditStatus(plan.status);
    setEditAssignee(plan.assignee || '');
    setEditViews(plan.views || (plan.type === 'Story' ? 2840 : 12500));
    setEditLikes(plan.likes || 840);
    setEditComments(plan.comments || 120);
    setEditShares(plan.shares || 65);
    setEditExternalLink(plan.externalLink || plan.videoUrl || '');
  };

  const saveEditedPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editTitle.trim()) return;

    const { month, day, year } = parseDateString(editDate);
    const matchedAcc = instagramAccounts.find(a => a.handle === editAccountHandle);

    const vNum = Number(editViews) || 0;
    const lNum = Number(editLikes) || 0;
    const cNum = Number(editComments) || 0;
    const sNum = Number(editShares) || 0;
    const calcER = vNum > 0 
      ? (((lNum + cNum + sNum) / vNum) * 100).toFixed(1) + '%'
      : '0.0%';
    const calcVR = vNum > 0 ? ((vNum / 10000) * 100).toFixed(1) + '%' : '12.4%';
    const calcLR = vNum > 0 ? ((lNum / vNum) * 100).toFixed(1) + '%' : '6.7%';

    const updated: ContentPlan = {
      ...editingPlan,
      title: editTitle.trim(),
      description: editDescription.trim(),
      assignedDate: editDate,
      month,
      day,
      year,
      platform: editPlatform,
      accountHandle: editAccountHandle || editingPlan.accountHandle || '@chai_with_aadi',
      accountName: matchedAcc?.name || editingPlan.accountName || 'Chai with Aadithyan',
      type: editType,
      status: editStatus,
      assignee: editAssignee,
      views: vNum,
      likes: lNum,
      comments: cNum,
      shares: sNum,
      engagementRate: calcER,
      viewRate: calcVR,
      likeRate: calcLR,
      externalLink: editExternalLink.trim(),
      storyViews: editType === 'Story' ? (vNum > 0 ? vNum : 2840) : editingPlan.storyViews,
      storyViewRate: editType === 'Story' ? calcVR : editingPlan.storyViewRate
    };

    onUpdatePlan(updated);
    setEditingPlan(null);
    addLog(`Planner: Updated campaign "${editTitle.trim()}" metrics [Views: ${vNum}, Likes: ${lNum}, Comments: ${cNum}, ER: ${calcER}]`, 'success');
  };

  // Preloaded templates automatic assigning and date management
  const [templateDates, setTemplateDates] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    PRELOADED_TEMPLATES.forEach((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      const mStr = MONTHS[d.getMonth()] || 'October';
      const dNum = d.getDate();
      initial[idx] = formatDateComponents(2026, mStr, dNum); // Initially 2026 or fallback
    });
    return initial;
  });

  // Keep template dates in sync with selectedYear
  useEffect(() => {
    const initial: Record<number, string> = {};
    PRELOADED_TEMPLATES.forEach((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      const mStr = MONTHS[d.getMonth()] || 'October';
      const dNum = d.getDate();
      initial[idx] = formatDateComponents(selectedYear, mStr, dNum);
    });
    setTemplateDates(initial);
  }, [selectedYear]);

  const findNextOpenSlot = (monthName: string): number => {
    const occupiedDays = new Set(plans.filter(p => p.month === monthName).map(p => p.day));
    for (let day = 1; day <= 31; day++) {
      if (!occupiedDays.has(day)) {
        return day;
      }
    }
    return Math.min(31, plans.filter(p => p.month === monthName).length + 1);
  };

  const handleAutoFindSlot = (idx: number) => {
    const currentSelectedMonth = selectedMonth;
    const openDay = findNextOpenSlot(currentSelectedMonth);
    const dateStr = formatDateComponents(selectedYear, currentSelectedMonth, openDay);
    setTemplateDates(prev => ({ ...prev, [idx]: dateStr }));
    addLog(`Automated Assigner: Calculated optimal open slot on Day ${openDay} in ${currentSelectedMonth} for template #${idx + 1}`, 'info');
  };

  const handleDeployTemplate = (idx: number, tpl: typeof PRELOADED_TEMPLATES[0]) => {
    if (permissionLevel === 'viewer') {
      alert("Permission Denied: You have Read-Only (Viewer) access. Please register or switch to an Editor account to create or modify plans.");
      return;
    }
    const dateStr = templateDates[idx] || formatDateComponents(selectedYear, MONTHS[new Date().getMonth()], new Date().getDate());
    const { month, day, year } = parseDateString(dateStr);

    onAddPlan({
      title: tpl.title,
      type: tpl.type,
      description: tpl.description,
      month,
      day,
      year,
      assignedDate: dateStr,
      platform: tpl.platform,
      status: tpl.suggestedStatus
    });

    addLog(`Deployer: Successfully auto-assigned and scheduled "${tpl.title}" on ${month} Day ${day}`, 'success');
    
    setActiveTab('monthly');
    setSelectedMonth(month);
  };

  // Media upload states
  const [uploadedVideo, setUploadedVideo] = useState<{ url: string; name: string; size: string; isGoogleDrive?: boolean; mediaType?: 'video' | 'image' | 'link' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state for video player modal
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  // Video Form & Metadata States (Before Initiating Upload)
  const [stagedVideoFileForForm, setStagedVideoFileForForm] = useState<{ file?: File; isGoogleDrive?: boolean; driveUrl?: string; driveName?: string; driveSize?: string } | null>(null);
  const [showVideoMetadataForm, setShowVideoMetadataForm] = useState(false);
  const [videoFormTitle, setVideoFormTitle] = useState('');
  const [videoFormDescription, setVideoFormDescription] = useState('');
  const [videoFormTags, setVideoFormTags] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoFile = (file: File) => {
    if (!file) return;
    
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      addLog(`Validation Error: File "${file.name}" is not a valid video or photo format`, 'warning');
      alert('Please upload a photo image (JPG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV) file.');
      return;
    }

    // Set staged file details for the form
    setStagedVideoFileForForm({ file });
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setVideoFormTitle(baseName);
    setVideoFormDescription('');
    setVideoFormTags('');
    setUploadProgress(0);
    setIsUploading(false);
    setShowVideoMetadataForm(true);
  };

  const handleInitiateUpload = () => {
    if (!videoFormTitle.trim()) {
      alert("Please enter a media title.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    addLog(`Media Pipeline: Initiating secure upload flow for "${videoFormTitle}"...`, 'info');

    // Simulate progress increments
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 15;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);

      const isDrive = stagedVideoFileForForm?.isGoogleDrive;
      const isImg = stagedVideoFileForForm?.file?.type.startsWith('image/');
      const finalUrl = stagedVideoFileForForm?.file 
        ? URL.createObjectURL(stagedVideoFileForForm.file) 
        : (stagedVideoFileForForm?.driveUrl || '');
      const finalName = stagedVideoFileForForm?.file 
        ? stagedVideoFileForForm.file.name 
        : (stagedVideoFileForForm?.driveName || 'Staged Media File');
      const finalSize = stagedVideoFileForForm?.file 
        ? `${(stagedVideoFileForForm.file.size / (1024 * 1024)).toFixed(2)} MB` 
        : (stagedVideoFileForForm?.driveSize || 'Unknown Size');

      const videoData = {
        url: finalUrl,
        name: finalName,
        size: finalSize,
        isGoogleDrive: isDrive,
        mediaType: isImg ? ('image' as const) : ('video' as const)
      };

      setUploadedVideo(videoData);
      setIsUploading(false);
      setShowVideoMetadataForm(false);

      // Auto-populate the active content form values
      setTitle(videoFormTitle.trim());
      setDescription(videoFormDescription.trim());

      // Auto-save this directly inside the Content Planner as a plan item!
      onAddPlan({
        title: videoFormTitle.trim(),
        type: isImg ? 'Image' : 'Video',
        description: videoFormDescription.trim(),
        month: formMonth,
        day: formDay,
        year: 2026,
        assignedDate: formDateTime,
        platform: formPlatform,
        status: 'Planned',
        videoUrl: finalUrl,
        videoName: finalName,
        videoSize: finalSize,
        mediaType: isImg ? 'image' : 'video',
        createdBy: currentUser || 'aadithyan',
        tags: videoFormTags.trim()
      });

      addLog(`Planner: Saved & scheduled "${videoFormTitle.trim()}" in the content planner with tags: [${videoFormTags.trim()}]`, 'success');

      if (!isImg) {
        // Trigger automatic video playback immediately if video
        setPreviewVideo({
          url: finalUrl,
          title: videoFormTitle.trim()
        });
      }

      addLog(`Media Pipeline: Media staged for "${videoFormTitle.trim()}"`, 'success');
    }, 1200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (permissionLevel === 'viewer') {
      alert("Permission Denied: You have Read-Only (Viewer) access. Please register or switch to an Editor account to create or modify plans.");
      return;
    }
    if (!title.trim()) return;

    const matchedAcc = instagramAccounts.find(a => a.handle === formAccountHandle);
    const isImg = uploadedVideo?.mediaType === 'image' || (uploadedVideo?.url ? Boolean(uploadedVideo.url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || uploadedVideo.url.includes('unsplash')) : false);

    const vNum = Number(formViews) || 0;
    const lNum = Number(formLikes) || 0;
    const cNum = Number(formComments) || 0;
    const sNum = Number(formShares) || 0;
    const calcER = vNum > 0 
      ? (((lNum + cNum + sNum) / vNum) * 100).toFixed(1) + '%'
      : '0.0%';
    const calcVR = vNum > 0 ? ((vNum / 10000) * 100).toFixed(1) + '%' : '12.4%';
    const calcLR = vNum > 0 ? ((lNum / vNum) * 100).toFixed(1) + '%' : '6.7%';

    onAddPlan({
      title: title.trim(),
      type,
      description: description.trim(),
      month: formMonth,
      day: formDay,
      year: 2026,
      assignedDate: formDateTime,
      platform: formPlatform,
      accountHandle: formAccountHandle || '@chai_with_aadi',
      accountName: matchedAcc?.name || formAccountHandle || 'Chai with Aadithyan',
      status: formStatus,
      assignee: formAssignee,
      videoUrl: uploadedVideo?.url || formDirectMediaUrl || undefined,
      videoName: uploadedVideo?.name,
      videoSize: uploadedVideo?.size,
      mediaType: isImg ? 'image' : 'video',
      storyViewRate: type === 'Story' ? (calcVR !== '0.0%' ? calcVR : '14.8%') : calcVR,
      storyViews: vNum > 0 ? vNum : (type === 'Story' ? 2840 : vNum),
      views: vNum,
      likes: lNum,
      comments: cNum,
      shares: sNum,
      engagementRate: calcER,
      viewRate: calcVR,
      likeRate: calcLR,
      externalLink: formExternalLink.trim(),
      createdBy: currentUser || 'aadithyan'
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setUploadedVideo(null);
    setFormDirectMediaUrl('');
    setFormExternalLink('');
    setFormViews(12500);
    setFormLikes(840);
    setFormComments(120);
    setFormShares(65);
    setFormDirectMediaUrl('');
    addLog(`Planner: Staged content plan "${title}" for ${formMonth} Day ${formDay} [Assigned to ${formAccountHandle}]`, 'success');
    
    // Switch back to view tab
    setActiveTab('monthly');
    setSelectedMonth(formMonth);
  };

  const removeStagedVideo = () => {
    if (uploadedVideo?.url) {
      URL.revokeObjectURL(uploadedVideo.url);
    }
    setUploadedVideo(null);
    addLog('Media: Staged video removed from current form context', 'info');
  };

  const handleExportIndividualPDF = (plan: ContentPlan) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please enable pop-ups to export the PDF report.');
      return;
    }

    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE - ${plan.title}</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 50px;
              line-height: 1.6;
              position: relative;
            }

            /* Premium Corporate watermark */
            body::before {
              content: "SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE";
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-28deg);
              font-size: 56px;
              font-weight: 900;
              color: rgba(79, 70, 229, 0.05);
              white-space: nowrap;
              pointer-events: none;
              z-index: -999;
              letter-spacing: 0.15em;
              font-family: 'Inter', sans-serif;
              text-transform: uppercase;
            }

            .header {
              border-bottom: 3px solid #4f46e5;
              padding-bottom: 25px;
              margin-bottom: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .logo-text {
              font-size: 26px;
              font-weight: 900;
              letter-spacing: -0.05em;
              color: #1e1b4b;
              text-transform: uppercase;
              margin: 0;
            }

            .subtitle {
              font-size: 11px;
              color: #4f46e5;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              margin: 4px 0 0 0;
            }

            .meta {
              text-align: right;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #64748b;
            }

            .card {
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 30px;
              background: #f8fafc;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
              margin-bottom: 30px;
            }

            .field-group {
              margin-bottom: 20px;
            }

            .field-label {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #64748b;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .field-value {
              font-size: 15px;
              color: #0f172a;
              font-weight: 600;
            }

            .field-desc {
              font-size: 13px;
              color: #334155;
              line-height: 1.7;
              background: #ffffff;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #f1f5f9;
            }

            .badge {
              display: inline-block;
              padding: 4px 12px;
              font-size: 10px;
              font-weight: 700;
              border-radius: 9999px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .badge-primary {
              background-color: #e0e7ff;
              color: #4f46e5;
            }

            .badge-success {
              background-color: #dcfce7;
              color: #15803d;
            }

            .watermark-footer {
              margin-top: 60px;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              font-family: 'JetBrains Mono', monospace;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }

            .btn-print {
              display: block;
              width: fit-content;
              margin: 40px auto 0 auto;
              background-color: #4f46e5;
              color: #ffffff;
              font-size: 13px;
              font-weight: 700;
              padding: 12px 30px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
              transition: all 0.2s;
            }

            @media print {
              .btn-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="logo-text">SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE</h1>
              <p class="subtitle">Individual Content Node Manifest</p>
            </div>
            <div class="meta">
              <div>Registry ID: SNY-2026-${plan.id.slice(0, 8).toUpperCase()}</div>
              <div>Generated: ${new Date().toLocaleDateString()}</div>
              <div>Assigned: ${plan.month} Day ${plan.day}, 2026</div>
            </div>
          </div>

          <div class="card">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 25px;">
              <div class="field-group">
                <div class="field-label">Campaign Title</div>
                <div class="field-value" style="font-size: 18px; color: #1e1b4b;">${plan.title}</div>
              </div>
              <div class="field-group" style="text-align: right;">
                <div class="field-label">Status</div>
                <span class="badge ${plan.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${plan.status}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px;">
              <div class="field-group">
                <div class="field-label">Platform Target</div>
                <div class="field-value">${plan.platform}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Content Format</div>
                <div class="field-value">${plan.type}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Deployment Date</div>
                <div class="field-value">${plan.month} ${plan.day}, 2026</div>
              </div>
            </div>

            <div class="field-group">
              <div class="field-label">Content Memo / Description</div>
              <div class="field-desc">${plan.description || 'No summary notes defined.'}</div>
            </div>
    `;

    if (plan.videoName) {
      htmlContent += `
            <div class="field-group" style="margin-top: 25px;">
              <div class="field-label">Staged Media Resource</div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; background: #f1f5f9; padding: 10px; border-radius: 6px; color: #475569;">
                File: ${plan.videoName} (${plan.videoSize || 'Staged size'})
              </div>
            </div>
      `;
    }

    htmlContent += `
          </div>

          <div class="watermark-footer">
            SECURE DEPLOYMENT MANIFEST • VERIFIED COMPLIANCE WATERMARK ENABLED • SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE
          </div>

          <button class="btn-print" onclick="window.print()">Print / Save PDF</button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please enable pop-ups to export the PDF report.');
      return;
    }

    const completedCount = visiblePlans.filter(p => p.status === 'Completed').length;
    const progressCount = visiblePlans.filter(p => p.status === 'In Progress').length;
    const reviewCount = visiblePlans.filter(p => p.status === 'Review').length;
    const plannedCount = visiblePlans.filter(p => p.status === 'Planned').length;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE Report</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
              position: relative;
            }

            /* Faint company watermark in the background of printed page */
            body::before {
              content: "SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE";
              position: fixed;
              top: 55%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-32deg);
              font-size: 48px;
              font-weight: 900;
              color: rgba(79, 70, 229, 0.045);
              white-space: nowrap;
              pointer-events: none;
              z-index: -999;
              letter-spacing: 0.12em;
              font-family: 'Inter', sans-serif;
              text-transform: uppercase;
            }

            .header-container {
              border-bottom: 2px solid #6366f1;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }

            .logo-title {
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.05em;
              color: #1e1b4b;
              text-transform: uppercase;
              margin: 0;
            }

            .subtitle {
              font-size: 11px;
              color: #4f46e5;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin: 3px 0 0 0;
            }

            .meta-details {
              text-align: right;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #64748b;
              line-height: 1.6;
            }

            .report-title-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
            }

            .stat-box {
              text-align: center;
              padding: 10px;
              background: #ffffff;
              border: 1px solid #f1f5f9;
              border-radius: 8px;
            }

            .stat-val {
              font-size: 22px;
              font-weight: 700;
              color: #4f46e5;
            }

            .stat-label {
              font-size: 9px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-top: 2px;
            }

            h2.section-header {
              font-size: 14px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #0f172a;
              margin: 0 0 15px 0;
              border-left: 4px solid #6366f1;
              padding-left: 10px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }

            th {
              background-color: #f8fafc;
              color: #475569;
              font-weight: 700;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 12px 10px;
              border-bottom: 2px solid #e2e8f0;
              text-align: left;
            }

            td {
              padding: 12px 10px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 11px;
              color: #334155;
              vertical-align: top;
            }

            .plan-day {
              font-family: 'JetBrains Mono', monospace;
              font-weight: 700;
              color: #4f46e5;
            }

            .plan-title {
              font-weight: 700;
              color: #1e293b;
            }

            .badge {
              display: inline-block;
              font-size: 9px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: uppercase;
            }

            .badge-completed { background-color: #dcfce7; color: #166534; }
            .badge-progress { background-color: #e0e7ff; color: #3730a3; }
            .badge-review { background-color: #fef3c7; color: #92400e; }
            .badge-planned { background-color: #f1f5f9; color: #475569; }

            .badge-platform {
              font-family: 'JetBrains Mono', monospace;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              color: #475569;
            }

            .footer-container {
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 10px;
              color: #94a3b8;
            }

            .footer-brand {
              font-weight: 700;
              letter-spacing: 0.05em;
              color: #64748b;
            }

            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }

            .print-btn-container {
              background-color: #f1f5f9;
              padding: 15px;
              border-radius: 10px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .btn {
              background-color: #4f46e5;
              color: #ffffff;
              font-weight: 600;
              font-size: 12px;
              padding: 8px 16px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              transition: background-color 0.15s;
            }

            .btn:hover {
              background-color: #4338ca;
            }

            .btn-secondary {
              background-color: #e2e8f0;
              color: #475569;
            }

            .btn-secondary:hover {
              background-color: #cbd5e1;
            }
          </style>
        </head>
        <body>
          <div class="print-btn-container no-print">
            <div>
              <strong style="font-size: 13px; color: #1e293b;">SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE PDF Generator Ready</strong>
              <p style="font-size: 11px; color: #64748b; margin: 3px 0 0 0;">Verify layout options and print to finalize the PDF save cycle.</p>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" onclick="window.close()">Cancel</button>
              <button class="btn" onclick="window.print()">Print / Save PDF</button>
            </div>
          </div>

          <div class="header-container">
            <div>
              <h1 class="logo-title">SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE</h1>
              <p class="subtitle">Custom Campaign Registry & Deployment Matrix</p>
            </div>
            <div class="meta-details">
              <div>REPORT ID: SW-${Date.now().toString().substring(5)}</div>
              <div>GENERATED: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
              <div>OPERATOR ID: ${currentUser.toUpperCase()}</div>
              <div>NODE STATUS: ACTIVE SECURE</div>
            </div>
          </div>

          <div class="report-title-card">
            <div class="stat-box">
              <div class="stat-val">${plans.length}</div>
              <div class="stat-label">Total Scheduled</div>
            </div>
            <div class="stat-box">
              <div class="stat-val" style="color: #10b981;">${completedCount}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-box">
              <div class="stat-val" style="color: #3b82f6;">${progressCount + reviewCount}</div>
              <div class="stat-label">In Dev / Review</div>
            </div>
            <div class="stat-box">
              <div class="stat-val" style="color: #64748b;">${plannedCount}</div>
              <div class="stat-label">Planned</div>
            </div>
          </div>

          <h2 class="section-header">Campaign Deployment Matrix (${selectedMonth})</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 7%">Day</th>
                <th style="width: 13%">Platform</th>
                <th style="width: 12%">Category</th>
                <th style="width: 20%">Assigned Date</th>
                <th style="width: 33%">Title & Details</th>
                <th style="width: 15%">Status</th>
              </tr>
            </thead>
            <tbody>
              ${visiblePlans.filter(p => p.month === selectedMonth).length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: #94a3b8; font-style: italic; padding: 30px;">
                    No content plans scheduled for ${selectedMonth} under active registry.
                  </td>
                </tr>
              ` : visiblePlans.filter(p => p.month === selectedMonth).map(plan => `
                <tr>
                  <td class="plan-day">Day ${plan.day}</td>
                  <td>
                    <span class="badge badge-platform">${plan.platform}</span>
                    ${plan.accountHandle ? `<div style="font-size: 9px; font-weight: bold; color: #d97706; margin-top: 2px; font-family: 'JetBrains Mono', monospace;">${plan.accountHandle}</div>` : ''}
                  </td>
                  <td><span style="font-weight: 500;">${plan.type}</span></td>
                  <td>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; color: #059669;">
                      ${formatPlanDateTime(plan)}
                    </span>
                  </td>
                  <td>
                    <div class="plan-title">${plan.title}</div>
                    ${plan.assignee ? `<div style="font-size: 10px; color: #059669; margin-top: 3px; font-weight: bold;">Assignee: ${plan.assignee}</div>` : ''}
                    <div style="font-size: 10px; color: #64748b; margin-top: 3px;">${plan.description}</div>
                  </td>
                  <td>
                    <span class="badge badge-${plan.status.toLowerCase().replace(' ', '')}">
                      ${plan.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-container">
            <span class="footer-brand">SWANIQUE AI INTEGRATED CONTENT-PLANNING SOFTWARE</span>
            <span>Page 1 of 1 • System Verification Authenticated</span>
          </div>

          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    addLog(`System action: Exported campaigns for ${selectedMonth} to printable report format`, 'success');
  };

  // Stats calculation for Yearly View
  const typeCounts = plans.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = plans.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformCounts = plans.reduce((acc, p) => {
    acc[p.platform] = (acc[p.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyCounts = plans.reduce((acc, p) => {
    acc[p.month] = (acc[p.month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter & Search states
  const [accountFilter, setAccountFilter] = useState<string>('ALL');

  const filteredPlans = visiblePlans.filter(p => {
    if (accountFilter !== 'ALL' && p.accountHandle !== accountFilter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(query);
      const platformMatch = p.platform.toLowerCase().includes(query);
      const statusMatch = p.status.toLowerCase().includes(query);
      const typeMatch = p.type.toLowerCase().includes(query);
      const descMatch = p.description?.toLowerCase().includes(query) || false;
      const accountMatch = p.accountHandle?.toLowerCase().includes(query) || p.accountName?.toLowerCase().includes(query) || false;
      return titleMatch || platformMatch || statusMatch || typeMatch || descMatch || accountMatch;
    }
    return p.month === selectedMonth;
  });

  return (
    <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-xl flex flex-col h-full justify-between transition-all duration-500 ${
      uiMode === 'ai' 
        ? 'bg-slate-900/60 border-slate-800/80' 
        : 'bg-slate-900/40 border-slate-800/60 shadow-md'
    }`}>
      <div>
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border transition-all ${
              uiMode === 'ai' 
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {uiMode === 'ai' ? (
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              ) : (
                <Film className="w-6 h-6 text-slate-300" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                {uiMode === 'ai' ? 'SWANIQUE AI Content Engine' : 'SWANIQUE Content Registry'}
              </h3>
              <p className="text-slate-400 text-xs">
                {uiMode === 'ai' 
                  ? 'Predictive media scheduler, SEO tag recommendations & cloud pipelines' 
                  : 'Manual media content scheduler & verified team registers'
                }
              </p>
            </div>
          </div>

          {/* Module Nav Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Monthly Planner
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'yearly'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Yearly Overview
            </button>
            <button
              onClick={() => setActiveTab('entity-manager')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'entity-manager'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5 animate-pulse" /> Add Planning
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('under-development');
                addLog('System Navigation: Switched to Under Development module', 'info');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'under-development'
                  ? 'bg-amber-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Under Development
            </button>

            <button
              onClick={() => {
                setActiveTab('accounts-registry');
                addLog('System Navigation: Switched to Pre-Registered Accounts Directory & Entity Registry', 'info');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'accounts-registry'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-300 animate-pulse" /> Accounts Registry
            </button>
          </div>
        </div>

        {/* Individual Workspace Privacy & Switcher Banner */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-white text-xs">Private Workspace: <span className="text-indigo-300 font-extrabold">@{currentUser}</span></span>
                <span className="bg-emerald-950/90 border border-emerald-800/60 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Strict Workspace Isolation Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Your content plans, assigned tasks, and schedules are strictly private to your account (@{currentUser}). Other operators or clients cannot view your workspace items.
              </p>
            </div>
          </div>

          {isSystemAdmin && (
            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0 self-end md:self-auto">
              <button
                type="button"
                onClick={() => setWorkspaceMode('private')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  workspaceMode === 'private' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3 h-3" /> My Private Workspace
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceMode('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  workspaceMode === 'all' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" /> All Workspaces (Admin View)
              </button>
            </div>
          )}
        </div>

        {/* Collaborative Permission Banner */}
        {permissionLevel === 'viewer' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-left"
          >
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 border border-amber-500/20">
              <Plus className="w-5 h-5 rotate-45 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                🔒 Collaborative View-Only Session Enforced
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                You are currently logged into the <span className="font-bold text-white">Swanaya Partner Registry</span> with a <strong className="text-amber-400">Viewer</strong> role. You can view all content schedules, yearly overviews, and simulator assets in real-time. Writing, editing, or deleting items is restricted. To edit campaigns, please request upgrade permissions or register an <strong className="text-emerald-400">Editor</strong> account from the registry login portal.
              </p>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            TAB 1: MONTHLY PLANNER
            ========================================================================= */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            
            {/* Active Content Operator Banner */}
             <div className="bg-slate-950/40 border border-slate-850 rounded-xl px-4 py-2.5 flex flex-wrap gap-3 items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-400">Secure Content Planner Node active for:</span>
                <strong className="text-white font-bold">{currentUser}</strong>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400">Active Planner Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    const yr = Number(e.target.value);
                    setSelectedYear(yr);
                    addLog(`System: Switched active calendar registry year to ${yr}`, 'action');
                  }}
                  className="bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-bold rounded px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer font-mono"
                >
                  <option value={2026}>2026 AD</option>
                  <option value={2025}>2025 AD</option>
                  <option value={2024}>2024 AD</option>
                  <option value={2023}>2023 AD</option>
                </select>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-1 rounded">Active Session</span>
              </div>
            </div>

            {/* Months Scroller */}
            <div className="flex gap-1 overflow-x-auto pb-2 pr-1 scrollbar-thin">
              {MONTHS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                    selectedMonth === m
                      ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-400'
                      : 'bg-slate-950/40 border border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  {m.substring(0, 3).toUpperCase()}
                  <span className="ml-1 text-[10px] opacity-60 font-normal">
                    ({visiblePlans.filter(p => p.month === m).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Content List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Staged Plans for the selected month */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 border border-slate-850 p-2.5 rounded-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-indigo-400" /> Active Registry: {selectedMonth}
                    </span>

                    {/* Pre-registered Account Selector Filter */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Account:</span>
                      <select
                        value={accountFilter}
                        onChange={(e) => {
                          setAccountFilter(e.target.value);
                          addLog(`Content Planner: Filtered schedule by account [${e.target.value}]`, 'info');
                        }}
                        className="bg-transparent text-[10px] font-mono font-bold text-amber-300 outline-none cursor-pointer max-w-[160px] truncate"
                      >
                        <option value="ALL" className="bg-slate-950 text-white">✨ All Pre-Registered Accounts</option>
                        <optgroup label="📸 Instagram Accounts" className="bg-slate-950 text-slate-300">
                          {instagramAccounts.filter(a => !a.platform || a.platform === 'Instagram').map(acc => (
                            <option key={acc.id} value={acc.handle} className="bg-slate-950 text-amber-300">
                              {acc.handle} — {acc.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🔴 YouTube Channels" className="bg-slate-950 text-slate-300">
                          {instagramAccounts.filter(a => a.platform === 'YouTube' || a.handle.includes('youtube')).map(acc => (
                            <option key={acc.id} value={acc.handle} className="bg-slate-950 text-rose-300">
                              {acc.handle} — {acc.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🌐 Meta / Facebook" className="bg-slate-950 text-slate-300">
                          {instagramAccounts.filter(a => a.platform === 'Facebook' || a.handle.includes('facebook')).map(acc => (
                            <option key={acc.id} value={acc.handle} className="bg-slate-950 text-cyan-300">
                              {acc.handle} — {acc.name}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Switcher Toggle */}
                    <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg mr-1 shadow-inner">
                      <button
                        type="button"
                        onClick={() => {
                          setPlannerViewMode('list');
                          addLog('System Navigation: Switched Planner to List Registry layout', 'info');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          plannerViewMode === 'list'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                        title="Switch to List View"
                      >
                        <List className="w-3 h-3" /> List
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlannerViewMode('calendar');
                          addLog('System Navigation: Switched Planner to Visual Monthly Calendar grid', 'info');
                        }}
                        className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          plannerViewMode === 'calendar'
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                        title="Switch to Monthly Calendar Layout"
                      >
                        <Calendar className="w-3 h-3" /> Calendar
                      </button>
                    </div>

                    <button
                      onClick={handleExportPDF}
                      className="bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all shadow active:scale-95"
                      title="Download Selected Month Campaign Plan as PDF"
                    >
                      <FileText className="w-3.5 h-3.5" /> Export PDF
                    </button>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 border border-slate-900 px-2 py-1 rounded">
                      {filteredPlans.length} plans
                    </span>
                  </div>
                </div>

                {/* Drag and drop helper tip */}
                <div className="flex items-center justify-between bg-indigo-950/40 border border-indigo-900/50 px-3 py-1.5 rounded-lg text-xs font-mono text-indigo-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <GripVertical className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    Drag & Drop Enabled:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {plannerViewMode === 'list' ? 'Drag items to reorder schedule or drag onto calendar days' : 'Drag posts to any date cell on the grid to reschedule'}
                  </span>
                </div>

                {plannerViewMode === 'list' ? (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    <AnimatePresence mode="popLayout">
                      {filteredPlans.length === 0 ? (
                        <motion.div 
                          key="empty-state"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="bg-slate-950/30 border border-slate-800/50 rounded-xl p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2"
                        >
                          <Calendar className="w-8 h-8 text-slate-700" />
                          <p>{searchQuery ? `No content plans match the query "${searchQuery}".` : `No content scheduled for ${selectedMonth} yet.`}</p>
                          {!searchQuery && (
                            <button
                              onClick={() => {
                                setFormMonth(selectedMonth);
                                setActiveTab('entity-manager');
                              }}
                              className="mt-2 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                            >
                              + Click here to schedule one
                            </button>
                          )}
                        </motion.div>
                      ) : (
                        filteredPlans.map((plan, index) => {
                          const isBeingDragged = draggedPlanId === plan.id;
                          const isBeingTargeted = dragOverPlanId === plan.id;

                          return (
                          <motion.div 
                            key={plan.id}
                            layout
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.15), ease: 'easeOut' }}
                            draggable={permissionLevel !== 'viewer'}
                            onDragStart={(e) => handleDragStartPlan(e, plan.id)}
                            onDragOver={(e) => handleDragOverPlan(e, plan.id)}
                            onDrop={(e) => handleDropOnPlan(e, plan)}
                            onDragEnd={() => { setDraggedPlanId(null); setDragOverPlanId(null); }}
                            className={`bg-slate-950/50 border border-slate-800/85 hover:border-slate-700/80 hover:bg-slate-950/80 rounded-xl p-4 transition-all hover:scale-[1.01] shadow-md flex flex-col justify-between cursor-pointer group relative ${
                              isBeingDragged ? 'opacity-40 border-dashed border-indigo-500 scale-[0.98]' : ''
                            } ${
                              isBeingTargeted ? 'ring-2 ring-indigo-500 bg-indigo-950/70 border-indigo-400 shadow-xl scale-[1.02] z-10' : ''
                            }`}
                            onClick={() => {
                              setViewingPostPlan(plan);
                              addLog(`Interactive Node: Opened detailed 3D View for "${plan.title}"`, 'action');
                            }}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  {permissionLevel !== 'viewer' && (
                                    <div 
                                      className="text-slate-600 group-hover:text-indigo-400 p-0.5 rounded cursor-grab active:cursor-grabbing transition-colors"
                                      title="Click & Drag to reorder item position or drag onto calendar date"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                  )}
                                  <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full">
                                    {searchQuery ? `${plan.month} ` : ''}Day {plan.day} • {plan.platform}
                                  </span>
                                  {plan.accountHandle && (
                                    <span className="font-mono text-[9px] font-bold text-amber-300 bg-amber-950/60 border border-amber-900/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                      {plan.platform === 'YouTube' ? '🔴' : plan.platform === 'Facebook' ? '🌐' : '📸'} {plan.accountHandle}
                                    </span>
                                  )}
                                  {plan.status === 'Live' ? (
                                    <span className="font-mono text-[9px] font-bold text-rose-400 bg-rose-950/50 border border-rose-900/40 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                      LIVE
                                    </span>
                                  ) : (
                                    <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-full flex items-center gap-1" title="Assigned Target Date">
                                      <Calendar className="w-2.5 h-2.5 shrink-0" />
                                      {formatPlanDateTime(plan)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1 items-center">
                                  {permissionLevel !== 'viewer' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openEditModal(plan); }}
                                      className="text-slate-500 hover:text-indigo-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer mr-0.5"
                                      title="Edit Campaign details & Assigned Date"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <select
                                    disabled={permissionLevel === 'viewer'}
                                    value={plan.status}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      onUpdatePlanStatus(plan.id, e.target.value as any);
                                      addLog(`System: Changed campaign "${plan.title}" status to [${e.target.value}]`, 'action');
                                    }}
                                    className={`text-[10px] font-bold py-0.5 px-1.5 rounded outline-none cursor-pointer ${
                                      plan.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                      plan.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400' :
                                      plan.status === 'Review' ? 'bg-amber-500/10 text-amber-400' :
                                      plan.status === 'Live' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                                      'bg-slate-800 text-slate-300'
                                    } ${permissionLevel === 'viewer' ? 'opacity-80 cursor-not-allowed' : ''}`}
                                  >
                                    <option value="Planned">Planned</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Live">Live</option>
                                  </select>
                                  {permissionLevel !== 'viewer' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}
                                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                      title="Delete Plan"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <h4 className="text-sm font-bold text-white mb-1 font-display group-hover:text-indigo-300 transition-colors">{plan.title}</h4>
                              {plan.assignee && (
                                <p className="text-[10px] font-mono text-emerald-400 mb-1 border border-emerald-900/30 bg-emerald-950/20 inline-block px-1.5 py-0.5 rounded">
                                  Assignee: {plan.assignee}
                                </p>
                              )}
                              <p className="text-xs text-slate-400 line-clamp-2 mb-2">{plan.description}</p>
                              {plan.tags && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {plan.tags.split(',').map((tg, idx) => tg.trim() && (
                                    <span key={idx} className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-1.5 py-0.5 rounded">
                                      #{tg.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Performance Metrics Tracker Pill Bar */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-3 font-mono text-[9px]">
                                <span className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  👁️ {(plan.views || (plan.type === 'Story' ? 2840 : 12500)).toLocaleString()}
                                </span>
                                <span className="bg-slate-900 border border-slate-800 text-rose-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  ❤️ {(plan.likes || 840).toLocaleString()}
                                </span>
                                <span className="bg-slate-900 border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  💬 {(plan.comments || 120).toLocaleString()}
                                </span>
                                <span className="bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                                  📊 {plan.engagementRate || '7.8%'} ER
                                </span>
                                {plan.externalLink && (
                                  <a
                                    href={plan.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-amber-950/60 hover:bg-amber-900 border border-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1 truncate max-w-[110px]"
                                    title={`Open link: ${plan.externalLink}`}
                                  >
                                    <Link className="w-2.5 h-2.5 shrink-0" /> Link
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Staged media files in this item */}
                            {plan.videoUrl ? (
                              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <div className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded">
                                    <Video className="w-4 h-4" />
                                  </div>
                                  <div className="text-left overflow-hidden">
                                    <p className="text-[10px] font-medium text-white truncate max-w-[130px]">
                                      {plan.videoName || 'Uploaded Video'}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-mono">
                                      {plan.videoSize || 'N/A MB'}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewVideo({ url: plan.videoUrl!, title: plan.title });
                                    addLog(`Media: Loaded cinematic video preview for [${plan.title}] into sandbox pipeline`, 'info');
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-1.5 transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-white" /> Play
                                </button>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-600 italic border border-dashed border-slate-800 rounded-lg py-1 px-3">
                                No associated video clip.
                              </div>
                            )}
                          </motion.div>
                          );
                        })
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* GORGEOUS MONTHLY CALENDAR GRID LAYOUT */
                  <div className="bg-slate-950/30 border border-slate-850 rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
                        Interactive {selectedYear} Calendar Node
                      </span>
                      <span className="text-slate-600">Select day to view or add post</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {/* Weekday headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="text-center text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest py-1">
                          {d}
                        </div>
                      ))}

                      {/* Empty padding offsets for current month */}
                      {(() => {
                        const { startDayOfWeek, totalDays } = getMonthDetails(selectedMonth, selectedYear);
                        const cells = [];
                        
                        // Empty pads
                        for (let i = 0; i < startDayOfWeek; i++) {
                          cells.push(
                            <div key={`empty-${i}`} className="aspect-square bg-slate-950/10 border border-slate-900/40 rounded-lg opacity-30" />
                          );
                        }

                        // Day cells
                        for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
                          const dayPlans = filteredPlans.filter(p => p.day === dayNum);
                          const hasPlans = dayPlans.length > 0;
                          const isToday = new Date().getDate() === dayNum && MONTHS[new Date().getMonth()] === selectedMonth;
                          const isCalendarTargeted = dragOverDay === dayNum;
                          
                          // Determine platform indicator border
                          let customStyle = "bg-slate-950/20 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40";
                          if (hasPlans) {
                            const firstPlan = dayPlans[0];
                            if (firstPlan.status === 'Live') {
                              customStyle = "bg-rose-950/30 border-rose-500/40 hover:border-rose-400 hover:bg-rose-950/50 text-rose-300 shadow-sm shadow-rose-500/10 animate-pulse";
                            } else if (firstPlan.platform === 'YouTube') {
                              customStyle = "bg-red-950/25 border-red-500/30 hover:border-red-400/50 hover:bg-red-950/40 text-red-200";
                            } else if (firstPlan.platform === 'Instagram') {
                              customStyle = "bg-pink-950/20 border-pink-500/35 hover:border-pink-400/50 hover:bg-pink-950/30 text-pink-200";
                            } else if (firstPlan.platform === 'TikTok') {
                              customStyle = "bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-400/50 hover:bg-cyan-950/30 text-cyan-200";
                            } else {
                              customStyle = "bg-indigo-950/25 border-indigo-500/35 hover:border-indigo-400/50 hover:bg-indigo-950/35 text-indigo-200";
                            }
                          }

                          cells.push(
                            <motion.div
                              whileHover={{ scale: 1.04, y: -1 }}
                              whileTap={{ scale: 0.96 }}
                              key={`day-${dayNum}`}
                              onDragOver={(e) => handleDragOverDay(e, dayNum)}
                              onDragLeave={() => setDragOverDay(null)}
                              onDrop={(e) => handleDropOnCalendarDay(e, dayNum)}
                              onClick={() => {
                                if (hasPlans) {
                                  setViewingPostPlan(dayPlans[0]);
                                  addLog(`Interactive Node: Opened calendar day ${dayNum} post detail: "${dayPlans[0].title}"`, 'action');
                                } else {
                                  setFormMonth(selectedMonth);
                                  setFormDay(dayNum);
                                  // Compute date
                                  const mIdx = MONTHS.indexOf(selectedMonth) + 1;
                                  const formattedMonth = mIdx < 10 ? `0${mIdx}` : `${mIdx}`;
                                  const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                                  setFormDateTime(`${selectedYear}-${formattedMonth}-${formattedDay}T12:00`);
                                  setActiveTab('entity-manager');
                                  addLog(`System: Staged scheduler date [${selectedYear}-${formattedMonth}-${formattedDay}] via calendar matrix`, 'action');
                                }
                              }}
                              className={`aspect-square p-1 border rounded-lg flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${customStyle} ${
                                isToday ? 'ring-1 ring-emerald-500 border-emerald-500/50' : ''
                              } ${
                                isCalendarTargeted ? 'ring-2 ring-indigo-400 bg-indigo-950/80 border-indigo-400 scale-[1.05] z-20 shadow-lg shadow-indigo-500/20' : ''
                              }`}
                            >
                              {/* Day Label & Platform Indicators */}
                              <div className="flex justify-between items-center z-10">
                                <span className={`text-[9px] font-mono font-bold ${
                                  isToday ? 'text-emerald-400 bg-emerald-950/60 px-1 rounded border border-emerald-900/30' : 
                                  hasPlans ? 'text-indigo-300 font-extrabold' : 'text-slate-500'
                                }`}>
                                  {dayNum}
                                </span>
                                
                                {hasPlans && (
                                  <div className="flex gap-0.5">
                                    {dayPlans.map((p, idx) => {
                                      let dotColor = 'bg-slate-400';
                                      if (p.platform === 'YouTube') dotColor = 'bg-red-500';
                                      else if (p.platform === 'Instagram') dotColor = 'bg-pink-500';
                                      else if (p.platform === 'TikTok') dotColor = 'bg-cyan-400';
                                      else if (p.platform === 'LinkedIn') dotColor = 'bg-blue-500';
                                      else if (p.platform === 'Facebook') dotColor = 'bg-blue-600';
                                      
                                      return (
                                        <span 
                                          key={p.id || idx} 
                                          className={`w-1 h-1 rounded-full ${dotColor} ${p.status === 'Live' ? 'animate-ping' : ''}`}
                                          title={`${p.platform}: ${p.title}`}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Day Miniature content descriptor */}
                              {hasPlans ? (
                                <div 
                                  className="mt-auto text-left leading-tight cursor-grab active:cursor-grabbing"
                                  draggable={permissionLevel !== 'viewer'}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    handleDragStartPlan(e, dayPlans[0].id);
                                  }}
                                >
                                  <p className="text-[7.5px] font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                                    {dayPlans[0].title}
                                  </p>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-[6.5px] font-mono px-1 py-0.2 bg-slate-900/80 rounded border border-slate-800 text-slate-400 uppercase tracking-wider scale-[0.9] origin-left">
                                      {dayPlans[0].platform.substring(0, 3)}
                                    </span>
                                    {dayPlans[0].videoUrl && (
                                      <Video className="w-2.5 h-2.5 text-indigo-400 animate-pulse shrink-0" />
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[7px] text-slate-700 font-mono text-left opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                                  + Add Plan
                                </span>
                              )}
                            </motion.div>
                          );
                        }
                        
                        return cells;
                      })()}
                    </div>

                    {/* Platform color legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center pt-2 border-t border-slate-900 text-[8px] font-mono text-slate-500">
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> YouTube</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pink-500" /> Instagram</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> TikTok</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> LinkedIn</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Facebook</span>
                      <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" /> Live</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Preview Card */}
              <div className="bg-slate-950/40 border border-slate-800/70 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" /> Dynamic Media Pipeline
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload dynamic video reels and cross-reference scheduler tasks instantly. Select any planned element on the left to verify or test your video overlays.
                  </p>

                  {/* Active Video player helper */}
                  <div className="mt-4 aspect-video rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center text-center p-4 relative group">
                    {previewVideo ? (
                      <div className="absolute inset-0 w-full h-full bg-black flex flex-col justify-between">
                        <video 
                          src={previewVideo.url} 
                          controls 
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-1 rounded-full cursor-pointer hover:bg-rose-600 transition-colors" onClick={() => setPreviewVideo(null)}>
                          <X className="w-4 h-4" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Video className="w-8 h-8 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-xs font-mono text-slate-500">Video Player Pipeline Standby</span>
                        <p className="text-[10px] text-slate-600 max-w-[200px]">
                          Click "Play" on any scheduled planner card with an uploaded video to view it live here!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-3 mt-4 text-[11px] text-indigo-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                  <span>
                    <strong>Swanaya Tip:</strong> To drive engagement in 2026, schedule video content for days 1, 15, and 30 to align with digital search spikes!
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: YEARLY STATS
            ========================================================================= */}
        {activeTab === 'yearly' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">TOTAL REGISTRY</span>
                <span className="text-xl font-bold text-white">{plans.length}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">VIDEO ASSETS</span>
                <span className="text-xl font-bold text-indigo-400">{typeCounts['Video'] || 0}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">COMPLETED PROJECTS</span>
                <span className="text-xl font-bold text-emerald-400">{statusCounts['Completed'] || 0}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 text-center">
                <span className="text-[10px] font-mono text-slate-500 block mb-1">STAGED REELS</span>
                <span className="text-xl font-bold text-purple-400">
                  {plans.filter(p => p.videoUrl).length}
                </span>
              </div>
            </div>

            {/* Visual Charts / Distributions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Monthly volume bar chart mock (using plain styled divs) */}
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/60">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  Monthly Campaign Allocation Volume
                </h4>
                <div className="h-44 flex items-end justify-between gap-1 border-b border-slate-800 pb-2">
                  {MONTHS.map(m => {
                    const count = monthlyCounts[m] || 0;
                    // Scale maximum height based on hypothetical 10 max plans
                    const pct = Math.min((count / 8) * 100, 100);
                    return (
                      <div key={m} className="flex flex-col items-center flex-1 group">
                        <div className="text-[9px] font-mono text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          {count}
                        </div>
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-600/60 to-indigo-500 rounded-t-sm group-hover:brightness-125 transition-all"
                          style={{ height: `${Math.max(pct, 5)}px` }}
                        />
                        <span className="text-[8px] font-mono text-slate-500 mt-2 rotate-45 origin-left tracking-tighter uppercase">
                          {m.substring(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-5" /> {/* spacing spacer for tilted text */}
              </div>

              {/* Platform Distribution Ratio */}
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/60">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  Platform Distribution Spectrum
                </h4>
                <div className="space-y-3.5">
                  {PLATFORMS.map(platform => {
                    const count = platformCounts[platform] || 0;
                    const total = plans.length || 1;
                    const pct = Math.round((count / total) * 100);
                    
                    let barColor = 'bg-red-500';
                    if (platform === 'Instagram') barColor = 'bg-pink-500';
                    if (platform === 'TikTok') barColor = 'bg-purple-500';
                    if (platform === 'LinkedIn') barColor = 'bg-sky-500';
                    if (platform === 'Facebook') barColor = 'bg-indigo-500';

                    return (
                      <div key={platform} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-300">{platform}</span>
                          <span className="font-mono text-slate-500">{count} plans ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: ENTITY MANAGER (Add New Plan with Video uploading)
            ========================================================================= */}
        {activeTab === 'entity-manager' && (
          <form onSubmit={handleFormSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Column Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Campaign / Content Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Autumn Promo Reel"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Content Category
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      {TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Platform
                    </label>
                    <select
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pre-registered Social Account / Channel Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Pre-Registered Social Account / Channel</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold">✨ Auto-syncs Platform</span>
                  </label>
                  <select
                    value={formAccountHandle}
                    onChange={(e) => {
                      const selectedHandle = e.target.value;
                      setFormAccountHandle(selectedHandle);
                      const acc = instagramAccounts.find(a => a.handle === selectedHandle);
                      if (acc?.platform) {
                        setFormPlatform(acc.platform as any);
                      } else if (selectedHandle.includes('youtube')) {
                        setFormPlatform('YouTube');
                      } else if (selectedHandle.includes('facebook')) {
                        setFormPlatform('Facebook');
                      } else {
                        setFormPlatform('Instagram');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer font-medium"
                  >
                    <optgroup label="📸 Instagram Accounts">
                      {instagramAccounts.filter(a => !a.platform || a.platform === 'Instagram').map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🔴 YouTube Channels">
                      {instagramAccounts.filter(a => a.platform === 'YouTube' || a.handle.includes('youtube')).map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 Meta / Facebook Archives">
                      {instagramAccounts.filter(a => a.platform === 'Facebook' || a.handle.includes('facebook')).map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Unified Date & Time Picker Replacement */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Campaign Scheduling Assignment
                    </span>
                    {isAssigned ? (
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                        🟢 Assigned
                      </span>
                    ) : (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                        🔴 Unassigned
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-lg flex flex-col items-center justify-center min-h-[90px] text-center gap-3">
                    {isAssigned ? (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-200">
                          Assigned to publish on:{' '}
                          <span className="text-emerald-400 font-bold font-mono">
                            {formMonth} {formDay}, {selectedYear}
                          </span>{' '}
                          at{' '}
                          <span className="text-amber-400 font-bold font-mono">
                            {formDateTime && !isNaN(new Date(formDateTime).getTime())
                              ? new Date(formDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : '12:00 PM'}
                          </span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAssignModal(true)}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          ✏️ Edit Assignment Date & Time
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          This content plan has not been assigned to a calendar schedule yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAssignModal(true)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer mx-auto shadow-md transition-all active:scale-95"
                        >
                          🟢 Assign Content to Date
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Plan Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Operator / Event Planner Assignee
                  </label>
                  <input
                    type="text"
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    placeholder="Enter assignee username or role"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {/* Right Column Fields (Description & Video File Uploading) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Content Memo / Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details on script context, copy captions, overlays, etc..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                {/* DYNAMIC MEDIA FILE & LINK UPLOAD PIPELINE */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Photos & Videos Media Upload Pipeline</span>
                    <span className="text-[9px] text-amber-400 uppercase font-mono">Photos • Videos • Drive • Link Pastes</span>
                  </label>

                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
                      isDragging 
                        ? 'border-indigo-500 bg-indigo-500/10' 
                        : uploadedVideo 
                          ? 'border-emerald-500/50 bg-emerald-950/10' 
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
                      accept="image/*,video/*"
                      className="hidden"
                    />

                    {uploadedVideo ? (
                      <div className="space-y-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full inline-flex border border-emerald-500/20">
                          {uploadedVideo.mediaType === 'image' || uploadedVideo.url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || uploadedVideo.url.includes('unsplash') ? (
                            <ImageIcon className="w-6 h-6 text-amber-400 animate-pulse" />
                          ) : uploadedVideo.isGoogleDrive ? (
                            <svg className="w-6 h-6 text-emerald-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.43 12.981L14.71 4.801c-.38-.66-1.08-1.06-1.85-1.06h-1.72c-.77 0-1.47.4-1.85 1.06L4.57 12.981c-.38.66-.38 1.47 0 2.13l2.36 4.091c.38.66 1.08 1.06 1.85 1.06h9.44c.77 0 1.47-.4 1.85-1.06l2.36-4.091c.38-.66.38-1.47 0-2.13zM9.43 17.5c-.38 0-.74-.21-.93-.54L6.14 12.87c-.19-.33-.19-.74 0-1.07l2.36-4.09c.19-.33.55-.54.93-.54h4.72c.38 0 .74.21.93.54l2.36 4.09c.19.33.19.74 0 1.07l-2.36 4.09c-.19.33-.55.54-.93.54H9.43z" />
                            </svg>
                          ) : (
                            <Video className="w-6 h-6 animate-pulse" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold text-white max-w-[250px] truncate mx-auto">
                            {uploadedVideo.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {uploadedVideo.isGoogleDrive ? 'Linked from Google Drive' : `Type: ${uploadedVideo.mediaType === 'image' ? 'Photo Image' : 'Video Clip'} • ${uploadedVideo.size}`}
                          </p>
                          {uploadedVideo.isGoogleDrive && uploadedVideo.url && (
                            <a
                              href={uploadedVideo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline font-mono inline-block mt-1 animate-pulse"
                            >
                              Open in Drive 🔗
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={removeStagedVideo}
                          className="bg-rose-950/50 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-[10px] py-1 px-3 rounded-lg transition-all cursor-pointer font-semibold"
                        >
                          Clear Media File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pointer-events-none">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-full inline-flex border border-indigo-500/20">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium text-slate-200">
                          Drag & drop Photo (JPG/PNG) or Video clip here, or <span className="text-indigo-400 underline">browse</span>
                        </p>
                        <p className="text-[9px] text-slate-500">
                          Supports mp4, webm, mov, jpg, png, webp, gif (Max 150MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Direct Photo or Video URL Link Paste Input */}
                  <div className="mt-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-amber-400" /> Direct Photo / Video URL Link Paste
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">Unsplash, Web Image or Video Link</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={formDirectMediaUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormDirectMediaUrl(val);
                          if (val.trim()) {
                            const isImg = Boolean(val.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i) || val.includes('unsplash.com') || val.includes('image'));
                            setUploadedVideo({
                              url: val.trim(),
                              name: val.split('/').pop()?.split('?')[0] || 'pasted_media_link',
                              size: isImg ? 'Photo Link' : 'Video Link',
                              mediaType: isImg ? 'image' : 'video'
                            });
                            addLog('Media Pipeline: Attached direct photo/video URL link', 'info');
                          }
                        }}
                        placeholder="e.g. https://images.unsplash.com/photo-1518770660439... or https://cdn.com/clip.mp4"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/80 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                      />
                      {formDirectMediaUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormDirectMediaUrl('');
                            setUploadedVideo(null);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-2 rounded-lg font-mono cursor-pointer shrink-0"
                        >
                          Clear Link
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Google Drive Picker Trigger Button */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleVideoGooglePicker}
                      className="w-full bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow active:scale-95"
                    >
                      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.43 12.981L14.71 4.801c-.38-.66-1.08-1.06-1.85-1.06h-1.72c-.77 0-1.47.4-1.85 1.06L4.57 12.981c-.38.66-.38 1.47 0 2.13l2.36 4.091c.38.66 1.08 1.06 1.85 1.06h9.44c.77 0 1.47-.4 1.85-1.06l2.36-4.091c.38-.66.38-1.47 0-2.13zM9.43 17.5c-.38 0-.74-.21-.93-.54L6.14 12.87c-.19-.33-.19-.74 0-1.07l2.36-4.09c.19-.33.55-.54.93-.54h4.72c.38 0 .74.21.93.54l2.36 4.09c.19.33.19.74 0 1.07l-2.36 4.09c-.19.33-.55.54-.93.54H9.43z" />
                      </svg>
                                      Select Staged Media via Google Picker
                    </button>
                  </div>

                  {/* Performance Analytics & Direct Social Link Tracker */}
                  <div className="mt-3 p-3.5 bg-indigo-950/20 border border-indigo-900/40 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Performance Metrics & Post Link Tracker
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                        ER: {formViews > 0 ? (((formLikes + formComments + formShares) / formViews) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">
                        Direct Social Post Link (Instagram Reel / Facebook Post / YouTube Video / Story)
                      </label>
                      <input
                        type="url"
                        value={formExternalLink}
                        onChange={(e) => setFormExternalLink(e.target.value)}
                        placeholder="https://instagram.com/p/... or https://youtube.com/watch?v=..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">👁️ Views / Plays</label>
                        <input
                          type="number"
                          min="0"
                          value={formViews}
                          onChange={(e) => setFormViews(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">❤️ Likes</label>
                        <input
                          type="number"
                          min="0"
                          value={formLikes}
                          onChange={(e) => setFormLikes(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">💬 Comments</label>
                        <input
                          type="number"
                          min="0"
                          value={formComments}
                          onChange={(e) => setFormComments(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">🔁 Shares / Clicks</label>
                        <input
                          type="number"
                          min="0"
                          value={formShares}
                          onChange={(e) => setFormShares(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>

              </div>

            <div className="pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              {!isAssigned ? (
                <div className="text-rose-400 text-xs font-bold font-mono px-3.5 py-2 bg-rose-950/20 border border-rose-900/40 rounded-xl flex items-center gap-1.5 w-full sm:w-auto">
                  <span>🔴 Content is Unassigned - Please assign content to date!</span>
                </div>
              ) : (
                <div className="text-emerald-400 text-xs font-bold font-mono px-3.5 py-2 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center gap-1.5 w-full sm:w-auto">
                  <span>🟢 Ready to publish on {formMonth} {formDay}</span>
                </div>
              )}
              
              <div className="flex gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('monthly')}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs py-2 px-4 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {!isAssigned ? (
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-5 rounded-lg shadow-lg shadow-emerald-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    🟢 Assign Content
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={permissionLevel === 'viewer'}
                    className={`text-xs font-bold py-2 px-5 rounded-lg shadow-lg transition-all ${
                      permissionLevel === 'viewer'
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 cursor-pointer'
                    }`}
                  >
                    {permissionLevel === 'viewer' ? '🔒 Read-Only Mode' : '📅 Schedule Content Plan'}
                  </button>
                )}
              </div>
            </div>

          </form>
        )}



        {/* =========================================================================
            TAB: UNDER DEVELOPMENT MODULE
            ========================================================================= */}
        {activeTab === 'under-development' && (
          <div className="space-y-6 text-left">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    MODULE UNDER DEVELOPMENT
                  </span>
                  <span className="text-xs text-slate-400 font-mono">v2.4 Roadmap</span>
                </div>
                <h3 className="text-xl font-extrabold text-white font-display flex items-center gap-2">
                  <Clock className="w-6 h-6 text-amber-400" /> Advanced Integrations & Automated Social Gateway
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  This module is currently undergoing active engineering and backend pipeline integration. Live Meta Graph API auto-publishing, direct Instagram Reel dispatchers, and automated multi-platform campaign telemetry are being built.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('monthly')}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Go to Monthly Planner
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('accounts-registry')}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> View Accounts Register
                </button>
              </div>
            </div>

            {/* Recent Developments & Live Deployments Section */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-emerald-400 animate-bounce" />
                    <h4 className="text-base font-extrabold text-white font-display">Recent Development Deployments & Live Projects</h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      {recentDevelopments.length} Active Link{recentDevelopments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Direct access portal for newly registered development deployments, Netlify prototypes, and API staging environments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingDev(!isAddingDev)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg"
                >
                  <Plus className="w-4 h-4" /> {isAddingDev ? 'Cancel Form' : 'Add Development Link'}
                </button>
              </div>

              {/* Form to Add New Recent Development */}
              {isAddingDev && (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 space-y-3 font-mono">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-emerald-400" /> Register New Recent Development Deployment
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Project / Module Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Planora Odyssey"
                        value={newDevName}
                        onChange={(e) => setNewDevName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Deployment URL</label>
                      <input
                        type="text"
                        placeholder="https://planora-odessesy.netlify.app/"
                        value={newDevUrl}
                        onChange={(e) => setNewDevUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Deployment Status</label>
                      <select
                        value={newDevStatus}
                        onChange={(e) => setNewDevStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="LIVE DEPLOYMENT">LIVE DEPLOYMENT</option>
                        <option value="IN DEVELOPMENT (80%)">IN DEVELOPMENT (80%)</option>
                        <option value="STAGING ENVIRONMENT">STAGING ENVIRONMENT</option>
                        <option value="BETA TEST">BETA TEST</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Category / Host</label>
                      <input
                        type="text"
                        placeholder="e.g., Netlify / Web App"
                        value={newDevCategory}
                        onChange={(e) => setNewDevCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1">Short Description</label>
                      <input
                        type="text"
                        placeholder="Summary of feature capabilities or deployment details..."
                        value={newDevDesc}
                        onChange={(e) => setNewDevDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingDev(false)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newDevName.trim() || !newDevUrl.trim()) return;
                        const formattedUrl = newDevUrl.startsWith('http') ? newDevUrl : `https://${newDevUrl}`;
                        const newItem = {
                          id: Date.now().toString(),
                          name: newDevName,
                          url: formattedUrl,
                          description: newDevDesc || 'Recent development deployment project.',
                          status: newDevStatus,
                          platform: newDevCategory || 'Web Application',
                          category: newDevCategory || 'Web App',
                          addedAt: new Date().toISOString().split('T')[0],
                          isFeatured: false
                        };
                        setRecentDevelopments(prev => [newItem, ...prev]);
                        setIsAddingDev(false);
                        setNewDevName('');
                        setNewDevUrl('');
                        setNewDevDesc('');
                        addLog(`Recent Development: Registered "${newItem.name}" (${newItem.url}) into pipeline.`, 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer transition-colors"
                    >
                      Save Recent Development
                    </button>
                  </div>
                </div>
              )}

              {/* Grid of Recent Development Deployments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentDevelopments.map((dev) => (
                  <div
                    key={dev.id}
                    className={`p-4 rounded-xl border text-left space-y-3 transition-all relative group ${
                      dev.isFeatured
                        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/70 hover:bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-bold text-white font-display flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                            {dev.name}
                          </h5>
                          {dev.isFeatured && (
                            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Featured
                            </span>
                          )}
                        </div>
                        <span className="inline-block text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                          {dev.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {recentDevelopments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setRecentDevelopments(prev => prev.filter(d => d.id !== dev.id));
                              addLog(`Recent Development: Removed "${dev.name}" from registry.`, 'warning');
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                            title="Remove from recent development"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {dev.description}
                    </p>

                    {/* URL display box */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-slate-300 truncate font-semibold">{dev.url}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(dev.url);
                            setCopiedUrl(dev.url);
                            addLog(`Copied deployment link: ${dev.url}`, 'info');
                            setTimeout(() => setCopiedUrl(null), 2000);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                          title="Copy Link"
                        >
                          {copiedUrl === dev.url ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" /> Copy
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPreviewIframeUrl(dev.url);
                            addLog(`Recent Development: Opening live preview modal for ${dev.name}`, 'info');
                          }}
                          className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 p-1.5 rounded transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                          title="Preview in Modal"
                        >
                          <Eye className="w-3 h-3" /> Preview
                        </button>

                        <a
                          href={dev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        >
                          Launch <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                      <span>Category: {dev.category}</span>
                      <span>Added: {dev.addedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Status Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Feature Progress Pipeline */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Feature Engineering Status Pipeline
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Build #842 • Cloud SQL Ready</span>
                </div>

                <div className="space-y-3 font-mono">
                  {/* Item 1 */}
                  <div className="p-3 bg-slate-950/80 border border-emerald-900/40 rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        Performance Metrics & Link Tracker
                      </p>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Views, Likes, Comments, Shares & Engagement Rate calculation engine integrated across all plans.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-1 rounded shrink-0">
                      100% COMPLETED
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="p-3 bg-slate-950/80 border border-emerald-900/40 rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        Google Drive & Direct Video Staging
                      </p>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Seamless video asset uploading, direct playback previews, and staged cloud media node associations.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-1 rounded shrink-0">
                      100% COMPLETED
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="p-3 bg-slate-950/80 border border-amber-900/40 rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                        Meta Graph API Direct Auto-Publisher
                      </p>
                      <p className="text-[10px] text-slate-400 font-sans">
                        OAuth token exchange and direct scheduled posting for Instagram Reels and Facebook Pages.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2 py-1 rounded shrink-0">
                      IN DEVELOPMENT (65%)
                    </span>
                  </div>

                  {/* Item 4 */}
                  <div className="p-3 bg-slate-950/80 border border-indigo-900/40 rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                        AI Multi-Platform Hashtag Generator
                      </p>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Automated SEO tag generation and trending keyword research engine for YouTube and Instagram.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 px-2 py-1 rounded shrink-0">
                      PLANNED (Q3 2026)
                    </span>
                  </div>
                </div>
              </div>

              {/* Development Notes & Quick Actions */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-sm font-bold text-white font-display">System Status Notice</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    All core features—including campaign planning, calendar visualization, accounts assignment, video upload, and engagement rate tracking—are fully operational across the app.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    This section will unlock live auto-publishing APIs as soon as the sandbox validation cycle completes.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      addLog('System Diagnostics: Verified Under Development module integrity and backend services', 'success');
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-300 p-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Run Module Diagnostic Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('entity-manager')}
                    className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 p-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" /> Add New Content Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}




























        {/* =========================================================================
            DEDICATED TAB VIEW: ACCOUNTS REGISTRY & ENTITY PROFILES
            ========================================================================= */}
        {activeTab === 'accounts-registry' && (
          <div className="space-y-6 text-left">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-purple-950/40 border border-indigo-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" /> Pre-Registered Accounts & Entity Profiles Registry
                </h3>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Central management for all pre-registered Instagram handles, YouTube channels, and Facebook ad profiles. Connect your content planning items and live simulator previews directly to verified brand handles.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 font-mono text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {instagramAccounts.length} Active Accounts
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingInstaAccount(!isAddingInstaAccount);
                    setIsEditingInstaAccount(false);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-1.5 px-3.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow"
                >
                  {isAddingInstaAccount ? '✕ Close Form' : '+ Register New Account'}
                </button>
              </div>
            </div>

            {/* Form to Register a New Profile */}
            {isAddingInstaAccount && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-900/80 shadow-2xl space-y-4">
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" /> 1-Click Quick Presets (Instant Auto-Fill):
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Select any template to auto-fill fields</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { label: '🎬 IG Reels Studio', handle: '@instagram_reels_official', name: 'Instagram Reels Studio', category: 'Reels Creator Studio', followers: '320K', bio: 'Dedicated short-form video portal, trending audio syncs, and viral reel series. 🎬⚡' },
                      { label: '🖼️ Single Image Showcase', handle: '@instagram_single_images', name: 'Instagram Single Image Showcase', category: 'Visual Showcase', followers: '68K', bio: 'High-res single image photography, visual aesthetics, and brand poster showcase. 🖼️🎨' },
                      { label: '🎠 Carousel Studio', handle: '@instagram_carousels_hub', name: 'Instagram Carousel Studio', category: 'Carousel Infographics', followers: '95K', bio: 'Multi-slide visual storyboards, carousel infographic sequences, and swipeable tutorials. 🎠📊' },
                      { label: '📸 IG Story Views Hub', handle: '@instagram_story_hub', name: 'Instagram Story Hub', category: 'Story & Views Analytics', followers: '142K', bio: 'Daily IG Story uploads, interactive sticker polls, link taps, and real-time view rates. 📸📊' },
                      { label: '📣 Meta Ads Manager', handle: '@instagram_meta_ads', name: 'Instagram Meta Ads', category: 'Sponsored Meta Ads', followers: '250K', bio: 'Meta Ads Manager & Sponsored Campaign Registry. Direct automated multi-format ad deployment. 📣📊' },
                      { label: '🛡️ FB Ad Registry Archive', handle: '@facebook_ad_registry', name: 'Facebook Ad Registry', category: 'Ad Transparency Archive', followers: '1.2M', bio: 'Official Facebook & Meta Transparency Ad Archive and Verified Ad Registry. 🛡️📑' },
                      { label: '☕ Chai with Aadi', handle: '@chai_with_aadi', name: 'Chai with Aadithyan (Instagram)', category: 'Tech Podcast', followers: '108K', bio: 'Weekly podcasts about future design paradigms, tech automation, and digital media craft. ☕🎙️' },
                      { label: '🎬 Come Along with Title', handle: '@come_along_title', name: 'Come Along with Title', category: 'Creative Series', followers: '82.5K', bio: 'Exclusive behind-the-scenes title sequences, cinematic storyboards, and episodic creative previews. 🎬' }
                    ].map(preset => (
                      <button
                        key={preset.handle}
                        type="button"
                        onClick={() => {
                          setNewInstaHandle(preset.handle);
                          setNewInstaName(preset.name);
                          setNewInstaCategory(preset.category);
                          setNewInstaFollowers(preset.followers);
                          setNewInstaBio(preset.bio);
                          addLog(`Registry Preset Loaded: Populated form for ${preset.label}`, 'success');
                        }}
                        className="text-xs font-mono bg-slate-900 hover:bg-indigo-600 hover:text-white text-indigo-300 border border-indigo-900/60 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Profile Handle</label>
                    <input
                      type="text"
                      placeholder="e.g. @chai_with_aadi"
                      value={newInstaHandle}
                      onChange={(e) => setNewInstaHandle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Full Brand Name / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Chai with Aadithyan"
                      value={newInstaName}
                      onChange={(e) => setNewInstaName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Category / Niche</label>
                    <input
                      type="text"
                      placeholder="e.g. Tech Podcast"
                      value={newInstaCategory}
                      onChange={(e) => setNewInstaCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Followers Count</label>
                    <input
                      type="text"
                      placeholder="e.g. 108K"
                      value={newInstaFollowers}
                      onChange={(e) => setNewInstaFollowers(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Bio / Channel Overview</label>
                    <input
                      type="text"
                      placeholder="Enter short bio message..."
                      value={newInstaBio}
                      onChange={(e) => setNewInstaBio(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Registered Year Selector</label>
                    <select
                      value={newInstaYear}
                      onChange={(e) => setNewInstaYear(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none cursor-pointer font-mono"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                      <option value={2023}>2023</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newInstaHandle.trim() || !newInstaName.trim()) return;
                        const newId = Date.now().toString();
                        const newAcc = {
                          id: newId,
                          handle: newInstaHandle.startsWith('@') ? newInstaHandle : `@${newInstaHandle}`,
                          name: newInstaName,
                          bio: newInstaBio || 'No biography details provided.',
                          followers: newInstaFollowers || '1.2K',
                          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80',
                          category: newInstaCategory || 'General Media',
                          registeredYear: newInstaYear
                        };
                        setInstagramAccounts(prev => [...prev, newAcc]);
                        setActiveInstaAccountId(newId);
                        setIsAddingInstaAccount(false);
                        setNewInstaHandle('');
                        setNewInstaName('');
                        setNewInstaBio('');
                        addLog(`Registry: Registered new media entity ${newAcc.handle} into directory.`, 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold py-2 px-5 rounded-lg cursor-pointer uppercase transition-colors shadow"
                    >
                      Add Entity to Registry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of All Pre-Registered Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instagramAccounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => {
                    setActiveInstaAccountId(acc.id);
                    setIsEditingInstaAccount(false);
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative group flex flex-col justify-between space-y-3 ${
                    activeInstaAccountId === acc.id
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-xl'
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                        <img src={acc.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white leading-tight flex items-center gap-1">
                          {acc.name}
                          <span className="text-blue-400 font-bold text-xs">✓</span>
                        </h5>
                        <p className="text-xs font-mono text-amber-300 font-semibold">{acc.handle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-full font-bold">
                      {acc.registeredYear}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                    {acc.bio}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-850">
                    <span className="text-slate-500">{acc.category}</span>
                    <span className="text-emerald-400 font-bold">{acc.followers} Followers</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      activeInstaAccountId === acc.id ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                    }`}>
                      {activeInstaAccountId === acc.id ? '● Active Default' : 'Click to Select'}
                    </span>
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveInstaAccountId(acc.id);
                          setIsEditingInstaAccount(true);
                          setIsAddingInstaAccount(false);
                          setEditedInstaHandle(acc.handle);
                          setEditedInstaName(acc.name);
                          setEditedInstaBio(acc.bio);
                          setEditedInstaCategory(acc.category);
                          setEditedInstaFollowers(acc.followers);
                          setEditedInstaYear(acc.registeredYear);
                        }}
                        className="text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-800 cursor-pointer"
                      >
                        Edit Profile
                      </button>
                      {instagramAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setInstagramAccounts(prev => prev.filter(a => a.id !== acc.id));
                            if (activeInstaAccountId === acc.id) {
                              setActiveInstaAccountId(instagramAccounts.find(a => a.id !== acc.id)?.id || '');
                            }
                            addLog(`Registry: Removed profile ${acc.handle} from register.`, 'warning');
                          }}
                          className="text-xs font-mono text-rose-400 hover:text-rose-300 bg-slate-900 hover:bg-slate-800 px-2 py-1 rounded-lg border border-slate-800 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          INLINE EDITING SYSTEM MODAL
          ========================================================================= */}
      <AnimatePresence>
        {editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-slate-950/60 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-tight font-display">Campaign Detail Registry Editor</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {editingPlan.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPlan(null)}
                  className="text-slate-500 hover:text-white transition-colors p-1 rounded hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={saveEditedPlan} className="p-6 space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none transition-all font-display"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Campaign Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white placeholder-slate-700 outline-none transition-all resize-none"
                  />
                </div>

                {/* Date Assignment */}
                <div className="bg-indigo-950/20 border border-indigo-900/30 p-3.5 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Integrated Date & Time Editor
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Select Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-2 text-xs text-white outline-none cursor-pointer font-mono font-bold"
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex flex-col justify-center">
                      <p className="font-semibold text-slate-300 leading-tight">Live Synchronization</p>
                      <p className="mt-0.5 leading-relaxed text-slate-500 text-[9px]">
                        Selected: <span className="text-white font-bold">{editDate ? parseDateString(editDate).month : ''} Day {editDate ? parseDateString(editDate).day : ''}</span>
                        {editDate && !isNaN(new Date(editDate).getTime()) && (
                          <> at <span className="text-amber-400 font-bold">{new Date(editDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pre-registered Account Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between">
                    <span>Pre-Registered Social Account / Channel</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold">Auto-Syncs Platform</span>
                  </label>
                  <select
                    value={editAccountHandle}
                    onChange={(e) => {
                      const selectedHandle = e.target.value;
                      setEditAccountHandle(selectedHandle);
                      const acc = instagramAccounts.find(a => a.handle === selectedHandle);
                      if (acc?.platform) {
                        setEditPlatform(acc.platform as any);
                      } else if (selectedHandle.includes('youtube')) {
                        setEditPlatform('YouTube');
                      } else if (selectedHandle.includes('facebook')) {
                        setEditPlatform('Facebook');
                      } else {
                        setEditPlatform('Instagram');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none font-medium cursor-pointer"
                  >
                    <optgroup label="📸 Instagram Accounts">
                      {instagramAccounts.filter(a => !a.platform || a.platform === 'Instagram').map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🔴 YouTube Channels">
                      {instagramAccounts.filter(a => a.platform === 'YouTube' || a.handle.includes('youtube')).map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 Meta / Facebook Archives">
                      {instagramAccounts.filter(a => a.platform === 'Facebook' || a.handle.includes('facebook')).map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Platform */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Media Target Channel
                    </label>
                    <select
                      value={editPlatform}
                      onChange={(e) => setEditPlatform(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Content Type */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Category Classification
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      {TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status and Assignee */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Workflow Pipeline State
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Live">Live</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Assigned Operator
                    </label>
                    <input
                      type="text"
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      placeholder="Username or role"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Performance Analytics & Direct Post Link Editor */}
                <div className="p-3.5 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Performance Metrics & Link Editor
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                      Calculated ER: {editViews > 0 ? (((editLikes + editComments + editShares) / editViews) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase mb-1">
                      Direct Social Post / Video Link
                    </label>
                    <input
                      type="url"
                      value={editExternalLink}
                      onChange={(e) => setEditExternalLink(e.target.value)}
                      placeholder="https://instagram.com/reel/... or https://youtube.com/watch?v=..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">👁️ Views</label>
                      <input
                        type="number"
                        min="0"
                        value={editViews}
                        onChange={(e) => setEditViews(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">❤️ Likes</label>
                      <input
                        type="number"
                        min="0"
                        value={editLikes}
                        onChange={(e) => setEditLikes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">💬 Comments</label>
                      <input
                        type="number"
                        min="0"
                        value={editComments}
                        onChange={(e) => setEditComments(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-slate-400 mb-0.5">🔁 Shares</label>
                      <input
                        type="number"
                        min="0"
                        value={editShares}
                        onChange={(e) => setEditShares(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-md p-1.5 text-xs text-white outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold py-2 px-4 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Dismiss Changes
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-lg text-xs shadow-lg shadow-indigo-500/10 cursor-pointer transition-all"
                  >
                    Commit Update Registry
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          INTERACTIVE 3D MULTI-VIEW POST PREVIEW & LIVE STATUS GATEWAY MODAL
          ========================================================================= */}
      <AnimatePresence>
        {viewingPostPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 30 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[620px] max-h-[90vh]"
            >
              {/* LEFT COLUMN: 3D Simulator Space */}
              <div className="flex-1 bg-slate-950 p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden group">
                {/* 3D Space Grids / Background details */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                
                {/* Header of 3D Panel */}
                <div className="z-10 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                      Multi-3D Simulation Viewport
                    </span>
                  </div>
                  
                  {/* Mockup template selector tabs */}
                  <div className="flex gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[9px] font-mono font-bold">
                    {(['smartphone', 'cinema', 'hologram', 'billboard'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => {
                          setMulti3dModel(mode);
                          addLog(`Interactive Node: Simulated 3D template changed to [${mode.toUpperCase()}]`, 'info');
                        }}
                        className={`px-2 py-1 rounded transition-all capitalize cursor-pointer ${
                          multi3dModel === mode
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* THE 3D VIEW STAGE */}
                <div className="flex-1 flex items-center justify-center relative p-4" style={{ perspective: '1200px' }}>
                  
                  {/* Holographic glowing ray light cone */}
                  {multi3dModel === 'hologram' && (
                    <div 
                      className="absolute bottom-4 w-40 h-72 bg-gradient-to-t from-indigo-500/20 via-indigo-500/5 to-transparent rounded-full blur-xl origin-bottom pointer-events-none animate-pulse"
                      style={{
                        transform: `rotateY(${multi3dRotation}deg) scale(${multi3dGlow / 40})`,
                        transition: 'transform 0.1s ease-out'
                      }}
                    />
                  )}

                  {/* Dynamic perspective container */}
                  <motion.div
                    animate={{
                      rotateY: multi3dRotation,
                      rotateX: multi3dModel === 'cinema' ? 10 : 15,
                      z: multi3dModel === 'smartphone' ? 50 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 80, damping: 20 }}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    className={`relative transition-all shadow-2xl ${
                      multi3dModel === 'smartphone' ? 'w-52 h-[380px] bg-slate-900 border-4 border-slate-800 rounded-[30px] p-2 flex flex-col justify-between' :
                      multi3dModel === 'cinema' ? 'w-[320px] h-[190px] bg-slate-900 border-8 border-slate-800 rounded-lg p-1' :
                      multi3dModel === 'hologram' ? 'w-56 h-[320px] bg-indigo-950/20 border-2 border-indigo-500/30 rounded-3xl p-3 text-center border-dashed backdrop-blur-sm' :
                      'w-[280px] h-[220px] bg-slate-900 border-4 border-slate-700 rounded p-1.5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {/* Inner gloss glow */}
                    <div 
                      className="absolute inset-0 rounded-lg opacity-40 pointer-events-none z-30" 
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
                        boxShadow: `0 0 ${multi3dGlow}px rgba(99, 102, 241, 0.2)`
                      }}
                    />

                    {/* Smartphone notch */}
                    {multi3dModel === 'smartphone' && (
                      <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2 shrink-0 z-30 relative" />
                    )}

                    {/* ACTIVE SCREEN PIPELINE CONTENT */}
                    <div className="flex-1 w-full h-full rounded-md overflow-hidden bg-slate-950 border border-slate-800 relative flex flex-col justify-between">
                      {/* Video clip player */}
                      {viewingPostPlan.videoUrl ? (
                        <video
                          key={viewingPostPlan.videoUrl}
                          src={viewingPostPlan.videoUrl}
                          controls
                          autoPlay
                          muted
                          loop
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        /* Polished interactive placeholder visual */
                        <div className="absolute inset-0 flex flex-col justify-between p-3.5 text-left bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950">
                          {/* Top header mockup */}
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[8px] text-indigo-400">S</span>
                            <div>
                              <p className="text-[8px] text-white font-bold leading-none">@swanaya_enterprise</p>
                              <p className="text-[6.5px] text-slate-500 font-mono">2026 Sandbox Server</p>
                            </div>
                          </div>

                          {/* Center Graphic */}
                          <div className="my-auto flex flex-col items-center text-center space-y-1.5 p-2">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative">
                              <Rotate3d className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                              <span className="absolute inset-0 rounded-full border border-indigo-500/10 animate-ping" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">3D Media Emulator</p>
                              <p className="text-[7.5px] text-slate-500 max-w-[140px] leading-tight">No active video clip compiled. Upload a video file on the right panel.</p>
                            </div>
                          </div>

                          {/* Footer engagement logs */}
                          <div className="space-y-1 mt-auto">
                            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '65%' }} />
                            </div>
                            <div className="flex items-center justify-between text-[6.5px] font-mono text-slate-600">
                              <span>AUDIO INGRESS</span>
                              <span>STABLE SYNC</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Overlap hologram beams */}
                      {multi3dModel === 'hologram' && (
                        <div className="absolute inset-0 bg-indigo-500/5 mix-blend-color-dodge pointer-events-none z-20" />
                      )}
                    </div>

                    {/* Billboard Pole */}
                    {multi3dModel === 'billboard' && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-24 bg-gradient-to-r from-slate-800 to-slate-900 border-x border-slate-700/50 z-[-1]" />
                    )}
                  </motion.div>
                </div>

                {/* SLIDER ADJUSTERS FOR 3D ENGINE */}
                <div className="z-10 bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1"><Rotate3d className="w-3.5 h-3.5 text-indigo-400" /> Adjust perspective</span>
                    <span>Yaw: {multi3dRotation}°</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Slide 1: Yaw */}
                    <div>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase">Yaw Rotation</span>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        value={multi3dRotation}
                        onChange={(e) => setMulti3dRotation(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                    {/* Slide 2: Glow */}
                    <div>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase">Neon Glow</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={multi3dGlow}
                        onChange={(e) => setMulti3dGlow(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                    {/* Slide 3: Perspective */}
                    <div>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase">Focal Depth</span>
                      <input
                        type="range"
                        min="400"
                        max="1500"
                        value={multi3dPerspective}
                        onChange={(e) => setMulti3dPerspective(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Metadata & Gateway Status Change */}
              <div className="w-full md:w-[380px] p-6 flex flex-col justify-between overflow-y-auto bg-slate-900 h-full">
                
                {/* Header context */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Interactive Campaign Node
                      </span>
                      <h3 className="text-base font-extrabold text-white font-display mt-0.5">{viewingPostPlan.title}</h3>
                    </div>
                    <button
                      onClick={() => setViewingPostPlan(null)}
                      className="text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300 font-bold">
                      {viewingPostPlan.platform}
                    </span>
                    {viewingPostPlan.accountHandle && (
                      <span className="px-2 py-0.5 bg-amber-950/60 border border-amber-900/50 rounded text-amber-300 font-bold flex items-center gap-1 shadow-sm">
                        {viewingPostPlan.platform === 'YouTube' ? '🔴' : viewingPostPlan.platform === 'Facebook' ? '🌐' : '📸'} {viewingPostPlan.accountHandle}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-900/30 rounded text-indigo-300">
                      {viewingPostPlan.type}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400">
                      Day {viewingPostPlan.day} • {viewingPostPlan.month}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Campaign Summary</span>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 border border-slate-950 p-3 rounded-xl">
                      {viewingPostPlan.description || 'No description assigned for this content node.'}
                    </p>
                  </div>

                  {/* Campaign Promotion for normal videos */}
                  {viewingPostPlan.type === 'Video' && (
                    <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border border-indigo-900/45 p-3.5 rounded-xl space-y-2 text-left">
                      <span className="block text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Promote Content Node
                      </span>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        This content node is currently a standard Video. You can instantly promote it to an integrated Campaign to enable analytical telemetry beacons, 3D emulator grids, and global deployment sheets.
                      </p>
                      <button
                        disabled={permissionLevel === 'viewer'}
                        onClick={() => {
                          if (permissionLevel === 'viewer') {
                            alert("Permission Denied: Viewers cannot modify campaign states.");
                            return;
                          }
                          const updated = { ...viewingPostPlan, type: 'Campaign' as const };
                          onUpdatePlan(updated);
                          setViewingPostPlan(updated);
                          addLog(`Planner: Successfully upgraded "${viewingPostPlan.title}" from normal Video to integrated Campaign Node`, 'success');
                        }}
                        className={`mt-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer transition-all shadow-md uppercase font-mono tracking-wider ${
                          permissionLevel === 'viewer' ? 'opacity-50 cursor-not-allowed bg-slate-800 hover:bg-slate-800' : ''
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-300 animate-bounce" /> Enable Campaign Integration
                      </button>
                    </div>
                  )}

                  {/* Performance Metrics & Telemetry Panel */}
                  <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5 text-indigo-400" /> Performance Metrics Telemetry
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/40">
                        {viewingPostPlan.engagementRate || '8.2%'} ER
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg">
                        <p className="text-[9px] text-slate-500 font-mono">Views / Plays</p>
                        <p className="text-sm font-extrabold text-white font-mono mt-0.5">
                          {(viewingPostPlan.views || (viewingPostPlan.type === 'Story' ? 2840 : 12500)).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg">
                        <p className="text-[9px] text-slate-500 font-mono">Likes</p>
                        <p className="text-sm font-extrabold text-rose-400 font-mono mt-0.5">
                          {(viewingPostPlan.likes || 840).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg">
                        <p className="text-[9px] text-slate-500 font-mono">Comments</p>
                        <p className="text-sm font-extrabold text-indigo-400 font-mono mt-0.5">
                          {(viewingPostPlan.comments || 120).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-lg">
                        <p className="text-[9px] text-slate-500 font-mono">Shares / Clicks</p>
                        <p className="text-sm font-extrabold text-amber-400 font-mono mt-0.5">
                          {(viewingPostPlan.shares || 65).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {viewingPostPlan.externalLink && (
                      <a
                        href={viewingPostPlan.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 py-1.5 px-3 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all truncate"
                      >
                        <Link className="w-3 h-3 text-indigo-400" /> Open Direct Social Link
                      </a>
                    )}
                  </div>

                  {/* Upload video file inside modal if needed */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 text-left">
                    <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Video Media Controller
                    </span>
                    {viewingPostPlan.videoUrl ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 p-2 rounded-lg">
                          <Video className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-medium text-white truncate max-w-[200px]">{viewingPostPlan.videoName || 'Simulated Video'}</p>
                            <p className="text-[8px] text-slate-500 font-mono">{viewingPostPlan.videoSize || 'N/A MB'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <label className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-1.5 px-3 rounded text-[10px] font-semibold text-center cursor-pointer transition-colors">
                            Change File
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={handleVideoUploadInModal}
                            />
                          </label>
                          <button
                            onClick={handleVideoPickerInModal}
                            className="bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 py-1.5 px-3 rounded text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <FolderOpen className="w-3 h-3" /> Drive
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-500 leading-tight">No video file associated with this post. Upload or select one below to preview live.</p>
                        <div className="flex gap-2">
                          <label className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 px-3 rounded text-[10px] font-bold text-center cursor-pointer transition-all shadow-md flex items-center justify-center gap-1">
                            <UploadCloud className="w-3.5 h-3.5" /> Upload Video
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={handleVideoUploadInModal}
                            />
                          </label>
                          <button
                            onClick={handleVideoPickerInModal}
                            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 py-1.5 px-3 rounded text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <FolderOpen className="w-3.5 h-3.5" /> Drive
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Workflow Gateway Control - LIVE STATE CHANGE */}
                <div className="pt-4 border-t border-slate-800/80 space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Workflow Pipeline Gateway
                    </label>
                    <select
                      value={viewingPostPlan.status}
                      onChange={(e) => handleStatusChange(e.target.value as any)}
                      className={`w-full text-xs font-bold py-2.5 px-3 rounded-lg outline-none cursor-pointer border ${
                        viewingPostPlan.status === 'Completed' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' :
                        viewingPostPlan.status === 'In Progress' ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-400' :
                        viewingPostPlan.status === 'Review' ? 'bg-amber-950/40 border-amber-500/40 text-amber-400' :
                        viewingPostPlan.status === 'Live' ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-md shadow-rose-500/5' :
                        'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Live">Live</option>
                    </select>
                  </div>

                  {/* Active Live Streaming Telemetry Dashboard */}
                  {viewingPostPlan.status === 'Live' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-rose-400">
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                          LIVE SIGNAL BEACON ACTIVE
                        </span>
                        <span>Ingress: Stable</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                          <p className="text-[7.5px] font-mono text-slate-500 uppercase">Live Audience</p>
                          <p className="text-sm font-extrabold text-white mt-0.5">
                            {Math.floor(Math.sin(Date.now() / 10000) * 120) + 1480} <span className="text-[9px] font-normal text-rose-500">●</span>
                          </p>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                          <p className="text-[7.5px] font-mono text-slate-500 uppercase">Simulated Engagement</p>
                          <p className="text-sm font-extrabold text-emerald-400 mt-0.5">92.4%</p>
                        </div>
                      </div>

                      {/* Animated frequency bar visualizer representing active streaming data */}
                      <div className="flex items-end justify-between h-4 px-1 bg-slate-950 rounded-md overflow-hidden pt-1">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <span 
                            key={i} 
                            className="w-1 bg-rose-500 rounded-t-sm origin-bottom animate-pulse"
                            style={{
                              height: `${Math.floor(Math.random() * 80) + 20}%`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-[10px] text-slate-500 font-mono text-center py-2 italic border border-dashed border-slate-800 rounded-xl">
                      Status set to [{viewingPostPlan.status}]. Toggle status to "Live" to deploy simulated interactive telemetry beacons.
                    </div>
                  )}

                  {/* Dismiss buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleExportIndividualPDF(viewingPostPlan)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5" /> Export Individual PDF (Watermarked)
                    </button>
                    <button
                      onClick={() => setViewingPostPlan(null)}
                      className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      Close View Node
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎬 VIDEO METADATA FORM DIALOG - PRE-UPLOAD VALIDATION GATE */}
      <AnimatePresence>
        {showVideoMetadataForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 text-left relative overflow-hidden"
            >
              {/* Top Accent Lines */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                    Video Upload Pipeline Details
                  </h3>
                </div>
                <button
                  onClick={() => setShowVideoMetadataForm(false)}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-850 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 text-xs text-slate-400 flex items-center justify-between">
                <div className="truncate pr-4">
                  <p className="font-mono text-[10px] uppercase text-indigo-400 font-bold">Staging Media Asset</p>
                  <p className="font-semibold text-white truncate max-w-[280px]">
                    {stagedVideoFileForForm?.file?.name || stagedVideoFileForForm?.driveName}
                  </p>
                </div>
                <div className="shrink-0 font-mono text-[10px] bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-500">
                  {stagedVideoFileForForm?.file ? `${(stagedVideoFileForForm.file.size / (1024 * 1024)).toFixed(2)} MB` : stagedVideoFileForForm?.driveSize}
                </div>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Video Title <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={videoFormTitle}
                    onChange={(e) => setVideoFormTitle(e.target.value)}
                    placeholder="e.g. Q3 Workspace Launch Reels"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Video Description / Script Context
                  </label>
                  <textarea
                    rows={3}
                    value={videoFormDescription}
                    onChange={(e) => setVideoFormDescription(e.target.value)}
                    placeholder="Explain the script outlines, caption details, transitions..."
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                    <span>Tags / Keywords</span>
                    <span className="text-[8px] text-slate-500 uppercase font-mono">comma separated</span>
                  </label>
                  <input
                    type="text"
                    value={videoFormTags}
                    onChange={(e) => setVideoFormTags(e.target.value)}
                    placeholder="e.g. swanique, tutorial, productLaunch, reels"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>

                {/* Account / Channel Selector for Video Upload */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                    <span>Target Pre-Registered Account / Channel</span>
                    <span className="text-[8px] text-indigo-400 font-mono font-bold">Instagram & YouTube</span>
                  </label>
                  <select
                    value={formAccountHandle}
                    onChange={(e) => {
                      const selectedHandle = e.target.value;
                      setFormAccountHandle(selectedHandle);
                      const acc = instagramAccounts.find(a => a.handle === selectedHandle);
                      if (acc?.platform) {
                        setFormPlatform(acc.platform as any);
                      } else if (selectedHandle.includes('youtube')) {
                        setFormPlatform('YouTube');
                      } else {
                        setFormPlatform('Instagram');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
                  >
                    <optgroup label="📸 Instagram Accounts">
                      {instagramAccounts.filter(a => !a.platform || a.platform === 'Instagram').map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🔴 YouTube Channels">
                      {instagramAccounts.filter(a => a.platform === 'YouTube' || a.handle.includes('youtube')).map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 Meta / Facebook Archives">
                      {instagramAccounts.filter(a => a.platform === 'Facebook' || a.handle.includes('facebook')).map(acc => (
                        <option key={acc.id} value={acc.handle}>
                          {acc.handle} — {acc.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Upload Progress Simulation bar */}
              {isUploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
                    <span className="animate-pulse">Uploading & Parsing Frames...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-rose-500 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVideoMetadataForm(false)}
                  disabled={isUploading}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-slate-200 text-xs py-2 px-4 rounded-xl transition-all cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInitiateUpload}
                  disabled={isUploading || !videoFormTitle.trim()}
                  className={`text-xs font-bold py-2 px-5 rounded-xl transition-all shadow-lg flex items-center gap-1.5 ${
                    isUploading || !videoFormTitle.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-750'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 cursor-pointer active:scale-95'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <UploadCloud className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>Initiate Upload & Save</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* ASSIGN DATE & TIME MODAL POPUP (POPO) */}
        {showAssignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" /> Assign Content Schedule Date
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Best Timing Suggestions */}
              <div className="bg-indigo-950/30 border border-indigo-900/50 p-4 rounded-xl space-y-2.5">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  💡 Peak Engagement Hours (Best Timing to Upload)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For <span className="text-indigo-400 font-bold">{formPlatform}</span>, the optimal audience activity hours are generally:
                </p>
                <p className="text-xs text-amber-400 font-black font-mono bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-850">
                  ✨ {getBestUploadTiming(formPlatform).text}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const currentVal = formDateTime;
                    const datePart = currentVal.split('T')[0] || new Date().toISOString().slice(0, 10);
                    const optimalTime = getBestUploadTiming(formPlatform).time;
                    handleDateTimeChange(`${datePart}T${optimalTime}`);
                    addLog(`Optimal Timings: Applied peak upload hour (${optimalTime}) for ${formPlatform}`, 'success');
                  }}
                  className="text-[10px] bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-bold py-1.5 px-3 rounded-lg cursor-pointer border border-indigo-800/40 flex items-center gap-1.5"
                >
                  ⚡ Apply Peak Time ({getBestUploadTiming(formPlatform).time})
                </button>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Assign to Pre-Registered Account / Channel</span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Instagram & YouTube</span>
                </label>
                <select
                  value={formAccountHandle}
                  onChange={(e) => {
                    const selectedHandle = e.target.value;
                    setFormAccountHandle(selectedHandle);
                    const acc = instagramAccounts.find(a => a.handle === selectedHandle);
                    if (acc?.platform) {
                      setFormPlatform(acc.platform as any);
                    } else if (selectedHandle.includes('youtube')) {
                      setFormPlatform('YouTube');
                    } else if (selectedHandle.includes('facebook')) {
                      setFormPlatform('Facebook');
                    } else {
                      setFormPlatform('Instagram');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none font-medium cursor-pointer"
                >
                  <optgroup label="📸 Instagram Accounts">
                    {instagramAccounts.filter(a => !a.platform || a.platform === 'Instagram').map(acc => (
                      <option key={acc.id} value={acc.handle}>
                        {acc.handle} — {acc.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🔴 YouTube Channels">
                    {instagramAccounts.filter(a => a.platform === 'YouTube' || a.handle.includes('youtube')).map(acc => (
                      <option key={acc.id} value={acc.handle}>
                        {acc.handle} — {acc.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌐 Meta / Facebook Archives">
                    {instagramAccounts.filter(a => a.platform === 'Facebook' || a.handle.includes('facebook')).map(acc => (
                      <option key={acc.id} value={acc.handle}>
                        {acc.handle} — {acc.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select Target Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formDateTime}
                  onChange={(e) => handleDateTimeChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-3 text-sm text-white font-mono font-bold cursor-pointer transition-all hover:border-slate-700"
                />
              </div>

              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Scheduled Slots</p>
                  <p className="text-xs text-white font-bold">{formMonth} {formDay}, {selectedYear}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Target Slot</p>
                  <p className="text-xs text-amber-400 font-bold font-mono">
                    {formDateTime ? new Date(formDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00 PM'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs py-2 px-4 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAssigned(true);
                    setShowAssignModal(false);
                    addLog(`Scheduler: Assigned content slot to ${formMonth} ${formDay} at ${new Date(formDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'success');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-5 rounded-lg shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Confirm & Assign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Preview Modal for Recent Developments */}
      <AnimatePresence>
        {previewIframeUrl && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white">Live Development Preview</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate max-w-xs">
                    {previewIframeUrl}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewIframeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                  >
                    Open Fullscreen <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewIframeUrl(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Iframe */}
              <div className="flex-1 bg-slate-950 relative">
                <iframe
                  src={previewIframeUrl}
                  title="Live Development Deployment Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
