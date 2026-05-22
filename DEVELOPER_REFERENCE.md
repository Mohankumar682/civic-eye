# CivicEye AI+ Developer Quick Reference

## 🚀 Quick Start (2 minutes)

```bash
# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend  
cd frontend && npm install && npm run dev

# Open browser to http://localhost:5173
```

---

## 📋 Common Tasks

### Register Test User
1. Go to `/register`
2. Fill form
3. Choose "City Official (Admin)" for testing dashboard
4. Submit

### Report an Issue
1. Go to `/submit`
2. Title: "Pothole on Main St"
3. Description: "Large pothole dangerous"
4. Click map to set location
5. Upload image (optional)
6. Submit

### View Admin Dashboard
1. Login as admin account
2. Click "Dashboard" in navbar
3. See analytics and manage issues

### Test Upvote System
1. Go to home `/`
2. See issues in grid
3. Click upvote button
4. Number increases

### Update Issue Status (Admin)
1. Go to dashboard
2. Filter by status
3. Click edit button on issue
4. Change status and priority
5. Save
6. Check notifications on issue creator

---

## 🔧 Code Structure

### Adding a New Issue Field

**Backend (Issue.js)**
```javascript
// Add to IssueSchema
assignedDepartment: { type: String, default: '' }
```

**API (issues.js)**
```javascript
// Add to issue creation
data.append('assignedDepartment', 'Public Works');
```

**Frontend (IssueCard.jsx)**
```javascript
// Display in component
<p>Assigned to: {issue.assignedDepartment}</p>
```

### Adding a New Filter

**Backend (issues.js)**
```javascript
// Add to filter object
if (department) filter.assignedDepartment = department;
```

**Frontend (IssueList.jsx)**
```javascript
// Add to filter state
const [filters, setFilters] = useState({
  // ... existing filters ...
  department: ''
});
```

### Adding Authentication to Route

**Backend**
```javascript
// Protected route
router.get('/:id', auth, async (req, res) => {
  // Only authenticated users can access
});
```

**Frontend**
```javascript
// Protected route in App.jsx
<Route path="/admin" element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/login" />} />
```

---

## 🎨 CSS Classes (Common)

```css
/* Button variations */
.btn-primary    /* Blue gradient button */
.btn-secondary  /* Gray outlined button */

/* Status badges */
.status-pending      /* Red */
.status-in-progress  /* Yellow */
.status-resolved     /* Green */

/* Cards */
.card            /* Styled container */
.issue-card      /* Issue-specific card */
.analytics-card  /* Analytics stat card */

/* Layout */
.container       /* Max-width wrapper */
.issue-grid      /* Responsive grid */

/* Animations */
@keyframes fadeIn     /* Fade in animation */
@keyframes bounce     /* Bounce animation */
@keyframes pulse      /* Pulse animation */
```

---

## 🔌 API Quick Reference

```bash
# Login
POST /api/auth/login
-H "Content-Type: application/json"
-d '{"email":"user@example.com","password":"pass"}'

# Get Issues
GET /api/issues?status=pending&sort=upvotes

# Create Issue
POST /api/issues
-H "x-auth-token: TOKEN"
-F "title=Issue" -F "description=Desc" -F "lat=40.7"

# Upvote
PUT /api/issues/upvote/ISSUE_ID
-H "x-auth-token: TOKEN"

# Update Status (Admin)
PUT /api/issues/ISSUE_ID
-H "x-auth-token: ADMIN_TOKEN"
-H "Content-Type: application/json"
-d '{"status":"in-progress"}'

# Get Analytics (Admin)
GET /api/analytics
-H "x-auth-token: ADMIN_TOKEN"

# Get Notifications
GET /api/notifications
-H "x-auth-token: TOKEN"
```

---

## 📁 File Locations

| Feature | File |
|---------|------|
| User Model | `backend/models/User.js` |
| Issue Model | `backend/models/Issue.js` |
| Notifications | `backend/models/Notification.js` |
| Auth Routes | `backend/routes/auth.js` |
| Issue Routes | `backend/routes/issues.js` |
| Issue Card | `frontend/src/components/IssueCard.jsx` |
| Issue List | `frontend/src/components/IssueList.jsx` |
| Admin Dashboard | `frontend/src/components/AdminDashboard.jsx` |
| Home Page | `frontend/src/pages/Home.jsx` |
| Auth Context | `frontend/src/context/AuthContext.jsx` |

---

## 🐛 Debugging Tips

### Backend

```javascript
// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Debug field value
console.log('Category:', category);

// Async/await debugging
try {
  const data = await Issue.find();
  console.log('Found:', data);
} catch (err) {
  console.error('Error:', err.message);
}
```

### Frontend

```javascript
// Component debugging
useEffect(() => {
  console.log('Component mounted');
  console.log('Props:', props);
  return () => console.log('Cleanup');
}, []);

// Network debugging
axios.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  }
);
```

---

## 🎯 Important Variables

### Backend
```javascript
const mongoURI = process.env.MONGO_URI
const jwtSecret = process.env.JWT_SECRET
const port = process.env.PORT || 5000
const nodeEnv = process.env.NODE_ENV
```

### Frontend
```javascript
const API_BASE = 'http://localhost:5000/api'
const token = localStorage.getItem('token')
const user = useContext(AuthContext).user
```

---

## ✅ Pre-Deployment Checklist

### Backend
- [ ] Remove console.log() statements
- [ ] Set NODE_ENV=production
- [ ] Verify MONGO_URI
- [ ] Generate strong JWT_SECRET
- [ ] Update CORS for production domain
- [ ] Test all API endpoints
- [ ] Check error handling
- [ ] Verify file upload path

### Frontend
- [ ] Run npm run build
- [ ] Test production build locally
- [ ] Update API_URL if needed
- [ ] Remove console.log() calls
- [ ] Check all routes work
- [ ] Test responsive design
- [ ] Verify images load correctly

### Database
- [ ] Backup data
- [ ] Create indexes on frequent queries
- [ ] Test restore procedure

---

## 🚢 Deployment Checklist

```bash
# Backend
- [ ] Heroku: heroku create && git push heroku main
- [ ] Railway: git push (auto-deploys)
- [ ] Vercel Functions: Adapt to serverless

# Frontend
- [ ] Create build: npm run build
- [ ] Deploy dist/ folder to Vercel/Netlify
- [ ] Set environment variables
- [ ] Test on production

# Environment Variables Set
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] API_URL (frontend)
- [ ] NODE_ENV=production
```

---

## 📊 Database Schemas Quick View

### User
```javascript
{ name, email, password(hashed), role, createdAt }
```

### Issue
```javascript
{ 
  title, description, category, priority, status,
  location: { lat, lng, address },
  imageUrl, upvotes: [userId],
  createdBy: userId, createdAt, resolvedAt
}
```

### Notification
```javascript
{ userId, issueId, message, type, read, createdAt }
```

---

## 🎨 Design Tokens

```css
--primary: #3b82f6        /* Actions, links */
--error: #ef4444          /* Errors, delete */
--warning: #f59e0b        /* Warnings, medium priority */
--success: #10b981        /* Success, resolved */
--bg: #0f172a             /* Main background */
--surface: #1e293b        /* Cards background */
--text-primary: #f8fafc   /* Main text */
--text-secondary: #cbd5e1 /* Secondary text */
--border-color: #334155   /* Borders */
```

---

## 🔑 Key Component Props

```javascript
// IssueCard
<IssueCard 
  issue={issueObject}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  showAdmin={false}
/>

// IssueList  
<IssueList showAdmin={false} />

// MapComponent
<MapComponent issues={issuesArray} />

// AdminDashboard
<AdminDashboard />

// NotificationPanel
<NotificationPanel />
```

---

## 🔐 Security Notes

- JWT tokens stored in localStorage
- Passwords hashed with bcryptjs (10 salt rounds)
- Admin-only routes checked server-side
- CORS headers set in server
- File uploads stored server-side only

---

## 📈 Performance Tips

```javascript
// Use React.memo for expensive components
export default React.memo(IssueCard);

// Lazy load pages
const Dashboard = lazy(() => import('./Dashboard'));

// Debounce search input
const [searchTerm, setSearchTerm] = useState('');
const debounceSearch = debounce(setSearchTerm, 300);

// Optimize images
// - Use WebP format
// - Serve different sizes
// - Use loading="lazy"
```

---

## 🆘 Emergency Fixes

### Can't connect to MongoDB
```bash
# Check if MongoDB running
mongosh

# Or check Atlas status at mongodb.com/cloud/atlas
```

### API not responding
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check logs: npm run dev
```

### Frontend won't load
```bash
# Check Vite is running
# http://localhost:5173

# Check for errors in console (F12)
# Check network tab for API calls
```

### Images not uploading
```bash
# Create uploads directory
mkdir backend/uploads

# Check multer config in issues.js
```

---

## 📚 Useful Links

- [Express Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Leaflet Docs](https://leafletjs.com/)
- [JWT.io](https://jwt.io/)

---

## 💡 Pro Tips

1. **Test with Mock Data**: Use Postman to test API before frontend
2. **Use Browser DevTools**: Network tab shows all API calls
3. **Check Package Versions**: npm outdated to see updates
4. **Read Error Messages**: Usually tell you exactly what's wrong
5. **Use Git Branches**: For features, use git checkout -b feature/name
6. **Commit Often**: Small, meaningful commits easier to debug
7. **Document Changes**: Comment complex logic

---

## ✨ Quick Commands

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Check for errors
npm run lint

# Database operations
mongosh                           # Connect
db.issues.find()                 # Query
db.issues.deleteMany({})         # Clear collection
db.dropDatabase()                # Delete db
```

---

**Last Updated: April 2024**

Print this for quick reference! 📄
