"use client"
import { useState, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { FaTrash, FaPen } from 'react-icons/fa';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface Conversation {
  _id: string;
  conversationId: string;
  updatedAt: string;
  createdAt: string;
  preview?: string;
  assistantPreview?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Add URL handling for conversation persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get('conversation');
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, []);

  // Update URL when conversation changes
  useEffect(() => {
    if (activeConversation) {
      const url = new URL(window.location.href);
      url.searchParams.set('conversation', activeConversation);
      window.history.replaceState({}, '', url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('conversation');
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeConversation]);

  // Fetch chat history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
      setHistory(data.conversations || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setHistoryError(errorMessage);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history?conversationId=${conversationId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch messages');
      setMessages(
        (data.messages || []).map((msg: { content: string; role: string; timestamp: string }) => ({
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: msg.timestamp,
        }))
      );
      setActiveConversation(conversationId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const userMessage: Message = {
        content: message,
        isUser: true,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId: activeConversation,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      const aiMessage: Message = {
        content: data.text,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      // If this was a new conversation, update activeConversation and refresh history
      if (!activeConversation && data.conversationId) {
        setActiveConversation(data.conversationId);
        fetchHistory();
      } else {
        fetchHistory(); // Always refresh sidebar after sending
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    setMessages([]);
    setActiveConversation(null);
    // Clear the URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('conversation');
    window.history.replaceState({}, '', url.toString());
  };

  // Add delete and rename handlers
  const handleDeleteConversation = async (conversationId: string) => {
    // Optimistically remove from UI
    setHistory(prev => prev.filter(c => c.conversationId !== conversationId));
    if (activeConversation === conversationId) {
      setMessages([]);
      setActiveConversation(null);
    }
    await fetch(`/api/history?conversationId=${conversationId}`, { method: 'DELETE' });
    fetchHistory();
  };

  const handleRenameConversation = async (conversationId: string, currentPreview: string) => {
    const newTitle = prompt('Enter a new title for this conversation:', currentPreview || '');
    if (newTitle && newTitle.trim()) {
      await fetch(`/api/history?conversationId=${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview: newTitle.trim() }),
      });
      fetchHistory();
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-50 via-white to-purple-100">
      {/* Sidebar */}
      <aside className="w-72 min-w-[16rem] max-w-xs h-screen flex flex-col bg-[#18181b] border-r border-zinc-800 shadow-2xl z-20">
        <div className="flex items-center gap-3 px-6 py-7 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow">
            🤖
          </div>
          <span className="text-lg font-bold text-white tracking-tight">AI Chat</span>
        </div>
        <button
          className="m-4 py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition-transform"
          onClick={handleNewChat}
        >
          + New Chat
        </button>
        <div className="flex-1 overflow-y-auto px-2">
          <div className="mt-2 flex flex-col gap-1">
            {historyLoading && <div className="text-zinc-400 px-4 py-2">Loading...</div>}
            {historyError && <div className="text-red-400 px-4 py-2">{historyError}</div>}
            {!historyLoading && !historyError && history.length === 0 && (
              <div className="text-zinc-400 px-4 py-2">No conversations yet.</div>
            )}
            {history.map((chat) => (
              <div key={chat.conversationId} className="flex items-center group">
                <button
                  className={`flex-1 text-left px-4 py-3 rounded-lg font-medium transition-colors text-sm mb-1 flex flex-col items-start gap-1 overflow-hidden ${
                    activeConversation === chat.conversationId
                      ? 'bg-zinc-700 text-white shadow'
                      : 'bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                  onClick={() => fetchMessages(chat.conversationId)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shadow">
                      🤖
                    </div>
                    <span className="truncate w-36 font-semibold">
                      {chat.preview ? (chat.preview.length > 32 ? chat.preview.slice(0, 32) + '…' : chat.preview) : 'New Chat'}
                    </span>
                  </div>
                  {chat.assistantPreview && (
                    <span className="truncate w-44 text-xs text-zinc-400">
                      {chat.assistantPreview.length > 44 ? chat.assistantPreview.slice(0, 44) + '…' : chat.assistantPreview}
                    </span>
                  )}
                </button>
                <button
                  className="ml-1 p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(chat.conversationId);
                  }}
                >
                  <FaTrash size={13} />
                </button>
                <button
                  className="ml-1 p-1 text-zinc-400 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"
                  title="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameConversation(chat.conversationId, chat.preview || '');
                  }}
                >
                  <FaPen size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800 text-zinc-400 text-xs text-center">Made with LangChain</div>
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen bg-transparent">
        <div className="h-full w-full flex flex-col">
          <div className="flex flex-col h-full w-full shadow-2xl border border-white/30 bg-white/60 backdrop-blur-2xl overflow-hidden relative transition-all duration-300 m-0">
            {/* Header */}
            <header className="flex items-center gap-4 px-10 py-7 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg relative z-10" style={{boxShadow: '0 4px 32px 0 rgba(80,80,180,0.10)'}}>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl shadow-inner border-2 border-white/30">
                <span role="img" aria-label="bot">🤖</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-extrabold tracking-tight font-sans">AI Chat Assistant</h1>
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                  </span>
                  Online
                </span>
              </div>
            </header>
            {/* Chat Card */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5 bg-gradient-to-b from-white/70 to-purple-50/60">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Start a conversation by sending a message.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage
                    key={idx}
                    message={msg.content}
                    isUser={msg.isUser}
                    timestamp={msg.timestamp}
                  />
                ))
              )}
              {isLoading && (
                <div className="flex items-center gap-2 mt-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow">
                    🤖
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-24 h-3 bg-gray-200 rounded-full" />
                    <div className="w-16 h-3 bg-gray-200 rounded-full" />
                  </div>
                </div>
              )}
              {error && (
                <div className="mt-2 p-3 bg-red-100 text-red-700 rounded-lg">
                  <p className="font-medium">Error:</p>
                  <p>{error}</p>
                </div>
              )}
            </div>
            {/* Input */}
            <div className="bg-white/70 backdrop-blur-xl border-t border-white/30 shadow-xl sticky bottom-0 z-10 px-8 py-5">
              <ChatInput onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 