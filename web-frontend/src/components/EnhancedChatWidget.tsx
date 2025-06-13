import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Mic,
  MicOff,
  Camera,
  Image,
  Paperclip,
  MoreHorizontal,
  User,
  Bot,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  RefreshCw,
  Utensils,
  Heart,
  Wifi,
  Clock,
  AlertTriangle
} from 'lucide-react';
import apiService from '../services/api';
import { ChatMessage, ChatResponse, MessageSender, MessageType } from '../types';

interface EnhancedChatWidgetProps {
  onClose: () => void;
  primaryColor?: string;
  guestName?: string;
  roomNumber?: string;
}

interface QuickSuggestion {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: 'service' | 'info' | 'booking' | 'emergency';
}

const EnhancedChatWidget: React.FC<EnhancedChatWidgetProps> = ({
  onClose,
  primaryColor = '#6366f1',
  guestName = 'Guest',
  roomNumber
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessionId] = useState(`chat_${Date.now()}`);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const quickSuggestions: QuickSuggestion[] = [
    {
      id: 'room-service',
      text: 'Order room service',
      icon: <Utensils className="w-4 h-4" />,
      category: 'service'
    },
    {
      id: 'spa-booking',
      text: 'Book spa appointment',
      icon: <Heart className="w-4 h-4" />,
      category: 'booking'
    },
    {
      id: 'wifi-password',
      text: 'WiFi password',
      icon: <Wifi className="w-4 h-4" />,
      category: 'info'
    },
    {
      id: 'checkout-time',
      text: 'Check-out time',
      icon: <Clock className="w-4 h-4" />,
      category: 'info'
    },
    {
      id: 'concierge',
      text: 'Speak to concierge',
      icon: <User className="w-4 h-4" />,
      category: 'service'
    },
    {
      id: 'emergency',
      text: 'Emergency assistance',
      icon: <AlertTriangle className="w-4 h-4" />,
      category: 'emergency'
    }
  ];

  useEffect(() => {    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sessionId,
      content: `Hello ${guestName}! I'm your AI concierge. How can I assist you today?${roomNumber ? ` I see you're in room ${roomNumber}.` : ''}`,
      sender: MessageSender.AI,
      timestamp: new Date().toISOString(),
      type: MessageType.TEXT
    };
    setMessages([welcomeMessage]);
    
    // Load chat history
    loadChatHistory();
  }, [guestName, roomNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await apiService.getChatHistory(sessionId);
      if (history.length > 0) {
        setMessages(prev => [...prev, ...history]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (content: string, image?: string) => {
    if (!content.trim() && !image) return;    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sessionId,
      content: content || 'Image shared',
      sender: MessageSender.USER,
      timestamp: new Date().toISOString(),
      type: image ? MessageType.IMAGE : MessageType.TEXT,
      metadata: image ? { imageUrl: image } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await apiService.sendChatMessage(content, sessionId, image);
        const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sessionId,
        content: response.message.content,
        sender: MessageSender.AI,
        timestamp: new Date().toISOString(),
        type: MessageType.TEXT,
        metadata: response.suggestions ? { quickReplies: response.suggestions.map((s: string) => ({ text: s, value: s })) } : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Text-to-speech for assistant response
      if (voiceEnabled && response.message.content) {
        speakText(response.message.content);
      }
    } catch (error) {
      console.error('Error sending message:', error);      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        sessionId,
        content: 'Sorry, I encountered an error. Please try again or contact support.',
        sender: MessageSender.AI,
        timestamp: new Date().toISOString(),
        type: MessageType.TEXT
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Convert to text using speech recognition or send to backend
        const transcription = await transcribeAudio(audioBlob);
        if (transcription) {
          sendMessage(transcription);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<string | null> => {
    // Mock transcription - in production, use speech-to-text service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("I need help with room service");
      }, 1000);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        sendMessage('', base64);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestionClick = (suggestion: QuickSuggestion) => {
    sendMessage(suggestion.text);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const rateMessage = (messageId: string, rating: 'positive' | 'negative') => {
    // Send rating to backend for improvement
    console.log('Message rated:', messageId, rating);
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-4 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI Concierge</h3>
              <p className="text-xs opacity-80">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white bg-opacity-10 rounded-full translate-y-10 -translate-x-10"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === MessageSender.USER ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === MessageSender.USER 
                  ? 'bg-gray-200'
                  : 'bg-blue-100'
              }`}>
                {message.sender === MessageSender.USER ? (
                  <User className="w-4 h-4 text-gray-600" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-600" />
                )}
              </div>
                <div className={`rounded-2xl p-3 ${
                message.sender === MessageSender.USER
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {message.type === MessageType.IMAGE && message.metadata?.imageUrl && (
                  <img 
                    src={message.metadata.imageUrl} 
                    alt="Shared image" 
                    className="max-w-full h-auto rounded-lg mb-2"
                  />
                )}
                
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {message.metadata?.confidence && message.sender === MessageSender.AI && (
                  <div className="mt-2 text-xs opacity-70">
                    Confidence: {Math.round(message.metadata.confidence * 100)}%
                  </div>
                )}
                
                {message.sender === MessageSender.AI && (
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>                    <button
                      onClick={() => rateMessage(message.id || '', 'positive')}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => rateMessage(message.id || '', 'negative')}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {showSuggestions && messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-500 mb-2">Quick suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-1 rounded-full text-xs"
              >
                {suggestion.icon}
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputMessage);
                }
              }}
              placeholder="Type your message..."
              className="w-full p-3 pr-20 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {uploadingImage ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-1 transition-colors ${
                  isRecording 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: inputMessage.trim() ? primaryColor : undefined }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {isRecording && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-red-500 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Recording... Tap to stop</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedChatWidget;
