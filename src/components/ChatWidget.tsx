import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Headphones, ChevronRight, CircleCheck as CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getInitials } from '@/utils/helpers';
import type { ChatThread } from '@/types';

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts: string): string {
  const d = new Date(ts);
  const today = new Date('2026-10-08');
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = (todayDate.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function ChatWidget() {
  const { currentUser, partners, chatThreads, chatMessages, startChatThread, sendChatMessage, markThreadReadByPartner } = useApp();
  const [open, setOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [sentConfirm, setSentConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myThreads = currentUser?.partnerId
    ? chatThreads.filter(t => t.partnerId === currentUser.partnerId)
    : [];

  const activeThread = activeThreadId ? myThreads.find(t => t.id === activeThreadId) ?? null : null;
  const activeMessages = activeThreadId
    ? chatMessages.filter(m => m.threadId === activeThreadId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    if (open && activeThreadId && activeThread) {
      markThreadReadByPartner(activeThreadId);
    }
  }, [open, activeThreadId, activeThread, markThreadReadByPartner, chatMessages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const totalUnread = myThreads.reduce((s, t) => s + t.unreadByPartner, 0);

  const handleStartChat = () => {
    const subject = subjectInput.trim() || 'General Support';
    const id = startChatThread(subject);
    if (id) {
      setActiveThreadId(id);
      setShowNewChat(false);
      setSubjectInput('');
      sendChatMessage(id, `Hi, I need help with: ${subject}`, false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !activeThreadId) return;
    sendChatMessage(activeThreadId, input.trim(), false);
    setInput('');
  };

  if (!currentUser) return null;
  if (currentUser.role !== 'partner') return null;

  const partner = partners.find(p => p.id === currentUser.partnerId);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zubkas-700 text-white shadow-lg shadow-zubkas-700/30 transition-all hover:bg-zubkas-800 hover:scale-105 active:scale-95"
        aria-label="Open chat support"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[30rem] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-gray-100 bg-white shadow-2xl animate-slide-up overflow-hidden sm:w-96">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-zubkas-700 to-zubkas-800 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Headphones className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-display text-sm font-bold">Zubkas Support</p>
              <p className="text-[10px] text-zubkas-200">We typically reply within a few hours</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          {!activeThread && !showNewChat && (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="px-1 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Your Conversations</p>
              {myThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="rounded-full bg-gray-100 p-4 mb-3">
                    <MessageCircle className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a chat with our support team</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myThreads.map(t => {
                    const lastMsg = chatMessages
                      .filter(m => m.threadId === t.id)
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveThreadId(t.id)}
                        className="flex w-full items-start gap-3 rounded-xl border border-gray-100 p-3 text-left transition-all hover:border-zubkas-200 hover:bg-zubkas-50/40"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white">
                          {getInitials(t.partnerName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">{t.subject}</p>
                            {t.unreadByPartner > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-zubkas-700" />}
                          </div>
                          <p className="truncate text-xs text-gray-500 mt-0.5">{lastMsg?.text ?? 'No messages yet'}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                            <span className={`badge ${t.status === 'open' ? 'badge-success' : 'badge-neutral'}`}>{t.status}</span>
                            {lastMsg && <span>{formatDateLabel(lastMsg.timestamp)} · {formatTime(lastMsg.timestamp)}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setShowNewChat(true)}
                className="btn-primary mt-4 w-full"
              >
                <MessageCircle className="h-4 w-4" />
                Start New Chat
              </button>
            </div>
          )}

          {/* New chat form */}
          {!activeThread && showNewChat && (
            <div className="flex-1 overflow-y-auto p-4">
              <button onClick={() => setShowNewChat(false)} className="mb-3 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                <ChevronRight className="h-3 w-3 rotate-180" />
                Back to conversations
              </button>
              <div className="flex items-center gap-3 rounded-xl bg-zubkas-50 p-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white">
                  {getInitials(currentUser.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{partner?.company ?? ''}</p>
                </div>
              </div>
              <label className="text-sm font-medium text-gray-700">What do you need help with?</label>
              <input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleStartChat(); }}
                className="input-field mt-1"
                placeholder="e.g. Commission question, lead issue..."
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2">A support agent will respond to your message.</p>
              <button onClick={handleStartChat} className="btn-primary mt-4 w-full">
                <Send className="h-4 w-4" />
                Start Conversation
              </button>
            </div>
          )}

          {/* Active conversation */}
          {activeThread && (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
                <button onClick={() => setActiveThreadId(null)} className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                  <ChevronRight className="h-3 w-3 rotate-180" />
                  Back
                </button>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{activeThread.subject}</p>
                  <p className="text-[10px] text-gray-400">
                    {activeThread.status === 'open' ? 'Active conversation' : 'Closed'}
                  </p>
                </div>
                {activeThread.status === 'open' && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Online
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-4">
                {activeMessages.map((msg, i) => {
                  const isMe = msg.senderType === 'partner';
                  const prevMsg = activeMessages[i - 1];
                  const showDate = !prevMsg || formatDateLabel(prevMsg.timestamp) !== formatDateLabel(msg.timestamp);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <p className="text-center text-[10px] text-gray-400 my-2">{formatDateLabel(msg.timestamp)}</p>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] ${isMe ? '' : 'flex items-end gap-2'}`}>
                          {!isMe && (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zubkas-700 text-[10px] font-bold text-white">
                              ZS
                            </div>
                          )}
                          <div>
                            {!isMe && <p className="text-[10px] font-medium text-gray-500 mb-0.5">Zubkas Support</p>}
                            <div
                              className={`rounded-2xl px-3 py-2 text-sm ${
                                isMe
                                  ? 'bg-zubkas-700 text-white rounded-br-md'
                                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md'
                              }`}
                            >
                              {msg.text}
                            </div>
                            <p className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activeThread.status === 'closed' && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-xs text-gray-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    This conversation has been closed by support
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {activeThread.status === 'open' ? (
                <div className="flex items-center gap-2 border-t border-gray-100 p-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="input-field flex-1"
                    placeholder="Type a message..."
                    autoFocus
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-zubkas-700 text-white transition-all hover:bg-zubkas-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100 p-3">
                  <button onClick={() => { setActiveThreadId(null); setShowNewChat(true); }} className="btn-secondary w-full">
                    <MessageCircle className="h-4 w-4" />
                    Start New Conversation
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
