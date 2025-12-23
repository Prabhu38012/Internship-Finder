import React, { useState } from "react";
import { useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import AIChatbot from "../AI/AIChatbot";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user } = useSelector((state) => state.auth);

  // Only show for authenticated users
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Floating Button - only show when chatbot is closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-gradient-purple rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 group relative animate-bounce"
          >
            <MessageCircle className="w-8 h-8 text-white" />

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"></span>

            {/* Tooltip */}
            <div className="absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              AI Assistant
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="border-8 border-transparent border-l-gray-800"></div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* AI Chatbot Component */}
      <AIChatbot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
      />
    </>
  );
};

export default FloatingChatbot;
