const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (error) {
    console.error('Error creating transporter:', error);
    return null;
  }
};

// Send email
const sendEmail = async (options) => {
  // Skip email sending if no email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email configuration missing - skipping email send');
    return { messageId: 'skipped-no-config' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.log('⚠️  Failed to create transporter - skipping email send');
    return { messageId: 'skipped-no-transporter' };
  }

  const message = {
    from: `${process.env.FROM_NAME || 'InternQuest'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    // Don't throw error - just log and continue
    console.error('❌ Email error (continuing anyway):', error.message);
    return { messageId: 'failed', error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to InternQuest!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to InternQuest!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining our platform. We're excited to help you find amazing internship opportunities!</p>
        <p>Get started by:</p>
        <ul>
          <li>Completing your profile</li>
          <li>Uploading your resume</li>
          <li>Browsing available internships</li>
        </ul>
        <p>Best regards,<br>The InternQuest Team</p>
      </div>
    `
  }),

  applicationReceived: (applicantName, internshipTitle) => ({
    subject: 'New Application Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Application Received</h1>
        <p>You have received a new application for <strong>${internshipTitle}</strong></p>
        <p>Applicant: <strong>${applicantName}</strong></p>
        <p>Please log in to your dashboard to review the application.</p>
        <p>Best regards,<br>The InternQuest Team</p>
      </div>
    `
  }),

  statusUpdate: (applicantName, internshipTitle, status) => ({
    subject: `Application Status Update - ${internshipTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Application Status Update</h1>
        <p>Hi ${applicantName},</p>
        <p>Your application for <strong>${internshipTitle}</strong> has been updated.</p>
        <p>New Status: <strong style="color: #059669;">${status.toUpperCase()}</strong></p>
        <p>Please log in to your dashboard for more details.</p>
        <p>Best regards,<br>The InternQuest Team</p>
      </div>
    `
  }),

  interviewScheduled: (applicantName, internshipTitle, date, time) => ({
    subject: `Interview Scheduled - ${internshipTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Interview Scheduled</h1>
        <p>Hi ${applicantName},</p>
        <p>Your interview for <strong>${internshipTitle}</strong> has been scheduled.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>Please log in to your dashboard for more details and preparation materials.</p>
        <p>Best regards,<br>The InternQuest Team</p>
      </div>
    `
  }),

  passwordResetOTP: (name, otp) => ({
    subject: 'InternQuest - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 5px;">InternQuest</h1>
          <p style="color: #64748b; font-size: 14px;">Password Reset</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
          <p style="color: #334155; font-size: 16px; margin-bottom: 5px;">Hi ${name},</p>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">We received a request to reset your password. Use the OTP below to verify your identity:</p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #3b82f6;">${otp}</span>
          </div>
          <p style="color: #ef4444; font-size: 13px; margin-top: 15px;">This OTP expires in <strong>10 minutes</strong>.</p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">Best regards,<br>The InternQuest Team</p>
      </div>
    `
  }),

  deadlineReminder: (applicantName, internshipTitle, deadline) => ({
    subject: `Application Deadline Reminder - ${internshipTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Application Deadline Reminder</h1>
        <p>Hi ${applicantName},</p>
        <p>This is a reminder that the application deadline for <strong>${internshipTitle}</strong> is approaching.</p>
        <p><strong>Deadline:</strong> ${deadline}</p>
        <p>Don't miss out on this opportunity!</p>
        <p>Best regards,<br>The InternQuest Team</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
