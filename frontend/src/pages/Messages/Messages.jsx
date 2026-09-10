import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Divider,
  Badge,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
} from "@mui/material";
import {
  Send,
  AttachFile,
  MoreVert,
  Search,
  Delete,
  Reply,
  EmojiEmotions,
  Close,
  Add,
  PersonAdd,
  PictureAsPdf,
  InsertDriveFile,
  Download,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";

import messageService from "../../services/messageService";
import socketService from "../../services/socketService";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const Messages = () => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedConversationRef = useRef(selectedConversation);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    // Ensure real-time socket connection is active
    const token = localStorage.getItem("token");
    if (token) {
      socketService.connect(token);
    }

    fetchConversations();
    fetchAvailableUsers();
    fetchOnlineUsers();

    // Setup socket listeners
    socketService.on("new_message", handleNewMessage);
    socketService.on("message_deleted", handleMessageDeleted);
    socketService.on("user_typing", handleUserTyping);
    socketService.on("user_status_change", handleUserStatusChange);
    socketService.on("user:online", (d) => handleUserStatusChange({ ...d, isOnline: true }));
    socketService.on("user:offline", (d) => handleUserStatusChange({ ...d, isOnline: false }));
    socketService.on("online_users_list", handleOnlineUsersList);
    socketService.on("application_notification", handleApplicationNotification);

    return () => {
      socketService.off("new_message", handleNewMessage);
      socketService.off("message_deleted", handleMessageDeleted);
      socketService.off("user_typing", handleUserTyping);
      socketService.off("user_status_change", handleUserStatusChange);
      socketService.off("online_users_list", handleOnlineUsersList);
      socketService.off(
        "application_notification",
        handleApplicationNotification,
      );
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const response = await messageService.getOnlineUsers();
      if (response && response.success && Array.isArray(response.data)) {
        setOnlineUsers(new Set(response.data));
      }
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
    socketService.getOnlineUsers();
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await messageService.searchUsers();
      if (response && response.success) {
        setAvailableUsers(
          response.data.filter((u) => u._id !== user.id && u._id !== user._id),
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleCreateConversation = async (selectedUser) => {
    try {
      const response = await messageService.createConversation(
        selectedUser._id,
      );
      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      selectedConversationRef.current = newConversation;
      socketService.joinConversation(newConversation._id);
      setNewConversationOpen(false);
      setUserSearchQuery("");
      toast.success(`Started conversation with ${selectedUser.name}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data);

      // Mark messages as read
      await messageService.markAsRead(conversationId);
    } catch (error) {
      toast.error("Failed to load messages");
    }
  };

  const handleConversationSelect = (conversation) => {
    // Leave previous conversation room
    if (selectedConversation) {
      socketService.leaveConversation(selectedConversation._id);
    }

    setSelectedConversation(conversation);
    selectedConversationRef.current = conversation;
    setMessages([]);
    setTypingUsers({});
    fetchMessages(conversation._id);

    // Join new conversation room
    socketService.joinConversation(conversation._id);
  };

  const getAttachmentUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const backendBase =
      import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
        : (import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!selectedConversation) return;

    try {
      setSendingMessage(true);

      const hasPdf = attachments.some(
        (f) =>
          f.type === "application/pdf" ||
          f.name?.toLowerCase().endsWith(".pdf"),
      );
      const effectiveMessageType = attachments.length > 0 ? (hasPdf ? "file" : "file") : "text";

      const response = await messageService.sendMessage(
        selectedConversation._id,
        newMessage.trim(),
        effectiveMessageType,
        attachments,
        replyTo?._id,
      );

      const rawMsg = response?.data || response;
      const formattedSender =
        rawMsg.sender && typeof rawMsg.sender === "object" && (rawMsg.sender._id || rawMsg.sender.id)
          ? rawMsg.sender
          : {
              _id: user?.id || user?._id,
              name: user?.name || "You",
              email: user?.email,
              avatar: user?.avatar || "",
              role: user?.role || "student",
            };

      const finalMessage = {
        ...rawMsg,
        _id: rawMsg._id || rawMsg.id || `temp_${Date.now()}`,
        sender: formattedSender,
        createdAt: rawMsg.createdAt || new Date().toISOString(),
      };

      setMessages((prev) => {
        const newMsgId = String(finalMessage._id || finalMessage.id || "");
        if (newMsgId && prev.some((m) => String(m._id || m.id || "") === newMsgId)) {
          return prev;
        }
        return [...prev, finalMessage];
      });
      setNewMessage("");
      setAttachments([]);
      setReplyTo(null);

      // Update conversation in list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: finalMessage, lastActivity: new Date() }
            : conv,
        ),
      );

      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleNewMessage = (data) => {
    if (!data || !data.message) return;

    const incomingMsg = data.message;
    const incomingId = String(incomingMsg._id || incomingMsg.id || "");
    const incomingConvId = String(
      data.conversationId?._id ||
      data.conversationId ||
      incomingMsg.conversation?._id ||
      incomingMsg.conversation ||
      ""
    );
    const activeConvId = String(selectedConversationRef.current?._id || "");

    // If viewing this conversation, immediately render the incoming message
    if (incomingConvId && activeConvId && incomingConvId === activeConvId) {
      setMessages((prev) => {
        if (incomingId && prev.some((msg) => String(msg._id || msg.id || "") === incomingId)) {
          return prev;
        }
        return [...prev, incomingMsg];
      });
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } else if (incomingConvId && activeConvId && incomingConvId !== activeConvId) {
      // User is in Messages page but viewing a different conversation
      const senderName = incomingMsg.sender?.name || "New message";
      toast(`${senderName}: ${incomingMsg.content.substring(0, 40)}`, {
        icon: "💬",
        id: `msg_${incomingId}`,
      });
    }

    // Update conversations list in real-time
    setConversations((prev) => {
      const exists = prev.some((conv) => String(conv._id) === incomingConvId);
      if (!exists) {
        fetchConversations();
        return prev;
      }
      return prev
        .map((conv) =>
          String(conv._id) === incomingConvId
            ? { ...conv, lastMessage: incomingMsg, lastActivity: new Date() }
            : conv,
        )
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    });
  };

  const handleMessageDeleted = (data) => {
    const deletedConvId = String(data.conversationId?._id || data.conversationId || "");
    const activeConvId = String(selectedConversationRef.current?._id || "");
    if (deletedConvId && activeConvId && deletedConvId === activeConvId) {
      setMessages((prev) => prev.filter((msg) => String(msg._id || msg.id) !== String(data.messageId)));
    }
  };

  const handleUserTyping = (data) => {
    const typingConvId = String(data.conversationId?._id || data.conversationId || "");
    const activeConvId = String(selectedConversationRef.current?._id || "");
    const currentUserId = String(user?.id || user?._id || "");
    const typingUserId = String(data.userId || "");

    if (
      typingConvId &&
      activeConvId &&
      typingConvId === activeConvId &&
      typingUserId !== currentUserId
    ) {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: {
          userName: data.userName,
          isTyping: data.isTyping,
        },
      }));

      // Clear typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        }, 3000);
      }
    }
  };

  const handleOnlineUsersList = (data) => {
    if (data && Array.isArray(data.users)) {
      setOnlineUsers(new Set(data.users));
    }
  };

  const handleUserStatusChange = (data) => {
    if (!data || !data.userId) return;
    setOnlineUsers((prev) => {
      const updated = new Set(prev);
      if (data.isOnline) {
        updated.add(data.userId);
      } else {
        updated.delete(data.userId);
      }
      return updated;
    });
  };

  const handleApplicationNotification = (data) => {
    // Create automatic message for application events
    const automaticMessage = {
      _id: `auto_${Date.now()}`,
      content: data.message,
      messageType: "system",
      sender: { _id: "system", name: "System" },
      createdAt: new Date(),
      isSystemMessage: true,
      applicationData: data.applicationData,
    };

    if (data.conversationId === selectedConversation?._id) {
      setMessages((prev) => [...prev, automaticMessage]);
    }

    // Update conversations list
    setConversations((prev) =>
      prev.map((conv) =>
        conv._id === data.conversationId
          ? { ...conv, lastMessage: automaticMessage, lastActivity: new Date() }
          : conv,
      ),
    );

    // Show toast notification
    toast.success(data.message, { icon: "📨" });
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      await messageService.deleteMessage(selectedMessage._id);
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== selectedMessage._id),
      );
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedMessage(null);
      setMenuAnchor(null);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = (value) => {
    setNewMessage(value);

    if (selectedConversation && value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        socketService.sendTyping(selectedConversation._id, true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketService.sendTyping(selectedConversation._id, false);
      }, 1000);
    } else if (isTyping) {
      setIsTyping(false);
      socketService.sendTyping(selectedConversation._id, false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p._id !== user.id);
    return otherParticipant?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const formatMessageTime = (date) => {
    try {
      if (!date) return "Just now";
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Just now";
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return "Just now";
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find((p) => p._id !== user.id);
  };

  if (loading) {
    return <LoadingSpinner message="Loading messages..." />;
  }

  return (
    <>
      <Helmet>
        <title>Messages - InternQuest</title>
        <meta
          name="description"
          content="Send and receive messages with companies and other users."
        />
      </Helmet>

      <Box sx={{ height: "calc(100vh - 80px)", display: "flex" }}>
        {/* Conversations List */}
        <Paper sx={{ width: 350, display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Messages</Typography>
              <IconButton
                color="primary"
                onClick={() => setNewConversationOpen(true)}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <Add />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <List sx={{ flex: 1, overflow: "auto" }}>
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversation?._id === conversation._id;

              return (
                <ListItem
                  key={conversation._id}
                  button
                  selected={isSelected}
                  onClick={() => handleConversationSelect(conversation)}
                  sx={{
                    borderLeft: isSelected ? 3 : 0,
                    borderColor: "primary.main",
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount || 0}
                      color="error"
                      invisible={!conversation.unreadCount}
                    >
                      <Badge
                        variant="dot"
                        color="success"
                        invisible={!onlineUsers.has(otherParticipant?._id)}
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: "#44b700",
                            color: "#44b700",
                            boxShadow: `0 0 0 2px white`,
                            "&::after": {
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              animation: onlineUsers.has(otherParticipant?._id)
                                ? "ripple 1.2s infinite ease-in-out"
                                : "none",
                              border: "1px solid currentColor",
                              content: '""',
                            },
                          },
                          "@keyframes ripple": {
                            "0%": {
                              transform: "scale(.8)",
                              opacity: 1,
                            },
                            "100%": {
                              transform: "scale(2.4)",
                              opacity: 0,
                            },
                          },
                        }}
                      >
                        <Avatar src={otherParticipant?.avatar}>
                          {otherParticipant?.name?.charAt(0)}
                        </Avatar>
                      </Badge>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle2" noWrap>
                          {otherParticipant?.name}
                        </Typography>
                        <Chip
                          label={otherParticipant?.role}
                          size="small"
                          color={
                            otherParticipant?.role === "company"
                              ? "primary"
                              : "default"
                          }
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      conversation.lastMessage?.content || "No messages yet"
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {conversation.lastActivity &&
                      formatMessageTime(conversation.lastActivity)}
                  </Typography>
                </ListItem>
              );
            })}

            {filteredConversations.length === 0 && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No conversations found
                </Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Paper sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={getOtherParticipant(selectedConversation)?.avatar}
                  >
                    {getOtherParticipant(selectedConversation)?.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {getOtherParticipant(selectedConversation)?.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.25,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: onlineUsers.has(
                              getOtherParticipant(selectedConversation)?._id,
                            )
                              ? "#22c55e"
                              : "#94a3b8",
                            boxShadow: onlineUsers.has(
                              getOtherParticipant(selectedConversation)?._id,
                            )
                              ? "0 0 6px #22c55e"
                              : "none",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: onlineUsers.has(
                              getOtherParticipant(selectedConversation)?._id,
                            )
                              ? "#22c55e"
                              : "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          {onlineUsers.has(
                            getOtherParticipant(selectedConversation)?._id,
                          )
                            ? "Online"
                            : "Offline"}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getOtherParticipant(selectedConversation)?.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
                {messages.map((message) => {
                  const senderId = String(
                    message.sender?._id ||
                    message.sender?.id ||
                    message.sender ||
                    ""
                  );
                  const currentUserId = String(user?.id || user?._id || "");
                  const isOwn = Boolean(
                    senderId && currentUserId && senderId === currentUserId
                  );
                  const isSystemMessage =
                    message.isSystemMessage || message.messageType === "system";

                  const senderDisplayName =
                    message.sender?.name ||
                    (isOwn ? user?.name || "You" : "User");

                  if (isSystemMessage) {
                    return (
                      <Box
                        key={message._id}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: "80%",
                            bgcolor: "info.light",
                            color: "info.contrastText",
                            textAlign: "center",
                            borderRadius: 3,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            📨 {message.content}
                          </Typography>
                          {message.applicationData && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1,
                                bgcolor: "rgba(255,255,255,0.1)",
                                borderRadius: 1,
                              }}
                            >
                              <Typography variant="caption">
                                Application:{" "}
                                {message.applicationData.internshipTitle}
                              </Typography>
                            </Box>
                          )}
                          <Typography
                            variant="caption"
                            sx={{ display: "block", mt: 0.5, opacity: 0.8 }}
                          >
                            {formatMessageTime(message.createdAt)}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  }

                  return (
                    <Box
                      key={message._id}
                      sx={{
                        display: "flex",
                        justifyContent: isOwn ? "flex-end" : "flex-start",
                        mb: 1,
                        mx: 1,
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          maxWidth: "70%",
                          bgcolor: isOwn ? "primary.main" : "rgba(255, 255, 255, 0.08)",
                          color: isOwn ? "#ffffff" : "#f8fafc",
                          border: isOwn ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                          position: "relative",
                          borderRadius: isOwn
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          boxShadow: isOwn
                            ? "0 2px 10px rgba(59, 130, 246, 0.3)"
                            : "0 2px 10px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {message.replyTo && (
                          <Box
                            sx={{
                              p: 1,
                              mb: 1,
                              bgcolor: isOwn
                                ? "rgba(0,0,0,0.15)"
                                : "rgba(255,255,255,0.06)",
                              borderRadius: 1,
                              borderLeft: 3,
                              borderColor: isOwn ? "white" : "primary.main",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.85, color: "inherit" }}
                            >
                              Replying to: {message.replyTo.content}
                            </Typography>
                          </Box>
                        )}

                        {!isOwn && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mb: 0.5,
                              fontWeight: 600,
                              color: "primary.light",
                            }}
                          >
                            {senderDisplayName}
                          </Typography>
                        )}
                        <Typography
                          variant="body1"
                          sx={{
                            color: isOwn ? "#ffffff" : "#f8fafc",
                            wordBreak: "break-word",
                            lineHeight: 1.5,
                          }}
                        >
                          {message.content}
                        </Typography>

                        {message.attachments?.length > 0 && (
                          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                            {message.attachments.map((attachment, index) => {
                              const fullUrl = getAttachmentUrl(attachment.url);
                              const isPdf =
                                attachment.originalName?.toLowerCase().endsWith(".pdf") ||
                                attachment.mimetype === "application/pdf";
                              return (
                                <Paper
                                  key={index}
                                  elevation={0}
                                  onClick={() => window.open(fullUrl, "_blank")}
                                  sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 1,
                                    cursor: "pointer",
                                    bgcolor: isOwn
                                      ? "rgba(0, 0, 0, 0.2)"
                                      : "rgba(255, 255, 255, 0.08)",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: isOwn
                                      ? "rgba(255, 255, 255, 0.3)"
                                      : "rgba(255, 255, 255, 0.15)",
                                    color: "inherit",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      bgcolor: isOwn
                                        ? "rgba(0, 0, 0, 0.3)"
                                        : "rgba(255, 255, 255, 0.15)",
                                      transform: "translateY(-1px)",
                                    },
                                  }}
                                >
                                  {isPdf ? (
                                    <PictureAsPdf sx={{ color: "#ef4444", fontSize: 24, flexShrink: 0 }} />
                                  ) : (
                                    <InsertDriveFile sx={{ color: "primary.light", fontSize: 24, flexShrink: 0 }} />
                                  )}
                                  <Box sx={{ minWidth: 0, mr: 1, flex: 1 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        wordBreak: "break-all",
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {attachment.originalName}
                                    </Typography>
                                    {attachment.size && (
                                      <Typography variant="caption" sx={{ opacity: 0.75, fontSize: "0.7rem", display: "block", mt: 0.25 }}>
                                        {(attachment.size / (1024 * 1024)).toFixed(2)} MB • Click to open/download
                                      </Typography>
                                    )}
                                  </Box>
                                  <Download fontSize="small" sx={{ opacity: 0.8, ml: "auto", flexShrink: 0 }} />
                                </Paper>
                              );
                            })}
                          </Box>
                        )}

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              opacity: 0.75,
                              color: isOwn
                                ? "rgba(255, 255, 255, 0.85)"
                                : "rgba(248, 250, 252, 0.65)",
                              fontSize: "0.7rem",
                            }}
                          >
                            {formatMessageTime(message.createdAt)}
                          </Typography>

                          {isOwn && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setMenuAnchor(e.currentTarget);
                                setSelectedMessage(message);
                              }}
                              sx={{ color: "inherit", ml: 1 }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  );
                })}

                {/* Typing Indicators */}
                {Object.values(typingUsers).some((user) => user.isTyping) && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Paper sx={{ p: 1, bgcolor: "rgba(255, 255, 255, 0.06)", borderRadius: 2, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        {Object.values(typingUsers)
                          .filter((user) => user.isTyping)
                          .map((user) => user.userName)
                          .join(", ")}{" "}
                        {Object.values(typingUsers).filter(
                          (user) => user.isTyping,
                        ).length === 1
                          ? "is"
                          : "are"}{" "}
                        typing...
                      </Typography>
                    </Paper>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Reply Preview */}
              {replyTo && (
                <Box
                  sx={{
                    p: 1,
                    bgcolor: "rgba(255, 255, 255, 0.04)",
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Reply fontSize="small" />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      Replying to: {replyTo.content}
                    </Typography>
                    <IconButton size="small" onClick={() => setReplyTo(null)}>
                      <Close />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <Box sx={{ p: 1, bgcolor: "rgba(255, 255, 255, 0.04)" }}>
                  <Typography variant="body2" gutterBottom>
                    Attachments ({attachments.length}):
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {attachments.map((file, index) => (
                      <Chip
                        key={index}
                        icon={
                          file.name.toLowerCase().endsWith(".pdf") ? (
                            <PictureAsPdf style={{ color: "#ef4444" }} />
                          ) : undefined
                        }
                        label={file.name}
                        onDelete={() => removeAttachment(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    style={{ display: "none" }}
                  />

                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sendingMessage}
                  >
                    <AttachFile />
                  </IconButton>

                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendingMessage}
                  />

                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={
                      sendingMessage ||
                      (!newMessage.trim() && attachments.length === 0)
                    }
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                Select a conversation to start messaging
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose from your existing conversations or start a new one
              </Typography>
            </Box>
          )}
        </Box>

        {/* Message Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            onClick={() => {
              setReplyTo(selectedMessage);
              setMenuAnchor(null);
            }}
          >
            <Reply sx={{ mr: 1 }} />
            Reply
          </MenuItem>
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
            }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Message</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteMessage} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* New Conversation Dialog */}
        <Dialog
          open={newConversationOpen}
          onClose={() => setNewConversationOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonAdd />
              Start New Conversation
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {availableUsers
                .filter(
                  (user) =>
                    user.name
                      .toLowerCase()
                      .includes(userSearchQuery.toLowerCase()) ||
                    user.email
                      .toLowerCase()
                      .includes(userSearchQuery.toLowerCase()),
                )
                .map((user) => (
                  <ListItem
                    key={user._id}
                    button
                    onClick={() => handleCreateConversation(user)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.profilePicture}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span
                            style={{
                              fontSize: "0.875rem",
                              color: "rgba(0, 0, 0, 0.6)",
                            }}
                          >
                            {user.email}
                          </span>
                          <Chip
                            label={user.role}
                            size="small"
                            color={
                              user.role === "student" ? "primary" : "secondary"
                            }
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              {availableUsers.filter(
                (user) =>
                  user.name
                    .toLowerCase()
                    .includes(userSearchQuery.toLowerCase()) ||
                  user.email
                    .toLowerCase()
                    .includes(userSearchQuery.toLowerCase()),
              ).length === 0 && (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </Box>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewConversationOpen(false)}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Messages;
