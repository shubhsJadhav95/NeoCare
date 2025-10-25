import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  TrashIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import drNeo from '../assets/images/DRNEO.png';
import axios from 'axios';
import { AI_BASE_URL } from '../config.js';
import { authContext } from '../context/AuthContext.jsx';

const DrNeoChatbot = () => {
  const { user, token } = useContext(authContext);

  // Storage key for conversations
  const CHAT_STORAGE_KEY = 'drneo_chat_conversation';

  // Load initial messages from backend for logged-in users or localStorage for guests
  const loadInitialMessages = async () => {
    if (token && user) {
      // User is logged in - load from backend
      try {
        const response = await axios.get(`${AI_BASE_URL}/chat/get-conversation/${user.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.messages || [
          {
            id: 1,
            text: "Hello! I'm Dr.NEO, your AI healthcare assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
          }
        ];
      } catch (error) {
        console.error('Error loading conversation from backend:', error);
        // Fallback to default message if backend fails
        return [
          {
            id: 1,
            text: "Hello! I'm Dr.NEO, your AI healthcare assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
          }
        ];
      }
    } else {
      // User is not logged in - load from localStorage
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Validate that messages have required properties
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            return parsedMessages;
          }
        } catch (error) {
          console.error('Error parsing saved messages:', error);
        }
      }
      return [
        {
          id: 1,
          text: "Hello! I'm Dr.NEO, your AI healthcare assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ];
    }
  };

  // Save conversation to backend for logged-in users
  const saveConversationToBackend = async (messagesToSave) => {
    if (token && user) {
      try {
        await axios.post(`${AI_BASE_URL}/chat/save-conversation`, {
          userEmail: user.email,
          messages: messagesToSave
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error saving conversation to backend:', error);
      }
    }
  };

  // State declarations (moved before useEffect hooks)
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize messages on component mount
  useEffect(() => {
    const initializeMessages = async () => {
      const initialMessages = await loadInitialMessages();
      setMessages(initialMessages);
    };

    initializeMessages();
  }, [token, user]); // Re-initialize when auth state changes

  // Save messages to localStorage whenever they change (only for non-logged-in users)
  useEffect(() => {
    if (!token && !user) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } else if (token && user) {
      // Save to backend for logged-in users
      saveConversationToBackend(messages);
    }
  }, [messages, token, user]);

  // Clear localStorage when user logs in
  useEffect(() => {
    if (token && user) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [token, user]);

  const generateBotResponse = async (userMessage) => {
    setIsThinking(true);

    try {
      const response = await axios.post(`${AI_BASE_URL}/chat/message`, {
        message: userMessage
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setIsThinking(false);

      const botMessage = {
        id: Date.now(), // Use timestamp for unique ID
        text: response.data.response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save to localStorage for non-logged-in users
      if (!token && !user) {
        const updatedMessages = [...messages, botMessage];
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
      }
    } catch (error) {
      setIsThinking(false);

      let errorMessage = "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again later.";

      if (error.message.includes('Network Error')) {
        errorMessage = "Unable to connect to the AI service. Please make sure the AI service is running.";
      } else if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
          // Optionally redirect to login
          window.location.href = '/login';
        } else {
          errorMessage = error.response.data.error || "An error occurred while processing your request.";
        }
      }

      const botMessage = {
        id: Date.now(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save error message to localStorage for non-logged-in users
      if (!token && !user) {
        const updatedMessages = [...messages, botMessage];
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue.trim();
    setInputValue('');

    // Generate bot response using AI service
    try {
      await generateBotResponse(currentMessage);
    } catch (error) {
      console.error('Error generating bot response:', error);
    }
  };

  const clearChat = () => {
    const initialMessage = {
      id: 1,
      text: "Hello! I'm Dr.NEO, your AI healthcare assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages([initialMessage]);

    // Clear localStorage for non-logged-in users
    if (!token && !user) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify([initialMessage]));
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show login prompt if user is not authenticated
  if (!token && !user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <img src={drNeo} alt="DrNeo" className="object-contain w-32 h-32 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Dr.NEO</h1>
          <p className="text-gray-600 mb-6">
            Your conversation will be saved locally until you log in. Sign in to save your conversations permanently and access more features.
          </p>
          <div className="space-y-3">
            <a href="/login">
              <button className="w-full bg-primaryColor py-3 px-6 text-white font-[600] rounded-[50px] hover:bg-blue-700 transition">
                Login to Continue
              </button>
            </a>
            <a href="/register">
              <button className="w-full bg-gray-200 text-primaryColor py-3 px-6 font-[600] rounded-[50px] hover:bg-gray-300 transition">
                Register New Account
              </button>
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            💾 Your current conversation is saved locally and will persist until you log in
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 p-4"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={drNeo} alt="DrNeo" className="object-contain w-24 h-24 sm:w-36 sm:h-36" />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dr.NEO – Your AI Healthcare Assistant</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                  <WifiIcon className="w-4 h-4" /> Online
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              {user && (
                <div className="text-xs text-gray-500 mt-1">
                  Welcome back, {user.name || user.email}! Your conversation is secure.
                </div>
              )}
            </div>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-gray-600 hover:text-white hover:bg-red-500 rounded-lg transition-colors duration-150"
            title="Clear Chat"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  {message.sender === 'bot' && (
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                    >
                      <span className="text-white font-bold text-sm">🧠</span>
                    </motion.div>
                  )}

                  {/* Message Bubble */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`relative px-4 py-3 rounded-2xl shadow ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {/* Message Text with Typewriter Effect */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm leading-relaxed"
                    >
                      {message.text}
                    </motion.div>

                    {/* Timestamp */}
                    <div className={`text-xs mt-2 opacity-70 ${
                      message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>

                    {/* Message Tail */}
                    <div className={`absolute top-4 ${
                      message.sender === 'user'
                        ? 'right-[-8px] border-l-[8px] border-l-indigo-600 border-y-[8px] border-y-transparent'
                        : 'left-[-8px] border-r-[8px] border-r-white border-y-[8px] border-y-transparent'
                    }`} />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking Animation */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-sm">🧠</span>
                  </motion.div>

                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 px-4 py-3 rounded-2xl shadow-lg border border-gray-600/30">
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-2 h-2 bg-blue-400 rounded-full"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.2
                        }}
                        className="w-2 h-2 bg-purple-400 rounded-full"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.4
                        }}
                        className="w-2 h-2 bg-indigo-400 rounded-full"
                      />
                      <span className="text-sm text-gray-400 ml-2">Dr.NEO is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Typing Animation */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-sm">🧠</span>
                  </motion.div>

                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 px-4 py-3 rounded-2xl shadow-lg border border-gray-600/30">
                    <div className="flex items-center space-x-1">
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-sm text-gray-400"
                      >
                        Dr.NEO is typing
                      </motion.span>
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-gray-400"
                      >
                        ...
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 bg-white border-t border-gray-200"
        >
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your health-related question here..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none transition-all duration-200"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!inputValue.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </motion.button>
          </form>

          <div className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send • Shift + Enter for new line
            {!token && !user && (
              <span className="block text-green-600 font-medium mt-1">
                💾 Conversation saved locally • Login to save permanently
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DrNeoChatbot;
