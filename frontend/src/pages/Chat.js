import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { useToast } from '../hooks/use-toast';
import api from '../services/api';

const Chat = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // State management
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        loadChatHistory();
        // Add welcome message
        setMessages([{
            id: Date.now(),
            type: 'assistant',
            content: 'Hello! I\'m EduBot, your learning assistant. I can help you with course recommendations, learning paths, and answer any questions about our platform. How can I assist you today?',
            timestamp: new Date()
        }]);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadChatHistory = async () => {
        try {
            setHistoryLoading(true);
            const response = await api.get('/gemini/history?limit=20');
            if (response.data.status === 'success') {
                setChatHistory(response.data.data.chats);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        };

        // Add user message to chat
        setMessages(prev => [...prev, userMessage]);
        const currentMessage = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);

        try {
            // Send to Gemini API
            const response = await api.post('/gemini/generate', {
                prompt: currentMessage
            });

            if (response.data.status === 'success') {
                const assistantMessage = {
                    id: Date.now() + 1,
                    type: 'assistant',
                    content: response.data.data.response,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, assistantMessage]);

                // Refresh history
                loadChatHistory();
            }
        } catch (error) {
            console.error('Error sending message:', error);

            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: error.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);

            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Failed to send message',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const loadHistoryChat = (chat) => {
        const historyMessages = [
            {
                id: `history-${chat._id}-user`,
                type: 'user',
                content: chat.prompt,
                timestamp: new Date(chat.createdAt)
            },
            {
                id: `history-${chat._id}-assistant`,
                type: 'assistant',
                content: chat.response,
                timestamp: new Date(chat.createdAt)
            }
        ];

        setMessages([
            {
                id: 'welcome',
                type: 'assistant',
                content: 'Hello! I\'m EduBot, your learning assistant. I can help you with course recommendations, learning paths, and answer any questions about our platform. How can I assist you today?',
                timestamp: new Date()
            },
            ...historyMessages
        ]);
    };

    const clearChat = () => {
        setMessages([{
            id: Date.now(),
            type: 'assistant',
            content: 'Hello! I\'m EduBot, your learning assistant. How can I assist you today?',
            timestamp: new Date()
        }]);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'instructor':
                return 'bg-blue-100 text-blue-800';
            case 'student':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
            {/* Sidebar */}
            <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🤖</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">EduBot</h1>
                            <p className="text-sm text-gray-500">AI Learning Assistant</p>
                        </div>
                    </div>
                </div>                {/* Chat Actions */}
                <div className="p-4 border-b border-gray-200">
                    <Button
                        onClick={clearChat}
                        variant="outline"
                        className="w-full mb-3"
                    >
                        🗨️ New Chat
                    </Button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Conversations</h3>
                    </div>
                    <ScrollArea className="flex-1 px-4">
                        {historyLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {chatHistory.map((chat) => (
                                    <Card
                                        key={chat._id}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors p-3 border border-gray-100"
                                        onClick={() => loadHistoryChat(chat)}
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                {chat.prompt}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(chat.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </Card>
                                ))}
                                {chatHistory.length === 0 && !historyLoading && (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No conversations yet
                                    </p>
                                )}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* User Info & Navigation */}
                <div className="p-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                    {user?.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.name || 'User'}
                                </p>
                                <Badge className={getRoleColor(user?.role)} variant="secondary">
                                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                        >
                            📊 Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/courses')}
                        >
                            📚 Courses
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        🚪 Sign Out
                    </Button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 p-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Chat with EduBot</h2>
                        <p className="text-gray-600">Get instant help with courses, learning paths, and platform guidance</p>
                    </div>
                </div>                {/* Messages Area */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-6">
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-3xl flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                                                ? 'bg-blue-600'
                                                : message.type === 'error'
                                                    ? 'bg-red-500'
                                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                            }`}>
                                            <span className="text-white text-sm font-semibold">
                                                {message.type === 'user'
                                                    ? (user?.name?.charAt(0) || 'U')
                                                    : message.type === 'error'
                                                        ? '⚠️'
                                                        : '🤖'
                                                }
                                            </span>
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`rounded-2xl px-4 py-3 ${message.type === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : message.type === 'error'
                                                    ? 'bg-red-50 text-red-900 border border-red-200'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}>
                                            <div className="space-y-2">
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {message.content}
                                                </p>
                                                <p className={`text-xs ${message.type === 'user'
                                                        ? 'text-blue-100'
                                                        : message.type === 'error'
                                                            ? 'text-red-500'
                                                            : 'text-gray-500'
                                                    }`}>
                                                    {formatTimestamp(message.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-3xl flex items-start space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <span className="text-white text-sm">🤖</span>
                                        </div>
                                        <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Quick Actions */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInputMessage('What courses do you recommend for a beginner in programming?')}
                                className="text-xs"
                            >
                                💻 Programming courses
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInputMessage('How do I enroll in a course?')}
                                className="text-xs"
                            >
                                📚 How to enroll
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInputMessage('What learning path should I follow for web development?')}
                                className="text-xs"
                            >
                                🌐 Web development path
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setInputMessage('Can you help me with course prerequisites?')}
                                className="text-xs"
                            >
                                ✅ Prerequisites
                            </Button>
                        </div>

                        <div className="flex items-end space-x-4">
                            <div className="flex-1">
                                <Input
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me about courses, learning paths, or anything related to your education..."
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 resize-none"
                                />
                            </div>
                            <Button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>Send</span>
                                        <span>🚀</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;