'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiUser, FiCpu, FiPlus, FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: Message[];
}

const AIAssistant = () => {
  const { t } = useTranslation('aiAssistant');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'default',
      title: t('defaultConversationTitle'),
      lastUpdated: new Date(),
      messages: []
    }
  ]);
  
  const [activeConversationId, setActiveConversationId] = useState('default');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  
  // Get the active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation.messages]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConversation: Conversation = {
      id: newId,
      title: t('newConversationTitle'),
      lastUpdated: new Date(),
      messages: []
    };
    
    setConversations([...conversations, newConversation]);
    setActiveConversationId(newId);
    setShowConversations(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    // Update conversation with user message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          lastUpdated: new Date()
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    setInput('');
    setIsTyping(true);
    
    try {
      // In a real app, this would be an API call to your backend
      // For demo purposes, we'll simulate a response after a delay
      setTimeout(() => {
        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: getSimulatedResponse(input.trim()),
          timestamp: new Date()
        };
        
        setConversations(prevConversations => {
          return prevConversations.map(conv => {
            if (conv.id === activeConversationId) {
              // Update conversation title if it's the first message
              const newTitle = conv.messages.length === 1 
                ? truncateTitle(userMessage.content) 
                : conv.title;
                
              return {
                ...conv,
                title: newTitle,
                messages: [...conv.messages, assistantMessage],
                lastUpdated: new Date()
              };
            }
            return conv;
          });
        });
        
        setIsTyping(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  // Helper function to truncate message for conversation title
  const truncateTitle = (message: string) => {
    return message.length > 30 ? `${message.substring(0, 30)}...` : message;
  };

  // Simulated AI response based on user input
  const getSimulatedResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return t('responses.greeting');
    } else if (lowerInput.includes('tax') && lowerInput.includes('deduction')) {
      return t('responses.taxDeduction');
    } else if (lowerInput.includes('80c')) {
      return t('responses.section80C');
    } else if (lowerInput.includes('deadline') || lowerInput.includes('due date')) {
      return t('responses.taxDeadline');
    } else if (lowerInput.includes('regime')) {
      return t('responses.taxRegime');
    } else {
      return t('responses.default');
    }
  };

  const copyConversation = () => {
    const text = activeConversation.messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(t('conversationCopied'));
      })
      .catch(err => {
        console.error('Failed to copy conversation:', err);
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="relative">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="flex items-center text-gray-700 hover:text-gray-900 font-medium"
          >
            {activeConversation.title}
            {showConversations ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
          
          {/* Conversation List Dropdown */}
          {showConversations && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-10">
              <div className="p-2 border-b">
                <button
                  onClick={createNewConversation}
                  className="w-full flex items-center p-2 text-left text-gray-700 hover:bg-gray-100 rounded"
                >
                  <FiPlus className="mr-2" />
                  {t('newConversation')}
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setShowConversations(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 text-left rounded ${
                      conv.id === activeConversationId ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{conv.title}</span>
                    {conv.id === activeConversationId && (
                      <span className="h-2 w-2 rounded-full bg-primary-500"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={copyConversation}
          disabled={activeConversation.messages.length === 0}
          className={`p-2 rounded-full ${
            activeConversation.messages.length === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          title={t('copyConversation')}
        >
          <FiCopy size={18} />
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeConversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <FiCpu className="text-gray-300 h-16 w-16 mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">{t('emptyState.title')}</h3>
            <p className="text-gray-500 max-w-md">{t('emptyState.description')}</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {['section80C', 'taxDeadline', 'taxRegime', 'taxCalculation'].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(t(`suggestions.${suggestion}`));
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                  className="p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  {t(`suggestions.${suggestion}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          activeConversation.messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary-100 text-gray-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span className="p-1 rounded-full mr-2">
                    {message.role === 'user' ? (
                      <FiUser className="text-primary-600" />
                    ) : (
                      <FiCpu className="text-gray-600" />
                    )}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center mb-1">
                <span className="p-1 rounded-full mr-2">
                  <FiCpu className="text-gray-600" />
                </span>
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="border-t p-3">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder')}
            className="w-full border rounded-lg pl-3 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={1}
            style={{ maxHeight: '150px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className={`absolute right-2 bottom-2 p-2 rounded-full ${
              !input.trim() || isTyping
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-primary-600 hover:bg-primary-50'
            }`}
          >
            <FiSend size={20} />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2 px-2">
          {t('disclaimer')}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
