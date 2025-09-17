import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  CloudUpload,
  Assessment,
  CheckCircle,
  Warning,
  TrendingUp,
  School,
  Work,
  Code
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import aiService from '../../services/aiService';

const ResumeAnalyzer = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const response = await aiService.analyzeResume(file, true);
      setAnalysis(response.data);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getSentimentColor = (score) => {
    if (score > 0) return 'success';
    if (score === 0) return 'warning';
    return 'error';
  };

  const renderSkillCategory = (category, skills) => {
    if (skills.length === 0) return null;

    const categoryIcons = {
      programming: <Code />,
      databases: <Assessment />,
      cloud: <TrendingUp />,
      design: <School />,
      analytics: <Assessment />
    };

    return (
      <Box key={category} mb={2}>
        <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'capitalize' }}>
          {categoryIcons[category]} {category}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          {skills.map((skill, idx) => (
            <Chip key={idx} label={skill} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        AI Resume Analyzer
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload your resume to get AI-powered insights, skill extraction, and improvement suggestions.
      </Typography>

      {/* Upload Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          mb: 3,
          transition: 'all 0.3s ease'
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supports PDF, DOCX, and TXT files (max 5MB)
        </Typography>
        <Button variant="outlined" sx={{ mt: 2 }}>
          Choose File
        </Button>
      </Paper>

      {loading && (
        <Box display="flex" alignItems="center" justifyContent="center" p={4}>
          <CircularProgress sx={{ mr: 2 }} />
          <Typography>Analyzing your resume...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {analysis && (
        <Grid container spacing={3}>
          {/* Overall Score */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Overall Score</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h2" color={`${getScoreColor(analysis.overallScore)}.main`}>
                    {analysis.overallScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    out of 100
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={analysis.overallScore}
                    color={getScoreColor(analysis.overallScore)}
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Experience Level */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Work color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Experience Level</Typography>
                </Box>
                <Chip
                  label={analysis.experienceLevel}
                  color="primary"
                  sx={{ textTransform: 'capitalize', fontSize: '1rem', p: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sentiment Analysis */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Tone Analysis</Typography>
                </Box>
                <Typography variant="h4" color={`${getSentimentColor(analysis.sentiment.score)}.main`}>
                  {analysis.sentiment.score > 0 ? 'Positive' : 
                   analysis.sentiment.score === 0 ? 'Neutral' : 'Negative'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {analysis.sentiment.score} | Words: {analysis.sentiment.tokens}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Extracted Skills */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Extracted Skills
                </Typography>
                {Object.entries(analysis.skills).map(([category, skills]) =>
                  renderSkillCategory(category, skills)
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Education */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <School color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Education</Typography>
                </Box>
                {analysis.education.degrees.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Degrees:</Typography>
                    {analysis.education.degrees.map((degree, idx) => (
                      <Chip key={idx} label={degree} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
                {analysis.education.fields.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Fields:</Typography>
                    {analysis.education.fields.map((field, idx) => (
                      <Chip key={idx} label={field} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Projects */}
          {analysis.projects.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detected Projects
                  </Typography>
                  <List>
                    {analysis.projects.slice(0, 5).map((project, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <CheckCircle color="success" />
                        </ListItemIcon>
                        <ListItemText primary={project} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* AI Suggestions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI Improvement Suggestions
                </Typography>
                <List>
                  {analysis.suggestions.map((suggestion, idx) => (
                    <ListItem key={idx}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ResumeAnalyzer;
