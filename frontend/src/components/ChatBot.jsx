import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();

  const userId = localStorage.getItem('userId') || '1'; // Default backup
  const userRole = localStorage.getItem('role') || 'INITIATOR';

  const getRoleColors = () => {
    switch (userRole.toUpperCase()) {
      case 'ADMIN': return { header: 'from-purple-600 to-purple-800', bot: 'from-purple-500 to-purple-600', text: 'text-purple-600', button: 'from-purple-500 to-purple-600', hover: 'hover:to-purple-700' };
      case 'INITIATOR': return { header: 'from-blue-600 to-blue-800', bot: 'from-blue-500 to-blue-600', text: 'text-blue-600', button: 'from-blue-500 to-blue-600', hover: 'hover:to-blue-700' };
      case 'MANAGER': return { header: 'from-orange-500 to-orange-700', bot: 'from-orange-400 to-orange-500', text: 'text-orange-600', button: 'from-orange-500 to-orange-600', hover: 'hover:to-orange-700' };
      case 'FINANCE': return { header: 'from-green-600 to-green-800', bot: 'from-green-500 to-green-600', text: 'text-green-600', button: 'from-green-500 to-green-600', hover: 'hover:to-green-700' };
      case 'AUDITOR': return { header: 'from-gray-700 to-gray-900', bot: 'from-gray-600 to-gray-700', text: 'text-gray-700', button: 'from-gray-600 to-gray-700', hover: 'hover:to-gray-800' };
      default: return { header: 'from-indigo-600 to-purple-600', bot: 'from-indigo-500 to-purple-600', text: 'text-indigo-600', button: 'from-indigo-500 to-purple-600', hover: 'hover:to-purple-700' };
    }
  };

  const colors = getRoleColors();

  // Welcome message
  useEffect(() => {
    const welcomeMsg = `Hey ${userRole}! 👋 I'm your Workflow Assistant. How can I help you today?`;
    setMessages([{ id: 1, text: welcomeMsg, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  }, [userRole]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const clearChat = () => {
    const welcomeMsg = `Hey ${userRole}! 👋 I'm your Workflow Assistant. How can I help you today?`;
    setMessages([{ id: Date.now(), text: welcomeMsg, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8080/api/chat', {
        userId: parseInt(userId),
        role: userRole,
        message: currentInput
      }, { timeout: 60000 });

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: res.data.response,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setLoading(false);
      }, 500); // reduced simulated delay
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Oops! I encountered a system error trying to fetch your data. Please try again.",
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setLoading(false);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Convert markdown-like bold to html
  const renderMessageContent = (text) => {
    if (!text) return null;
    let formattedText = text;
    // Simple basic markdown parser for **text** -> <strong>text</strong>
    const parts = formattedText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Do not render on home, login, and signup
  const hideOnRoutes = ['/', '/login', '/signup'];
  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="chatbot-container fixed bottom-6 right-6 z-[9999] pointer-events-auto font-sans flex flex-col items-end transition-all duration-300">

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window origin-bottom-right bg-white/95 backdrop-blur-2xl shadow-2xl shadow-blue-500/10 border border-gray-200 rounded-3xl w-96 h-[550px] flex flex-col overflow-hidden animate-popup max-w-[95vw] max-h-[90vh] transition-all hover:shadow-blue-500/20">

          {/* Header */}
          <div className={`chat-header bg-gradient-to-r ${colors.header} text-white p-6 pb-4 relative overflow-hidden flex-shrink-0`}>
            <div className="absolute inset-0 bg-white/10" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Workflow Assistant</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs font-medium text-white/90 uppercase">{userRole}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={clearChat}
                  title="Clear Chat"
                  className="p-2 hover:bg-white/20 hover:rotate-12 active:scale-95 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button
                  onClick={toggleChat}
                  title="Close"
                  className="p-2 hover:bg-white/20 hover:-rotate-90 active:scale-95 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container flex-1 p-5 overflow-y-auto space-y-5 bg-gray-50/50 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
                {msg.sender === 'bot' && (
                  <div className={`avatar-bot w-8 h-8 rounded-full bg-gradient-to-br ${colors.bot} flex items-center justify-center mr-2 shadow-sm flex-shrink-0 mt-1`}>
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                )}

                <div className={`message max-w-[80%] p-3.5 rounded-2xl shadow-sm border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default ${msg.sender === 'user'
                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 ml-12 rounded-tr-sm border-gray-200'
                  : 'bg-white border-gray-100 rounded-tl-sm mr-12'}`}>
                  <p className="text-[14px] leading-relaxed whitespace-pre-line text-gray-700">
                    {renderMessageContent(msg.text)}
                  </p>
                  <span className="text-[10px] mt-1.5 block text-gray-400 font-medium text-right">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fadeInUp">
                <div className={`avatar-bot w-8 h-8 rounded-full bg-gradient-to-br ${colors.bot} flex items-center justify-center mr-2 shadow-sm flex-shrink-0 mt-1`}>
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-3.5 mr-12 shadow-sm min-w-[120px]">
                  <p className={`text-xs ${colors.text} font-medium mb-1.5`}>Workflow Assistant is typing...</p>
                  <div className="typing-dots flex space-x-1 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce bg-current ${colors.text}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce bg-current ${colors.text}`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce bg-current ${colors.text}`} style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-end space-x-2 bg-gray-50 border border-gray-200 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100 rounded-2xl p-2 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your workflows..."
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 py-2 px-3 text-sm resize-none h-[40px] max-h-[100px] overflow-y-auto transition-all duration-200"
                disabled={loading}
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`send-btn w-10 h-10 bg-gradient-to-r ${colors.button} ${colors.hover} text-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0 mb-0.5`}
              >
                <svg className="w-4 h-4 transform rotate-45 -ml-1 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400 font-medium">Enterprise Rules Engine • Internal Network</span>
            </div>
          </div>
        </div>
      )}

      {/* FAB - Using dynamic headers */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className={`fab w-14 h-14 bg-gradient-to-r ${colors.header} text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center relative overflow-hidden group hover:rotate-6`}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse opacity-50 group-hover:opacity-100 group-hover:animate-none" />
          <svg className="w-7 h-7 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      <style jsx>{`
        @keyframes popup {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          50% { transform: scale(1.02) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar { width: 5px; }
        .scrollbar-hide::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-hide::-webkit-scrollbar-thumb { 
          background: #e2e8f0; 
          border-radius: 10px; 
        }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        @media (max-width: 640px) {
          .chat-window { 
            width: calc(100vw - 2rem) !important; 
            height: calc(100vh - 6rem) !important; 
            max-height: 85vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
