import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Typography,
  Avatar,
  Paper,
  Chip,
  IconButton,
  Fade,
  Tooltip,
  Alert,
  Button,
} from "@mui/material";
import {
  Send,
  SmartToy,
  Person,
  Close,
  Minimize,
  Refresh,
  AutoAwesome,
  Search,
  Assessment,
  TrendingUp,
  Psychology,
  Edit,
  Description,
  ArrowForward,
  LightbulbOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import aiService from "../../services/aiService";

// Simple markdown-like formatter for bot messages
const FormattedMessage = ({ text }) => {
  if (!text) return null;
  const lines = text.split("\n");

  return (
    <Box sx={{ color: "#212121", fontSize: "0.875rem", lineHeight: 1.6 }}>
      {lines.map((line, idx) => {
        let formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

        // Bullet points
        if (formatted.startsWith("- ") || formatted.startsWith("\u2022 ")) {
          return (
            <div
              key={idx}
              style={{ paddingLeft: 16, marginBottom: 3, display: "flex", alignItems: "flex-start", color: "#212121" }}
            >
              <span style={{ marginRight: 6, color: "#212121" }}>{"\u2022"}</span>
              <span style={{ color: "#212121" }} dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = formatted.match(/^(\d+)\.\s/);
        if (numberedMatch) {
          return (
            <div
              key={idx}
              style={{ paddingLeft: 16, marginBottom: 3, display: "flex", alignItems: "flex-start", color: "#212121" }}
            >
              <span style={{ marginRight: 6, fontWeight: 600, color: "#212121" }}>
                {numberedMatch[1]}.
              </span>
              <span
                style={{ color: "#212121" }}
                dangerouslySetInnerHTML={{
                  __html: formatted.slice(numberedMatch[0].length),
                }}
              />
            </div>
          );
        }

        // Empty lines
        if (formatted.trim() === "") {
          return <div key={idx} style={{ height: 8 }} />;
        }

        return (
          <div
            key={idx}
            style={{ marginBottom: 3, color: "#212121" }}
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      })}
    </Box>
  );
};

// Action button with icon mapping
const ActionButton = ({ action, onClick }) => {
  const iconMap = {
    search: <Search fontSize="small" />,
    auto_awesome: <AutoAwesome fontSize="small" />,
    assessment: <Assessment fontSize="small" />,
    trending_up: <TrendingUp fontSize="small" />,
    psychology: <Psychology fontSize="small" />,
    person: <Person fontSize="small" />,
    edit: <Edit fontSize="small" />,
    description: <Description fontSize="small" />,
  };

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={iconMap[action.icon] || <ArrowForward fontSize="small" />}
      onClick={() => onClick(action.route)}
      sx={{
        textTransform: "none",
        borderRadius: 2,
        fontSize: "0.75rem",
        py: 0.5,
      }}
    >
      {action.label}
    </Button>
  );
};

const AIChatbot = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch personalized welcome message when chatbot opens
  const initializeChatbot = useCallback(async () => {
    if (isInitialized) return;

    try {
      const response = await aiService.getWelcomeGuidance();
      const welcomeData = response.data;

      setMessages([
        {
          id: 1,
          text: welcomeData.message,
          sender: "bot",
          timestamp: new Date(),
          suggestions: welcomeData.suggestions || [],
          actions: welcomeData.actions || [],
          guidance: welcomeData.guidance,
          type: "welcome",
        },
      ]);
    } catch (error) {
      setMessages([
        {
          id: 1,
          text: "\uD83D\uDC4B Hi! I'm your AI Career Assistant. I can help you find internships, improve your applications, develop skills, and plan your career.\n\nWhat would you like to explore?",
          sender: "bot",
          timestamp: new Date(),
          suggestions: [
            "Find internships for my skills",
            "How to improve my resume?",
            "What skills should I learn?",
            "Guide me through the platform",
          ],
          actions: [
            { label: "AI Dashboard", route: "/ai", icon: "auto_awesome" },
            { label: "Browse Internships", route: "/internships", icon: "search" },
          ],
          type: "welcome",
        },
      ]);
    }
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      initializeChatbot();
    }
  }, [isOpen, isMinimized, initializeChatbot]);

  // Build conversation history from messages
  const getConversationHistory = () => {
    return messages
      .filter((m) => m.type !== "welcome")
      .map((m) => ({
        sender: m.sender,
        text: m.text,
      }));
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = getConversationHistory();
      const response = await aiService.getChatbotResponse(
        message,
        conversationHistory
      );

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.message,
        sender: "bot",
        timestamp: new Date(),
        type: response.data.type,
        confidence: response.data.confidence,
        suggestions: response.data.suggestions || [],
        actions: response.data.actions || [],
        guidance: response.data.guidance,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble processing your request right now. Please try again or rephrase your question.",
        sender: "bot",
        timestamp: new Date(),
        isError: true,
        suggestions: [
          "Find internships",
          "Resume help",
          "Career advice",
          "Skill recommendations",
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleActionClick = (route) => {
    navigate(route);
    if (onClose) onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setIsInitialized(false);
    setMessages([]);
    setTimeout(() => {
      setIsInitialized(false);
      initializeChatbot();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <Fade in={isOpen}>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: isMinimized ? 320 : 420,
          height: isMinimized ? 60 : 640,
          zIndex: 1300,
          borderRadius: 3,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "rgba(255,255,255,0.2)",
                mr: 1,
              }}
            >
              <SmartToy fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                AI Career Assistant
              </Typography>
              {!isMinimized && (
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Powered by InternQuest AI
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <Tooltip title="Clear chat">
              <IconButton
                size="small"
                onClick={clearChat}
                sx={{ color: "white", mr: 0.5 }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isMinimized ? "Expand" : "Minimize"}>
              <IconButton
                size="small"
                onClick={onToggleMinimize}
                sx={{ color: "white", mr: 0.5 }}
              >
                <Minimize fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{ color: "white" }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Messages */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 1.5,
                bgcolor: "#f8f9fa",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(0,0,0,0.15)",
                  borderRadius: 3,
                },
              }}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      message.sender === "user" ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      maxWidth: "88%",
                      flexDirection:
                        message.sender === "user" ? "row-reverse" : "row",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        mx: 0.75,
                        bgcolor:
                          message.sender === "user"
                            ? "primary.main"
                            : "#7c4dff",
                        fontSize: "0.85rem",
                      }}
                    >
                      {message.sender === "user" ? (
                        <Person fontSize="small" />
                      ) : (
                        <SmartToy fontSize="small" />
                      )}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          bgcolor:
                            message.sender === "user"
                              ? "primary.main"
                              : "white",
                          color:
                            message.sender === "user"
                              ? "white"
                              : "text.primary",
                          borderRadius: 2.5,
                          borderTopRightRadius:
                            message.sender === "user" ? 4 : 20,
                          borderTopLeftRadius:
                            message.sender === "user" ? 20 : 4,
                          ...(message.isError && {
                            bgcolor: "#fff3f0",
                            border: "1px solid #ffcdd2",
                            color: "error.dark",
                          }),
                          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                        }}
                      >
                        {message.sender === "bot" ? (
                          <FormattedMessage text={message.text} />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-wrap" }}
                          >
                            {message.text}
                          </Typography>
                        )}
                      </Paper>

                      {/* Guidance alert */}
                      {message.guidance && (
                        <Alert
                          severity="info"
                          icon={<LightbulbOutlined fontSize="small" />}
                          sx={{
                            mt: 1,
                            py: 0,
                            fontSize: "0.75rem",
                            "& .MuiAlert-message": { py: 0.75 },
                          }}
                          action={
                            message.guidance.action ? (
                              <Button
                                size="small"
                                onClick={() =>
                                  handleActionClick(message.guidance.action.route)
                                }
                                sx={{ fontSize: "0.7rem", textTransform: "none" }}
                              >
                                {message.guidance.action.label}
                              </Button>
                            ) : null
                          }
                        >
                          {message.guidance.message}
                        </Alert>
                      )}

                      {/* Action buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <Box mt={1} display="flex" flexWrap="wrap" gap={0.75}>
                          {message.actions.map((action, idx) => (
                            <ActionButton
                              key={idx}
                              action={action}
                              onClick={handleActionClick}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Suggestion chips */}
                      {message.suggestions &&
                        message.suggestions.length > 0 && (
                          <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                            {message.suggestions.map((suggestion, idx) => (
                              <Chip
                                key={idx}
                                label={suggestion}
                                size="small"
                                variant="outlined"
                                clickable
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                                sx={{
                                  fontSize: "0.72rem",
                                  height: 26,
                                  borderColor: "primary.light",
                                  color: "primary.main",
                                  "&:hover": {
                                    bgcolor: "primary.50",
                                    borderColor: "primary.main",
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        )}

                      <Typography
                        variant="caption"
                        sx={{ mt: 0.5, display: "block", fontSize: "0.65rem", color: "#64748b" }}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {isLoading && (
                <Box display="flex" justifyContent="flex-start" mb={2}>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        mr: 0.75,
                        bgcolor: "#7c4dff",
                      }}
                    >
                      <SmartToy fontSize="small" />
                    </Avatar>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        borderTopLeftRadius: 4,
                        bgcolor: "white",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {[0, 1, 2].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                bgcolor: "primary.main",
                                animation: "pulse 1.4s infinite ease-in-out",
                                animationDelay: `${i * 0.2}s`,
                                "@keyframes pulse": {
                                  "0%, 80%, 100%": {
                                    transform: "scale(0.4)",
                                    opacity: 0.4,
                                  },
                                  "40%": {
                                    transform: "scale(1)",
                                    opacity: 1,
                                  },
                                },
                              }}
                            />
                          ))}
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontSize="0.8rem"
                        >
                          Thinking...
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: "white",
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Box display="flex" gap={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about internships, careers, skills..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  multiline
                  maxRows={3}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                      fontSize: "0.875rem",
                      bgcolor: "#ffffff",
                      color: "#1e293b",
                      "& fieldset": {
                        borderColor: "#cbd5e1",
                      },
                      "&:hover fieldset": {
                        borderColor: "#3b82f6",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "#0f172a !important",
                      WebkitTextFillColor: "#0f172a !important",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#64748b !important",
                      opacity: "1 !important",
                      WebkitTextFillColor: "#64748b !important",
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    width: 38,
                    height: 38,
                    "&:hover": { bgcolor: "primary.dark" },
                    "&:disabled": { bgcolor: "grey.300", color: "grey.500" },
                  }}
                >
                  <Send fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Fade>
  );
};

export default AIChatbot;
