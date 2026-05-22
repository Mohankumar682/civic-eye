# CivicEye AI+ - Smart Public Issue Reporting System

Advanced full-stack civic issue reporting platform with intelligent AI-powered features, real-time mapping, and admin analytics.

## Features

### Core Features
- ** Authentication**: Secure user & admin role-based authentication with JWT
- ** Issue Reporting**: Report issues with images, descriptions, and precise locations
- ** AI-Powered Classification**: Automatic category detection and priority assignment
- ** Interactive Map**: Real-time visualization of all issues with clustering and hotspots
- ** Upvote System**: Community engagement - upvote issues to increase visibility
- ** Status Tracking**: Track issue lifecycle from pending → in-progress → resolved
- ** Analytics**: Comprehensive admin dashboard with resolution metrics
- ** Notifications**: Real-time notifications for status updates and engagement
- ** Modern UI**: Beautiful responsive design with animations and gradients

### Tech Stack
- **Frontend**: React 19 + Vite + React Router + Leaflet
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **File Upload**: Multer for image handling
- **Mapping**: Leaflet & OpenStreetMap
- **Styling**: CSS3 with animations and modern design tokens

##  Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure MongoDB connection and JWT secret in .env
# MONGO_URI=mongodb://127.0.0.1:27017/civic_eye
# JWT_SECRET=your_secret_key

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Development server (Vite)
npm run dev

# Build for production
npm build

# Preview production build
npm preview
```

## 📚 Project Structure

```
civic-eye/
├── backend/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js         # User model with roles
│   │   ├── Issue.js        # Issue model with status tracking
│   │   └── Notification.js # Notification model
│   ├── routes/             # API endpoints
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── issues.js       # Issue CRUD + upvote
│   │   ├── notifications.js # Notification management
│   │   └── analytics.js    # Admin analytics
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   ├── uploads/            # Image storage
│   ├── server.js           # Express app setup
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx              # Navigation bar
    │   │   ├── IssueCard.jsx           # Individual issue display
    │   │   ├── IssueList.jsx           # Issues grid with filters
    │   │   ├── MapComponent.jsx        # Interactive map
    │   │   ├── NotificationPanel.jsx   # Notifications dropdown
    │   │   └── AdminDashboard.jsx      # Admin analytics
    │   ├── pages/
    │   │   ├── Home.jsx                # Main page with map & issues
    │   │   ├── Login.jsx               # User login
    │   │   ├── Register.jsx            # User registration
    │   │   ├── SubmitIssue.jsx         # Issue reporting form
    │   │   └── Dashboard.jsx           # Admin dashboard
    │   ├── context/
    │   │   └── AuthContext.jsx         # Auth state management
    │   ├── styles/
    │   │   ├── IssueCard.css
    │   │   ├── IssueList.css
    │   │   ├── MapComponent.css
    │   │   ├── AdminDashboard.css
    │   │   └── Notifications.css
    │   ├── App.jsx
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login

### Issues
- `GET /api/issues` - Get all issues (with filters: status, category, priority, sort)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue (with image upload)
- `PUT /api/issues/:id` - Update issue status/priority (Admin only)
- `PUT /api/issues/upvote/:id` - Toggle upvote on issue
- `DELETE /api/issues/:id` - Delete issue (Admin only)

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Analytics (Admin only)
- `GET /api/analytics` - Get comprehensive analytics data

##  Design Tokens & Styling

The application uses a modern dark theme with customizable CSS variables:

```css
--primary: #3b82f6        /* Blue */
--secondary: #10b981      /* Green */
--error: #ef4444          /* Red */
--warning: #f59e0b        /* Amber */
--success: #10b981        /* Green */
--bg: #0f172a             /* Dark slate */
--surface: #1e293b        /* Slate */
--text-primary: #f8fafc   /* White */
--text-secondary: #cbd5e1 /* Light gray */
```

##  Key Components

### IssueCard
Displays individual issue with:
- Status, priority, category badges
- Image preview
- Upvote counter
- Admin edit/delete actions
- Location and date information

### IssueList
Manages issue display with:
- Search functionality
- Advanced filtering (status, category, priority)
- Sorting options (newest, oldest, most upvoted)
- Responsive grid layout

### MapComponent
Interactive Leaflet map featuring:
- Real-time issue markers
- Color-coded by priority
- Detailed popups on click
- Auto-centering based on issues
- Custom icon styling

### AdminDashboard
Comprehensive analytics including:
- Total issues, resolution rate, avg resolution time
- Category breakdown
- Priority distribution
- Top upvoted issues
- Issue management interface

### NotificationPanel
Real-time notifications with:
- Unread badge counter
- Auto-refresh every 30 seconds
- Mark as read functionality
- Notification types (status_change, upvote, new_issue)

## AI Features

### Auto-Classification
- **Category Detection**: Analyzes issue description to predict category
  - Keywords: "garbage", "trash", "waste" → Garbage
  - Keywords: "pothole", "road", "crack" → Roads
  - Keywords: "light", "lamp", "bulb" → Streetlights
  - Keywords: "water", "leak", "pipe" → Water
  - Keywords: "sewer", "drainage" → Drainage

### Priority Scoring
- **High**: "emergency", "dangerous", "collapse", "flood"
- **Medium**: Default for neutral language
- **Low**: "minor", "cosmetic", "slight"

### Department Suggestion
Automatically suggests responsible department based on category:
- Garbage → Sanitation Department
- Roads → Public Works Department
- Streetlights → Electrical Department
- Water → Water Supply Board
- Drainage → Municipal Engineering

##  Analytics Metrics

Admin dashboard provides:
- **Total Issues**: Complete count
- **Resolution Rate**: Percentage of resolved issues
- **Average Resolution Time**: Hours from creation to resolution
- **Status Breakdown**: Pending, In-Progress, Resolved counts
- **Category Distribution**: Issues by category
- **Priority Distribution**: High, Medium, Low counts
- **Top Upvoted Issues**: Most popular 5 issues
- **Issues Per Day**: 30-day trend

##  Security

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control (User/Admin)
- Protected routes and API endpoints
- CORS enabled for frontend-backend communication
- Secure file upload handling

##  Responsive Design

Fully responsive across:
- Desktop (1200px+)
- Tablet (768px-1199px)
- Mobile (< 768px)

Mobile-specific optimizations:
- Touch-friendly buttons
- Stack-based layouts
- Optimized map height
- Full-screen modals

##  Deployment Guide

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm build
# Deploy the dist/ folder
```

### Backend Deployment (Heroku/Railway)
```bash
# Set environment variables
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
PORT=5000

# Deploy using platform CLI
```

### MongoDB Atlas Setup
1. Create cluster at mongodb.com/cloud/atlas
2. Get connection string
3. Add to .env as MONGO_URI

##  Troubleshooting

### MongoDB Connection Error
```
Check if MongoDB is running: mongod
Verify connection string in .env
```

### CORS Issues
```
Ensure backend has: app.use(cors())
Frontend calls correct API URL: http://localhost:5000
```

### Image Upload Not Working
```
Create uploads/ directory in backend
Check file permissions
Verify multer disk storage configuration
```

### Map Not Displaying
```
Check Leaflet CSS is imported in main.jsx
Verify React Leaflet components are properly used
Check console for OpenStreetMap errors
```

##  Future Enhancements

- Image recognition using ML models
- Real-time notifications using WebSockets
- Issue clustering on map
- Advanced analytics with charts
- Mobile app version
- SMS alerts
- Email notifications
- Gamification (badges, leaderboards)
- Issue comments and discussions
- Integration with government databases
- Multi-language support

##  Usage Tips

1. **Admin Testing**: Register with role "admin" to access dashboard
2. **Auto-Classification**: Submit issue with descriptive text for AI to tag
3. **Location Accuracy**: Click on map where issue is located for accuracy
4. **Images**: Provide clear photos of issues for better validation
5. **Status Updates**: Only admins can update statuses to track progress

##  License

This project is open source and available under the MIT License.

##  Contributing

Contributions are welcome! Please follow standard git workflow:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

##  Support

For issues and support:
1. Check troubleshooting section
2. Review API documentation
3. Create GitHub issue
4. Contact development team

---


