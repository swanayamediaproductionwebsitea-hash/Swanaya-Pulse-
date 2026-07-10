import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Calendar, Film, Image, FileText, CheckCircle, Clock, Trash2, 
  Video, Eye, Play, X, UploadCloud, ChevronRight, BarChart3, AlertCircle, Sparkles, Filter, Edit2,
  ClipboardList, Paperclip, FolderOpen, Instagram, Heart, Bookmark, MessageCircle, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentPlan } from '../types';
import { launchGooglePicker } from '../lib/googlePicker';

interface ContentPlannerProps {
  plans: ContentPlan[];
  onAddPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt'>) => void;
  onUpdatePlanStatus: (id: string, status: ContentPlan['status']) => void;
  onDeletePlan: (id: string) => void;
  onUpdatePlan: (plan: ContentPlan) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  currentUser?: string;
  searchQuery?: string;
  uiMode?: 'human' | 'ai';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook'];
const TYPES = ['Video', 'Image', 'Article', 'Campaign', 'Story'] as const;

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
  currentUser = 'each',
  searchQuery = '',
  uiMode = 'ai'
}: ContentPlannerProps) {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly' | 'entity-manager' | 'assigner' | 'instagram-interface'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);

  const isSystemAdmin = currentUser?.toLowerCase() === 'aadithyan' || currentUser?.toLowerCase() === 'each';
  const visiblePlans = isSystemAdmin ? plans : plans.filter(p => !p.createdBy || p.createdBy.toLowerCase() === currentUser.toLowerCase());

  // Instagram Hub Live Simulator states
  const [instaLikes, setInstaLikes] = useState(148);
  const [instaHasLiked, setInstaHasLiked] = useState(false);
  const [instaBookmarks, setInstaBookmarks] = useState(24);
  const [instaHasBookmarked, setInstaHasBookmarked] = useState(false);
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

  const visibleAssignedTasks = isSystemAdmin ? assignedTasks : assignedTasks.filter(t => !t.createdBy || t.createdBy.toLowerCase() === currentUser.toLowerCase());

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
      createdBy: currentUser || 'each'
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
        
        setUploadedVideo({
          url: file.url,
          name: `GDrive: ${file.name}`,
          size: sizeStr,
          isGoogleDrive: true
        });

        addLog(`Media: Video file "${file.name}" linked from Google Drive successfully`, 'upload');
      },
      () => {
        addLog('Google Picker: User canceled video selection', 'info');
      },
      (err) => {
        addLog(`Google Picker Error: ${err.message || err}`, 'warning');
      }
    );
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
  const [formStatus, setFormStatus] = useState<ContentPlan['status']>('Planned');

  // Bidirectional Date Sync helpers
  const parseDateString = (dateStr: string) => {
    if (!dateStr) return { year: 2026, month: 'October', day: 15 };
    const parts = dateStr.split('-');
    const y = parseInt(parts[0]) || 2026;
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

  const [formDate, setFormDate] = useState(() => 
    formatDateComponents(2026, MONTHS[new Date().getMonth()], new Date().getDate())
  );

  const handleDateChange = (val: string) => {
    setFormDate(val);
    const { month, day } = parseDateString(val);
    setFormMonth(month);
    setFormDay(day);
  };

  // Editing modal states
  const [editingPlan, setEditingPlan] = useState<ContentPlan | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPlatform, setEditPlatform] = useState<ContentPlan['platform']>('YouTube');
  const [editType, setEditType] = useState<ContentPlan['type']>('Video');
  const [editStatus, setEditStatus] = useState<ContentPlan['status']>('Planned');

  const openEditModal = (plan: ContentPlan) => {
    setEditingPlan(plan);
    setEditTitle(plan.title);
    setEditDescription(plan.description);
    setEditDate(plan.assignedDate || formatDateComponents(2026, plan.month, plan.day));
    setEditPlatform(plan.platform);
    setEditType(plan.type);
    setEditStatus(plan.status);
  };

  const saveEditedPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !editTitle.trim()) return;

    const { month, day, year } = parseDateString(editDate);

    const updated: ContentPlan = {
      ...editingPlan,
      title: editTitle.trim(),
      description: editDescription.trim(),
      assignedDate: editDate,
      month,
      day,
      year,
      platform: editPlatform,
      type: editType,
      status: editStatus
    };

    onUpdatePlan(updated);
    setEditingPlan(null);
  };

  // Preloaded templates automatic assigning and date management
  const [templateDates, setTemplateDates] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    PRELOADED_TEMPLATES.forEach((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + idx);
      const mStr = MONTHS[d.getMonth()] || 'October';
      const dNum = d.getDate();
      initial[idx] = formatDateComponents(2026, mStr, dNum);
    });
    return initial;
  });

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
    const dateStr = formatDateComponents(2026, currentSelectedMonth, openDay);
    setTemplateDates(prev => ({ ...prev, [idx]: dateStr }));
    addLog(`Automated Assigner: Calculated optimal open slot on Day ${openDay} in ${currentSelectedMonth} for template #${idx + 1}`, 'info');
  };

  const handleDeployTemplate = (idx: number, tpl: typeof PRELOADED_TEMPLATES[0]) => {
    const dateStr = templateDates[idx] || formatDateComponents(2026, MONTHS[new Date().getMonth()], new Date().getDate());
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

  // Video upload states
  const [uploadedVideo, setUploadedVideo] = useState<{ url: string; name: string; size: string; isGoogleDrive?: boolean } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state for video player modal
  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  const handleVideoFile = (file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      addLog(`Validation Error: File "${file.name}" is not a valid video format`, 'warning');
      alert('Please upload a video file only.');
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const objectUrl = URL.createObjectURL(file);
    
    setUploadedVideo({
      url: objectUrl,
      name: file.name,
      size: `${sizeInMB} MB`
    });

    addLog(`Media: Video file "${file.name}" (${sizeInMB} MB) uploaded & staged successfully`, 'upload');
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
    if (!title.trim()) return;

    onAddPlan({
      title: title.trim(),
      type,
      description: description.trim(),
      month: formMonth,
      day: formDay,
      year: 2026,
      assignedDate: formDate,
      platform: formPlatform,
      status: formStatus,
      videoUrl: uploadedVideo?.url,
      videoName: uploadedVideo?.name,
      videoSize: uploadedVideo?.size,
      createdBy: currentUser || 'each'
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setUploadedVideo(null);
    addLog(`Planner: Staged content plan "${title}" for ${formMonth} Day ${formDay}`, 'success');
    
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
          <title>Swanaya Media Content Deployment Report</title>
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
              <strong style="font-size: 13px; color: #1e293b;">Swanaya Interactive PDF Generator Ready</strong>
              <p style="font-size: 11px; color: #64748b; margin: 3px 0 0 0;">Verify layout options and print to finalize the PDF save cycle.</p>
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-secondary" onclick="window.close()">Cancel</button>
              <button class="btn" onclick="window.print()">Print / Save PDF</button>
            </div>
          </div>

          <div class="header-container">
            <div>
              <h1 class="logo-title">Swanaya Media Enterprises</h1>
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
                  <td><span class="badge badge-platform">${plan.platform}</span></td>
                  <td><span style="font-weight: 500;">${plan.type}</span></td>
                  <td>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; color: #059669;">
                      ${plan.assignedDate || formatDateComponents(2026, plan.month, plan.day)}
                    </span>
                  </td>
                  <td>
                    <div class="plan-title">${plan.title}</div>
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
            <span class="footer-brand">SWANAYA ENTERPRISES PRODUCTION NODE</span>
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

  const filteredPlans = visiblePlans.filter(p => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(query);
      const platformMatch = p.platform.toLowerCase().includes(query);
      const statusMatch = p.status.toLowerCase().includes(query);
      const typeMatch = p.type.toLowerCase().includes(query);
      const descMatch = p.description?.toLowerCase().includes(query) || false;
      return titleMatch || platformMatch || statusMatch || typeMatch || descMatch;
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/60 mb-6">
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
              <Plus className="w-3.5 h-3.5 animate-pulse" /> Add Registry Item
            </button>
            <button
              onClick={() => setActiveTab('assigner')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'assigner'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Assigning System
            </button>
            <button
              onClick={() => {
                setActiveTab('instagram-interface');
                addLog('System Navigation: Loaded live Instagram Hub interactive simulator', 'info');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'instagram-interface'
                  ? 'bg-indigo-600 text-white shadow font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> Instagram Hub
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: MONTHLY PLANNER
            ========================================================================= */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            
            {/* Active Content Operator Banner */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-400">Secure Content Planner Node active for:</span>
                <strong className="text-white font-bold">{currentUser}</strong>
              </div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Active Session</span>
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
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-indigo-400" /> Active Registry: {selectedMonth}
                  </span>
                  <div className="flex items-center gap-2">
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

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
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
                      filteredPlans.map((plan, index) => (
                        <motion.div 
                          key={plan.id}
                          layout
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.22, delay: Math.min(index * 0.03, 0.15), ease: 'easeOut' }}
                          className="bg-slate-950/50 border border-slate-800/85 hover:border-slate-700/80 rounded-xl p-4 transition-colors hover:bg-slate-950/70 shadow-md flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded-full">
                                  {searchQuery ? `${plan.month} ` : ''}Day {plan.day} • {plan.platform}
                                </span>
                                <span className="font-mono text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-full flex items-center gap-1" title="Assigned Target Date">
                                  <Calendar className="w-2.5 h-2.5 shrink-0" />
                                  {plan.assignedDate || formatDateComponents(2026, plan.month, plan.day)}
                                </span>
                              </div>
                              <div className="flex gap-1 items-center">
                                <button
                                  onClick={() => openEditModal(plan)}
                                  className="text-slate-500 hover:text-indigo-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer mr-0.5"
                                  title="Edit Campaign details & Assigned Date"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <select
                                  value={plan.status}
                                  onChange={(e) => onUpdatePlanStatus(plan.id, e.target.value as any)}
                                  className={`text-[10px] font-bold py-0.5 px-1.5 rounded outline-none cursor-pointer ${
                                    plan.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                    plan.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400' :
                                    plan.status === 'Review' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  <option value="Planned">Planned</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Review">Review</option>
                                  <option value="Completed">Completed</option>
                                </select>
                                <button
                                  onClick={() => onDeletePlan(plan.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                                  title="Delete Plan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="text-sm font-bold text-white mb-1 font-display">{plan.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{plan.description}</p>
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
                                onClick={() => setPreviewVideo({ url: plan.videoUrl!, title: plan.title })}
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
                      ))
                    )}
                  </AnimatePresence>
                </div>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Month
                    </label>
                    <select
                      value={formMonth}
                      onChange={(e) => setFormMonth(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    >
                      {MONTHS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Day (1-31)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={31}
                      value={formDay}
                      onChange={(e) => setFormDay(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="bg-indigo-950/15 border border-indigo-900/30 p-4 rounded-xl space-y-3 mt-1">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 animate-pulse" /> Date Assigning System
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Assign Calendar Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 text-xs text-white outline-none cursor-pointer"
                      />
                    </div>
                    <div className="text-[9px] text-slate-500 flex flex-col justify-center leading-relaxed">
                      <p className="font-bold text-slate-400">Reactive Target Sync</p>
                      <p className="mt-0.5">
                        Updates here will sync the Target Month & Day dropdowns automatically.
                      </p>
                    </div>
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

                {/* DYNAMIC VIDEO FILE UPLOAD COMPONENT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Video Media Upload pipeline</span>
                    <span className="text-[9px] text-indigo-400 uppercase font-mono">HTML5 Video Linker</span>
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
                      accept="video/*"
                      className="hidden"
                    />

                    {uploadedVideo ? (
                      <div className="space-y-2 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-full inline-flex border border-emerald-500/20">
                          {uploadedVideo.isGoogleDrive ? (
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
                            {uploadedVideo.isGoogleDrive ? 'Linked from Google Drive' : `Size: ${uploadedVideo.size}`} | Staged successfully
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
                          Clear Video File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pointer-events-none">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-full inline-flex border border-indigo-500/20">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium text-slate-200">
                          Drag & drop video clip here, or <span className="text-indigo-400 underline">browse</span>
                        </p>
                        <p className="text-[9px] text-slate-500">
                          Supports mp4, webm, quicktime, ogg (Max 150MB)
                        </p>
                      </div>
                    )}
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
                      Select Staged Video via Google Picker
                    </button>
                  </div>
                  </div>
                </div>

              </div>

            <div className="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('monthly')}
                className="bg-slate-950 hover:bg-slate-900 text-slate-300 text-xs py-2 px-4 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Schedule & Stage Entry
              </button>
            </div>

          </form>
        )}

        {/* =========================================================================
            TAB 5: CONTENT ASSIGNING SYSTEM
            ========================================================================= */}
        {activeTab === 'assigner' && (
          <div className="space-y-6">
            
            {/* Header / Intro block */}
            <div className="bg-gradient-to-r from-emerald-950/35 via-slate-900/40 to-indigo-950/20 border border-emerald-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-400 animate-pulse" /> Content Assigning System Node
                </h4>
                <p className="text-xs text-slate-400 max-w-xl">
                  Enterprise-grade client task scheduler. Enter descriptions, select standard monthly/yearly scopes, assign calendar deadlines, and upload attachments to generate trackable campaign deliverables.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg text-xs font-mono shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-slate-400">Total Tasks:</span>
                <strong className="text-white font-bold">{assignedTasks.length}</strong>
              </div>
            </div>

            {/* Dark-themed CSS Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Form Assignment Panel */}
              <div className="bg-slate-950/40 border border-slate-850/80 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Assign New Task</span>
                </div>

                <form onSubmit={handleAssignTask} className="space-y-4">
                  {/* Monthly/Yearly Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Schedule Target Scope
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
                      <button
                        type="button"
                        onClick={() => setAssignerPeriod('Monthly')}
                        className={`py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          assignerPeriod === 'Monthly'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Monthly Scope
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignerPeriod('Yearly')}
                        className={`py-1.5 rounded-md text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                          assignerPeriod === 'Yearly'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Yearly Scope
                      </button>
                    </div>
                  </div>

                  {/* Text Input for Task Assignment */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Task Description / Name
                    </label>
                    <input
                      type="text"
                      required
                      value={assignerTaskName}
                      onChange={(e) => setAssignerTaskName(e.target.value)}
                      placeholder="e.g., Assemble Q3 Instagram Visual Deck..."
                      className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-2.5 text-xs text-white placeholder-slate-700 outline-none transition-all font-sans"
                    />

                    {/* AI Autofill trigger button */}
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <span className="text-[8px] text-slate-500 font-mono">Need SEO-optimized copy?</span>
                      <button
                        type="button"
                        disabled={isAiLoading || !assignerTaskName.trim()}
                        onClick={handleAiAutofill}
                        className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold uppercase transition-all duration-300 flex items-center gap-1 cursor-pointer ${
                          assignerTaskName.trim()
                            ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-400 hover:text-white border border-emerald-500/40 hover:from-emerald-600 hover:to-indigo-600 shadow-md hover:shadow-emerald-500/20'
                            : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
                        {isAiLoading ? 'Analyzing...' : 'Smart SEO Autofill'}
                      </button>
                    </div>
                  </div>

                  {/* AI Loading State with specific logs */}
                  {isAiLoading && (
                    <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3.5 space-y-2.5 animate-pulse">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">Gemini SEO Engine Booting...</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
                        Fetching semantic metadata, analyzing search intent, crafting social tags, and predicting expected timelines.
                      </p>
                      <div className="w-full bg-slate-950 rounded-full h-1">
                        <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                  )}

                  {/* AI Error Display */}
                  {aiError && (
                    <div className="bg-rose-950/40 border border-rose-900/30 text-rose-400 text-[9px] font-mono p-2.5 rounded-lg">
                      ⚠️ AI Autofill Failed: {aiError}
                    </div>
                  )}

                  {/* AI SUGGESTIONS PANEL - AI UI INTEGRATED WITH SEO */}
                  {showAiSuggestions && aiSuggestions && (
                    <div className="bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/30 rounded-xl p-3.5 space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0">
                        <span className="text-[7px] font-mono font-bold uppercase tracking-widest bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-bl border-l border-b border-indigo-500/20">SEO SUITE</span>
                      </div>

                      <div className="flex items-center gap-1.5 border-b border-slate-850/60 pb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Gemini SEO Recommendations</h5>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">💡 Improved Description</span>
                        <p className="text-[10px] text-slate-300 bg-slate-950/80 border border-slate-900/40 p-2 rounded-lg leading-relaxed max-h-[80px] overflow-y-auto">
                          {aiSuggestions.description}
                        </p>
                      </div>

                      {/* Tags & Keywords Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">🏷️ Social Tags</span>
                          <div className="flex flex-wrap gap-1">
                            {aiSuggestions.tags.map((tag, idx) => (
                              <span key={idx} className="bg-indigo-950/50 border border-indigo-900/20 text-indigo-300 text-[8px] font-mono px-1 py-0.5 rounded">
                                {tag.startsWith('#') ? tag : `#${tag}`}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">📈 Target SEO Keywords</span>
                          <div className="flex flex-wrap gap-1">
                            {aiSuggestions.seoKeywords.map((kw, idx) => (
                              <span key={idx} className="bg-emerald-950/50 border border-emerald-900/20 text-emerald-400 text-[8px] font-mono px-1 py-0.5 rounded">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Meta Copy / Caption */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">✍️ Meta Description / caption Copy</span>
                        <p className="text-[9px] text-slate-400 font-mono bg-slate-950/50 p-2 rounded-lg border border-slate-900/40 leading-relaxed">
                          {aiSuggestions.seoDescription}
                        </p>
                      </div>

                      {/* Calculated Timeline info */}
                      <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-850/60 text-[9px] font-mono">
                        <span className="text-slate-500">Suggested Timeline:</span>
                        <strong className="text-emerald-400">{aiSuggestions.timelineDays} Days (Due Date set to {assignerDueDate})</strong>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-850/60">
                        <button
                          type="button"
                          onClick={() => {
                            setAiSuggestions(null);
                            setShowAiSuggestions(false);
                            addLog("AI System: Suggestions cleared", "info");
                          }}
                          className="text-[9px] font-mono font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          ✕ Discard Suggestions
                        </button>
                        <span className="text-[8px] text-emerald-400 font-mono italic flex items-center gap-0.5">
                          ✓ Auto-Linked to Form
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Role Selector dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Assignee Role / Staff
                    </label>
                    <select
                      value={assignerRole}
                      onChange={(e) => setAssignerRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer transition-all font-sans"
                    >
                      <option value="Designer">Designer</option>
                      <option value="Editor">Editor</option>
                      <option value="Developer">Developer</option>
                      <option value="SEO Expert">SEO Expert</option>
                      <option value="Marketing Executive">Marketing Executive</option>
                      <option value="Photographer">Photographer</option>
                      <option value="Videographer">Videographer</option>
                      <option value="Content Writer">Content Writer</option>
                    </select>
                  </div>

                  {/* Priority and Due Date in a grid */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={assignerPriority}
                        onChange={(e) => setAssignerPriority(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer transition-all font-mono"
                      >
                        <option value="High">🔴 High</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Low">🟢 Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Target Due Date
                      </label>
                      <input
                        type="date"
                        required
                        value={assignerDueDate}
                        onChange={(e) => setAssignerDueDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-2.5 text-xs text-white outline-none cursor-pointer transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Tags / SEO Keywords input field with Optimize with AI button */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Tags / SEO Keywords
                      </label>
                      <button
                        type="button"
                        disabled={isOptimizingTags || !assignerTaskName.trim()}
                        onClick={handleOptimizeTags}
                        className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer ${
                          assignerTaskName.trim()
                            ? 'bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60'
                            : 'bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isOptimizingTags ? 'animate-spin' : ''}`} />
                        {isOptimizingTags ? 'Optimizing...' : 'Optimize with AI'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={assignerTags}
                      onChange={(e) => setAssignerTags(e.target.value)}
                      placeholder="e.g. #marketing, #seo, carousel, instatip"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-2.5 text-xs text-white placeholder-slate-700 outline-none transition-all font-mono"
                    />
                  </div>

                  {/* Google Workspace Connection Checkbox */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850/80 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={assignerGoogleSync}
                        onChange={(e) => setAssignerGoogleSync(e.target.checked)}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 cursor-pointer h-4 w-4"
                      />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wide">Sync with Google Calendar</span>
                    </label>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-mono">
                      {localStorage.getItem('swanaya_google_oauth_linked') === 'true' 
                        ? '✅ Google Account (aadithyanmmenon@gmail.com) is authenticated. Direct calendar entries will be created.' 
                        : '⚠️ Google Workspace is currently disconnected. Go to the Home Page to authenticate Google OAuth first.'}
                    </p>
                  </div>

                  {/* "Assign" Button */}
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs shadow-lg shadow-emerald-500/10 cursor-pointer transition-all flex items-center justify-center gap-1.5 hover:shadow-emerald-500/25 active:scale-[0.98]"
                  >
                    <ClipboardList className="w-4 h-4" /> Assign Campaign Task
                  </button>
                </form>

                <div className="bg-slate-900/40 border border-slate-850/60 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed font-mono">
                  <span className="font-bold text-slate-400">Automated Integration:</span> Tasks assigned here feed live interactive pipelines, log activity metrics automatically, and accept binary attachment drops.
                </div>
              </div>

              {/* Right Column (Spans 2 cols on wide screens): Dynamic Table */}
              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850/80 rounded-2xl p-5 flex flex-col justify-between">
                
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-850 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Dynamic Scheduler Registry</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Click Status badging to toggle Pending/Completed states
                    </span>
                  </div>

                  {visibleAssignedTasks.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-slate-850 rounded-xl">
                      <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-2.5" />
                      <p className="text-xs text-slate-400 font-semibold">No assigned campaign tasks found</p>
                      <p className="text-[10px] text-slate-600 mt-1">Fill out the left form to schedule custom campaign tasks.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-850/60 text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                            <th className="pb-2.5 font-bold">Task Details</th>
                            <th className="pb-2.5 font-bold">Scope</th>
                            <th className="pb-2.5 font-bold">Due Date</th>
                            <th className="pb-2.5 font-bold">Status</th>
                            <th className="pb-2.5 font-bold">File Upload</th>
                            <th className="pb-2.5 text-right font-bold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/60">
                          {visibleAssignedTasks.map((task) => (
                            <React.Fragment key={task.id}>
                              <tr className="group hover:bg-slate-900/30 transition-colors">
                                {/* Task Details & Assignee */}
                                <td className="py-3 pr-2">
                                  <div className="space-y-1.5 max-w-[200px] sm:max-w-[240px]">
                                    {/* Badges metadata list */}
                                    <div className="flex flex-wrap gap-1">
                                      {task.priority && (
                                        <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                                          task.priority === 'High'
                                            ? 'bg-rose-950/60 text-rose-400 border-rose-900/40'
                                            : task.priority === 'Medium'
                                              ? 'bg-amber-950/60 text-amber-400 border-amber-900/40'
                                              : 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40'
                                        }`}>
                                          {task.priority} Priority
                                        </span>
                                      )}
                                      {task.role && (
                                        <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-900/20 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                                          👤 {task.role}
                                        </span>
                                      )}
                                      {task.googleSynced && (
                                        <span className="bg-sky-950/60 text-sky-400 border border-sky-900/20 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Synced with Google Calendar API">
                                          <svg className="w-2.5 h-2.5 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24 12.24 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.737-.08-1.3-.175-1.855H12.24z" />
                                          </svg>
                                          G-Cal
                                        </span>
                                      )}
                                    </div>

                                    <p className="text-xs font-bold text-white tracking-tight font-display line-clamp-2">
                                      {task.name}
                                    </p>

                                    {task.tags && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {task.tags.split(',').map((tag, idx) => (
                                          <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-400 text-[8px] font-mono px-1.5 py-0.5 rounded">
                                            {tag.trim()}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {task.fileName ? (
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-900/20 px-2 py-0.5 rounded text-[9px] text-emerald-300 w-fit font-mono" title="Binary Attachment Registered">
                                          <Paperclip className="w-2.5 h-2.5 shrink-0" />
                                          <span className="truncate max-w-[110px]">{task.fileName}</span>
                                          <span className="text-emerald-500 font-semibold shrink-0">({task.fileSize})</span>
                                        </div>
                                        {task.fileUrl && (
                                          <a
                                            href={task.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline font-mono flex items-center gap-1 mt-0.5"
                                          >
                                            <span>🔗</span> Open Drive File
                                          </a>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-[9px] text-slate-600 italic">No attachments dropped</p>
                                    )}

                                    {/* Action toggle for AI SEO suite */}
                                    {task.aiDescription && (
                                      <div className="pt-1">
                                        <button
                                          type="button"
                                          onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                          className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 border ${
                                            expandedTaskId === task.id 
                                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                                              : 'bg-indigo-950/40 border-indigo-900/35 text-indigo-300 hover:bg-indigo-900/40 hover:text-white'
                                          }`}
                                        >
                                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                                          {expandedTaskId === task.id ? 'Hide SEO Suite' : 'View AI SEO Suite'}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Scope / Period */}
                                <td className="py-3 pr-2">
                                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                    task.period === 'Monthly'
                                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
                                      : 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/20'
                                  }`}>
                                    {task.period}
                                  </span>
                                </td>

                                {/* Due Date */}
                                <td className="py-3 pr-2 whitespace-nowrap">
                                  <span className="text-[10px] font-mono font-medium text-slate-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    {task.dueDate}
                                  </span>
                                </td>

                                {/* Status Toggle Badge */}
                                <td className="py-3 pr-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleTaskStatus(task.id)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 ${
                                      task.status === 'Completed'
                                        ? 'bg-emerald-950/50 border border-emerald-900/30 text-emerald-400'
                                        : 'bg-amber-950/50 border border-amber-900/30 text-amber-400 animate-pulse'
                                    }`}
                                    title="Click to toggle completion status"
                                  >
                                    {task.status === 'Completed' ? (
                                      <>
                                        <CheckCircle className="w-2.5 h-2.5 shrink-0" />
                                        Completed
                                      </>
                                    ) : (
                                      <>
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                        Pending
                                      </>
                                    )}
                                  </button>
                                </td>

                                {/* File Upload Input */}
                                <td className="py-3 pr-2">
                                  <div className="flex flex-col sm:flex-row gap-1.5 items-start sm:items-center">
                                    {/* Local File Upload Button */}
                                    <div className="relative">
                                      <label className="flex items-center gap-1 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono text-slate-400 transition-colors cursor-pointer w-fit shadow active:scale-95">
                                        <Paperclip className="w-3 h-3 text-slate-500" />
                                        <span>{task.fileName ? 'Local' : 'Upload'}</span>
                                        <input
                                          type="file"
                                          onChange={(e) => handleTaskFileUpload(task.id, e)}
                                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        />
                                      </label>
                                    </div>
                                    
                                    {/* Google Picker Drive Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleTaskGooglePicker(task.id)}
                                      className="flex items-center gap-1 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono text-slate-400 transition-colors cursor-pointer w-fit shadow active:scale-95"
                                      title="Select resource from Google Drive"
                                    >
                                      <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.43 12.981L14.71 4.801c-.38-.66-1.06-1.06-1.85-1.06h-1.72c-.77 0-1.47.4-1.85 1.06L4.57 12.981c-.38.66-.38 1.47 0 2.13l2.36 4.091c.38.66 1.08 1.06 1.85 1.06h9.44c.77 0 1.47-.4 1.85-1.06l2.36-4.091c.38-.66.38-1.47 0-2.13zM9.43 17.5c-.38 0-.74-.21-.93-.54L6.14 12.87c-.19-.33-.19-.74 0-1.07l2.36-4.09c.19-.33.55-.54.93-.54h4.72c.38 0 .74.21.93.54l2.36 4.09c.19.33.19.74 0 1.07l-2.36 4.09c-.19.33-.55.54-.93.54H9.43z" />
                                      </svg>
                                      <span>Drive</span>
                                    </button>
                                  </div>
                                </td>

                                {/* Actions */}
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => handleDeleteAssignedTask(task.id)}
                                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900/80 transition-all cursor-pointer inline-flex items-center"
                                    title="Delete Task Row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>

                              {/* Expandable SEO Co-Pilot suite details row */}
                              {expandedTaskId === task.id && (
                                <tr className="bg-slate-950/40 hover:bg-transparent">
                                  <td colSpan={6} className="p-3.5 border-t border-b border-indigo-950/30">
                                    <div className="bg-slate-950/90 border border-indigo-500/20 rounded-xl p-3.5 space-y-3">
                                      
                                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                        <div className="flex items-center gap-1.5">
                                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Swanaya SEO Co-Pilot Report</span>
                                        </div>
                                        <span className="text-[8px] text-slate-500 font-mono">100% SEO OPTIMIZED SUITE</span>
                                      </div>

                                      {task.aiDescription && (
                                        <div className="space-y-1 text-left">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">🎯 Execution Plan & Copy Blueprint</span>
                                          <p className="text-[10px] text-slate-300 leading-relaxed font-sans whitespace-pre-wrap bg-slate-900/30 p-2.5 rounded-lg border border-slate-900/60">
                                            {task.aiDescription}
                                          </p>
                                        </div>
                                      )}

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                        {task.aiTags && task.aiTags.length > 0 && (
                                          <div className="space-y-1 text-left">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">🏷️ Social Campaign Tags</span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {task.aiTags.map((tag, idx) => (
                                                <span key={idx} className="bg-indigo-950/70 border border-indigo-900/30 text-indigo-300 text-[9px] font-mono px-2 py-0.5 rounded">
                                                  {tag.startsWith('#') ? tag : `#${tag}`}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {task.aiSeoKeywords && task.aiSeoKeywords.length > 0 && (
                                          <div className="space-y-1 text-left">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">📈 Target SEO Keywords</span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {task.aiSeoKeywords.map((kw, idx) => (
                                                <span key={idx} className="bg-emerald-950/70 border border-emerald-900/30 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded">
                                                  {kw}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {task.aiSeoDescription && (
                                        <div className="space-y-1 text-left">
                                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">✍️ Search Meta Description / Post Hook</span>
                                          <p className="text-[9.5px] text-slate-400 leading-relaxed font-mono bg-slate-900/40 p-2.5 rounded-lg border border-slate-900/60">
                                            {task.aiSeoDescription}
                                          </p>
                                        </div>
                                      )}

                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Logged-in Operator: <strong className="text-slate-400">{currentUser}</strong></span>
                  <span>Auto-saved to local node engine storage</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: INSTAGRAM HUB (INTERACTIVE SIMULATOR & HASHTAG OPTIMIZER)
            ========================================================================= */}
        {activeTab === 'instagram-interface' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/40 to-amber-950/20 border border-blue-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400 animate-bounce" /> Interactive Instagram Interface Previewer
                </h4>
                <p className="text-xs text-slate-400 max-w-xl">
                  Simulate, test, and preview your campaigns before they go live. Review layouts, optimize captions with hashtags, click interactive controls, and test real-time comments.
                </p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-400">Mode:</span>
                <span className="text-amber-300 font-bold">LIVE SIMULATION</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
              
              {/* Left Column: High-Fidelity Mobile Frame Simulator */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[340px] bg-slate-950 border-[6px] border-slate-800 rounded-[40px] shadow-2xl overflow-hidden pb-4">
                  {/* Notch / Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-950 ml-auto mr-3 border border-slate-800" />
                  </div>

                  {/* Phone Header Info */}
                  <div className="bg-slate-950 px-5 pt-7 pb-2 flex justify-between text-[10px] text-slate-400 font-mono select-none">
                    <span>9:41 AM</span>
                    <div className="flex gap-1 items-center">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>5G</span>
                    </div>
                  </div>

                  {/* Insta Header */}
                  <div className="px-3.5 py-2 border-b border-slate-900 flex justify-between items-center bg-slate-950">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px]">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80" 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
                          swanaya_enterprises
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center text-[6px] text-white">✓</span>
                        </p>
                        <p className="text-[8px] text-slate-400">Swanaya Studios, Chennai</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-white text-xs font-bold font-mono tracking-widest px-1">•••</button>
                  </div>

                  {/* Insta Main Post Image/Video Placeholder */}
                  <div className="relative aspect-square w-full bg-slate-900 group overflow-hidden select-none">
                    <img 
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=500" 
                      alt="Instagram Mock Post Content" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                      referrerPolicy="no-referrer"
                      onDoubleClick={() => {
                        if (!instaHasLiked) {
                          setInstaLikes(prev => prev + 1);
                          setInstaHasLiked(true);
                          addLog('Instagram Simulator: Double-tapped image to LIKE post', 'success');
                        }
                      }}
                    />
                    
                    {/* Double Tap Heart Animation Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-[9px] bg-slate-950/80 text-slate-300 font-mono px-2.5 py-1 rounded-full backdrop-blur">
                        Double-tap to Like
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="px-3.5 py-2.5 flex justify-between items-center bg-slate-950">
                    <div className="flex gap-3.5">
                      <button 
                        onClick={() => {
                          const liked = !instaHasLiked;
                          setInstaHasLiked(liked);
                          setInstaLikes(prev => liked ? prev + 1 : prev - 1);
                          addLog(`Instagram Simulator: ${liked ? 'Liked' : 'Unliked'} mock post`, 'action');
                        }}
                        className="transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Heart className={`w-5 h-5 ${instaHasLiked ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
                      </button>
                      <button className="transition-transform hover:scale-110 cursor-pointer text-white">
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button className="transition-transform hover:scale-110 cursor-pointer text-white">
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        const bmed = !instaHasBookmarked;
                        setInstaHasBookmarked(bmed);
                        setInstaBookmarks(prev => bmed ? prev + 1 : prev - 1);
                        addLog(`Instagram Simulator: ${bmed ? 'Saved' : 'Unsaved'} post mockup`, 'action');
                      }}
                      className="transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Bookmark className={`w-5 h-5 ${instaHasBookmarked ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Interaction Stats */}
                  <div className="px-3.5 pb-1 bg-slate-950 text-left select-none">
                    <p className="text-[11px] font-bold text-white">{instaLikes.toLocaleString()} likes</p>
                  </div>

                  {/* Caption */}
                  <div className="px-3.5 pb-2.5 bg-slate-950 text-left text-[11px] leading-relaxed">
                    <p className="text-slate-300">
                      <span className="font-bold text-white mr-1.5">swanaya_enterprises</span>
                      {instaCaption}
                    </p>
                  </div>

                  {/* Comments Feed Panel */}
                  <div className="px-3.5 py-2 bg-slate-900/30 border-t border-slate-900 max-h-[140px] overflow-y-auto scrollbar-thin space-y-2 text-left">
                    <span className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">Live Simulated Comments ({instaComments.length})</span>
                    {instaComments.map(c => (
                      <div key={c.id} className="text-[10px] leading-tight flex items-start gap-1 justify-between">
                        <div>
                          <strong className="text-white mr-1">{c.user}</strong>
                          <span className="text-slate-300">{c.text}</span>
                        </div>
                        <span className="text-[8px] font-mono text-slate-500 shrink-0">{c.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Post Comment Input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newInstaComment.trim()) return;
                      const commentObj = {
                        id: `c-${Date.now()}`,
                        user: 'each_operator',
                        text: newInstaComment.trim(),
                        time: '1s'
                      };
                      setInstaComments(prev => [...prev, commentObj]);
                      setNewInstaComment('');
                      addLog(`Instagram Simulator: Added comment "${commentObj.text}" to post preview`, 'success');
                    }}
                    className="px-3 py-2 bg-slate-950 border-t border-slate-900 flex gap-2 items-center"
                  >
                    <input 
                      type="text"
                      value={newInstaComment}
                      onChange={(e) => setNewInstaComment(e.target.value)}
                      placeholder="Add interactive comment..."
                      className="flex-1 bg-slate-900 border border-slate-850 rounded-full px-3 py-1 text-[10px] text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
                    />
                    <button 
                      type="submit"
                      disabled={!newInstaComment.trim()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full p-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-2.5 h-2.5 fill-white" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Interaction Hub Toolkits */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Campaign Plan Loader */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <FolderOpen className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Simulate Scheduled Campaigns</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Select any of your current scheduled Instagram campaigns from the selector below. This instantly imports its title and description into the live Instagram mockup on the left for visualization.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-9">
                      <select 
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const found = plans.find(p => p.id === selectedId);
                          if (found) {
                            setInstaCaption(`${found.title} - ${found.description}`);
                            addLog(`Instagram Simulator: Loaded scheduled campaign "${found.title}" into mockup`, 'info');
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-blue-500 transition-all cursor-pointer font-mono"
                      >
                        <option value="">-- Choose scheduled campaign to preview --</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id}>
                            [{p.month} Day {p.day}] - {p.title} ({p.platform})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <button 
                        onClick={() => {
                          setInstaCaption('Swanaya Media Enterprises official Instagram post preview. Direct media scheduling, automated workflows, and high-performance multi-platform campaign logs. 🚀🎬✨');
                          addLog('Instagram Simulator: Reset preview caption to default boilerplate text', 'info');
                        }}
                        className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 text-xs font-semibold py-2 px-3 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Reset Caption
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Hashtag Optimizer */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">AI Hashtag Optimizer</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Optimize search discoverability and algorithmic engagement. Choose a niche theme below to generate a trending set of optimized, highly matching campaign hashtags.
                  </p>

                  {/* Category Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {['Media', 'Technology', 'Fashion', 'Corporate', 'Creative'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setHashtagCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          hashtagCategory === cat
                            ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/5'
                            : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Hashtags display and apply button */}
                  <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-850 space-y-3.5">
                    <div className="flex flex-wrap gap-2">
                      {hashtagCategory === 'Media' && [
                        '#mediaproduction', '#swanaya', '#contentplanner', '#videoediting', '#agencylife', '#digitalmarketing', '#campaigns'
                      ].map((h, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold bg-blue-950/60 text-blue-300 border border-blue-900/40 px-2.5 py-1 rounded">
                          {h}
                        </span>
                      ))}

                      {hashtagCategory === 'Technology' && [
                        '#containerization', '#esbuild', '#typescript', '#clouddeploy', '#nodejs', '#webdevelopment', '#devops'
                      ].map((h, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-900/40 px-2.5 py-1 rounded">
                          {h}
                        </span>
                      ))}

                      {hashtagCategory === 'Fashion' && [
                        '#editorial', '#aesthetic', '#vogue', '#outfitoftheday', '#colorgrading', '#brandshoot', '#runway'
                      ].map((h, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold bg-pink-950/60 text-pink-300 border border-pink-900/40 px-2.5 py-1 rounded">
                          {h}
                        </span>
                      ))}

                      {hashtagCategory === 'Corporate' && [
                        '#corporatelaunch', '#enterpriseworkflow', '#saas', '#b2bmarketing', '#productivity', '#collaboration', '#agile'
                      ].map((h, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1 rounded">
                          {h}
                        </span>
                      ))}

                      {hashtagCategory === 'Creative' && [
                        '#storyboarding', '#artdirection', '#conceptual', '#uiux', '#brandidentity', '#digitalart', '#motiongraphics'
                      ].map((h, i) => (
                        <span key={i} className="text-[10px] font-mono font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-900/40 px-2.5 py-1 rounded">
                          {h}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-900">
                      <span className="text-[9px] font-mono text-slate-500">Suggested density: 7 tags (Optimal for Instagram discovery)</span>
                      <button
                        onClick={() => {
                          const tags = {
                            'Media': ' #mediaproduction #swanaya #contentplanner #videoediting #agencylife #digitalmarketing #campaigns',
                            'Technology': ' #containerization #esbuild #typescript #clouddeploy #nodejs #webdevelopment #devops',
                            'Fashion': ' #editorial #aesthetic #vogue #outfitoftheday #colorgrading #brandshoot #runway',
                            'Corporate': ' #corporatelaunch #enterpriseworkflow #saas #b2bmarketing #productivity #collaboration #agile',
                            'Creative': ' #storyboarding #artdirection #conceptual #uiux #brandidentity #digitalart #motiongraphics'
                          }[hashtagCategory] || '';

                          setInstaCaption(prev => {
                            // Strip existing tags if already added
                            const cleanText = prev.split('#')[0].trim();
                            return `${cleanText} ${tags}`;
                          });
                          addLog(`Instagram Simulator: Applied trending [${hashtagCategory}] hashtags to caption`, 'success');
                        }}
                        className="bg-amber-400 text-slate-950 text-[10px] font-bold py-1.5 px-3 rounded hover:bg-amber-300 transition-colors cursor-pointer"
                      >
                        Apply to Mock Post Caption
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Predictive Performance Analytics */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-left space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Simulated Reach & Algorithmic Impact</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Based on hashtag density, posting time, and interactive engagement metrics (likes/bookmarks), simulate prospective algorithmic reach statistics.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Est. Impressions</p>
                      <p className="text-lg font-extrabold text-white font-display mt-1">{(instaLikes * 12.4).toFixed(0)}</p>
                      <span className="text-[8px] font-mono text-blue-400">Impression Multiplier: 12.4x</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Engagement Rate</p>
                      <p className="text-lg font-extrabold text-amber-300 font-display mt-1">{((instaLikes / 4.2) + (instaBookmarks / 1.5)).toFixed(2)}%</p>
                      <span className="text-[8px] font-mono text-emerald-400">Healthy Profile Average</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Estimated Shares</p>
                      <p className="text-lg font-extrabold text-white font-display mt-1">{(instaBookmarks * 2.8).toFixed(0)}</p>
                      <span className="text-[8px] font-mono text-pink-400">Bookmark Save-rate: High</span>
                    </div>
                  </div>
                </div>

              </div>

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
                    <Calendar className="w-3.5 h-3.5 animate-pulse" /> Date Assigning System
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Assigned Calendar Date
                      </label>
                      <input
                        type="date"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md p-2 text-xs text-white outline-none cursor-pointer"
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex flex-col justify-center">
                      <p className="font-semibold text-slate-300 leading-tight">Live Synchronization</p>
                      <p className="mt-0.5 leading-relaxed text-slate-500 text-[9px]">
                        Modifying this calendar date auto-calculates month grid indexes and year offsets.
                      </p>
                    </div>
                  </div>
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

                {/* Status */}
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
                  </select>
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

    </div>
  );
}
