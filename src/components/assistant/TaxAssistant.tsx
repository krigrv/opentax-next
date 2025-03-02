'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSend, FiUser, FiCpu, FiMessageCircle, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  feedback?: 'positive' | 'negative';
}

const TaxAssistant = () => {
  const { t } = useTranslation('common');
  const { preferences } = useUserPreferences();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Sample suggestions for users
  const suggestions = [
    t('assistant_suggestion_1'),
    t('assistant_suggestion_2'),
    t('assistant_suggestion_3'),
    t('assistant_suggestion_4'),
  ];

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          content: t('assistant_welcome_message'),
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [t, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages from local storage
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('opentax-assistant-messages');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const formattedMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages from localStorage:', error);
    }
  }, []);

  // Save messages to local storage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('opentax-assistant-messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages to localStorage:', error);
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Auto-submit after a short delay
    setTimeout(() => {
      const form = document.getElementById('assistant-form') as HTMLFormElement;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
  };

  const clearConversation = () => {
    // Keep only the welcome message
    setMessages([
      {
        id: Date.now().toString(),
        content: t('assistant_welcome_message'),
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  // Simple response generation based on keywords
  // In a real app, this would be replaced with an actual AI API call
  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('80c') || lowerQuery.includes('investment')) {
      return t('assistant_response_80c');
    } else if (lowerQuery.includes('hra') || lowerQuery.includes('house rent')) {
      return t('assistant_response_hra');
    } else if (lowerQuery.includes('deadline') || lowerQuery.includes('due date')) {
      return t('assistant_response_deadline');
    } else if (lowerQuery.includes('penalty') || lowerQuery.includes('late filing')) {
      return t('assistant_response_penalty');
    } else if (lowerQuery.includes('tax slab') || lowerQuery.includes('tax bracket')) {
      return t('assistant_response_tax_slabs');
    } else if (lowerQuery.includes('deduction') || lowerQuery.includes('exemption')) {
      return t('assistant_response_deductions');
    } else if (lowerQuery.includes('regime') || lowerQuery.includes('new vs old')) {
      return t('assistant_response_regimes');
    } else {
      return t('assistant_response_default');
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(preferences.language === 'hi' ? 'hi-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <FiMessageCircle className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">{t('tax_assistant')}</h2>
        </div>
        <button
          onClick={clearConversation}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {t('clear_conversation')}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === 'assistant' ? (
                  <FiCpu className="h-4 w-4 mr-1" />
                ) : (
                  <FiUser className="h-4 w-4 mr-1" />
                )}
                <span className="text-xs opacity-75">
                  {message.sender === 'assistant' ? t('assistant') : t('you')} • {formatTime(message.timestamp)}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Feedback buttons for assistant messages */}
              {message.sender === 'assistant' && (
                <div className="flex justify-end mt-1 space-x-2">
                  <button
                    onClick={() => handleFeedback(message.id, 'positive')}
                    className={`p-1 rounded-full ${
                      message.feedback === 'positive'
                        ? 'text-green-600 bg-green-100'
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                    aria-label={t('helpful')}
                    title={t('helpful')}
                  >
                    <FiThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleFeedback(message.id, 'negative')}
                    className={`p-1 rounded-full ${
                      message.feedback === 'negative'
                        ? 'text-red-600 bg-red-100'
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                    aria-label={t('not_helpful')}
                    title={t('not_helpful')}
                  >
                    <FiThumbsDown className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">{t('try_asking')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        id="assistant-form"
        onSubmit={handleSubmit}
        className="border-t p-4 flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ask_tax_question')}
          className="flex-1 border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <FiSend className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default TaxAssistant;
