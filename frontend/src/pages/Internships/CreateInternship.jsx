import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Delete,
  LocationOn,
  AttachMoney,
  Business,
  Schedule,
  Work,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import { createInternship } from "../../store/slices/internshipSlice";

const CreateInternship = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.internships);

  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    type: "internship",
    category: "",
    location: {
      type: "onsite",
      city: "",
      state: "",
      country: "",
      address: "",
    },
    remote: false,
    duration: {
      months: 3,
      startDate: "",
      endDate: "",
    },
    stipend: {
      amount: "",
      currency: "USD",
      period: "monthly",
    },
    skills: [],
    applicationDeadline: "",
    positions: 1,
    benefits: [],
    companyInfo: {
      name: "",
      website: "",
      industry: "",
    },
  });

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleLocationTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        type,
      },
      remote: type === "remote",
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
      setSkillDialogOpen(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.duration.startDate || !formData.applicationDeadline) {
      toast.error("Please provide start date and application deadline");
      return;
    }

    // Transform data to match backend requirements
    const submitData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      duration: `${formData.duration.months} months`,
      startDate: formData.duration.startDate,
      applicationDeadline: formData.applicationDeadline,
      requirements: formData.requirements || "No specific requirements",
      responsibilities:
        formData.responsibilities || "Will be discussed during onboarding",
      location: {
        type: formData.location.type,
        city: formData.location.city || "",
        state: formData.location.state || "",
        country: formData.location.country || "USA",
        address: formData.location.address || "",
      },
      remote: formData.remote,
      stipend: {
        amount: parseInt(formData.stipend.amount) || 0,
        currency: formData.stipend.currency,
        period: formData.stipend.period,
      },
      skills: formData.skills,
      positions: formData.positions,
      companyName: formData.companyInfo.name || "Company Name",
    };

    dispatch(createInternship(submitData))
      .unwrap()
      .then(() => {
        toast.success("Internship created successfully!");
        navigate("/company");
      })
      .catch((error) => {
        toast.error(error || "Failed to create internship");
      });
  };

  const categories = [
    "Software Development",
    "Data Science",
    "Machine Learning",
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Digital Marketing",
    "Business Development",
    "Finance",
    "Human Resources",
    "Content Writing",
    "Graphic Design",
    "Sales",
    "Operations",
    "Research",
    "Other",
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Consulting",
    "Media",
    "Non-profit",
    "Government",
    "Automotive",
    "Real Estate",
  ];

  return (
    <>
      <Helmet>
        <title>Create Internship - InternQuest</title>
        <meta
          name="description"
          content="Post a new internship opportunity for students."
        />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Create New Internship
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill out the details below to post your internship opportunity
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Internship Title *"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        fullWidth
                        placeholder="e.g., Software Development Intern"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category *</InputLabel>
                        <Select
                          value={formData.category}
                          label="Category *"
                          onChange={(e) =>
                            handleInputChange("category", e.target.value)
                          }
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={formData.type}
                          label="Type"
                          onChange={(e) =>
                            handleInputChange("type", e.target.value)
                          }
                        >
                          <MenuItem value="internship">Internship</MenuItem>
                          <MenuItem value="co-op">Co-op</MenuItem>
                          <MenuItem value="apprenticeship">
                            Apprenticeship
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Description *"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Describe the internship role, what the intern will do, and what they'll learn..."
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Requirements"
                        value={formData.requirements}
                        onChange={(e) =>
                          handleInputChange("requirements", e.target.value)
                        }
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="List the required qualifications, skills, and experience..."
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Responsibilities"
                        value={formData.responsibilities}
                        onChange={(e) =>
                          handleInputChange("responsibilities", e.target.value)
                        }
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Outline the key responsibilities and tasks..."
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Location
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Location Type</InputLabel>
                      <Select
                        value={formData.location.type}
                        label="Location Type"
                        onChange={(e) =>
                          handleLocationTypeChange(e.target.value)
                        }
                      >
                        <MenuItem value="onsite">On-site</MenuItem>
                        <MenuItem value="remote">Remote</MenuItem>
                        <MenuItem value="hybrid">Hybrid</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {formData.location.type !== "remote" && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="City"
                          value={formData.location.city}
                          onChange={(e) =>
                            handleInputChange("location.city", e.target.value)
                          }
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="State"
                          value={formData.location.state}
                          onChange={(e) =>
                            handleInputChange("location.state", e.target.value)
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Country"
                          value={formData.location.country}
                          onChange={(e) =>
                            handleInputChange(
                              "location.country",
                              e.target.value,
                            )
                          }
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Duration & Compensation */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Duration & Compensation
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Duration (months)"
                        type="number"
                        value={formData.duration.months}
                        onChange={(e) =>
                          handleInputChange(
                            "duration.months",
                            parseInt(e.target.value),
                          )
                        }
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Schedule />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Positions Available"
                        type="number"
                        value={formData.positions}
                        onChange={(e) =>
                          handleInputChange(
                            "positions",
                            parseInt(e.target.value),
                          )
                        }
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={formData.duration.startDate}
                        onChange={(e) =>
                          handleInputChange(
                            "duration.startDate",
                            e.target.value,
                          )
                        }
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Application Deadline"
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={(e) =>
                          handleInputChange(
                            "applicationDeadline",
                            e.target.value,
                          )
                        }
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        label="Stipend Amount"
                        type="number"
                        value={formData.stipend.amount}
                        onChange={(e) =>
                          handleInputChange("stipend.amount", e.target.value)
                        }
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel>Period</InputLabel>
                        <Select
                          value={formData.stipend.period}
                          label="Period"
                          onChange={(e) =>
                            handleInputChange("stipend.period", e.target.value)
                          }
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="total">Total</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Skills Required */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Skills Required</Typography>
                    <IconButton
                      onClick={() => setSkillDialogOpen(true)}
                      color="primary"
                    >
                      <Add />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {formData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={() => removeSkill(skill)}
                        deleteIcon={<Delete />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {formData.skills.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No skills added yet. Click + to add skills.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Company Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Company Name"
                        value={formData.companyInfo.name}
                        onChange={(e) =>
                          handleInputChange("companyInfo.name", e.target.value)
                        }
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Industry</InputLabel>
                        <Select
                          value={formData.companyInfo.industry}
                          label="Industry"
                          onChange={(e) =>
                            handleInputChange(
                              "companyInfo.industry",
                              e.target.value,
                            )
                          }
                        >
                          {industries.map((industry) => (
                            <MenuItem key={industry} value={industry}>
                              {industry}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Company Website"
                        value={formData.companyInfo.website}
                        onChange={(e) =>
                          handleInputChange(
                            "companyInfo.website",
                            e.target.value,
                          )
                        }
                        fullWidth
                        placeholder="https://company.com"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/company")}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Internship"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Add Skill Dialog */}
        <Dialog
          open={skillDialogOpen}
          onClose={() => setSkillDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Required Skill</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Skill"
              fullWidth
              variant="outlined"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addSkill();
                }
              }}
              placeholder="e.g., JavaScript, Python, React"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={addSkill}
              variant="contained"
              disabled={!newSkill.trim()}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default CreateInternship;
