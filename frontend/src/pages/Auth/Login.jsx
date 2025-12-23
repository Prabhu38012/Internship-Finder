import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff, Google, Apple } from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";

import { login, reset } from "../../store/slices/authSlice";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

// Slideshow images and taglines
const slides = [
  {
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    title: "Launch Your Career",
    subtitle: "Find Your Dream Internship",
  },
  {
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
    title: "Connect with Top Companies",
    subtitle: "Build Your Professional Network",
  },
  {
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    title: "Learn From Experts",
    subtitle: "Gain Real-World Experience",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

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

    if (isSuccess && user) {
      toast.success("Login successful!");
      navigate(from, { replace: true });
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch, from]);

  const onSubmit = (data) => {
    dispatch(login(data));
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
        <title>Login - InternQuest</title>
        <meta
          name="description"
          content="Login to your InternQuest account to access your dashboard and apply for internships."
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
                  stroke="url(#loginDiamondGradient)"
                  strokeWidth="3"
                  fill="none"
                />

                {/* Left Arrow */}
                <path
                  d="M30 60 L30 35 L22 43 M30 35 L38 43"
                  stroke="url(#loginArrowGradient1)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Center Arrow (taller) */}
                <path
                  d="M50 68 L50 25 L40 37 M50 25 L60 37"
                  stroke="url(#loginArrowGradient2)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Right Arrow */}
                <path
                  d="M70 60 L70 35 L62 43 M70 35 L78 43"
                  stroke="url(#loginArrowGradient1)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Gradients */}
                <defs>
                  <linearGradient id="loginDiamondGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="loginArrowGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#93c5fd" />
                  </linearGradient>
                  <linearGradient id="loginArrowGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
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
                Find Your Dream Internship
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
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 440 }}>
            <Typography
              variant="h3"
              sx={{ color: "white", fontWeight: "bold", mb: 1 }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}
            >
              New to InternQuest?{" "}
              <Link
                to="/register"
                style={{ color: "#3b82f6", textDecoration: "none" }}
              >
                Create an account
              </Link>
            </Typography>

            {isError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ ...inputStyles, mb: 2 }}
              />

              <TextField
                fullWidth
                label="Enter your password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
                sx={{ ...inputStyles, mb: 1 }}
              />

              <Box sx={{ textAlign: "right", mb: 3 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                  }}
                >
                  Forgot password?
                </Link>
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
                  "Sign in"
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
                  Or continue with
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

export default Login;
