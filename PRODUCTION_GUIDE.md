# Production Deployment Guide

## 🚀 Production-Ready Real-Time Internship Platform

This guide will help you deploy the internship platform to production with all real-time features enabled and demo data removed.

## ✅ Features Implemented

### Real-Time Features
- **Company Registration & Profiles**: Complete company onboarding system
- **Real-Time Internship Posting**: Companies can post internships with instant notifications
- **Live Application Tracking**: Real-time application status updates via Socket.IO
- **Wishlist System**: Students can save internships with real-time notifications
- **Notification Center**: Live notifications for all platform activities

### Core Systems
- **Authentication**: JWT-based auth for students, companies, and admins
- **Email Integration**: Gmail SMTP for notifications and confirmations
- **File Uploads**: Resume and document handling with Cloudinary
- **Database**: MongoDB with optimized indexes for performance
- **Security**: Rate limiting, CORS, input validation, and data sanitization

## 🛠️ Pre-Deployment Setup

### 1. Clean Demo Data
```bash
# Verify what demo data exists
cd backend
node scripts/cleanDemoData.js verify

# Remove all demo data
node scripts/cleanDemoData.js clean
```

### 2. Setup Production Environment
```bash
# Setup database indexes and verify configuration
node scripts/productionSetup.js setup

# Create admin user (optional)
node scripts/productionSetup.js admin admin@yourcompany.com securepassword "Admin Name"
```

### 3. Environment Configuration

Update your `.env` file with production values:

```env
# Database
MONGO_URI=mongodb://localhost:27017/internquest-prod
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/internquest-prod

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email Configuration (Gmail)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password-here

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
NODE_ENV=production
PORT=5000

# Demo Data (KEEP DISABLED FOR PRODUCTION)
ENABLE_DEMO_DATA=false

# CORS Origins (Update with your frontend URL)
FRONTEND_URL=https://your-frontend-domain.com
```

## 🚀 Deployment Steps

### Backend Deployment

1. **Install Dependencies**
```bash
cd backend
npm install --production
```

2. **Build and Start**
```bash
# Start the server
npm start

# Or with PM2 for production
npm install -g pm2
pm2 start server.js --name "internship-backend"
pm2 save
pm2 startup
```

### Frontend Deployment

1. **Update Environment Variables**
```env
# frontend/.env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

2. **Build and Deploy**
```bash
cd frontend
npm install
npm run build

# Deploy the dist folder to your hosting service
# (Netlify, Vercel, AWS S3, etc.)
```

## 🔧 Production Checklist

### Security
- [ ] JWT secrets are secure and unique
- [ ] CORS is configured for your domain only
- [ ] Rate limiting is enabled
- [ ] Input validation is active
- [ ] HTTPS is enabled
- [ ] Environment variables are secure

### Database
- [ ] MongoDB indexes are created
- [ ] Database backups are configured
- [ ] Connection pooling is optimized
- [ ] Demo data is removed

### Real-Time Features
- [ ] Socket.IO is working across domains
- [ ] WebSocket connections are stable
- [ ] Real-time notifications are functioning
- [ ] Application tracking updates in real-time

### Email System
- [ ] Gmail SMTP is configured
- [ ] Email templates are working
- [ ] Notification emails are being sent
- [ ] Email rate limits are considered

### Monitoring
- [ ] Error logging is configured
- [ ] Performance monitoring is active
- [ ] Database queries are optimized
- [ ] Server resources are monitored

## 🎯 Testing Production Features

### Company Registration Flow
1. Visit `/company/register`
2. Complete company registration
3. Verify email confirmation
4. Login and access company dashboard

### Internship Posting
1. Login as company
2. Navigate to "Post New Internship"
3. Fill out internship details
4. Submit and verify real-time notification

### Student Application Flow
1. Register as student
2. Browse internships
3. Apply to internships
4. Check real-time application status updates

### Real-Time Features Test
1. Open multiple browser windows
2. Perform actions (apply, update status, post internship)
3. Verify real-time updates across all windows

## 📊 Monitoring and Maintenance

### Database Maintenance
```bash
# Check database health
mongo
use internquest-prod
db.stats()

# Monitor collections
db.users.countDocuments()
db.internships.countDocuments()
db.applications.countDocuments()
```

### Server Monitoring
```bash
# Check server status with PM2
pm2 status
pm2 logs internship-backend

# Monitor system resources
htop
df -h
```

### Performance Optimization
- Monitor database query performance
- Optimize slow queries with proper indexes
- Use Redis for session management (optional)
- Implement CDN for static assets
- Enable gzip compression

## 🚨 Troubleshooting

### Common Issues

**Socket.IO Connection Issues**
- Check CORS configuration
- Verify WebSocket support on hosting platform
- Ensure proper SSL/TLS setup for WSS

**Email Not Sending**
- Verify Gmail app password
- Check email rate limits
- Confirm SMTP settings

**Database Connection Issues**
- Check MongoDB URI format
- Verify network connectivity
- Confirm database user permissions

**Real-Time Updates Not Working**
- Check Socket.IO client connection
- Verify JWT token validity
- Monitor browser console for errors

## 📈 Scaling Considerations

### Horizontal Scaling
- Use Redis for Socket.IO adapter
- Implement session store with Redis
- Load balance multiple server instances

### Database Scaling
- Implement read replicas
- Consider sharding for large datasets
- Monitor query performance

### CDN and Caching
- Use CDN for static assets
- Implement Redis caching
- Enable browser caching headers

## 🛡️ Security Best Practices

- Regular security updates
- Database access control
- API rate limiting
- Input sanitization
- HTTPS enforcement
- Secure headers (helmet.js)
- Regular backups
- Monitoring and alerting

## 📞 Support

For production issues or questions:
1. Check server logs first
2. Verify environment configuration
3. Test database connectivity
4. Monitor real-time connections

Your internship platform is now production-ready with all real-time features enabled! 🎉
