import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Checkbox,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Google, Apple } from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import { register as registerUser, reset } from "../../store/slices/authSlice";

const schema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  role: yup
    .string()
    .oneOf(["student", "company"], "Please select a role")
    .required("Role is required"),
  phone: yup.string().optional(),
});

// Slideshow images and taglines
const slides = [
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    title: "Join Our Community",
    subtitle: "10,000+ Active Internships",
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    title: "Start Your Journey",
    subtitle: "Connect with Top Companies",
  },
  {
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
    title: "Build Your Future",
    subtitle: "AI-Powered Recommendations",
  },
];

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: "student",
    },
  });

  const selectedRole = watch("role");

  // Auto-rotate slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      toast.success("Registration successful! Welcome to InternQuest.");
      navigate("/dashboard");
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (data) => {
    if (!agreeTerms) {
      toast.error("Please agree to the Terms & Conditions");
      return;
    }
    const { confirmPassword, ...userData } = data;
    dispatch(registerUser(userData));
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderRadius: 2,
      color: "white",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
        borderWidth: 1,
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.5)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "rgba(255, 255, 255, 0.7)",
    },
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - InternQuest</title>
        <meta
          name="description"
          content="Create your InternQuest account and start your journey to find amazing internship opportunities."
        />
      </Helmet>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          backgroundColor: "#0a0a0f",
        }}
      >
        {/* Left Side - Logo Panel */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flex: 1,
            p: 3,
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              width: "100%",
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              p: 4,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                InternQuest
              </Typography>
              <Button
                component={Link}
                to="/"
                variant="outlined"
                size="small"
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  borderRadius: 3,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Back to website →
              </Button>
            </Box>

            {/* Center - Large Logo */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {/* APEX-style Diamond Logo */}
              <svg
                width="180"
                height="180"
                viewBox="0 0 100 100"
                fill="none"
              >
                {/* Diamond Shape */}
                <path
                  d="M50 5 L95 50 L50 95 L5 50 Z"
                  stroke="url(#registerDiamondGradient)"
                  strokeWidth="3"
                  fill="none"
                />

                {/* Left Arrow */}
                <path
                  d="M30 60 L30 35 L22 43 M30 35 L38 43"
                  stroke="url(#registerArrowGradient1)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Center Arrow (taller) */}
                <path
                  d="M50 68 L50 25 L40 37 M50 25 L60 37"
                  stroke="url(#registerArrowGradient2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Right Arrow */}
                <path
                  d="M70 60 L70 35 L62 43 M70 35 L78 43"
                  stroke="url(#registerArrowGradient1)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Gradients */}
                <defs>
                  <linearGradient id="registerDiamondGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="registerArrowGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#93c5fd" />
                  </linearGradient>
                  <linearGradient id="registerArrowGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Brand Name */}
              <Typography
                variant="h2"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                INTERN<span style={{ color: "#60a5fa" }}>QUEST</span>
              </Typography>

              {/* Tagline */}
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 400,
                  textAlign: "center",
                }}
              >
                Start Your Career Journey
              </Typography>
            </Box>

            {/* Footer spacer */}
            <Box />
          </Box>
        </Box>

        {/* Right Side - Form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 3, md: 6 },
            overflowY: "auto",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 480 }}>
            <Typography
              variant="h3"
              sx={{ color: "white", fontWeight: "bold", mb: 1 }}
            >
              Create an account
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ color: "#3b82f6", textDecoration: "none" }}
              >
                Log in
              </Link>
            </Typography>

            {isError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Role Selection */}
              <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
                <FormLabel
                  component="legend"
                  sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
                >
                  I am a:
                </FormLabel>
                <RadioGroup
                  row
                  value={selectedRole}
                  onChange={(e) => setValue("role", e.target.value)}
                >
                  <FormControlLabel
                    value="student"
                    control={
                      <Radio
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                          "&.Mui-checked": { color: "#3b82f6" },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: "white" }}>Student</Typography>
                    }
                  />
                  <FormControlLabel
                    value="company"
                    control={
                      <Radio
                        sx={{
                          color: "rgba(255,255,255,0.5)",
                          "&.Mui-checked": { color: "#3b82f6" },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: "white" }}>Company</Typography>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    autoComplete="name"
                    autoFocus
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={inputStyles}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    autoComplete="tel"
                    {...register("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={inputStyles}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={inputStyles}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputStyles}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                            sx={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={inputStyles}
                  />
                </Grid>
              </Grid>

              {/* Terms Checkbox */}
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        "&.Mui-checked": { color: "#3b82f6" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        style={{ color: "#3b82f6", textDecoration: "none" }}
                      >
                        Terms & Conditions
                      </Link>
                    </Typography>
                  }
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  },
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Create account"
                )}
              </Button>

              <Divider
                sx={{
                  my: 3,
                  color: "rgba(255,255,255,0.3)",
                  "&::before, &::after": {
                    borderColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Or register with
                </Typography>
              </Divider>

              {/* Social Login Buttons */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "white",
                    textTransform: "none",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.3)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Apple />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "white",
                    textTransform: "none",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.3)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Apple
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Register;
