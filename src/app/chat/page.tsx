"use client"
import { useState, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { formatDate } from '@/utils/helpers';

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
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Fetch chat history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
      setHistory(data.conversations || []);
    } catch (err: any) {
      setHistoryError(err.message || 'Failed to fetch history');
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
        (data.messages || []).map((msg: any) => ({
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: msg.timestamp,
        }))
      );
      setActiveConversation(conversationId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
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
      const formattedHistory = messages.map(msg => ({
        role: msg.isUser ? 'human' : 'ai',
        content: msg.content
      }));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          chat_history: formattedHistory,
          conversationId: activeConversation,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      const aiMessage: Message = {
        content: data.message,
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
    } catch (error: any) {
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    setMessages([]);
    setActiveConversation(null);
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
              <button
                key={chat.conversationId}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors text-sm mb-1 ${
                  activeConversation === chat.conversationId
                    ? 'bg-zinc-700 text-white shadow'
                    : 'bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
                onClick={() => fetchMessages(chat.conversationId)}
              >
                {formatDate(new Date(chat.updatedAt))}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800 text-zinc-400 text-xs text-center">Made with LangChain</div>
      </aside>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/30 bg-white/60 backdrop-blur-2xl overflow-hidden relative transition-all duration-300 my-8">
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
      </main>
    </div>
  );
} 