import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Smile, 
  Phone, 
  Video, 
  Sparkles, 
  Pin, 
  MoreVertical, 
  Bot, 
  Languages, 
  FileText,
  Search,
  Check,
  CheckCheck,
  Play,
  Pause,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { useCall } from '../context/CallContext';
import api from '../services/api';
import AudioRecorder from '../components/AudioRecorder';

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket, onlineStatusMap } = useSocketContext();
  const { startCall } = useCall();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [smartReplies, setSmartReplies] = useState([]);
  const [aiTone, setAiTone] = useState('professional');
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch user conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/chat/conversations');
        if (res.data?.success) {
          setConversations(res.data.data);
          if (res.data.data.length > 0) {
            setActiveConv(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Fetch conversations error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversations/${activeConv._id}/messages`);
        if (res.data?.success) {
          setMessages(res.data.data);
          fetchSmartReplies(res.data.data);
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('chat:join', { conversationId: activeConv._id });
    }

    return () => {
      if (socket) {
        socket.emit('chat:leave', { conversationId: activeConv._id });
      }
    };
  }, [activeConv, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket real-time event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (activeConv && newMsg.conversationId === activeConv._id) {
        setMessages(prev => [...prev, newMsg]);
        fetchSmartReplies([...messages, newMsg]);
      }
    };

    const handleReactionUpdate = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    };

    const handleTypingStatus = ({ conversationId, userId, username, isTyping }) => {
      if (activeConv && conversationId === activeConv._id && userId !== user?._id) {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          if (isTyping) updated.add(username || 'Someone');
          else updated.delete(username || 'Someone');
          return updated;
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:reaction-updated', handleReactionUpdate);
    socket.on('typing:status', handleTypingStatus);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:reaction-updated', handleReactionUpdate);
      socket.off('typing:status', handleTypingStatus);
    };
  }, [socket, activeConv, messages, user]);

  const fetchSmartReplies = async (currentMsgs) => {
    try {
      const res = await api.post('/ai/smart-replies', {
        messages: currentMsgs.slice(-4),
      });
      if (res.data?.success) {
        setSmartReplies(res.data.data);
      }
    } catch (err) {
      setSmartReplies(["Sounds good!", "I'll check this now.", "Let's do it! 🚀"]);
    }
  };

  const handleSendMessage = async (customContent = null) => {
    const textToSend = customContent || inputText;
    if (!textToSend.trim() || !activeConv) return;

    const payload = {
      conversationId: activeConv._id,
      sender: user?._id || user?.id,
      content: textToSend.trim(),
      type: 'text',
    };

    if (socket) {
      socket.emit('message:send', payload);
    } else {
      await api.post(`/chat/conversations/${activeConv._id}/messages`, payload);
    }

    setInputText('');
    stopTyping();
  };

  const handleSendVoiceNote = async ({ audioUrl, duration }) => {
    if (!activeConv) return;
    const payload = {
      conversationId: activeConv._id,
      sender: user?._id || user?.id,
      content: 'Voice note',
      type: 'voice',
      mediaUrl: audioUrl,
      audioDuration: duration,
    };

    if (socket) {
      socket.emit('message:send', payload);
    } else {
      await api.post(`/chat/conversations/${activeConv._id}/messages`, payload);
    }
    setIsRecordingAudio(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        const payload = {
          conversationId: activeConv._id,
          sender: user?._id || user?.id,
          content: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          mediaUrl: res.data.data.url,
          fileName: file.name,
          fileSize: file.size,
        };
        socket?.emit('message:send', payload);
      }
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (!socket || !activeConv) return;

    socket.emit('typing:start', {
      conversationId: activeConv._id,
      userId: user?._id || user?.id,
      username: user?.displayName || user?.username,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(), 2000);
  };

  const stopTyping = () => {
    if (socket && activeConv) {
      socket.emit('typing:stop', {
        conversationId: activeConv._id,
        userId: user?._id || user?.id,
      });
    }
  };

  const handleAIRewrite = async (tone) => {
    if (!inputText.trim()) return;
    try {
      const res = await api.post('/ai/rewrite', { text: inputText, tone });
      if (res.data?.success) {
        setInputText(res.data.data.rewritten);
      }
    } catch (err) {
      console.error('AI Rewrite error:', err);
    } finally {
      setShowToneMenu(false);
    }
  };

  const handleAITranslate = async (targetLanguage) => {
    if (!inputText.trim()) return;
    try {
      const res = await api.post('/ai/translate', { text: inputText, targetLanguage });
      if (res.data?.success) {
        setInputText(res.data.data.translated);
      }
    } catch (err) {
      console.error('AI Translation error:', err);
    } finally {
      setShowTranslateMenu(false);
    }
  };

  const handleSummarizeThread = async () => {
    try {
      const res = await api.post('/ai/summarize', { messages });
      if (res.data?.success) {
        setSummaryModal(res.data.data);
      }
    } catch (err) {
      console.error('Summarize error:', err);
    }
  };

  const handleReact = (messageId, emoji) => {
    if (socket && activeConv) {
      socket.emit('message:react', {
        messageId,
        conversationId: activeConv._id,
        emoji,
        userId: user?._id || user?.id,
      });
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participantDetails) return null;
    return conv.participantDetails.find(p => p._id !== (user?._id || user?.id)) || conv.participantDetails[0];
  };

  const partner = getOtherParticipant(activeConv);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Left Chat List Column */}
      <div className="w-80 bg-vyntra-card/60 border-r border-vyntra-border/60 flex flex-col h-full select-none">
        {/* Search header */}
        <div className="p-4 border-b border-vyntra-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Direct Messages</h2>
            <button className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-vyntra-surface/50 border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            const isSelected = activeConv?._id === conv._id;
            return (
              <button
                key={conv._id}
                onClick={() => setActiveConv(conv)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                  isSelected
                    ? 'bg-vyntra-accent/15 border border-vyntra-accent/30 shadow-glow-sm'
                    : 'hover:bg-vyntra-surface/40 text-slate-300'
                }`}
              >
                <div className="relative">
                  <img
                    src={other?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=vyntra'}
                    alt="Avatar"
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-vyntra-bg ${
                    other?.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white truncate">{other?.displayName || 'User'}</h4>
                    <span className="text-[10px] text-slate-500 font-mono">12:40 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {conv.lastMessageDetail?.content || 'Tap to start conversation'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-vyntra-bg/40 min-w-0">
        {activeConv ? (
          <>
            {/* Chat Top Header */}
            <div className="h-16 px-6 border-b border-vyntra-border/60 bg-vyntra-card/50 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={partner?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=vyntra'}
                    alt="Partner"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-vyntra-bg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{partner?.displayName || 'User'}</h3>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    {partner?.status === 'online' ? '● Online' : 'Active recently'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Voice / Video Call & AI Summarizer */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSummarizeThread}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="AI Summarize Thread"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Summarize</span>
                </button>

                <button
                  onClick={() => partner && startCall(partner, 'audio')}
                  className="p-2 rounded-xl bg-vyntra-surface/60 hover:bg-vyntra-surface text-slate-300 hover:text-white border border-white/5 transition-colors"
                  title="Start Voice Call"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => partner && startCall(partner, 'video')}
                  className="p-2 rounded-xl bg-vyntra-surface/60 hover:bg-vyntra-surface text-slate-300 hover:text-white border border-white/5 transition-colors"
                  title="Start Video Call"
                >
                  <Video className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === (user?._id || user?.id);
                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderDetail?.avatar || partner?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                        alt="Sender"
                        className="w-7 h-7 rounded-full object-cover mb-1"
                      />
                    )}

                    <div className="max-w-md space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                          isMe
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-glow-sm'
                            : 'bg-vyntra-card border border-white/10 text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {/* Message Content rendering according to type */}
                        {msg.type === 'voice' ? (
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                            <div className="flex-1 flex items-center gap-1">
                              {[30, 60, 90, 40, 80, 50, 95, 70, 40, 60].map((h, i) => (
                                <span key={i} style={{ height: `${h}%` }} className="w-1 bg-white/80 rounded-full h-4" />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-white/80">{msg.audioDuration || 4}s</span>
                          </div>
                        ) : msg.type === 'image' ? (
                          <div className="space-y-1.5">
                            <img src={msg.mediaUrl} alt="Attached" className="rounded-xl max-h-60 w-full object-cover" />
                            <p>{msg.content}</p>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}

                        {/* Quick Reaction Toolbar on Hover */}
                        <div className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-vyntra-card border border-white/10 px-2 py-1 rounded-full shadow-lg z-10`}>
                          {['🔥', '❤️', '🚀', '♟️', '👍'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReact(msg._id, emoji)}
                              className="text-xs hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reactions display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {msg.reactions.map((r, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleReact(msg._id, r.emoji)}
                              className="text-[11px] bg-vyntra-surface/80 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-white/10"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-slate-300 font-mono text-[10px]">{r.users.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="px-6 py-1 text-xs text-indigo-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>{Array.from(typingUsers).join(', ')} is typing...</span>
              </div>
            )}

            {/* AI Smart Replies Bar */}
            {smartReplies.length > 0 && (
              <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto select-none border-t border-white/5 bg-vyntra-card/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0">Smart Replies:</span>
                {smartReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 hover:text-white border border-indigo-500/30 whitespace-nowrap transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Input Area */}
            <div className="p-4 border-t border-vyntra-border/60 bg-vyntra-card/80 backdrop-blur-md space-y-2">
              {isRecordingAudio ? (
                <AudioRecorder
                  onSend={handleSendVoiceNote}
                  onCancel={() => setIsRecordingAudio(false)}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl hover:bg-vyntra-surface text-slate-400 hover:text-white transition-colors"
                    title="Attach File or Image"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleTyping}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Message ${partner?.displayName || 'here'}...`}
                      className="w-full bg-vyntra-surface/50 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />

                    {/* AI Tone Rewrite / Translate Action Chips inside Input */}
                    {inputText.trim() && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {/* Rewrite Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowToneMenu(!showToneMenu)}
                            className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-[11px] flex items-center gap-1 font-semibold"
                            title="AI Tone Rewrite"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Tone</span>
                          </button>
                          {showToneMenu && (
                            <div className="absolute right-0 bottom-8 w-36 bg-vyntra-card border border-vyntra-border rounded-xl p-1 shadow-2xl z-20">
                              {['Professional', 'Casual', 'Concise', 'Friendly', 'Cyberpunk'].map((t) => (
                                <button
                                  key={t}
                                  onClick={() => handleAIRewrite(t)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-vyntra-surface rounded-lg"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Translate Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowTranslateMenu(!showTranslateMenu)}
                            className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] flex items-center gap-1 font-semibold"
                            title="AI Translate"
                          >
                            <Languages className="w-3 h-3" />
                            <span>Translate</span>
                          </button>
                          {showTranslateMenu && (
                            <div className="absolute right-0 bottom-8 w-36 bg-vyntra-card border border-vyntra-border rounded-xl p-1 shadow-2xl z-20">
                              {['Spanish', 'French', 'German', 'Japanese', 'Hindi'].map((l) => (
                                <button
                                  key={l}
                                  onClick={() => handleAITranslate(l)}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-vyntra-surface rounded-lg"
                                >
                                  {l}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsRecordingAudio(true)}
                    className="p-2.5 rounded-xl hover:bg-vyntra-surface text-slate-400 hover:text-white transition-colors"
                    title="Record Voice Note"
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold disabled:opacity-40 transition-all shadow-glow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-600" />
            <p className="text-sm font-medium">Select a conversation to start real-time messaging</p>
          </div>
        )}
      </div>

      {/* AI Summary Modal Popup */}
      {summaryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-vyntra-card border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span>AI Conversation Summary</span>
              </h3>
              <button onClick={() => setSummaryModal(null)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed font-light">{summaryModal.summary}</p>
              
              {summaryModal.keyPoints?.length > 0 && (
                <div className="space-y-1">
                  <h4 className="font-bold text-white">Key Points:</h4>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {summaryModal.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                  </ul>
                </div>
              )}

              {summaryModal.actionItems?.length > 0 && (
                <div className="space-y-1 pt-2">
                  <h4 className="font-bold text-white">Action Items:</h4>
                  <div className="space-y-1.5">
                    {summaryModal.actionItems.map((act, i) => (
                      <div key={i} className="p-2 rounded-xl bg-vyntra-surface/40 border border-white/5 flex items-center justify-between">
                        <span>{act.task}</span>
                        <span className="font-mono text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {act.person}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSummaryModal(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
