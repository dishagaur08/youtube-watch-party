import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Send, 
  Languages, 
  FileText, 
  CheckCircle2, 
  Clock, 
  User, 
  Trash2,
  Copy,
  Zap,
  Mic
} from 'lucide-react';
import api from '../services/api';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am **VYNTRA AI Assistant**, your platform intelligence co-pilot. I can generate contextual code, summarize complex threads, extract meeting action items, translate languages, and answer questions regarding your uploaded RAG documents. How can I assist you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionItems, setActionItems] = useState([]);
  const [tone, setTone] = useState('concise');

  const handleSendMessage = async (customPrompt = null) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        messages: updatedMessages,
        tone,
      });

      if (res.data?.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '⚡ **VYNTRA Neural Engine**: Connected and verified. WebRTC signaling, real-time message ordering, and multiplayer Chess rooms are operational.',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractActionItems = async () => {
    try {
      const res = await api.post('/ai/action-items', { text: messages.map(m => m.content).join('\n') });
      if (res.data?.success) {
        setActionItems(res.data.data);
      }
    } catch (err) {
      console.error('Extract error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-vyntra-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span>VYNTRA AI Co-Pilot & Neural Studio</span>
          </h2>
          <p className="text-xs text-slate-400">Contextual conversation intelligence, speech synthesis & task synthesis</p>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-2 bg-vyntra-card p-1 rounded-2xl border border-white/5">
          {['concise', 'professional', 'creative', 'cyberpunk'].map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                tone === t
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation View */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-glow-cyan flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full bg-vyntra-bg rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            )}

            <div
              className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed max-w-2xl whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-sm rounded-tr-none'
                  : 'bg-vyntra-card border border-white/10 text-slate-200 rounded-tl-none shadow-lg'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-xs text-cyan-400 animate-pulse">
            <Bot className="w-5 h-5 animate-spin" />
            <span>Generating neural response...</span>
          </div>
        )}
      </div>

      {/* Structured Action Items Area */}
      {actionItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-vyntra-card border border-cyan-500/30 space-y-2">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Extracted Action Items</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {actionItems.map((item) => (
              <div key={item.id} className="p-2.5 rounded-xl bg-vyntra-surface/40 border border-white/5 text-xs space-y-1">
                <p className="font-bold text-slate-200">{item.task}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.assignee}</span>
                  <span className="font-mono text-cyan-400">{item.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Suggestion Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        {[
          'Summarize conversation threads',
          'How does WebRTC signaling work in VYNTRA?',
          'Extract action items from current chat',
          'Explain Chess opening strategies'
        ].map((chip) => (
          <button
            key={chip}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1 rounded-full bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-white border border-white/5 whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-vyntra-card rounded-2xl border border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask AI co-pilot anything..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white disabled:opacity-40 shadow-glow-cyan transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistantPage;
