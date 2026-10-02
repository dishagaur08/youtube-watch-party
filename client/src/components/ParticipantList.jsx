import React from 'react';
import { Crown, Shield, User, MoreVertical, UserMinus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * ParticipantList
 * Renders the real-time participant list with colored role badges,
 * and enables Host-only management actions (promote to Mod, demote, remove user, transfer host).
 */
const ParticipantList = ({
  participants = [],
  currentUserId,
  userRole,
  onAssignRole,
  onRemoveParticipant,
}) => {
  const isHost = userRole === 'Host';

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Host':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>Host</span>
          </span>
        );
      case 'Moderator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Shield className="w-3 h-3 text-purple-400" />
            <span>Moderator</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <User className="w-3 h-3 text-slate-400" />
            <span>Participant</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-vyntra-card border border-white/10 rounded-3xl p-4 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-vyntra-border/60">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>Participants</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
            {participants.length}
          </span>
        </h3>
        {isHost && (
          <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            Room Admin
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/5 py-2 space-y-1">
        {participants.map((p) => {
          const isSelf = p.userId === currentUserId;
          return (
            <div
              key={p.userId}
              className="py-2.5 px-2 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all group"
            >
              {/* User Avatar & Info */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-md flex-shrink-0">
                  {p.username?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                      {p.username}
                    </span>
                    {isSelf && (
                      <span className="text-[9px] text-cyan-400 font-mono">(You)</span>
                    )}
                  </div>
                  <div className="mt-0.5">{getRoleBadge(p.role)}</div>
                </div>
              </div>

              {/* Host Management Controls */}
              {isHost && !isSelf && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {p.role === 'Participant' && (
                    <button
                      onClick={() => onAssignRole(p.userId, 'Moderator')}
                      title="Promote to Moderator"
                      className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-[10px] flex items-center gap-1 border border-purple-500/30 transition-colors"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Make Mod</span>
                    </button>
                  )}

                  {p.role === 'Moderator' && (
                    <button
                      onClick={() => onAssignRole(p.userId, 'Participant')}
                      title="Demote to Participant"
                      className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 border border-slate-600 transition-colors"
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Demote</span>
                    </button>
                  )}

                  <button
                    onClick={() => onAssignRole(p.userId, 'Host')}
                    title="Transfer Host Role"
                    className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[10px] flex items-center gap-1 border border-amber-500/30 transition-colors"
                  >
                    <Crown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveParticipant(p.userId)}
                    title="Remove from room"
                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[10px] flex items-center gap-1 border border-rose-500/30 transition-colors"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantList;
