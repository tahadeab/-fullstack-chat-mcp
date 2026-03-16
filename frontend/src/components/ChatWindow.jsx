import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { messagesAPI } from '../api';

export default function ChatWindow() {
  const { activeConversation, messages, sendMessage, startTyping, stopTyping, fetchMessages } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation?.id]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      startTyping(activeConversation.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(activeConversation.id);
    }, 1000);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !activeConversation) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsTyping(false);
    stopTyping(activeConversation.id);

    await sendMessage(activeConversation.id, content);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Welcome to Chat</h2>
          <p>Select a conversation or start a new chat</p>
        </div>
      </div>
    );
  }

  const getOtherParticipant = () => {
    if (activeConversation.type === 'group') return null;
    return activeConversation.participants.find(
      (p) => p.user.id !== useStore.getState().user?.id
    )?.user;
  };

  const otherUser = getOtherParticipant();

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
            {otherUser?.username?.[0]?.toUpperCase() || 'G'}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {otherUser?.username || activeConversation.name || 'Group Chat'}
            </h2>
            <p className="text-sm text-gray-500">
              {otherUser?.status === 'online' ? (
                <span className="text-green-500">●</span>
              ) : (
                <span className="text-gray-400">●</span>
              )}{' '}
              {otherUser?.status || 'offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isOwn = message.senderId === useStore.getState().user?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-item`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                {!isOwn && activeConversation.type === 'group' && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.sender.username}
                  </p>
                )}
                <p className="break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? 'opacity-75' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-full font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
