# Event Registration System - Deployment Guide

This guide provides comprehensive instructions for deploying the Event Registration System using Docker.

## 📋 Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Node.js**: Version 18+ (for local development only)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: At least 2GB free space
- **Network**: Internet connection for downloading images

## 🚀 Quick Start

### Option 1: Using Deployment Scripts (Recommended)

#### On Linux/macOS:
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy the application
./scripts/deploy.sh deploy
```

#### On Windows:
```cmd
# Run deployment script
scripts\deploy.bat deploy
```

### Option 2: Manual Docker Compose

```bash
# Stop any existing containers
docker-compose down

# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps
```

## 🔧 Configuration

### Environment Variables

Create or modify the following environment files:

#### Backend Environment (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://admin:password123@mongodb:27017/event_registration?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
```

#### Frontend Environment
The frontend uses `REACT_APP_API_URL` which is configured in the docker-compose.yml file.

### Database Configuration

The MongoDB instance is automatically configured with:
- **Username**: admin
- **Password**: password123
- **Database**: event_registration
- **Port**: 27017

**⚠️ Important**: Change the default MongoDB credentials in production!

## 📊 Service Architecture

The application consists of three main services:

### 1. Frontend (React App)
- **Port**: 3000
- **Technology**: React 19 + TypeScript
- **Web Server**: Nginx
- **Build**: Multi-stage Docker build

### 2. Backend (API Server)
- **Port**: 5000
- **Technology**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens

### 3. Database (MongoDB)
- **Port**: 27017
- **Version**: MongoDB 7.0
- **Storage**: Persistent volume
- **Initialization**: Automated with indexes

## 🔍 Health Checks

All services include health checks:

### API Health Check
```bash
curl http://localhost:5000/api/health
```

### Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## 🌐 Access URLs

After successful deployment:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health Endpoint**: http://localhost:5000/api/health
- **MongoDB**: mongodb://localhost:27017

## 🛠️ Deployment Scripts

### Available Commands

#### Linux/macOS (deploy.sh)
```bash
./scripts/deploy.sh deploy    # Deploy application
./scripts/deploy.sh stop      # Stop application
./scripts/deploy.sh restart   # Restart application
./scripts/deploy.sh logs      # View logs
./scripts/deploy.sh status    # Check service status
./scripts/deploy.sh cleanup   # Remove everything
./scripts/deploy.sh help      # Show help
```

#### Windows (deploy.bat)
```cmd
scripts\deploy.bat deploy     # Deploy application
scripts\deploy.bat stop       # Stop application
scripts\deploy.bat restart    # Restart application
scripts\deploy.bat logs       # View logs
scripts\deploy.bat status     # Check service status
scripts\deploy.bat cleanup    # Remove everything
scripts\deploy.bat help       # Show help
```

## 🔒 Security Considerations

### Production Security Checklist

1. **Change Default Credentials**:
   ```bash
   # Update MongoDB credentials in docker-compose.yml
   MONGO_INITDB_ROOT_USERNAME: your_username
   MONGO_INITDB_ROOT_PASSWORD: your_secure_password
   ```

2. **Update JWT Secret**:
   ```bash
   # Use a strong, unique JWT secret
   JWT_SECRET: your_very_long_and_secure_random_string_here
   ```

3. **Environment Variables**:
   ```bash
   # Never commit .env files with production credentials
   echo "*.env" >> .gitignore
   ```

4. **Firewall Configuration**:
   ```bash
   # Only expose necessary ports
   # Consider using a reverse proxy (nginx/traefik) for HTTPS
   ```

## 🚀 Production Deployment

### Cloud Deployment Options

#### 1. AWS ECS/EKS
```bash
# Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push images
docker tag event-registration-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/event-registration-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/event-registration-backend:latest
```

#### 2. Google Cloud Run
```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT-ID/event-registration-backend
gcloud run deploy --image gcr.io/PROJECT-ID/event-registration-backend --platform managed
```

#### 3. DigitalOcean App Platform
```yaml
# app.yaml
name: event-registration-system
services:
- name: backend
  source_dir: /
  dockerfile_path: Dockerfile.backend
  http_port: 5000
- name: frontend
  source_dir: /
  dockerfile_path: Dockerfile.frontend
  http_port: 3000
databases:
- name: mongodb
  engine: MONGODB
```

### Domain and SSL Setup

#### Using Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### SSL with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3000
lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker-compose exec mongodb mongosh
```

#### 3. Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/deploy.sh
```

### Debug Mode

#### Enable Debug Logging
```bash
# Backend debug
docker-compose exec backend npm run dev

# View detailed logs
docker-compose logs -f --tail=100 backend
```

## 📈 Monitoring and Maintenance

### Log Management
```bash
# Rotate logs
docker-compose logs --tail=1000 > app-logs-$(date +%Y%m%d).log

# Clear old logs
docker-compose down
docker system prune
```

### Database Backup
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /tmp/backup
docker cp $(docker-compose ps -q mongodb):/tmp/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore MongoDB
docker cp ./mongodb-backup/ $(docker-compose ps -q mongodb):/tmp/restore
docker-compose exec mongodb mongorestore /tmp/restore
```

### Updates and Maintenance
```bash
# Update application
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Update base images
docker-compose pull
docker-compose up -d
```

## 📞 Support

### Getting Help

1. **Check Logs**: Always start by checking the logs
2. **Health Checks**: Verify all services are healthy
3. **Documentation**: Refer to this guide and the main README.md
4. **Issues**: Report issues on the project GitHub repository

### Useful Commands

```bash
# Quick health check
curl -f http://localhost:5000/api/health && echo "API is healthy"

# Service resource usage
docker stats

# Container inspection
docker-compose exec backend env
docker-compose exec frontend ls -la /usr/share/nginx/html
```

---

🎉 **Congratulations!** Your Event Registration System should now be running successfully!