import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckSquare, Square, Trash2, CalendarPlus, Plus, 
  HelpCircle, RefreshCw, Layers, CheckCircle2, AlertCircle, Play, Lock, ShieldCheck, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AiTodoItem, ContentPlan } from '../types';

const resourceData = [
  { name: 'Aadithyan', workload: 85 },
  { name: 'Each', workload: 60 },
  { name: 'Sara', workload: 90 },
  { name: 'John', workload: 45 },
];

interface AiTodoProps {
  onAddPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt'>) => void;
  setActiveMainTab: (tab: any) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  currentUser: string;
  uiMode?: 'human' | 'ai';
}

export default function AiTodo({ onAddPlan, setActiveMainTab, addLog, currentUser, uiMode = 'ai' }: AiTodoProps) {
  const [todos, setTodos] = useState<AiTodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoPlatform, setNewTodoPlatform] = useState<any>('Instagram');
  const [newTodoPriority, setNewTodoPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTodoAssignee, setNewTodoAssignee] = useState<string>('');
  const [newTodoVisibility, setNewTodoVisibility] = useState<'public' | 'private'>('public');
  const [selectedTodoDetail, setSelectedTodoDetail] = useState<AiTodoItem | null>(null);

  // AI Generation states
  const [aiTopic, setAiTopic] = useState('');
  const [aiPlatform, setAiPlatform] = useState<string>('All');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Inline Deploy State for expanding date assignment under a task
  const [deployTaskId, setDeployTaskId] = useState<string | null>(null);
  const [deployDate, setDeployDate] = useState('2026-07-15');
  const [deployType, setDeployType] = useState<'Video' | 'Image' | 'Article' | 'Campaign' | 'Story'>('Video');

  // Load and save To-Dos with database synchronization and localStorage fallback
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('/api/todos');
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((t: any) => ({ ...t, id: String(t.id) }));
          setTodos(formatted);
          localStorage.setItem('swanaya_ai_todos', JSON.stringify(formatted));
          return;
        }
      } catch (err) {
        console.warn('Database offline, loading cached To-Dos:', err);
      }

      const saved = localStorage.getItem('swanaya_ai_todos');
      if (saved) {
        try {
          setTodos(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse swanaya_ai_todos', e);
        }
      } else {
        // Set initial high-fidelity seed To-Dos
        const initialSeed: AiTodoItem[] = [
          {
            id: 'todo_seed_1',
            text: 'Analyze YouTube Reels CTR trends for tech reviews and adjust hook subtitles',
            platform: 'YouTube',
            priority: 'High',
            completed: false,
            createdAt: new Date().toISOString()
          },
          {
            id: 'todo_seed_2',
            text: 'Draft 5 carousel slide assets for corporate branding tips on LinkedIn',
            platform: 'LinkedIn',
            priority: 'Medium',
            completed: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'todo_seed_3',
            text: 'Generate 3 caption copy hooks for Instagram ad campaigns using custom discount codes',
            platform: 'Instagram',
            priority: 'High',
            completed: false,
            createdAt: new Date().toISOString()
          }
        ];
        setTodos(initialSeed);
        localStorage.setItem('swanaya_ai_todos', JSON.stringify(initialSeed));
      }
    };

    fetchTodos();
  }, []);

  // Manual Add To-Do with DB synchronization
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const tempId = `todo_${Date.now()}`;
    const newItem: AiTodoItem = {
      id: tempId,
      text: newTodoText.trim(),
      platform: newTodoPlatform,
      priority: newTodoPriority,
      completed: false,
      createdAt: new Date().toISOString(),
      assignee: newTodoAssignee || currentUser,
      visibility: newTodoVisibility
    };

    setTodos((prev) => {
      const updated = [newItem, ...prev];
      localStorage.setItem('swanaya_ai_todos', JSON.stringify(updated));
      return updated;
    });
    setNewTodoText('');
    addLog(`To-Do Engine: Created manual item "${newItem.text.substring(0, 30)}..."`, 'success');

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newItem.text,
          platform: newItem.platform,
          priority: newItem.priority,
          completed: false,
          uid: currentUser
        })
      });
      if (response.ok) {
        const dbTodo = await response.json();
        setTodos((prev) => 
          prev.map((t) => t.id === tempId ? { ...t, id: String(dbTodo.id) } : t)
        );
      }
    } catch (err) {
      console.error('Failed to sync todo to DB:', err);
    }
  };

  // Toggle To-Do complete status with DB synchronization
  const handleToggleComplete = async (id: string) => {
    let targetTodo: AiTodoItem | undefined;
    const updated = todos.map(todo => {
      if (todo.id === id) {
        targetTodo = { ...todo, completed: !todo.completed };
        return targetTodo;
      }
      return todo;
    });

    setTodos(updated);
    localStorage.setItem('swanaya_ai_todos', JSON.stringify(updated));

    if (targetTodo) {
      addLog(`To-Do Engine: Marked task as ${targetTodo.completed ? 'Completed' : 'Active'}`, 'info');

      if (!id.startsWith('todo_')) {
        try {
          await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: targetTodo.completed })
          });
        } catch (err) {
          console.error('Failed to update todo status in DB:', err);
        }
      }
    }
  };

  // Delete To-Do with DB synchronization
  const handleDeleteTodo = async (id: string) => {
    const deletedItem = todos.find(t => t.id === id);
    setTodos((prev) => {
      const updated = prev.filter(todo => todo.id !== id);
      localStorage.setItem('swanaya_ai_todos', JSON.stringify(updated));
      return updated;
    });
    
    if (deployTaskId === id) setDeployTaskId(null);
    if (deletedItem) {
      addLog(`To-Do Engine: Deleted task "${deletedItem.text.substring(0, 30)}..."`, 'warning');
      
      if (!id.startsWith('todo_')) {
        try {
          await fetch(`/api/todos/${id}`, { method: 'DELETE' });
        } catch (err) {
          console.error('Failed to delete todo from DB:', err);
        }
      }
    }
  };

  // AI Generate To-Dos call to server with automatic DB save
  const handleAIGenerate = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const response = await fetch('/api/generate-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, platform: aiPlatform })
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

      const data = await response.json();
      if (data && Array.isArray(data.todos)) {
        addLog(`AI Core: Generated 4 high-conversion strategic To-Dos for Swanaya Media`, 'success');

        const savedItems: AiTodoItem[] = [];
        for (let index = 0; index < data.todos.length; index++) {
          const t = data.todos[index];
          try {
            const saveRes = await fetch('/api/todos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: t.text,
                platform: t.platform || 'Instagram',
                priority: t.priority || 'Medium',
                completed: false,
                uid: currentUser
              })
            });
            if (saveRes.ok) {
              const dbTodo = await saveRes.json();
              savedItems.push({
                id: String(dbTodo.id),
                text: dbTodo.text,
                platform: dbTodo.platform,
                priority: dbTodo.priority,
                completed: dbTodo.completed,
                createdAt: dbTodo.createdAt || new Date().toISOString()
              });
            }
          } catch (err) {
            console.error('Failed to auto-save AI todo to DB:', err);
          }
        }

        if (savedItems.length > 0) {
          setTodos((prev) => {
            const updated = [...savedItems, ...prev];
            localStorage.setItem('swanaya_ai_todos', JSON.stringify(updated));
            return updated;
          });
        }
        setAiTopic('');
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      console.error(err);
      setAiError('Failed to contact Swanaya AI generator. Please check key config.');
      addLog('AI Core Error: To-Do prompt generation pipeline failed', 'warning');
    } finally {
      setAiLoading(false);
    }
  };

  // Deploy task to planner schedule with DB completion status update
  const handleDeployToPlanner = async (todo: AiTodoItem) => {
    const d = new Date(deployDate);
    const monthsArray = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthsArray[d.getMonth()] || 'July';
    const dayNum = d.getDate() || 15;
    const yearNum = d.getFullYear() || 2026;

    // Platform validation
    let finalPlatform: any = 'Instagram';
    if (['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Facebook'].includes(todo.platform)) {
      finalPlatform = todo.platform;
    }

    onAddPlan({
      title: todo.text,
      type: deployType,
      description: `AI Generated task optimized for Swanaya Enterprises. Deployed from AI To-Do Engine. Original platform parameters: ${todo.platform}. Priority: ${todo.priority}.`,
      month: monthName,
      day: dayNum,
      year: yearNum,
      assignedDate: deployDate,
      status: 'Planned',
      platform: finalPlatform,
      createdBy: currentUser
    });

    addLog(`AI Core: Deployed and scheduled plan "${todo.text.substring(0, 35)}..." into calendar`, 'success');
    
    // Mark as completed when scheduled
    setTodos((prev) => {
      const updated = prev.map(t => {
        if (t.id === todo.id) return { ...t, completed: true };
        return t;
      });
      localStorage.setItem('swanaya_ai_todos', JSON.stringify(updated));
      return updated;
    });

    if (!todo.id.startsWith('todo_')) {
      try {
        await fetch(`/api/todos/${todo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true })
        });
      } catch (err) {
        console.error('Failed to complete todo after deploy in DB:', err);
      }
    }

    setDeployTaskId(null);
    setActiveMainTab('planner');
  };

  const isSystemAdmin = currentUser?.toLowerCase() === 'aadithyan' || currentUser?.toLowerCase() === 'administrator';
  const [workspaceView, setWorkspaceView] = useState<'my' | 'all'>('my');

  // Filter todos for individual user workspace isolation
  const visibleTodos = todos.filter(t => {
    if (isSystemAdmin && workspaceView === 'all') return true;
    const cleanUser = currentUser?.toLowerCase() || '';
    if ((t as any).createdBy) {
      return (t as any).createdBy.toLowerCase() === cleanUser || t.assignee?.toLowerCase() === cleanUser;
    }
    if (t.assignee) {
      return t.assignee.toLowerCase() === cleanUser;
    }
    return t.visibility !== 'private' || cleanUser === 'aadithyan' || cleanUser === 'administrator';
  });

  // Stats breakdowns for active workspace
  const totalCount = visibleTodos.length;
  const completedCount = visibleTodos.filter(t => t.completed).length;
  const activeCount = totalCount - completedCount;
  const highPriorityCount = visibleTodos.filter(t => !t.completed && t.priority === 'High').length;

  return (
    <div className={`backdrop-blur-md border rounded-2xl p-5 flex flex-col justify-between h-full min-h-[580px] shadow-2xl transition-all duration-500 ${
      uiMode === 'ai' 
        ? 'bg-slate-900/60 border-slate-800' 
        : 'bg-slate-900/45 border-slate-800/80 shadow-md'
    }`}>
      {selectedTodoDetail ? (
        <div className="flex flex-col h-full justify-between space-y-5 animate-fadeIn">
          {/* Detailed Assignment View */}
          <div className="space-y-4">
            {/* Back Button & Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <button
                onClick={() => setSelectedTodoDetail(null)}
                className="text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-900"
              >
                ← Return Back to Assignments
              </button>
              <span className="text-[10px] font-mono text-slate-500">Swanaya Work Node</span>
            </div>

            {/* Campaign details */}
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold bg-indigo-950 border border-indigo-900/60 text-indigo-400 px-2 py-0.5 rounded-full uppercase">
                  {selectedTodoDetail.platform}
                </span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  selectedTodoDetail.priority === 'High' ? 'text-rose-400 border-rose-900/30 bg-rose-950/20' : 'text-amber-400 border-amber-900/30 bg-amber-950/20'
                }`}>
                  {selectedTodoDetail.priority} Urgency
                </span>
              </div>
              <h3 className="text-sm font-extrabold font-display text-white leading-tight text-left">
                {selectedTodoDetail.text}
              </h3>
              <p className="text-[9px] text-slate-500 font-mono text-left">
                Assigned on: {new Date(selectedTodoDetail.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Creative Deliverables Checklist */}
            <div className="bg-slate-950/80 border border-slate-850 p-4 rounded-xl text-left space-y-3">
              <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-wide font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Required Campaign Deliverables
              </h4>
              
              <ul className="space-y-2.5 text-xs font-sans text-slate-300">
                <li className="flex items-start gap-2 text-left">
                  <span className="text-indigo-400 font-bold font-mono text-[10px]">1.</span>
                  <div>
                    <strong className="text-white text-xs block">Visual Assets & Storyboard:</strong>
                    <span className="text-[10px] text-slate-400">Design 3 core overlay graphics matching {selectedTodoDetail.platform} guidelines.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-left">
                  <span className="text-indigo-400 font-bold font-mono text-[10px]">2.</span>
                  <div>
                    <strong className="text-white text-xs block">Gemini Optimized Subtitles:</strong>
                    <span className="text-[10px] text-slate-400">Include high-engagement bold subtitles for the first 3 seconds to optimize retention.</span>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-left">
                  <span className="text-indigo-400 font-bold font-mono text-[10px]">3.</span>
                  <div>
                    <strong className="text-white text-xs block">Call to Action Copy:</strong>
                    <span className="text-[10px] text-slate-400">Standardized coupon codes and signup prompts to track ROI conversion metrics.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Simulated Gemini Optimization Recommendation */}
            <div className="bg-indigo-950/15 border border-indigo-500/15 p-4 rounded-xl text-left space-y-2">
              <span className="text-[9px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">
                Gemini Campaign Forecast
              </span>
              <p className="text-[10px] text-slate-300 leading-relaxed font-mono text-left">
                "Based on recent telemetry analysis, publishing this campaign on a Tuesday or Thursday at exactly 5:15 PM EST yields a predictive CTR increase of +2.4%. We recommend syncing this directly with the Content Planner."
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-850/60 flex gap-2">
            <button
              onClick={() => {
                handleToggleComplete(selectedTodoDetail.id);
                setSelectedTodoDetail(null);
              }}
              className="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] py-2.5 rounded-lg cursor-pointer transition-all shadow"
            >
              {selectedTodoDetail.completed ? 'Mark as Active' : 'Mark Deliverables Complete ✓'}
            </button>
            <button
              onClick={() => setSelectedTodoDetail(null)}
              className="px-4 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 font-mono text-[10px] rounded-lg cursor-pointer transition-all"
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
          {/* Header Title */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border transition-all ${
                uiMode === 'ai' 
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
              {uiMode === 'ai' ? (
                <Sparkles className="w-5 h-5 animate-pulse text-indigo-400" />
              ) : (
                <CheckSquare className="w-5 h-5 text-slate-300" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-display">
                {uiMode === 'ai' ? 'AI Task Planner' : 'Crew Task Registrar'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {uiMode === 'ai' ? 'Swanique AI Content Strategist & Predictive Actions' : 'Swanique Manual Crew Action Items & Task Auditing'}
              </p>
            </div>
          </div>
          
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 my-4">
            <h4 className="text-[10px] font-bold text-slate-300 uppercase mb-2">Staff Resource Allocation</h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none'}} />
                  <Bar dataKey="workload" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            uiMode === 'ai' 
              ? 'border-indigo-500/20 bg-indigo-950/40 text-indigo-400' 
              : 'border-slate-700 bg-slate-950 text-slate-400'
          }`}>
            {uiMode === 'ai' ? 'Node: AI Online' : 'Node: Operator manual'}
          </span>
        </div>

        {/* System Stats Indicators */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-[10px] font-mono text-center">
          <div className="bg-slate-950/40 border border-slate-850 p-2 rounded-xl">
            <span className="text-slate-500 block mb-0.5 uppercase tracking-wide text-[8px]">Total Tasks</span>
            <strong className="text-white text-xs">{totalCount}</strong>
          </div>
          <div className="bg-emerald-950/10 border border-emerald-900/20 p-2 rounded-xl">
            <span className="text-emerald-500/70 block mb-0.5 uppercase tracking-wide text-[8px]">Completed</span>
            <strong className="text-emerald-400 text-xs">{completedCount}</strong>
          </div>
          <div className="bg-indigo-950/10 border border-indigo-900/20 p-2 rounded-xl">
            <span className="text-indigo-500/70 block mb-0.5 uppercase tracking-wide text-[8px]">Active</span>
            <strong className="text-indigo-300 text-xs">{activeCount}</strong>
          </div>
          <div className="bg-rose-950/10 border border-rose-900/20 p-2 rounded-xl">
            <span className="text-rose-500/70 block mb-0.5 uppercase tracking-wide text-[8px]">High Urgency</span>
            <strong className="text-rose-400 text-xs">{highPriorityCount}</strong>
          </div>
        </div>

        {/* AI Task Generator Panel */}
        {uiMode === 'ai' && (
          <div className="bg-gradient-to-r from-slate-950/60 via-slate-900/50 to-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-850">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">Swanique Gemini Task Generator</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-center">
              <div className="md:col-span-2">
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Campaign Theme / Content Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g., Summer Brand Refresh, SEO hooks, tech reviews..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-700 outline-none transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Target Platform
                </label>
                <select
                  value={aiPlatform}
                  onChange={(e) => setAiPlatform(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
                >
                  <option value="All">All Channels</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Meta Ads">Meta Ads</option>
                  <option value="Google Ads">Google Ads</option>
                </select>
              </div>
            </div>

            {aiError && (
              <p className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-900/20 p-2 rounded-lg font-mono">
                ⚠️ {aiError}
              </p>
            )}

            <button
              onClick={handleAIGenerate}
              disabled={aiLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10.5px] py-2 rounded-lg cursor-pointer transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Analyzing Market Trends & Generating bespoke tasks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>AI Auto-Generate Strategic Content Tasks</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Workspace Security Header */}
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-indigo-900/40 flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] text-slate-300">
              Private Checklist: <strong className="text-white font-extrabold">@{currentUser}</strong>
            </span>
            <span className="bg-emerald-950 border border-emerald-900 text-emerald-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
              Isolated
            </span>
          </div>
          {isSystemAdmin && (
            <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setWorkspaceView('my')}
                className={`px-1.5 py-0.5 rounded font-mono ${workspaceView === 'my' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
              >
                Mine
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceView('all')}
                className={`px-1.5 py-0.5 rounded font-mono ${workspaceView === 'all' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
              >
                All
              </button>
            </div>
          )}
        </div>

        {/* To-Do List Content Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              {uiMode === 'ai' ? 'Active Checklists' : 'Operational Checklist Log'}
            </h4>
            <span className="text-[9px] text-slate-500 font-mono">Click checkboxes to mark progress</span>
          </div>

          <div className="max-h-[290px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            {visibleTodos.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl text-slate-500 font-mono space-y-1.5">
                <AlertCircle className="w-7 h-7 mx-auto text-slate-700 animate-bounce" />
                <p className="text-xs font-bold uppercase text-slate-400">Workspace checklist empty</p>
                <p className="text-[9px] text-slate-600">Enter a target theme above or manual task to initialize actions</p>
              </div>
            ) : (
              visibleTodos.map((todo) => {
                const isDeploying = deployTaskId === todo.id;
                
                let platformColor = 'bg-slate-900 border-slate-800 text-slate-400';
                if (todo.platform === 'YouTube') platformColor = 'bg-red-500/10 border-red-500/30 text-red-400';
                else if (todo.platform === 'Instagram') platformColor = 'bg-pink-500/10 border-pink-500/30 text-pink-400';
                else if (todo.platform === 'LinkedIn') platformColor = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
                else if (todo.platform === 'TikTok') platformColor = 'bg-teal-500/10 border-teal-500/30 text-teal-400';
                else if (todo.platform === 'Facebook') platformColor = 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
                else if (todo.platform === 'Google Ads' || todo.platform === 'Meta Ads') platformColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400';

                let priorityColor = 'text-slate-400 bg-slate-950 border-slate-850';
                if (todo.priority === 'High') priorityColor = 'text-rose-400 bg-rose-950/30 border-rose-900/30';
                else if (todo.priority === 'Medium') priorityColor = 'text-amber-400 bg-amber-950/30 border-amber-900/30';

                return (
                  <div 
                    key={todo.id} 
                    className={`bg-slate-950/50 border rounded-xl p-3 hover:border-slate-700/80 transition-all ${
                      todo.completed ? 'border-slate-900/60 opacity-55' : 'border-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 text-left">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(todo.id)}
                          className="mt-0.5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {todo.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <p 
                            onClick={() => {
                              setSelectedTodoDetail(todo);
                              addLog(`User Action: Inspected details of assignment "${todo.text.substring(0, 30)}..."`, 'info');
                            }}
                            title="Click to view full campaign deliverables & assignment details"
                            className={`text-xs text-white leading-relaxed hover:text-indigo-400 cursor-pointer transition-colors ${todo.completed ? 'line-through text-slate-500 font-normal' : 'font-semibold'}`}
                          >
                            {todo.text}
                          </p>
                          <div className="flex items-center flex-wrap gap-1.5 mt-1">
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${platformColor} uppercase tracking-wider font-bold`}>
                              {todo.platform}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${priorityColor} uppercase font-bold`}>
                              {todo.priority} Priority
                            </span>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border bg-slate-800 text-slate-300 border-slate-700 uppercase">
                              Assignee: {todo.assignee || 'Everyone'}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase ${todo.visibility === 'private' ? 'bg-rose-950/40 text-rose-400 border-rose-900/40' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'}`}>
                              {todo.visibility || 'public'}
                            </span>
                            <button
                              onClick={() => setSelectedTodoDetail(todo)}
                              className="text-[8px] font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer ml-1"
                            >
                              [View Deliverables]
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!todo.completed && (
                          <button
                            onClick={() => {
                              setDeployTaskId(isDeploying ? null : todo.id);
                              setDeployDate(new Date().toISOString().split('T')[0]);
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isDeploying 
                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400'
                            }`}
                            title="Schedule & Deploy task to planner"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-1.5 bg-slate-900 border border-slate-800 hover:border-rose-900 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Deploy Form */}
                    {isDeploying && (
                      <div className="mt-3 pt-3 border-t border-slate-900 space-y-3 bg-slate-900/30 p-2 rounded-lg text-left">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                          <h5 className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
                            Deploy parameters
                          </h5>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Target Date
                            </label>
                            <input
                              type="date"
                              value={deployDate}
                              onChange={(e) => setDeployDate(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-white outline-none cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Deliverable Type
                            </label>
                            <select
                              value={deployType}
                              onChange={(e: any) => setDeployType(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-slate-300 outline-none cursor-pointer"
                            >
                              <option value="Video">Video / Clip</option>
                              <option value="Image">Image / Poster</option>
                              <option value="Article">Article / Post</option>
                              <option value="Story">Story / Slides</option>
                              <option value="Campaign">Full Campaign</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeployToPlanner(todo)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[9px] py-1.5 rounded cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-md"
                        >
                          <Play className="w-3 h-3" /> Commit and Deploy to Content Schedule
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Manual Quick Add Form */}
      <form onSubmit={handleAddTodo} className="border-t border-slate-800/40 pt-4 mt-4 space-y-2.5">
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Write a custom operational task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="flex-grow bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-700 outline-none transition-all font-mono"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 rounded-lg transition-all flex items-center justify-center cursor-pointer shadow active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[9px] font-mono">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Platform:</span>
            <select
              value={newTodoPlatform}
              onChange={(e) => setNewTodoPlatform(e.target.value as any)}
              className="bg-slate-950 border border-slate-850 text-slate-300 rounded px-1.5 py-0.5 outline-none cursor-pointer text-[9px]"
            >
              <option value="Instagram">Instagram</option>
              <option value="YouTube">YouTube</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Meta Ads">Meta Ads</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500">Priority:</span>
            <select
              value={newTodoPriority}
              onChange={(e) => setNewTodoPriority(e.target.value as any)}
              className="bg-slate-950 border border-slate-850 text-slate-300 rounded px-1.5 py-0.5 outline-none cursor-pointer text-[9px]"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Assign To:</span>
            <input
              type="text"
              placeholder="Everyone"
              value={newTodoAssignee}
              onChange={(e) => setNewTodoAssignee(e.target.value)}
              className="bg-slate-950 border border-slate-850 text-slate-300 rounded px-1.5 py-0.5 outline-none text-[9px] w-20"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Visibility:</span>
            <select
              value={newTodoVisibility}
              onChange={(e) => setNewTodoVisibility(e.target.value as any)}
              className="bg-slate-950 border border-slate-850 text-slate-300 rounded px-1.5 py-0.5 outline-none cursor-pointer text-[9px]"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
