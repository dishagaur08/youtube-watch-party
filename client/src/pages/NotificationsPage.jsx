import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, MessageSquare, UserPlus, Phone, Trophy, Sparkles } from 'lucide-react';
import api from '../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (err) {
      console.error('Clear notifications error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full select-none">
      <div className="flex items-center justify-between pb-4 border-b border-vyntra-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-400" />
            <span>Notification Command Center</span>
          </h2>
          <p className="text-xs text-slate-400">Activity updates, friend invites & real-time alerts</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-3xl space-y-2">
            <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-300">You're all caught up!</p>
            <p>No unread notifications.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className="p-4 rounded-2xl bg-vyntra-card border border-white/5 flex items-center justify-between gap-4 shadow-sm hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{n.title}</h4>
                  <p className="text-xs text-slate-300">{n.body}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Just now</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
