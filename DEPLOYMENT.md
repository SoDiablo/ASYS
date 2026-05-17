# Deployment Guide

This guide covers deploying the ASYS Smart Building Management System to production environments.

## 🚀 Render Deployment

### Prerequisites
- GitHub account with your repository
- Render account (free tier available at https://render.com)
- PostgreSQL database (Render provides free PostgreSQL)

### Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy PostgreSQL Database

1. Log in to Render Dashboard
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `asys-database`
   - **Database**: `asys_db`
   - **User**: `asys_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click **Create Database**
5. Wait for database to provision
6. Copy the **Internal Database URL** (starts with `postgres://`)

### Step 3: Initialize Database Schema

1. In Render Dashboard, go to your database
2. Click **Connect** → **External Connection**
3. Use the provided connection string with psql:
```bash
psql <external-connection-string> -f database/schema.sql
```

Or use Render's web shell:
1. Click **Shell** tab in database dashboard
2. Copy and paste the contents of `database/schema.sql`

### Step 4: Deploy Backend Service

1. In Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `asys-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node backend/server.js`
   - **Plan**: Free (or paid for production)

4. Add Environment Variables:
   - `DB_HOST`: (from Internal Database URL - hostname part)
   - `DB_PORT`: `5432`
   - `DB_NAME`: `asys_db`
   - `DB_USER`: (from database credentials)
   - `DB_PASSWORD`: (from database credentials)
   - `JWT_SECRET`: (generate a strong random string)
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (will add after frontend deployment)
   - `SEED_DEMO_DATA`: `true` (for demo, `false` for production)

5. Click **Create Web Service**
6. Wait for deployment to complete
7. Copy your backend URL (e.g., `https://asys-backend.onrender.com`)

### Step 5: Deploy Frontend Service

1. In Render Dashboard, click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `asys-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add Environment Variable:
   - `REACT_APP_API_URL`: `https://asys-backend.onrender.com/api`

5. Click **Create Static Site**
6. Wait for deployment to complete
7. Copy your frontend URL (e.g., `https://asys-frontend.onrender.com`)

### Step 6: Update Backend CORS

1. Go to backend service in Render
2. Update environment variable:
   - `FRONTEND_URL`: `https://asys-frontend.onrender.com`
3. Service will automatically redeploy

### Step 7: Test Your Deployment

1. Visit your frontend URL
2. Try logging in with default credentials:
   - Email: `admin@asys.com`
   - Password: `Admin123456`
3. Test key features:
   - Dashboard loads
   - Create a maintenance request
   - View announcements
   - Check dues management

## 🐳 Docker Deployment

### Local Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Deployment

1. Update `docker-compose.yml` with production values
2. Use Docker secrets for sensitive data
3. Set up reverse proxy (nginx) for HTTPS
4. Configure persistent volumes for database

## 🔒 Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Disable SEED_DEMO_DATA in production
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Review and restrict CORS origins
- [ ] Enable database connection pooling
- [ ] Set up error tracking (e.g., Sentry)

## 📊 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database hostname | `postgres` or `dpg-xxx.oregon-postgres.render.com` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `asys_db` |
| `DB_USER` | Database user | `asys_user` |
| `DB_PASSWORD` | Database password | `strong_password_here` |
| `JWT_SECRET` | JWT signing secret | `your_super_secret_key_min_32_chars` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://asys-frontend.onrender.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRY` | Token expiration | `24h` |
| `SEED_DEMO_DATA` | Seed demo data on startup | `false` |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASSWORD` | SMTP password | - |
| `UPLOAD_DIR` | Upload directory | `uploads` |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `5242880` |

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify database credentials in environment variables
- Check if database is running
- Ensure backend can reach database (use Internal URL on Render)

### Frontend Can't Reach Backend
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS configuration in backend
- Ensure backend service is running

### Build Failures
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Ensure Node version compatibility (18+)

### Application Errors
- Check service logs in Render dashboard
- Verify all environment variables are set
- Check database schema is properly initialized

## 📞 Support

For deployment issues:
1. Check Render documentation: https://render.com/docs
2. Review application logs
3. Verify environment variables
4. Check database connectivity

## 🎯 Post-Deployment

After successful deployment:
1. Create your first admin account
2. Configure system settings
3. Add apartments and residents
4. Test all features thoroughly
5. Set up monitoring and alerts
6. Configure automated backups
7. Document your deployment configuration

---

**Note**: Free tier services on Render may spin down after inactivity. First request after inactivity may take 30-60 seconds to respond.
