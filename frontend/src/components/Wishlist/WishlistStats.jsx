import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

const WishlistStats = ({ stats, reminders = 0, closingSoon = 0 }) => {
  const getProgressValue = (value, total) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    progress,
  }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <Box display="flex" alignItems="center">
            {icon}
            <Typography variant="h6" component="div" ml={1}>
              {value}
            </Typography>
          </Box>
          <Chip label={title} color={color} size="small" />
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mb={1}>
            {subtitle}
          </Typography>
        )}
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={progress}
            color={color}
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box mb={3}>
      <Typography variant="h6" gutterBottom>
        Wishlist Overview
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Items"
            value={stats.total || 0}
            icon={<FavoriteIcon color="primary" />}
            color="primary"
            subtitle="Items in your wishlist"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Priority"
            value={stats.byPriority?.high || 0}
            icon={<StarIcon color="error" />}
            color="error"
            subtitle="Must-apply positions"
            progress={getProgressValue(
              stats.byPriority?.high || 0,
              stats.total || 1,
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Applied"
            value={stats.byCategory?.applied || 0}
            icon={<AssignmentIcon color="success" />}
            color="success"
            subtitle="Applications submitted"
            progress={getProgressValue(
              stats.byCategory?.applied || 0,
              stats.total || 1,
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dream Jobs"
            value={stats.byCategory?.dream_job || 0}
            icon={<TrendingUpIcon color="secondary" />}
            color="secondary"
            subtitle="Your top choices"
          />
        </Grid>

        {(reminders > 0 || closingSoon > 0) && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Reminders Due"
                value={reminders}
                icon={<ScheduleIcon color="warning" />}
                color="warning"
                subtitle="Action items pending"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Closing Soon"
                value={closingSoon}
                icon={<WarningIcon color="error" />}
                color="error"
                subtitle="Deadlines within 7 days"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Category Breakdown */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Category Breakdown
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Interested</Typography>
                  <Chip
                    label={stats.byCategory?.interested || 0}
                    color="primary"
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    stats.byCategory?.interested || 0,
                    stats.total || 1,
                  )}
                  color="primary"
                />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Backup Options</Typography>
                  <Chip
                    label={stats.byCategory?.backup || 0}
                    color="info"
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    stats.byCategory?.backup || 0,
                    stats.total || 1,
                  )}
                  color="info"
                />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Dream Jobs</Typography>
                  <Chip
                    label={stats.byCategory?.dream_job || 0}
                    color="secondary"
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    stats.byCategory?.dream_job || 0,
                    stats.total || 1,
                  )}
                  color="secondary"
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Applied</Typography>
                  <Chip
                    label={stats.byCategory?.applied || 0}
                    color="success"
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    stats.byCategory?.applied || 0,
                    stats.total || 1,
                  )}
                  color="success"
                />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2">Rejected</Typography>
                  <Chip
                    label={stats.byCategory?.rejected || 0}
                    color="error"
                    size="small"
                  />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue(
                    stats.byCategory?.rejected || 0,
                    stats.total || 1,
                  )}
                  color="error"
                />

                {/* Priority Breakdown */}
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  Priority Distribution
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="center">
                  <Chip
                    label={`High: ${stats.byPriority?.high || 0}`}
                    color="error"
                    size="small"
                  />
                  <Chip
                    label={`Medium: ${stats.byPriority?.medium || 0}`}
                    color="warning"
                    size="small"
                  />
                  <Chip
                    label={`Low: ${stats.byPriority?.low || 0}`}
                    color="info"
                    size="small"
                  />
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WishlistStats;
