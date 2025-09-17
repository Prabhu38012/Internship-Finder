import React, { useState, useEffect, useRef } from 'react';
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
  InputAdornment
} from '@mui/material';
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
  PersonAdd
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

import messageService from '../../services/messageService';
import socketService from '../../services/socketService';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Messages = () => {
  const { user } = useSelector(state => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
    
    // Setup socket listeners
    socketService.on('new_message', handleNewMessage);
    socketService.on('message_deleted', handleMessageDeleted);
    
    return () => {
      socketService.off('new_message', handleNewMessage);
      socketService.off('message_deleted', handleMessageDeleted);
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
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/search', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setAvailableUsers(data.data.filter(u => u._id !== user.id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleCreateConversation = async (selectedUser) => {
    try {
      const response = await messageService.createConversation([user.id, selectedUser._id]);
      const newConversation = response.data;
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversation(newConversation);
      setNewConversationOpen(false);
      setUserSearchQuery('');
      toast.success(`Started conversation with ${selectedUser.name}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.data);
      
      // Mark messages as read
      await messageService.markAsRead(conversationId);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    fetchMessages(conversation._id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!selectedConversation) return;

    try {
      setSendingMessage(true);
      
      const response = await messageService.sendMessage(
        selectedConversation._id,
        newMessage,
        'text',
        attachments,
        replyTo?._id
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setAttachments([]);
      setReplyTo(null);
      
      // Update conversation in list
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: response.data, lastActivity: new Date() }
            : conv
        )
      );
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === selectedConversation?._id) {
      setMessages(prev => [...prev, data.message]);
    }
    
    // Update conversations list
    setConversations(prev => 
      prev.map(conv => 
        conv._id === data.conversationId
          ? { ...conv, lastMessage: data.message, lastActivity: new Date() }
          : conv
      )
    );
  };

  const handleMessageDeleted = (data) => {
    if (data.conversationId === selectedConversation?._id) {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    try {
      await messageService.deleteMessage(selectedMessage._id);
      setMessages(prev => prev.filter(msg => msg._id !== selectedMessage._id));
      toast.success('Message deleted');
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedMessage(null);
      setMenuAnchor(null);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p._id !== user.id);
    return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatMessageTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user.id);
  };

  if (loading) {
    return <LoadingSpinner message="Loading messages..." />;
  }

  return (
    <>
      <Helmet>
        <title>Messages - InternQuest</title>
        <meta name="description" content="Send and receive messages with companies and other users." />
      </Helmet>

      <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex' }}>
        {/* Conversations List */}
        <Paper sx={{ width: 350, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Messages
              </Typography>
              <IconButton 
                color="primary" 
                onClick={() => setNewConversationOpen(true)}
                sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
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
                )
              }}
            />
          </Box>

          <List sx={{ flex: 1, overflow: 'auto' }}>
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
                    borderColor: 'primary.main'
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount || 0}
                      color="error"
                      invisible={!conversation.unreadCount}
                    >
                      <Avatar src={otherParticipant?.avatar}>
                        {otherParticipant?.name?.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {otherParticipant?.name}
                        </Typography>
                        <Chip
                          label={otherParticipant?.role}
                          size="small"
                          color={otherParticipant?.role === 'company' ? 'primary' : 'default'}
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="text.secondary">
                    {conversation.lastActivity && formatMessageTime(conversation.lastActivity)}
                  </Typography>
                </ListItem>
              );
            })}
            
            {filteredConversations.length === 0 && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No conversations found
                </Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={getOtherParticipant(selectedConversation)?.avatar}>
                    {getOtherParticipant(selectedConversation)?.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {getOtherParticipant(selectedConversation)?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getOtherParticipant(selectedConversation)?.role}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                {messages.map((message) => {
                  const isOwn = message.sender._id === user.id;
                  
                  return (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '70%',
                          bgcolor: isOwn ? 'primary.main' : 'grey.100',
                          color: isOwn ? 'white' : 'text.primary',
                          position: 'relative'
                        }}
                      >
                        {message.replyTo && (
                          <Box
                            sx={{
                              p: 1,
                              mb: 1,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              borderRadius: 1,
                              borderLeft: 3,
                              borderColor: 'primary.light'
                            }}
                          >
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              Replying to: {message.replyTo.content}
                            </Typography>
                          </Box>
                        )}
                        
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        
                        {message.attachments?.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {message.attachments.map((attachment, index) => (
                              <Chip
                                key={index}
                                label={attachment.originalName}
                                size="small"
                                onClick={() => window.open(attachment.url, '_blank')}
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {formatMessageTime(message.createdAt)}
                          </Typography>
                          
                          {isOwn && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setMenuAnchor(e.currentTarget);
                                setSelectedMessage(message);
                              }}
                              sx={{ color: 'inherit', ml: 1 }}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </Paper>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Box>

              {/* Reply Preview */}
              {replyTo && (
                <Box sx={{ p: 1, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                <Box sx={{ p: 1, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" gutterBottom>
                    Attachments ({attachments.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {attachments.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => removeAttachment(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    style={{ display: 'none' }}
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
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendingMessage}
                  />
                  
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || (!newMessage.trim() && attachments.length === 0)}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
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
              Are you sure you want to delete this message? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                )
              }}
            />
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {availableUsers
                .filter(user => 
                  user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                )
                .map((user) => (
                  <ListItem
                    key={user._id}
                    button
                    onClick={() => handleCreateConversation(user)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === 'student' ? 'primary' : 'secondary'}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              {availableUsers.filter(user => 
                user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
              ).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
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
