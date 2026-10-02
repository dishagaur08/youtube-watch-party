import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Bot,
  Send,
  Zap
} from 'lucide-react';
import api from '../services/api';

const ContextPanel = ({ activeChat, onClose }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAskAICopilot = async (customText) => {
    const promptToSend = customText || aiPrompt;
    if (!promptToSend.trim()) return;

    setLoadingAI(true);
    try {
      const res = await api.post('/ai/chat', {
        messages: [{ role: 'user', content: promptToSend }],
        tone: 'concise',
      });
      if (res.data?.success) {
        setAiResponse(res.data.data.reply);
      }
    } catch (err) {
      setAiResponse('AI Co-Pilot is standing by. Ready to analyze conversation topics or draft responses.');
    } finally {
      setLoadingAI(false);
      setAiPrompt('');
    }
  };

  return (
    <aside className="w-80 bg-vyntra-card border-l border-vyntra-border/60 hidden xl:flex flex-col p-5 overflow-y-auto space-y-6 select-none">
      {/* Top Details */}
      <div className="flex items-center justify-between pb-3 border-b border-vyntra-border/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hub Intelligence</h4>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
          <Zap className="w-3 h-3" /> Live Synced
        </span>
      </div>

      {/* AI Quick Co-Pilot Card */}
      <div className="bg-gradient-to-br from-indigo-900/30 via-vyntra-surface to-cyan-900/20 rounded-2xl p-4 border border-indigo-500/20 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>AI Conversation Co-Pilot</span>
        </div>
        <p className="text-xs text-slate-400">
          Ask questions, summarize threads, or rewrite draft notes in real-time.
        </p>

        <div className="flex flex-wrap gap-1.5">
          {['Summarize thread', 'Extract action items', 'Check tone'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleAskAICopilot(tag)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-white border border-white/5 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {aiResponse && (
          <div className="p-3 rounded-xl bg-vyntra-bg/80 border border-white/5 text-xs text-slate-200 leading-relaxed max-h-44 overflow-y-auto">
            {aiResponse}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAICopilot()}
            placeholder="Ask AI co-pilot..."
            className="flex-1 bg-vyntra-bg/70 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleAskAICopilot()}
            disabled={loadingAI}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Shared Media Highlights */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Shared Media & Assets</span>
        </h5>
        <div className="grid grid-cols-3 gap-2">
          {[
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
          ].map((url, i) => (
            <img
              key={i}
              src={url}
              alt="Shared item"
              className="w-full h-16 rounded-xl object-cover border border-white/5 hover:scale-105 transition-transform cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* Privacy & Encryption Security Badge */}
      <div className="mt-auto pt-4 border-t border-vyntra-border/60 flex items-center gap-2.5 text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-[11px] font-medium text-slate-400">End-to-End Encrypted Session</span>
      </div>
    </aside>
  );
};

export default ContextPanel;
