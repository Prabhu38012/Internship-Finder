import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  Email,
  Lock,
  CheckCircle,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import authService from "../../services/authService";

const steps = ["Enter Email", "Verify OTP", "New Password"];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Email
  const [email, setEmail] = useState("");

  // Step 2: OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [resendTimer, setResendTimer] = useState(0);

  // Step 3: New password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        toast.success("OTP sent to your email!");
        setActiveStep(1);
        setResendTimer(60);
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6);
      const newOtp = [...otp];
      digits.split("").forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyOTP(email, otpString);
      if (response.success) {
        toast.success("OTP verified!");
        setActiveStep(2);
      }
    } catch (err) {
      setError(err.message || "Invalid OTP. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError("");

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("New OTP sent!");
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const otpString = otp.join("");
      const response = await authService.resetPassword(email, otpString, newPassword);
      if (response.success) {
        setActiveStep(3); // Success state
        setSuccess(response.message);
        toast.success("Password reset successfully!");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - InternQuest</title>
      </Helmet>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          backgroundColor: "#0a0a0f",
        }}
      >
        {/* Left Side - Branding */}
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h5" sx={{ color: "white", fontWeight: "bold" }}>
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

            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              {/* Lock Icon */}
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(59,130,246,0.3)",
                }}
              >
                <Lock sx={{ fontSize: 60, color: "#3b82f6" }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                Reset Your
                <br />
                Password
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                  maxWidth: 300,
                }}
              >
                We&apos;ll send a verification code to your email to help you regain access
              </Typography>
            </Box>

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
            {/* Back button */}
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBack />}
              sx={{
                color: "rgba(255,255,255,0.6)",
                textTransform: "none",
                mb: 3,
                "&:hover": { color: "white" },
              }}
            >
              Back to Login
            </Button>

            <Typography variant="h3" sx={{ color: "white", fontWeight: "bold", mb: 1 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}>
              {activeStep === 0 && "Enter your email and we'll send you a verification code"}
              {activeStep === 1 && "Enter the 6-digit code sent to your email"}
              {activeStep === 2 && "Create a strong new password for your account"}
              {activeStep === 3 && "Your password has been reset successfully"}
            </Typography>

            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 4,
                "& .MuiStepLabel-label": {
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.75rem",
                  "&.Mui-active": { color: "#3b82f6" },
                  "&.Mui-completed": { color: "#22c55e" },
                },
                "& .MuiStepIcon-root": {
                  color: "rgba(255,255,255,0.15)",
                  "&.Mui-active": { color: "#3b82f6" },
                  "&.Mui-completed": { color: "#22c55e" },
                },
                "& .MuiStepConnector-line": {
                  borderColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            {/* Step 1: Email Input */}
            {activeStep === 0 && (
              <Box component="form" onSubmit={handleSendOTP}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "rgba(255,255,255,0.3)" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ...inputStyles, mb: 3 }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading || !email.trim()}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </Box>
            )}

            {/* Step 2: OTP Input */}
            {activeStep === 1 && (
              <Box component="form" onSubmit={handleVerifyOTP}>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.5)", mb: 1, textAlign: "center" }}
                >
                  Code sent to <span style={{ color: "#3b82f6" }}>{email}</span>
                </Typography>

                {/* OTP Input Boxes */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1.5,
                    mb: 3,
                    mt: 3,
                  }}
                >
                  {otp.map((digit, index) => (
                    <TextField
                      key={index}
                      inputRef={(el) => (otpRefs.current[index] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      inputProps={{
                        maxLength: 1,
                        style: {
                          textAlign: "center",
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          padding: "12px 0",
                          color: "white",
                        },
                      }}
                      sx={{
                        width: 52,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: digit
                              ? "#3b82f6"
                              : "rgba(255,255,255,0.15)",
                            borderWidth: digit ? 2 : 1,
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(255,255,255,0.3)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#3b82f6",
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  ))}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading || otp.join("").length !== 6}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    },
                    mb: 2,
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                    Didn&apos;t receive the code?{" "}
                    {resendTimer > 0 ? (
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <span
                        onClick={handleResendOTP}
                        style={{
                          color: "#3b82f6",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Resend OTP
                      </span>
                    )}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Step 3: New Password */}
            {activeStep === 2 && (
              <Box component="form" onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "rgba(255,255,255,0.3)" }} />
                      </InputAdornment>
                    ),
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
                  sx={{ ...inputStyles, mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "rgba(255,255,255,0.3)" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ ...inputStyles, mb: 1 }}
                />

                {/* Password strength hints */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
                    Password must be at least 6 characters
                  </Typography>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 0.5 }}>
                      Passwords do not match
                    </Typography>
                  )}
                  {newPassword && confirmPassword && newPassword === confirmPassword && (
                    <Typography variant="caption" sx={{ color: "#22c55e", display: "block", mt: 0.5 }}>
                      Passwords match ✓
                    </Typography>
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </Box>
            )}

            {/* Step 4: Success */}
            {activeStep === 3 && (
              <Box sx={{ textAlign: "center" }}>
                <CheckCircle sx={{ fontSize: 80, color: "#22c55e", mb: 2 }} />
                <Typography variant="h5" sx={{ color: "white", fontWeight: 600, mb: 1 }}>
                  Password Reset Successful!
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 4 }}>
                  Your password has been updated. You can now sign in with your new password.
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/login")}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    boxShadow: "0 4px 14px rgba(34, 197, 94, 0.4)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    },
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ForgotPassword;
