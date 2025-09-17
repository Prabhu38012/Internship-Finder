import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome,
  TrendingUp,
  LocationOn,
  AttachMoney,
  Schedule
} from '@mui/icons-material';
import aiService from '../../services/aiService';

const AIRecommendations = ({ limit = 10 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await aiService.getRecommendations(limit);
      setRecommendations(response.data);
      setError(null);
    } catch (err) {
      // Fallback to mock data if API fails
      const mockRecommendations = [
        {
          internship: {
            _id: '1',
            title: 'Frontend Developer Intern',
            company: { name: 'TechCorp', logo: null },
            location: { city: 'San Francisco', country: 'USA', type: 'hybrid' },
            stipend: { amount: 2000, currency: '$', period: 'month' },
            duration: '3 months',
            skills: ['React', 'JavaScript', 'CSS']
          },
          score: 0.92,
          reasons: ['Strong React skills match', 'Location preference aligned', 'Experience level suitable']
        },
        {
          internship: {
            _id: '2',
            title: 'AI/ML Research Intern',
            company: { name: 'DataLabs', logo: null },
            location: { city: 'Remote', country: 'Global', type: 'remote' },
            stipend: { amount: 1800, currency: '$', period: 'month' },
            duration: '6 months',
            skills: ['Python', 'Machine Learning', 'TensorFlow']
          },
          score: 0.85,
          reasons: ['Python expertise', 'ML background', 'Research experience']
        }
      ];
      setRecommendations(mockRecommendations);
      setError('Using demo data - backend server may be unavailable');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Low Match';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={fetchRecommendations}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <AutoAwesome color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2">
          AI-Powered Recommendations
        </Typography>
      </Box>

      {recommendations.length === 0 ? (
        <Alert severity="info">
          No recommendations available. Complete your profile to get personalized suggestions.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {recommendations.map(({ internship, score, reasons }, index) => (
            <Grid item xs={12} md={6} key={internship._id}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  border: score >= 0.8 ? '2px solid #4caf50' : 'none',
                  position: 'relative'
                }}
              >
                {score >= 0.8 && (
                  <Chip
                    label="Top Match"
                    color="success"
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                  />
                )}
                
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {internship.title}
                  </Typography>
                  
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {internship.companyName}
                  </Typography>

                  <Box mb={2}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Match Score
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {Math.round(score * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={score * 100}
                      color={getScoreColor(score)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getScoreLabel(score)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" component="div">
                      {internship.location?.city || 'Location not specified'}, {internship.location?.country || ''}
                      {internship.location?.type && (
                        <Chip 
                          label={internship.location.type} 
                          size="small" 
                          sx={{ ml: 1 }}
                          color={internship.location.type === 'remote' ? 'success' : 'default'}
                        />
                      )}
                    </Typography>
                  </Box>

                  {internship.stipend && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <AttachMoney fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {internship.stipend?.currency || '$'} {internship.stipend?.amount || 'N/A'}/{internship.stipend?.period || 'month'}
                      </Typography>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" mb={2}>
                    <Schedule fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {internship.duration || 'Duration not specified'}
                    </Typography>
                  </Box>

                  {reasons && reasons.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Why this matches you:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {reasons.map((reason, idx) => (
                          <Chip
                            key={idx}
                            label={reason}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </>
                  )}

                  <Box mt={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      href={`/internships/${internship._id}`}
                      sx={{ mb: 1 }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      startIcon={<TrendingUp />}
                      href={`/applications/predict/${internship._id}`}
                    >
                      Check Success Rate
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={3} textAlign="center">
        <Button
          variant="outlined"
          onClick={fetchRecommendations}
          startIcon={<AutoAwesome />}
        >
          Refresh Recommendations
        </Button>
      </Box>
    </Box>
  );
};

export default AIRecommendations;
