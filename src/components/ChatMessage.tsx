import React from 'react';
import { formatDate } from '@/utils/helpers';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string; // Accept ISO string
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  return (
    <div className={`flex items-end gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeInSlide`}> 
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white/60">
          🤖
        </div>
      )}
      <div className="flex flex-col max-w-[70%]">
        <div
          className={`px-6 py-4 rounded-3xl shadow-xl text-base whitespace-pre-line break-words font-sans transition-all duration-200 ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-br-2xl ml-auto border border-blue-200/30'
              : 'bg-white/60 backdrop-blur-md text-gray-900 rounded-bl-2xl mr-auto border border-white/40'
          }`}
          style={
            !isUser
              ? { boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)', backdropFilter: 'blur(8px)' }
              : { boxShadow: '0 4px 24px 0 rgba(80,80,180,0.10)' }
          }
        >
          {message}
        </div>
        <span className={`text-xs mt-2 px-2 ${isUser ? 'text-blue-200 text-right' : 'text-gray-500 text-left'} font-medium`}> 
          {formatDate(new Date(timestamp))}
        </span>
      </div>
      {/* User Avatar */}
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white/60">
          <span>N</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 