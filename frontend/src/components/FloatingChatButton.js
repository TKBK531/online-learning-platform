import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

const FloatingChatButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on chat page
    if (location.pathname === '/chat') {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                onClick={() => navigate('/chat')}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group"
            >
                <div className="flex flex-col items-center">
                    <span className="text-xl group-hover:animate-bounce">🤖</span>
                </div>
            </Button>

            {/* Tooltip */}
            <div className="absolute bottom-16 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Chat with AI Assistant
            </div>
        </div>
    );
};

export default FloatingChatButton;