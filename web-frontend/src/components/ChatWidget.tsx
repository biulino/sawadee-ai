import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import apiService from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'image' | 'file';
  metadata?: any;
}

interface ChatWidgetProps {
  onClose: () => void;
  primaryColor?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ 
  onClose, 
  primaryColor = '#6366f1' 
}) => {  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Hello! I am the hotel\'s AI assistant. How can I help you today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string, type: 'text' | 'image' = 'text', file?: File) => {
    if (!text.trim() && !file) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text || (file ? `📎 ${file.name}` : ''),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type,
      metadata: file ? { fileName: file.name, fileSize: file.size } : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );

      let response;
      if (file && type === 'image') {
        // Handle image upload for passport verification
        response = await handleImageUpload(file, text);      } else {
        // Regular text message
        response = await apiService.sendChatMessage(text, sessionId);
      }      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message?.content || response.report || 'Üzgünüm, bir hata oluştu.',
        sender: 'assistant',
        timestamp: new Date(),
        metadata: response.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      // Update user message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleImageUpload = async (file: File, context: string) => {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Determine upload type based on context
    if (context.toLowerCase().includes('pasaport') || context.toLowerCase().includes('passport')) {      // For passport images, we need a checkin record ID
      // This should be handled through the AICheckinFlow component instead
      throw new Error('Pasaport yükleme işlemi için AI Check-in akışını kullanın');
    }
    
    // General image analysis through chat
    return await apiService.sendChatMessage(context, sessionId, base64);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      sendMessage(`Fotoğraf yüklendi: ${file.name}`, 'image', file);
    } else {
      alert('Lütfen sadece resim dosyası seçin (JPG, PNG)');
    }
  };

  const getMessageIcon = (message: Message) => {
    if (message.sender === 'assistant') {
      return <Bot className="w-5 h-5" style={{ color: primaryColor }} />;
    }
    
    switch (message.status) {
      case 'sending':
        return <Loader className="w-4 h-4 animate-spin text-gray-400" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatMessageText = (text: string) => {
    // Simple formatting for AI responses
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
  };

  const quickActions = [
    { text: 'Rezervasyon yapmak istiyorum', icon: '🏨' },
    { text: 'Check-in yapmak istiyorum', icon: '🔑' },
    { text: 'Restoran bilgisi', icon: '🍽️' },
    { text: 'Spa hizmetleri', icon: '💆‍♀️' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
      className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50"
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 rounded-t-2xl text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">AI Asistan</h3>
            <p className="text-sm opacity-90">Her zaman buradayım</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className="flex-shrink-0">
                {getMessageIcon(message)}
              </div>
              <div
                className={`px-3 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.type === 'image' && message.metadata ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">{message.metadata.fileName}</span>
                    </div>
                    <div 
                      className="text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: formatMessageText(message.text) 
                      }} 
                    />
                  </div>
                ) : (
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageText(message.text) 
                    }} 
                  />
                )}
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('tr-TR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" style={{ color: primaryColor }} />
              <div className="bg-gray-100 px-3 py-2 rounded-2xl">
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

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => sendMessage(action.text)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors flex items-center space-x-1"
            >
              <span>{action.icon}</span>
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Fotoğraf yükle"
          >
            <Camera className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: inputText.trim() ? primaryColor : '#9ca3af' }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </motion.div>
  );
};

export default ChatWidget;
