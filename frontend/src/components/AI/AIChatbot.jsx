import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Fade
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Close,
  Minimize,
  Refresh
} from '@mui/icons-material';
import aiService from '../../services/aiService';

const AIChatbot = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI career assistant. I can help you find internships, improve your applications, and provide career advice. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        'Find internships matching my skills',
        'How to improve my resume?',
        'What skills should I learn?',
        'Career advice for my field'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.getChatbotResponse(message);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.message,
        sender: 'bot',
        timestamp: new Date(),
        type: response.data.type,
        suggestions: response.data.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Chat cleared! How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: [
          'Find internships matching my skills',
          'How to improve my resume?',
          'What skills should I learn?',
          'Career advice for my field'
        ]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <Fade in={isOpen}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: isMinimized ? 300 : 400,
          height: isMinimized ? 60 : 600,
          zIndex: 1300,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center">
            <SmartToy sx={{ mr: 1 }} />
            <Typography variant="h6">AI Assistant</Typography>
          </Box>
          <Box>
            <IconButton size="small" onClick={clearChat} sx={{ color: 'white', mr: 1 }}>
              <Refresh />
            </IconButton>
            <IconButton size="small" onClick={onToggleMinimize} sx={{ color: 'white', mr: 1 }}>
              <Minimize />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 1,
                bgcolor: 'grey.50'
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      maxWidth: '80%',
                      flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mx: 1,
                        bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main'
                      }}
                    >
                      {message.sender === 'user' ? <Person /> : <SmartToy />}
                    </Avatar>
                    
                    <Box>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          bgcolor: message.sender === 'user' ? 'primary.main' : 'white',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2,
                          ...(message.isError && { bgcolor: 'error.light', color: 'white' })
                        }}
                      >
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.text}
                        </Typography>
                      </Paper>
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                          {message.suggestions.map((suggestion, idx) => (
                            <Chip
                              key={idx}
                              label={suggestion}
                              size="small"
                              variant="outlined"
                              clickable
                              onClick={() => handleSuggestionClick(suggestion)}
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              
              {isLoading && (
                <Box display="flex" justifyContent="flex-start" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main' }}>
                      <SmartToy />
                    </Avatar>
                    <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
                      <Box display="flex" alignItems="center">
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body2">Thinking...</Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask me anything about internships or careers..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  multiline
                  maxRows={3}
                />
                <Button
                  variant="contained"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <Send />
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Fade>
  );
};

export default AIChatbot;
