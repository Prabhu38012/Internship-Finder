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
        borderColor: "#3b82f6",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(255, 255, 255, 0.5)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#3b82f6",
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
        {/* Left Side - Image Slideshow */}
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
            }}
          >
            {/* Slideshow Images */}
            {slides.map((slide, index) => (
              <Box
                key={index}
                component="img"
                src={slide.image}
                alt={slide.title}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: currentSlide === index ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                }}
              />
            ))}

            {/* Dark Overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)",
              }}
            />

            {/* Overlay Content */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: 4,
                zIndex: 2,
              }}
            >
              {/* Logo */}
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

              {/* Tagline - Changes with slide */}
              <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    mb: 1,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                >
                  {slides[currentSlide].title}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 400,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                >
                  {slides[currentSlide].subtitle}
                </Typography>
              </Box>

              {/* Dots - Clickable */}
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                {slides.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    sx={{
                      width: currentSlide === index ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      bgcolor:
                        currentSlide === index
                          ? "white"
                          : "rgba(255,255,255,0.3)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor:
                          currentSlide === index
                            ? "white"
                            : "rgba(255,255,255,0.5)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
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
