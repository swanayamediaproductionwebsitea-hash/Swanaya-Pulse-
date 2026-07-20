import React, { useState, useEffect } from 'react';
import { HelpCircle, Star, MessageSquare, PlusCircle, CheckCircle, ChevronDown, ChevronUp, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Experience {
  id: string;
  username: string;
  designation: string;
  rating: number;
  title: string;
  text: string;
  date: string;
}

interface FaqExperiencesProps {
  currentUser: string;
  addLog?: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

export default function FaqExperiences({ currentUser, addLog }: FaqExperiencesProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  
  // Experience Form states
  const [rating, setRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const loadExperiences = () => {
    try {
      const saved = localStorage.getItem('swanaya_user_experiences');
      if (saved) {
        setExperiences(JSON.parse(saved));
      } else {
        const defaultExperiences: Experience[] = [
          {
            id: 'exp_1',
            username: 'aadithyan',
            designation: 'Director & Marketing HOD',
            rating: 5,
            title: 'Unbelievable Operational Velocity',
            text: 'Swanaya Enterprises has completely re-engineered how we plan production campaigns. Moving from manual sheets to the 3D Content Planner and automatic SEO tags has cut campaign deployment times by over 80%.',
            date: 'Jul 12, 2026'
          },
          {
            id: 'exp_2',
            username: 'each',
            designation: 'System Administrator',
            rating: 5,
            title: 'Bulletproof Authentication and Auditing',
            text: 'As an admin, the capability to see real-time workspace logins, review security logs, and immediately dispatch alerts directly to employee dashboards has elevated our communication and compliance to enterprise grades.',
            date: 'Jul 14, 2026'
          },
          {
            id: 'exp_3',
            username: 'JohnMedia',
            designation: 'Senior Video Editor',
            rating: 5,
            title: 'Staging Large Files Is Seamless',
            text: 'I upload multiple draft videos directly into the Campaign view node to check compliance across mobile and billboards. Visual previews are perfectly isolated and responsive.',
            date: 'Jul 15, 2026'
          }
        ];
        localStorage.setItem('swanaya_user_experiences', JSON.stringify(defaultExperiences));
        setExperiences(defaultExperiences);
      }
    } catch (e) {
      console.error('Error loading user experiences:', e);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitted(false);

    if (!reviewTitle.trim()) {
      setFormError('Please provide a short summary title for your experience.');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setFormError('Please share at least 10 characters detailing your experience.');
      return;
    }

    try {
      const saved = localStorage.getItem('swanaya_user_experiences');
      const currentList: Experience[] = saved ? JSON.parse(saved) : [];
      
      const userDesignation = localStorage.getItem(`swanaya_profile_title_${currentUser.toLowerCase()}`) || 'Workspace Operator';

      const newExp: Experience = {
        id: `exp_${Date.now()}`,
        username: currentUser,
        designation: userDesignation,
        rating,
        title: reviewTitle.trim(),
        text: reviewText.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };

      const updated = [newExp, ...currentList];
      localStorage.setItem('swanaya_user_experiences', JSON.stringify(updated));
      setExperiences(updated);
      setIsSubmitted(true);
      setReviewTitle('');
      setReviewText('');
      setRating(5);

      if (addLog) {
        addLog(`System: User "${currentUser}" submitted a new ${rating}-star platform review`, 'success');
      }
    } catch (err) {
      setFormError('An error occurred while saving your feedback.');
    }
  };

  const FAQS = [
    {
      q: "What is Swanaya Media Enterprises?",
      a: "Swanaya Media Enterprises is an advanced digital production, brand-building, and software automation department that engineers bespoke corporate planners, secure employee trackers, and high-throughput advertising frameworks."
    },
    {
      q: "What is Swanaya AdsPortal and how do we access it?",
      a: "The Swanaya AdsPortal is our flagship campaign analytics node, available at https://swanaya-skillos.netlify.app/. It allows stakeholders and investors to monitor active advertising performance across key channels."
    },
    {
      q: "Can normal creators see all media files and schedules?",
      a: "Yes! Content schedules, video uploads, and assigned tasks in the Content Planner have been fully unlocked and are completely visible to everyone in the workspace to encourage fluid collaborative alignment."
    },
    {
      q: "How does the direct text message alert dispatcher work?",
      a: "System administrators ('aadithyan' and 'each') can access the Admin Console and write custom SMS or system-wide text alerts. Corresponding operators will immediately see these announcements as top banner alerts on their screen."
    },
    {
      q: "Who monitors and directs the digital workflow?",
      a: "All software architectures, 3D canvases, and automation nodes are engineered, monitored, and audited under the direct leadership of Aadithyan M Menon, Director and HOD of Marketing and Productions at Swanaya Media Enterprises."
    }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Visual Header Banner */}
      <div className="bg-slate-950/40 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <HelpCircle className="w-24 h-24 text-indigo-400" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h2 className="text-base font-extrabold text-white tracking-wider uppercase font-display">FAQ & User Experiences Hub</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Read corporate guidelines, expand technical FAQs, and browse or write authentic operator reviews tracking system utility.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Interactive FAQ Accordion */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-400" /> Operations FAQ Matrix
              </h3>
              <p className="text-[10px] text-slate-500">Click to expand any technical question</p>
            </div>

            <div className="space-y-2.5">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left text-[11px] font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>Q{idx + 1}. {faq.q}</span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-slate-900 bg-slate-950/20"
                        >
                          <p className="p-4 text-xs text-slate-400 leading-relaxed font-sans border-l-2 border-indigo-500 bg-indigo-950/5">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): User Experiences feed & form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-5">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-yellow-500" /> Operator Reviews & Testimonials
              </h3>
              <p className="text-[10px] text-slate-500">Real-time reviews posted by Swanaya brand managers and creators</p>
            </div>

            {/* Testimonials Feed */}
            <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
              {experiences.length === 0 ? (
                <div className="text-center py-12 text-slate-600 font-mono text-xs">
                  --- NO USER EXPERIENCES RECORDED YET ---
                </div>
              ) : (
                experiences.map((exp) => (
                  <div 
                    key={exp.id} 
                    className="bg-slate-950 border border-slate-900 p-4 rounded-xl space-y-2 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-snug">{exp.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < exp.rating ? 'fill-current' : 'text-slate-800'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-indigo-400 font-mono font-bold">Rating: {exp.rating}/5</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">{exp.date}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                      "{exp.text}"
                    </p>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-900/40 text-[10px] font-mono">
                      <div className="shrink-0 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                        <User className="w-2.5 h-2.5 text-indigo-400" />
                      </div>
                      <span className="text-slate-300 font-bold">
                        {exp.username.toLowerCase() === 'aadithyan' ? 'system_owner' : exp.username.toLowerCase() === 'each' ? 'system_admin' : exp.username}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500 uppercase tracking-tight">{exp.designation}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Submit Experience Form */}
            <div className="border-t border-slate-900 pt-4">
              <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 mb-3">
                <PlusCircle className="w-4 h-4 text-emerald-500" /> Share Your Platform Experience
              </h4>

              <form onSubmit={handleSubmitReview} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Platform Rating
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-900 p-1.5 rounded-lg">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        const active = rating >= starValue;
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setRating(starValue)}
                            className="p-0.5 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${active ? 'fill-current' : 'text-slate-800'}`} />
                          </button>
                        );
                      })}
                      <span className="text-[10px] text-slate-400 font-mono ml-1.5">({rating} Stars)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Experience Title / Summary
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Stunningly fast planning"
                      className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded p-2 text-xs text-white placeholder-slate-700 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Detail Your Experience / Feedback
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe how Swanaya has impacted your production workflows, team alignment, or metric tracking..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-indigo-500 rounded p-2 text-xs text-white placeholder-slate-700 outline-none font-sans"
                  />
                </div>

                {isSubmitted && (
                  <p className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded flex items-center gap-1 font-mono">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Experience published successfully and added to the public feed!
                  </p>
                )}

                {formError && (
                  <p className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-900/30 p-2 rounded font-mono">
                    ⚠️ {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-xs transition-colors cursor-pointer uppercase font-mono tracking-wider"
                >
                  Publish Experience
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
