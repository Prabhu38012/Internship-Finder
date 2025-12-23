import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Grid,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  X,
  CheckCircle,
  XCircle,
  Mail,
  GraduationCap,
  Briefcase,
  Code2,
  Star,
  BarChart3,
} from "lucide-react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import toast from "react-hot-toast";
import { internshipAPI } from "../../services/api";

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip,
  Legend,
);

// Colors for candidates
const CANDIDATE_COLORS = [
  { bg: "rgba(59, 130, 246, 0.2)", border: "rgb(59, 130, 246)" }, // Blue
  { bg: "rgba(16, 185, 129, 0.2)", border: "rgb(16, 185, 129)" }, // Green
  { bg: "rgba(249, 115, 22, 0.2)", border: "rgb(249, 115, 22)" }, // Orange
];

const CandidateComparison = ({
  open,
  onClose,
  candidates = [],
  internshipTitle,
  onStatusUpdate,
}) => {
  // Calculate metrics for radar chart (0-100 scale)
  const calculateMetrics = (candidate) => {
    const profile = candidate.applicant?.studentProfile || {};

    // Skills score (based on number of skills, max 10)
    const skillsScore = Math.min((profile.skills?.length || 0) * 10, 100);

    // Experience score (based on experience entries)
    const experienceScore = Math.min(
      (profile.experience?.length || 0) * 25,
      100,
    );

    // Education score (based on education entries)
    const educationScore = Math.min((profile.education?.length || 0) * 33, 100);

    // Projects score (based on project count)
    const projectsScore = Math.min((profile.projects?.length || 0) * 20, 100);

    // Overall profile completeness
    const completenessScore = Math.round(
      (((skillsScore +
        experienceScore +
        educationScore +
        projectsScore +
        (profile.bio ? 20 : 0) +
        (profile.resume ? 20 : 0) +
        (profile.portfolio ? 20 : 0)) /
        7) *
        100) /
        100,
    );

    return {
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      projects: projectsScore,
      completeness: completenessScore,
    };
  };

  // Prepare radar chart data
  const getChartData = () => {
    const labels = [
      "Technical Skills",
      "Experience",
      "Education",
      "Projects",
      "Profile Complete",
    ];

    const datasets = candidates.map((candidate, index) => {
      const metrics = calculateMetrics(candidate);
      return {
        label: candidate.applicant?.name || `Candidate ${index + 1}`,
        data: [
          metrics.skills,
          metrics.experience,
          metrics.education,
          metrics.projects,
          metrics.completeness,
        ],
        backgroundColor: CANDIDATE_COLORS[index].bg,
        borderColor: CANDIDATE_COLORS[index].border,
        borderWidth: 2,
        pointBackgroundColor: CANDIDATE_COLORS[index].border,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: CANDIDATE_COLORS[index].border,
      };
    });

    return { labels, datasets };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#fff",
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          color: "#94a3b8",
          backdropColor: "transparent",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.2)",
        },
        angleLines: {
          color: "rgba(148, 163, 184, 0.2)",
        },
        pointLabels: {
          color: "#e2e8f0",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      await internshipAPI.updateApplicationStatus(applicationId, status);
      toast.success(`Application ${status} successfully!`);
      if (onStatusUpdate) onStatusUpdate();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSendEmail = (email, name) => {
    window.location.href = `mailto:${email}?subject=Regarding your application for ${internshipTitle}`;
  };

  if (candidates.length < 2) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1e293b",
          backgroundImage: "none",
          color: "white",
          borderRadius: 3,
          minHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Compare Candidates ({candidates.length})
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {internshipTitle}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Candidate Cards Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {candidates.map((candidate, index) => (
            <Grid item xs={12} md={12 / candidates.length} key={candidate._id}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: "#0f172a",
                  borderRadius: 3,
                  border: `2px solid ${CANDIDATE_COLORS[index].border}`,
                  height: "100%",
                }}
              >
                {/* Avatar and Name */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    src={candidate.applicant?.avatar}
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: CANDIDATE_COLORS[index].border,
                    }}
                  >
                    {candidate.applicant?.name?.charAt(0) || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {candidate.applicant?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {candidate.applicant?.email}
                    </Typography>
                  </Box>
                </Box>

                <Divider
                  sx={{ my: 2, borderColor: "rgba(148, 163, 184, 0.2)" }}
                />

                {/* Skills */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Code2
                      className="w-4 h-4"
                      style={{ color: CANDIDATE_COLORS[index].border }}
                    />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Skills
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {candidate.applicant?.studentProfile?.skills
                      ?.slice(0, 5)
                      .map((skill, i) => (
                        <Chip
                          key={i}
                          label={skill}
                          size="small"
                          sx={{
                            bgcolor: "rgba(148, 163, 184, 0.1)",
                            color: "#e2e8f0",
                            fontSize: "0.7rem",
                          }}
                        />
                      )) || (
                      <Typography variant="body2" color="text.secondary">
                        No skills listed
                      </Typography>
                    )}
                    {(candidate.applicant?.studentProfile?.skills?.length ||
                      0) > 5 && (
                      <Chip
                        label={`+${candidate.applicant.studentProfile.skills.length - 5} more`}
                        size="small"
                        sx={{
                          bgcolor: "rgba(59, 130, 246, 0.2)",
                          color: "#3b82f6",
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Education */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <GraduationCap
                      className="w-4 h-4"
                      style={{ color: CANDIDATE_COLORS[index].border }}
                    />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Education
                    </Typography>
                  </Box>
                  {candidate.applicant?.studentProfile?.education
                    ?.slice(0, 1)
                    .map((edu, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        color="text.secondary"
                      >
                        {edu.degree} in {edu.field} • {edu.institution}
                      </Typography>
                    )) || (
                    <Typography variant="body2" color="text.secondary">
                      {candidate.applicant?.studentProfile?.university ||
                        "Not specified"}
                    </Typography>
                  )}
                </Box>

                {/* Experience */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Briefcase
                      className="w-4 h-4"
                      style={{ color: CANDIDATE_COLORS[index].border }}
                    />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Experience
                    </Typography>
                  </Box>
                  {candidate.applicant?.studentProfile?.experience
                    ?.slice(0, 1)
                    .map((exp, i) => (
                      <Typography
                        key={i}
                        variant="body2"
                        color="text.secondary"
                      >
                        {exp.title} at {exp.company}
                      </Typography>
                    )) || (
                    <Typography variant="body2" color="text.secondary">
                      {candidate.applicant?.studentProfile?.projects?.length
                        ? `${candidate.applicant.studentProfile.projects.length} projects`
                        : "No experience listed"}
                    </Typography>
                  )}
                </Box>

                {/* Quick Actions */}
                <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
                  <Tooltip title="Accept">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleStatusUpdate(candidate._id, "accepted")
                      }
                      sx={{
                        bgcolor: "rgba(16, 185, 129, 0.2)",
                        color: "#10b981",
                        "&:hover": { bgcolor: "rgba(16, 185, 129, 0.3)" },
                      }}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleStatusUpdate(candidate._id, "rejected")
                      }
                      sx={{
                        bgcolor: "rgba(239, 68, 68, 0.2)",
                        color: "#ef4444",
                        "&:hover": { bgcolor: "rgba(239, 68, 68, 0.3)" },
                      }}
                    >
                      <XCircle className="w-5 h-5" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Email">
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleSendEmail(
                          candidate.applicant?.email,
                          candidate.applicant?.name,
                        )
                      }
                      sx={{
                        bgcolor: "rgba(59, 130, 246, 0.2)",
                        color: "#3b82f6",
                        "&:hover": { bgcolor: "rgba(59, 130, 246, 0.3)" },
                      }}
                    >
                      <Mail className="w-5 h-5" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Status Badge */}
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={candidate.status?.toUpperCase()}
                    size="small"
                    color={
                      candidate.status === "accepted"
                        ? "success"
                        : candidate.status === "rejected"
                          ? "error"
                          : candidate.status === "shortlisted"
                            ? "primary"
                            : "warning"
                    }
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Radar Chart */}
        <Paper
          sx={{
            p: 3,
            bgcolor: "#0f172a",
            borderRadius: 3,
            height: 400,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <BarChart3 className="w-5 h-5 text-yellow-400" />
            Skills Comparison
          </Typography>
          <Box sx={{ height: 320 }}>
            <Radar data={getChartData()} options={chartOptions} />
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, borderTop: "1px solid rgba(148, 163, 184, 0.2)" }}
      >
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CandidateComparison;
