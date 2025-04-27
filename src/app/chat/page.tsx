"use client"
import { useState } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Format chat history for the API
      const formattedHistory = messages.map(msg => ({
        role: msg.isUser ? 'human' : 'ai',
        content: msg.content
      }));

      console.log('Sending chat history:', formattedHistory);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          chat_history: formattedHistory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const aiMessage: Message = {
        content: data.message,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[90vh]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 rounded-t-2xl flex items-center gap-2 px-6 py-4 shadow-sm">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow">
          <span>🤖</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">AI Chat Assistant</h1>
      </header>

      {/* Chat Card */}
      <div className="flex-1 overflow-y-auto p-6 bg-white/70 rounded-b-2xl shadow-xl backdrop-blur-md border border-gray-200 flex flex-col gap-2">
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
      <div className="bg-white/80 backdrop-blur rounded-b-2xl border-t border-gray-200 shadow-sm sticky bottom-0 z-10">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
} 