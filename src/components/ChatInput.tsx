import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="flex gap-2 items-end bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl px-5 py-4 border border-white/40 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
        <div className="flex-1 relative">
          <textarea
            suppressHydrationWarning
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full p-3 pr-16 border-none outline-none bg-transparent resize-none min-h-[44px] max-h-32 text-base rounded-xl focus:ring-0 font-sans text-gray-900 placeholder-gray-400 placeholder:font-medium"
            rows={1}
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute right-2 bottom-2 p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl hover:scale-110 hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/60"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput; 