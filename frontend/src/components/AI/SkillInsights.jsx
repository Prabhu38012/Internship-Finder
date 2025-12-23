import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";
import {
  TrendingUp,
  School,
  LocationOn,
  AttachMoney,
  Code,
  Refresh,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import aiService from "../../services/aiService";

const SkillInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    location: "",
  });

  const categories = [
    "Software Development",
    "Data Science",
    "Design",
    "Marketing",
    "Business",
    "Finance",
  ];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  useEffect(() => {
    fetchInsights();
  }, [filters]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await aiService.getSkillInsights(
        filters.category,
        filters.location,
      );
      setInsights(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch skill insights");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchInsights}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  const skillChartData =
    insights?.topSkills.slice(0, 10).map((skill) => ({
      name: skill.skill,
      demand: skill.demand,
      avgStipend: skill.avgStipend,
    })) || [];

  const categoryChartData =
    insights?.topCategories.map((cat, index) => ({
      name: cat.category,
      value: cat.opportunities,
      color: COLORS[index % COLORS.length],
    })) || [];

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        AI Skill Insights & Market Trends
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Discover the most in-demand skills and market trends based on current
        internship postings.
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Category"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              size="small"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              placeholder="e.g., San Francisco"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchInsights}
              fullWidth
            >
              Refresh Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {insights && (
        <Grid container spacing={3}>
          {/* Summary Stats */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Market Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {insights.totalInternships}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Internships
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {insights.topSkills.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Skills Tracked
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {insights.topCategories.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Categories
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {insights.topLocations.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Locations
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Skills Chart */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Most In-Demand Skills
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "demand"
                            ? `${value} opportunities`
                            : `$${value}`,
                          name === "demand" ? "Demand" : "Avg Stipend",
                        ]}
                      />
                      <Bar dataKey="demand" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Distribution
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Skills List */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Code color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Trending Skills</Typography>
                </Box>
                <List>
                  {insights.topSkills.slice(0, 10).map((skill, index) => (
                    <ListItem key={skill.skill} divider>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body1"
                              sx={{ textTransform: "capitalize" }}
                            >
                              {skill.skill}
                            </Typography>
                            <Chip
                              label={`${skill.demand} jobs`}
                              size="small"
                              color="primary"
                            />
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <AttachMoney fontSize="small" />
                            <Typography variant="body2">
                              Avg: ${skill.avgStipend}/month
                            </Typography>
                            <Box
                              ml={2}
                              display="flex"
                              flexWrap="wrap"
                              gap={0.5}
                            >
                              {skill.categories.slice(0, 2).map((cat, idx) => (
                                <Chip
                                  key={idx}
                                  label={cat}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Locations */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Top Locations</Typography>
                </Box>
                <List>
                  {insights.topLocations.slice(0, 10).map((location, index) => (
                    <ListItem key={location.location} divider>
                      <ListItemText
                        primary={
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography variant="body1">
                              {location.location}
                            </Typography>
                            <Chip
                              label={`${location.opportunities} opportunities`}
                              size="small"
                              color="secondary"
                            />
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <AttachMoney fontSize="small" />
                            <Typography variant="body2">
                              Avg Stipend: ${location.avgStipend}/month
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Categories Overview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <School color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Category Insights</Typography>
                </Box>
                <Grid container spacing={2}>
                  {insights.topCategories.map((category, index) => (
                    <Grid item xs={12} sm={6} md={4} key={category.category}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: "center",
                          bgcolor: `${COLORS[index % COLORS.length]}15`,
                          border: `1px solid ${COLORS[index % COLORS.length]}30`,
                        }}
                      >
                        <Typography variant="h6" color="primary">
                          {category.category}
                        </Typography>
                        <Typography variant="h4" sx={{ my: 1 }}>
                          {category.opportunities}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          opportunities
                        </Typography>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          mt={1}
                        >
                          <AttachMoney fontSize="small" />
                          <Typography variant="body2">
                            ${category.avgStipend}/month avg
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SkillInsights;
