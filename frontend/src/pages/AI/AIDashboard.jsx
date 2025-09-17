import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Fab,
  Badge
} from '@mui/material';
import {
  AutoAwesome,
  Assessment,
  Psychology,
  TrendingUp,
  SmartToy,
  Chat
} from '@mui/icons-material';
import AIRecommendations from '../../components/AI/AIRecommendations';
import ResumeAnalyzer from '../../components/AI/ResumeAnalyzer';
import PredictiveAnalytics from '../../components/AI/PredictiveAnalytics';
import SkillInsights from '../../components/AI/SkillInsights';
import AIChatbot from '../../components/AI/AIChatbot';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AIDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotMinimized, setChatbotMinimized] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChatbotToggle = () => {
    setChatbotOpen(!chatbotOpen);
    if (!chatbotOpen) {
      setUnreadMessages(0);
    }
  };

  const handleChatbotMinimize = () => {
    setChatbotMinimized(!chatbotMinimized);
  };

  const tabs = [
    {
      label: 'Smart Recommendations',
      icon: <AutoAwesome />,
      component: <AIRecommendations />
    },
    {
      label: 'Resume Analyzer',
      icon: <Assessment />,
      component: <ResumeAnalyzer />
    },
    {
      label: 'Success Predictor',
      icon: <Psychology />,
      component: <PredictiveAnalytics />
    },
    {
      label: 'Market Insights',
      icon: <TrendingUp />,
      component: <SkillInsights />
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            AI Career Assistant
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Leverage artificial intelligence to supercharge your internship search and career development
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{ minHeight: 64, textTransform: 'none' }}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {tab.component}
          </TabPanel>
        ))}

        {/* Floating Chatbot Button */}
        <Fab
          color="primary"
          aria-label="AI Assistant"
          onClick={handleChatbotToggle}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <Badge badgeContent={unreadMessages} color="error">
            <SmartToy />
          </Badge>
        </Fab>

        {/* AI Chatbot */}
        <AIChatbot
          isOpen={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
          isMinimized={chatbotMinimized}
          onToggleMinimize={handleChatbotMinimize}
        />
      </Box>
    </Container>
  );
};

export default AIDashboard;
