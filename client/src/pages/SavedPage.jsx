import React from 'react';
import { Bookmark, Sparkles, MessageSquare, Image as ImageIcon } from 'lucide-react';

const SavedPage = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full select-none">
      <div className="pb-4 border-b border-vyntra-border/60">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Bookmark className="w-6 h-6 text-indigo-400" />
          <span>Saved Messages & Highlights</span>
        </h2>
        <p className="text-xs text-slate-400">Bookmarked communications, shared assets, and tactical notes</p>
      </div>

      <div className="space-y-4">
        {[
          {
            title: 'WebRTC STUN/TURN Signaling Architecture',
            sender: 'Disha Patel',
            category: 'Tech Specs',
            content: 'Configured peer connection ICE candidate signaling over Socket.io namespaces with automated reconnect handling.',
            time: 'Yesterday at 4:20 PM',
          },
          {
            title: 'Chess Blitz Tournament Rules',
            sender: 'Alex Rivers',
            category: 'Arcade Arena',
            content: 'Standard 3+0 blitz chess time controls with server-authoritative legal move validation and ELO rating updates.',
            time: '2 days ago',
          },
        ].map((item, idx) => (
          <div key={idx} className="p-5 rounded-3xl bg-vyntra-card border border-white/5 space-y-2 hover:border-indigo-500/30 transition-all shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {item.category}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{item.time}</span>
            </div>
            <h3 className="font-bold text-sm text-white">{item.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
            <p className="text-[11px] text-slate-400">Saved from conversation with <strong className="text-slate-200">{item.sender}</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPage;
