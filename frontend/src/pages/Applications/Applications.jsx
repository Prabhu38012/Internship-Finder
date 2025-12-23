import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MoreVert,
  Visibility,
  Delete,
  Business,
  Schedule,
  LocationOn,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";

import {
  getMyApplications,
  getCompanyApplications,
  withdrawApplication,
} from "../../store/slices/applicationSlice";
import LoadingSpinner from "../../components/UI/LoadingSpinner";

const Applications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { applications, companyApplications, isLoading } = useSelector(
    (state) => state.applications,
  );

  const [currentTab, setCurrentTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    if (user?.role === "student") {
      dispatch(
        getMyApplications({
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
      );
    } else if (user?.role === "company") {
      dispatch(
        getCompanyApplications({
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
      );
    }
  }, [dispatch, user, statusFilter]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    const statuses = ["all", "pending", "reviewing", "accepted", "rejected"];
    setStatusFilter(statuses[newValue]);
  };

  const handleMenuOpen = (event, application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleWithdraw = () => {
    if (selectedApplication) {
      dispatch(
        withdrawApplication({
          id: selectedApplication._id,
          reason: "Withdrawn by applicant",
        }),
      );
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      case "reviewing":
        return "info";
      case "shortlisted":
        return "primary";
      case "interviewed":
        return "secondary";
      case "withdrawn":
        return "default";
      default:
        return "default";
    }
  };

  const tabLabels = ["All", "Pending", "Reviewing", "Accepted", "Rejected"];

  if (isLoading) {
    return <LoadingSpinner message="Loading applications..." />;
  }

  const displayApplications =
    user?.role === "student" ? applications : companyApplications;

  return (
    <>
      <Helmet>
        <title>Applications - InternQuest</title>
        <meta
          name="description"
          content="Manage your internship applications and track their status."
        />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            {user?.role === "student"
              ? "My Applications"
              : "Received Applications"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.role === "student"
              ? "Track the status of your internship applications"
              : "Review and manage applications for your internships"}
          </Typography>
        </Box>

        {/* Status Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        {/* Applications Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {user?.role === "student" ? (
                    <>
                      <TableCell>Internship</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Applied Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>Applicant</TableCell>
                      <TableCell>Internship</TableCell>
                      <TableCell>Applied Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayApplications?.map((application) => (
                  <TableRow key={application._id} hover>
                    {user?.role === "student" ? (
                      <>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {application.internship?.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {application.internship?.type}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Business fontSize="small" color="action" />
                            <Typography variant="body2">
                              {application.internship?.companyName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2">
                              {application.internship?.location?.type ===
                              "remote"
                                ? "Remote"
                                : `${application.internship?.location?.city}`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(
                              new Date(application.createdAt),
                              "MMM dd, yyyy",
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status}
                            size="small"
                            color={getStatusColor(application.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            to={`/applications/${application._id}`}
                            startIcon={<Visibility />}
                            size="small"
                          >
                            View
                          </Button>
                          {application.status === "pending" && (
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, application)}
                              size="small"
                            >
                              <MoreVert />
                            </IconButton>
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              src={application.applicant?.avatar}
                              sx={{ width: 40, height: 40 }}
                            >
                              {application.applicant?.name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {application.applicant?.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  application.applicant?.studentProfile
                                    ?.university
                                }
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {application.internship?.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(
                              new Date(application.createdAt),
                              "MMM dd, yyyy",
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status}
                            size="small"
                            color={getStatusColor(application.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            component={Link}
                            to={`/applications/${application._id}`}
                            startIcon={<Visibility />}
                            size="small"
                            variant="outlined"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {displayApplications?.length === 0 && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                No applications found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user?.role === "student"
                  ? "You haven't applied to any internships yet"
                  : "No applications received for your internships yet"}
              </Typography>
              {user?.role === "student" && (
                <Button variant="contained" component={Link} to="/internships">
                  Browse Internships
                </Button>
              )}
            </Box>
          )}
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleWithdraw}>
            <Delete sx={{ mr: 1 }} />
            Withdraw Application
          </MenuItem>
        </Menu>
      </Container>
    </>
  );
};

export default Applications;
