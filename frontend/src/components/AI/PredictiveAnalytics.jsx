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
  ListItemText,
  TextField
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Timeline,
  Assessment,
  Psychology
} from '@mui/icons-material';
import aiService from '../../services/aiService';

const PredictiveAnalytics = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [internshipId, setInternshipId] = useState('');

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const trimmedId = internshipId.trim();
      if (!trimmedId) {
        setLoading(false);
        setError('Please enter an internship ID to analyze your chances.');
        return;
      }

      const response = await aiService.predictSuccess(trimmedId);

      if (!response.success) {
        throw new Error(response.message || 'Failed to predict success rate');
      }

      const data = response.data;
      const mappedPrediction = {
        probability: data.successProbability,
        confidence: data.confidence,
        factors: data.factors || {},
        recommendations: data.recommendations || [],
        dataPoints: data.dataPoints
      };

      setPrediction(mappedPrediction);
      setLoading(false);
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
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2
              }}
            >
              <TextField
                label="Internship ID"
                variant="outlined"
                size="small"
                value={internshipId}
                onChange={(e) => setInternshipId(e.target.value)}
                placeholder="Enter internship ID"
                sx={{ minWidth: 260 }}
              />
              <Button
                variant="contained"
                startIcon={<Assessment />}
                onClick={fetchPrediction}
                size="large"
              >
                Analyze My Chances
              </Button>
            </Box>
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
