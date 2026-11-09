import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Search, CircleCheck as CheckCircle2, Circle as XCircle, Clock, Headphones, Inbox, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SectionHeader, EmptyState } from '@/components/Shared';
import { getInitials } from '@/utils/helpers';
import type { ChatThread } from '@/types';

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
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

function relativeTime(ts: string): string {
  const diff = (new Date('2026-10-08').getTime() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return formatDateLabel(ts);
}

export function AdminSupportChat() {
  const { chatThreads, chatMessages, sendChatMessage, markThreadReadBySupport, closeChatThread, reopenChatThread } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filtered = chatThreads.filter(t =>
    (t.partnerName.toLowerCase().includes(search.toLowerCase()) ||
      t.partnerCompany.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || t.status === statusFilter)
  ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const activeThread = activeThreadId ? chatThreads.find(t => t.id === activeThreadId) ?? null : null;
  const activeMessages = activeThreadId
    ? chatMessages.filter(m => m.threadId === activeThreadId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    if (activeThreadId && activeThread) {
      markThreadReadBySupport(activeThreadId);
    }
  }, [activeThreadId, activeThread, markThreadReadBySupport, chatMessages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length]);

  const handleSend = () => {
    if (!input.trim() || !activeThreadId) return;
    sendChatMessage(activeThreadId, input.trim(), true);
    setInput('');
  };

  const openCount = chatThreads.filter(t => t.status === 'open').length;
  const unreadCount = chatThreads.reduce((s, t) => s + t.unreadBySupport, 0);

  const handleSelectThread = (thread: ChatThread) => {
    setActiveThreadId(thread.id);
    markThreadReadBySupport(thread.id);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Support Chat" subtitle="View and respond to partner support conversations" />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <Inbox className="h-5 w-5 text-zubkas-700" />
            <span className="text-2xl font-display font-bold text-gray-900">{chatThreads.length}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Total Threads</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-2xl font-display font-bold text-gray-900">{openCount}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Open</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-display font-bold text-gray-900">{unreadCount}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Unread Messages</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-display font-bold text-gray-900">{chatThreads.filter(t => t.status === 'closed').length}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Closed</p>
        </div>
      </div>

      {chatThreads.length === 0 ? (
        <div className="card">
          <EmptyState icon={Headphones} title="No support conversations" message="When partners start a chat from their portal, conversations will appear here" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid lg:grid-cols-[340px_1fr] min-h-[28rem]">
            {/* Thread list */}
            <div className={`border-r border-gray-100 flex flex-col ${activeThreadId ? 'hidden lg:flex' : ''}`}>
              {/* Filters */}
              <div className="space-y-3 border-b border-gray-100 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  {(['all', 'open', 'closed'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${statusFilter === f ? 'bg-zubkas-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thread items */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No conversations found</p>
                ) : (
                  filtered.map(t => {
                    const lastMsg = chatMessages
                      .filter(m => m.threadId === t.id)
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                    const isActive = activeThreadId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectThread(t)}
                        className={`flex w-full items-start gap-3 border-b border-gray-50 p-3 text-left transition-colors ${isActive ? 'bg-zubkas-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white">
                            {getInitials(t.partnerName)}
                          </div>
                          {t.unreadBySupport > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zubkas-700 text-[10px] font-bold text-white ring-2 ring-white">
                              {t.unreadBySupport}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">{t.partnerName}</p>
                            <span className="text-[10px] text-gray-400 shrink-0">{relativeTime(t.lastMessageAt)}</span>
                          </div>
                          <p className="truncate text-xs text-gray-500">{t.subject}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`badge ${t.status === 'open' ? 'badge-success' : 'badge-neutral'}`}>{t.status}</span>
                            <p className="truncate text-[10px] text-gray-400">{lastMsg?.text ?? 'No messages'}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation view */}
            {activeThread ? (
              <div className="flex flex-col">
                {/* Conversation header */}
                <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                  <button onClick={() => setActiveThreadId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zubkas-700 text-xs font-bold text-white">
                    {getInitials(activeThread.partnerName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{activeThread.partnerName}</p>
                    <p className="truncate text-xs text-gray-500">{activeThread.partnerCompany} · {activeThread.subject}</p>
                  </div>
                  {activeThread.status === 'open' ? (
                    <button
                      onClick={() => closeChatThread(activeThread.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() => reopenChatThread(activeThread.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Reopen
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50/50 p-4" style={{ maxHeight: '24rem' }}>
                  {activeMessages.map((msg, i) => {
                    const isSupport = msg.senderType === 'support';
                    const prevMsg = activeMessages[i - 1];
                    const showDate = !prevMsg || formatDateLabel(prevMsg.timestamp) !== formatDateLabel(msg.timestamp);
                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <p className="text-center text-[10px] text-gray-400 my-2">{formatDateLabel(msg.timestamp)}</p>
                        )}
                        <div className={`flex ${isSupport ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[70%]">
                            {!isSupport && <p className="text-[10px] font-medium text-gray-500 mb-0.5">{msg.senderName}</p>}
                            <div
                              className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                                isSupport
                                  ? 'bg-zubkas-700 text-white rounded-br-md'
                                  : 'bg-white border border-gray-100 text-gray-700 rounded-bl-md'
                              }`}
                            >
                              {msg.text}
                            </div>
                            <p className={`text-[10px] text-gray-400 mt-0.5 ${isSupport ? 'text-right' : ''}`}>{formatTime(msg.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activeThread.status === 'closed' && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-xs text-gray-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      This conversation is closed
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
                      placeholder="Type a reply..."
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
                    <button onClick={() => reopenChatThread(activeThread.id)} className="btn-secondary w-full">
                      <Clock className="h-4 w-4" />
                      Reopen Conversation
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center justify-center lg:flex">
                <div className="text-center">
                  <div className="mx-auto mb-3 rounded-full bg-gray-100 p-4">
                    <MessageSquare className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Select a conversation</p>
                  <p className="text-xs text-gray-400 mt-1">Choose a thread from the list to view and reply</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
