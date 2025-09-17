import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Timeline,
  Assessment,
  Psychology
} from '@mui/icons-material';

const PredictiveAnalytics = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call with mock data since we don't have a specific internship ID
      setTimeout(() => {
        const mockPrediction = {
          probability: 0.75,
          confidence: 0.82,
          dataPoints: 150,
          factors: {
            skillMatch: 0.85,
            experience: 0.65,
            education: 0.90,
            timing: 0.70,
            competition: 0.55
          },
          recommendations: [
            "Highlight your relevant project experience in your application",
            "Consider applying early as timing affects success rate",
            "Emphasize your educational background which is a strong match",
            "Build more hands-on experience in the required technologies"
          ]
        };
        setPrediction(mockPrediction);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to predict success rate');
      setLoading(false);
    }
  };

  const getSuccessColor = (probability) => {
    if (probability >= 0.7) return 'success';
    if (probability >= 0.4) return 'warning';
    return 'error';
  };

  const getSuccessLabel = (probability) => {
    if (probability >= 0.8) return 'Very High';
    if (probability >= 0.6) return 'High';
    if (probability >= 0.4) return 'Medium';
    if (probability >= 0.2) return 'Low';
    return 'Very Low';
  };

  const getFactorIcon = (factor) => {
    const icons = {
      skillMatch: <CheckCircle />,
      experience: <Timeline />,
      education: <Assessment />,
      timing: <TrendingUp />,
      competition: <Psychology />
    };
    return icons[factor] || <Assessment />;
  };

  const getFactorLabel = (factor) => {
    const labels = {
      skillMatch: 'Skill Match',
      experience: 'Experience Level',
      education: 'Education Match',
      timing: 'Application Timing',
      competition: 'Competition Level'
    };
    return labels[factor] || factor;
  };

  const getFactorColor = (score) => {
    if (score >= 0.7) return 'success';
    if (score >= 0.4) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Psychology sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                Application Success Predictor
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get personalized insights about your application success rate based on your profile, skills, and historical data.
              </Typography>
            </Box>
          </Box>

          {!prediction && !loading && (
            <Button
              variant="contained"
              startIcon={<Assessment />}
              onClick={fetchPrediction}
              size="large"
              sx={{ mt: 2 }}
            >
              Analyze My Chances
            </Button>
          )}

          {loading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
              <CircularProgress sx={{ mr: 2 }} />
              <Typography>Analyzing your profile and market data...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
              <Button onClick={() => window.location.reload()} sx={{ ml: 2 }}>
                Retry
              </Button>
            </Alert>
          )}

          {prediction && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Success Rate Card */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Box textAlign="center">
                      <Typography variant="h6" gutterBottom>
                        Success Probability
                      </Typography>
                      <Box position="relative" display="inline-flex" mb={2}>
                        <CircularProgress
                          variant="determinate"
                          value={prediction.probability * 100}
                          size={120}
                          thickness={6}
                          color={getSuccessColor(prediction.probability)}
                        />
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          bottom={0}
                          right={0}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexDirection="column"
                        >
                          <Typography variant="h4" component="div" color="text.primary">
                            {Math.round(prediction.probability * 100)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={getSuccessLabel(prediction.probability)}
                        color={getSuccessColor(prediction.probability)}
                        size="large"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Confidence Score */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Prediction Confidence
                    </Typography>
                    <Box mb={2}>
                      <LinearProgress
                        variant="determinate"
                        value={prediction.confidence * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                        color={prediction.confidence >= 0.7 ? 'success' : 'warning'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(prediction.confidence * 100)}% confidence in this prediction
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Based on {prediction.dataPoints || 'available'} similar applications
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contributing Factors */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Key Success Factors
                    </Typography>
                    <List>
                      {Object.entries(prediction.factors || {}).map(([factor, score]) => (
                        <ListItem key={factor}>
                          <ListItemIcon>
                            {getFactorIcon(factor)}
                          </ListItemIcon>
                          <ListItemText
                            primary={getFactorLabel(factor)}
                            secondary={
                              <React.Fragment>
                                <LinearProgress
                                  variant="determinate"
                                  value={score * 100}
                                  color={getFactorColor(score)}
                                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                                  {Math.round(score * 100)}% match
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recommendations */}
              {prediction.recommendations && prediction.recommendations.length > 0 && (
                <Grid item xs={12}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        AI Recommendations
                      </Typography>
                      <List>
                        {prediction.recommendations.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <TrendingUp color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PredictiveAnalytics;
