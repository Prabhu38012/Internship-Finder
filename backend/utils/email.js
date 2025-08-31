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
    console.log('Email configuration missing - skipping email send');
    return { messageId: 'skipped' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.log('Failed to create transporter - skipping email send');
    return { messageId: 'failed' };
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Internship Finder'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error: ', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Internship Finder!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Internship Finder!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining our platform. We're excited to help you find amazing internship opportunities!</p>
        <p>Get started by:</p>
        <ul>
          <li>Completing your profile</li>
          <li>Uploading your resume</li>
          <li>Browsing available internships</li>
        </ul>
        <p>Best regards,<br>The Internship Finder Team</p>
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
        <p>Best regards,<br>The Internship Finder Team</p>
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
        <p>Best regards,<br>The Internship Finder Team</p>
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
        <p>Best regards,<br>The Internship Finder Team</p>
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
        <p>Best regards,<br>The Internship Finder Team</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
};
