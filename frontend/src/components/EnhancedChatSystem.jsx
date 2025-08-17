import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Users, 
  Hash, 
  Shield, 
  Trash2, 
  Ban, 
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react';

const EnhancedChatSystem = ({ user, isOpen, onToggle, isAdmin = false }) => {
  const [activeChannel, setActiveChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({
    general: [
      { id: 1, user: 'EcoHacker1', message: 'Anyone working on the XSS challenge?', timestamp: '10:30 AM', reported: false },
      { id: 2, user: 'GreenCoder', message: 'Just solved the SQL injection one! 🎉', timestamp: '10:32 AM', reported: false },
      { id: 3, user: 'TreeHugger', message: 'Need help with cryptography challenges', timestamp: '10:35 AM', reported: false }
    ],
    team: [
      { id: 4, user: 'TeamMate1', message: 'Great job on the forensics challenge!', timestamp: '10:25 AM', reported: false },
      { id: 5, user: 'TeamMate2', message: 'Should we focus on web exploitation next?', timestamp: '10:28 AM', reported: false }
    ],
    help: [
      { id: 6, user: 'Helper1', message: 'Remember to check the source code for hidden clues', timestamp: '10:20 AM', reported: false },
      { id: 7, user: 'Mentor', message: 'For beginners: start with the easier challenges first', timestamp: '10:22 AM', reported: false }
    ]
  });
  const [adminView, setAdminView] = useState(false);
  const [reportedMessages, setReportedMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const channels = [
    { id: 'general', name: 'General', icon: Hash, description: 'General discussion' },
    { id: 'team', name: 'Team Chat', icon: Users, description: 'Team communication' },
    { id: 'help', name: 'Help & Tips', icon: MessageCircle, description: 'Get help from mentors' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: user.username,
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reported: false
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], newMessage]
    }));

    setMessage('');
  };

  const handleDeleteMessage = (messageId) => {
    setMessages(prev => ({
      ...prev,
      [activeChannel]: prev[activeChannel].filter(msg => msg.id !== messageId)
    }));
  };

  const handleReportMessage = (messageId) => {
    setMessages(prev => ({
      ...prev,
      [activeChannel]: prev[activeChannel].map(msg => 
        msg.id === messageId ? { ...msg, reported: true } : msg
      )
    }));
    
    const reportedMsg = messages[activeChannel].find(msg => msg.id === messageId);
    if (reportedMsg) {
      setReportedMessages(prev => [...prev, { ...reportedMsg, channel: activeChannel }]);
    }
  };

  const handleBanUser = (username) => {
    // Mock ban functionality
    console.log(`User ${username} has been banned`);
  };

  const AdminPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-red-400 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Admin Monitoring
        </h3>
        <button
          onClick={() => setAdminView(false)}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Reported Messages */}
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
        <h4 className="text-red-300 font-medium mb-3 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Reported Messages ({reportedMessages.length})
        </h4>
        
        {reportedMessages.length === 0 ? (
          <p className="text-gray-400 text-sm">No reported messages</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {reportedMessages.map((msg) => (
              <div key={msg.id} className="bg-red-900/30 p-3 rounded border border-red-500/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white">{msg.message}</p>
                    <p className="text-xs text-gray-400">
                      by {msg.user} in #{msg.channel} at {msg.timestamp}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete Message"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => handleBanUser(msg.user)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Ban User"
                    >
                      <Ban size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Channels Monitor */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <h4 className="text-yellow-300 font-medium mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Live Channel Activity
        </h4>
        <div className="space-y-2 text-sm">
          {channels.map(channel => (
            <div key={channel.id} className="flex justify-between items-center">
              <span className="text-gray-300">#{channel.name}</span>
              <span className="text-gray-400">{messages[channel.id]?.length || 0} messages</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={24} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-6 bottom-6 w-96 h-[500px] bg-green-900/95 backdrop-blur-sm border border-green-500/30 rounded-lg shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-green-400">
            {adminView ? 'Admin Panel' : 'Chat'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => setAdminView(!adminView)}
              className={`p-2 rounded transition-colors ${
                adminView ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Admin Panel"
            >
              <Shield size={16} />
            </button>
          )}
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {adminView && isAdmin ? (
        <div className="flex-1 p-4 overflow-y-auto">
          <AdminPanel />
        </div>
      ) : (
        <>
          {/* Channel Tabs */}
          <div className="flex border-b border-green-500/30">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 text-sm transition-colors ${
                    activeChannel === channel.id
                      ? 'bg-green-600 text-white'
                      : 'text-green-300 hover:bg-green-800/50'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{channel.name}</span>
                </button>
              );
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {messages[activeChannel]?.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`group ${msg.reported ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {msg.user[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-green-300 text-sm">{msg.user}</span>
                        <span className="text-xs text-gray-400">{msg.timestamp}</span>
                        {msg.reported && (
                          <AlertTriangle className="w-3 h-3 text-red-400" title="Reported" />
                        )}
                      </div>
                      <p className="text-white text-sm mt-1 break-words">{msg.message}</p>
                    </div>
                    
                    {/* Message Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      {!msg.reported && (
                        <button
                          onClick={() => handleReportMessage(msg.id)}
                          className="text-yellow-400 hover:text-yellow-300 p-1"
                          title="Report Message"
                        >
                          <AlertTriangle size={12} />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete Message"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-green-500/30">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name}`}
                className="flex-1 px-3 py-2 bg-green-900/50 border border-green-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Send size={16} />
              </motion.button>
            </div>
          </form>
        </>
      )}
    </motion.div>
  );
};

export default EnhancedChatSystem;

