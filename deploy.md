# Event Registration System - Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Local Docker Deployment (Current)
```bash
# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs

# Stop the application
docker-compose down

# Access URLs:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Option 2: Free Cloud Hosting - Render.com

#### Step 1: Prepare for Deployment
1. Create GitHub repository and push your code
2. Create account at https://render.com

#### Step 2: Deploy Backend
1. Create new "Web Service" on Render
2. Connect your GitHub repository
3. Set Build Command: `cd backend && npm install`
4. Set Start Command: `cd backend && npm start`
5. Set Environment Variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=your-mongodb-atlas-connection-string`
   - `JWT_SECRET=your-jwt-secret`
   - `PORT=5000`

#### Step 3: Deploy Frontend
1. Create another "Web Service" on Render
2. Connect your GitHub repository
3. Set Build Command: `cd frontend && npm install && npm run build`
4. Set Start Command: `cd frontend && npm start`
5. Set Environment Variables:
   - `REACT_APP_API_URL=your-backend-render-url`

### Option 3: Vercel (Frontend) + MongoDB Atlas

#### MongoDB Atlas Setup:
1. Go to https://mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Whitelist all IPs (0.0.0.0/0) for development

#### Vercel Frontend:
1. Install Vercel CLI: `npm install -g vercel`
2. In frontend directory: `vercel`
3. Follow prompts

#### Backend hosting (Railway/Render):
1. Deploy backend separately
2. Update frontend API URL

### Option 4: Production VPS Deployment

#### Requirements:
- Ubuntu/CentOS VPS
- Docker & Docker Compose installed
- Domain name (optional)

#### Steps:
```bash
# 1. Clone repository
git clone your-repo-url
cd event-registration-system

# 2. Set environment variables
cp .env.example .env
# Edit .env with production values

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Set up nginx reverse proxy (optional)
sudo apt install nginx
# Configure nginx for domain
```

## 🔧 Environment Variables Needed

### Backend (.env):
```
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/eventregistration
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

### Frontend:
```
REACT_APP_API_URL=http://your-backend-url:5000
```

## 📝 Pre-deployment Checklist

- [ ] Database connection configured
- [ ] Environment variables set
- [ ] CORS configured for production domains
- [ ] Authentication working
- [ ] File uploads configured (if any)
- [ ] Error handling in place
- [ ] Logging configured

## 🛠 Troubleshooting

### Common Issues:
1. **CORS errors**: Update backend CORS settings
2. **Database connection**: Check MongoDB URI
3. **Environment variables**: Verify all required vars are set
4. **Build errors**: Check Node.js version compatibility

### Production Considerations:
- Use MongoDB Atlas for database
- Set up proper authentication
- Configure HTTPS/SSL
- Set up monitoring
- Regular backups
- Rate limiting
- Error tracking (e.g., Sentry)

## 📊 Recommended Stack for Production:
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or AWS
- **Database**: MongoDB Atlas
- **Storage**: AWS S3 (for file uploads)
- **Monitoring**: Vercel Analytics + Backend logging