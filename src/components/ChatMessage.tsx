import React from 'react';
import { formatDate } from '@/utils/helpers';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string; // Accept ISO string
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow">
          🤖
        </div>
      )}
      <div className="flex flex-col max-w-[70%]">
        <div
          className={`px-4 py-2 rounded-2xl shadow-md text-base whitespace-pre-line break-words transition-all duration-200 ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-md ml-auto'
              : 'bg-white text-gray-900 rounded-bl-md mr-auto border border-gray-200'
          }`}
        >
          {message}
        </div>
        <span className={`text-xs mt-1 px-2 ${isUser ? 'text-blue-400 text-right' : 'text-gray-400 text-left'}`}>
          {formatDate(new Date(timestamp))}
        </span>
      </div>
      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow">
          <span>N</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 