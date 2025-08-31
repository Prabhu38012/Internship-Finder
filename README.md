<<<<<<< HEAD
# Internship/Project Finder - MERN Stack Application

A comprehensive web application for connecting students with internship and project opportunities.

## Features

### Core Features
- User authentication (students, companies, admins)
- Post and browse internships/projects
- Advanced search and filtering
- Application management system
- User profiles and dashboards
- Real-time notifications
- File upload for resumes/documents
- Admin panel for managing listings
- Responsive design for all devices

### Advanced Features
- **Real-time Features**: Live notifications, instant updates, user presence tracking
- **External API Integration**: LinkedIn, Indeed, and Internshala job listings
- **Dynamic UI**: Infinite scroll, animated components, advanced filtering
- **Analytics Dashboard**: Real-time charts, statistics, and insights
- Recommendation system based on skills/interests
- Application tracking system
- Company verification system
- Rating and review system
- Email notifications
- Export functionality
- Social features (save favorites, share listings)

## Tech Stack

- **Frontend**: React 18 + Vite + Redux Toolkit + Material-UI + Tailwind CSS
- **Backend**: Node.js + Express.js + Socket.IO
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Cloudinary
- **Real-time**: Socket.IO for live updates and notifications
- **Email**: Nodemailer
- **External APIs**: LinkedIn Jobs, Indeed Publisher, Internshala
- **UI Libraries**: Framer Motion, React Query, Recharts
- **Additional**: React Window (virtualization), React Hook Form

## Project Structure

```
internship-finder/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── public/
│   └── package.json
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Start development server: `npm run dev`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/internship-finder
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile

### Internships
- GET `/api/internships` - Get all internships
- POST `/api/internships` - Create internship
- GET `/api/internships/:id` - Get single internship
- PUT `/api/internships/:id` - Update internship
- DELETE `/api/internships/:id` - Delete internship

### Applications
- POST `/api/applications` - Apply for internship
- GET `/api/applications` - Get user applications
- PUT `/api/applications/:id/status` - Update application status

### Analytics (Real-time)
- GET `/api/analytics` - Get system analytics (Admin)
- GET `/api/analytics/company` - Get company analytics
- GET `/api/analytics/student` - Get student analytics

### External APIs
- GET `/api/internships?includeExternal=true` - Get internships with external sources
- GET `/api/internships/external/search` - Search external APIs directly

## Real-time Features

This application includes comprehensive real-time functionality powered by Socket.IO:

### ✅ Implemented Real-time Features

1. **Live Notifications**
   - Instant notification delivery to users
   - Toast notifications for important updates
   - Real-time notification center with badge counts

2. **Dynamic Internship Updates**
   - New internship notifications for students
   - Real-time internship list updates
   - Instant removal of deleted internships

3. **Application Status Updates**
   - Real-time status change notifications
   - Instant application submission confirmations
   - Live application tracking

4. **User Activity Tracking**
   - Live user presence indicators
   - Activity logging and monitoring
   - Admin dashboard with real-time user activities

5. **Live Analytics Dashboard**
   - Real-time charts and statistics
   - Dynamic data visualization
   - Role-based analytics updates

### Socket Events

**Client Events:**
- `notification` - Real-time notifications
- `internship:created/updated/deleted` - Internship changes
- `application:status_changed` - Application updates
- `user:online/offline` - User presence
- `analytics:update` - Live analytics data

**Server Events:**
- `join/leave` - Room management
- `typing:start/stop` - Typing indicators
- `notification:read` - Mark notifications read

For detailed real-time implementation, see [REALTIME_FEATURES.md](./REALTIME_FEATURES.md)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.
=======
# Internship-Project-Finder-Web-Application
>>>>>>> 9ec34d3ad55006eff55afc122bfbd1278a50aa83
