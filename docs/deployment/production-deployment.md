# Production Deployment Guide

## Overview

This guide provides a complete roadmap for deploying Minerva to production, covering infrastructure setup, application deployment, and post-deployment configuration. This guide focuses on general deployment principles and Digital Ocean implementation. For AWS and Azure deployments, see the platform-specific guides.

## 🎯 Prerequisites

### Required Accounts & Services

- **Hosting Platform**: Digital Ocean, AWS, or similar VPS provider
- **Domain Name**: Registered domain for your application
- **SSL Certificate**: Let's Encrypt (free) or paid certificate
- **GitHub Repository**: Source code repository with GitHub Actions
- **Docker Hub**: Container image registry (optional but recommended)

### Technical Requirements

- **Server Resources**: Minimum 2GB RAM, 2 vCPUs, 50GB storage
- **Operating System**: Ubuntu 22.04 LTS or similar
- **Database**: PostgreSQL 14+ with automated backups
- **Network**: Public IP with firewall configuration

## 🚀 Deployment Phases

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 Hosting Platform Setup

**Digital Ocean (Recommended for simplicity):**

1. **Create Droplet:**

   ```bash
   # Choose Ubuntu 22.04 LTS
   # Select Basic plan (2GB RAM, 2 vCPUs)
   # Choose datacenter close to your users
   # Add SSH key for secure access
   ```

2. **Initial Server Configuration:**

   ```bash
   # SSH into server
   ssh root@your-server-ip

   # Update system
   apt update && apt upgrade -y

   # Install essential packages
   apt install -y curl wget git htop ufw fail2ban

   # Configure firewall
   ufw allow ssh
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

**For AWS Deployment**: See the [AWS Deployment Guide](aws/README.md) for comprehensive AWS setup using ECS Fargate, RDS, and managed services.

**For Azure Deployment**: See the [Azure Deployment Guide](azure/README.md) for Azure deployment using AKS, Azure SQL, and Azure services.

#### 1.2 Docker Production Setup

1. **Install Docker:**

   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose

   # Add user to docker group
   usermod -aG docker $USER
   ```

2. **Create Production Docker Compose:**

   ```yaml
   # docker-compose.prod.yml
   version: '3.8'

   services:
     backend:
       image: minerva-backend:latest
       restart: unless-stopped
       environment:
         - DJANGO_SETTINGS_MODULE=minervahome.settings_prod
         - DATABASE_URL=postgresql://user:pass@db:5432/minerva
         - REDIS_URL=redis://redis:6379
       depends_on:
         - db
         - redis
       networks:
         - minerva-network

     frontend:
       image: minerva-frontend:latest
       restart: unless-stopped
       networks:
         - minerva-network

     db:
       image: postgres:15
       restart: unless-stopped
       environment:
         - POSTGRES_DB=minerva
         - POSTGRES_USER=minerva_user
         - POSTGRES_PASSWORD=${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./backups:/backups
       networks:
         - minerva-network

     redis:
       image: redis:7-alpine
       restart: unless-stopped
       volumes:
         - redis_data:/data
       networks:
         - minerva-network

     nginx:
       image: nginx:alpine
       restart: unless-stopped
       ports:
         - '80:80'
         - '443:443'
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/nginx/ssl
       depends_on:
         - backend
         - frontend
       networks:
         - minerva-network

   volumes:
     postgres_data:
     redis_data:

   networks:
     minerva-network:
       driver: bridge
   ```

#### 1.3 Database Production Setup

1. **PostgreSQL Configuration:**

   ```bash
   # Create database user and database
   sudo -u postgres psql

   CREATE USER minerva_user WITH PASSWORD 'secure_password_here';
   CREATE DATABASE minerva OWNER minerva_user;
   GRANT ALL PRIVILEGES ON DATABASE minerva TO minerva_user;
   \q
   ```

2. **Backup Strategy:**

   ```bash
   # Create backup script
   nano /usr/local/bin/backup-minerva.sh

   #!/bin/bash
   BACKUP_DIR="/backups"
   DATE=$(date +%Y%m%d_%H%M%S)
   BACKUP_FILE="minerva_backup_$DATE.sql"

   pg_dump -U minerva_user -h localhost minerva > $BACKUP_DIR/$BACKUP_FILE

   # Keep only last 7 days of backups
   find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

   # Make executable
   chmod +x /usr/local/bin/backup-minerva.sh

   # Add to crontab (daily at 2 AM)
   crontab -e
   0 2 * * * /usr/local/bin/backup-minerva.sh
   ```

### Phase 2: Application Deployment (Week 2)

#### 2.1 Environment Configuration

1. **Create Production Environment File:**

   ```bash
   # .env.production
   DJANGO_SECRET_KEY=your-super-secret-key-here
   DJANGO_SETTINGS_MODULE=minervahome.settings_prod
   DATABASE_URL=postgresql://minerva_user:password@db:5432/minerva
   REDIS_URL=redis://redis:6379
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   DEBUG=False
   CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

   # AI Integration (if implementing)
   ANTHROPIC_API_KEY=your_anthropic_key
   LANGCHAIN_TRACING_V2=true
   ```

2. **Production Django Settings:**

   ```python
   # settings_prod.py
   import os
   from .settings import *

   DEBUG = False
   ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

   # Database
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'minerva',
           'USER': 'minerva_user',
           'PASSWORD': os.environ.get('DB_PASSWORD'),
           'HOST': 'db',
           'PORT': '5432',
       }
   }

   # Security
   SECURE_SSL_REDIRECT = True
   SESSION_COOKIE_SECURE = True
   CSRF_COOKIE_SECURE = True
   SECURE_BROWSER_XSS_FILTER = True
   SECURE_CONTENT_TYPE_NOSNIFF = True

   # Static files
   STATIC_ROOT = '/app/staticfiles/'
   MEDIA_ROOT = '/app/media/'
   ```

#### 2.2 Nginx Configuration

1. **Production Nginx Config:**

   ```nginx
   # nginx.conf
   events {
       worker_connections 1024;
   }

   http {
       upstream backend {
           server backend:8000;
       }

       upstream frontend {
           server frontend:3000;
       }

       # Rate limiting
       limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
       limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

       server {
           listen 80;
           server_name yourdomain.com www.yourdomain.com;
           return 301 https://$server_name$request_uri;
       }

       server {
           listen 443 ssl http2;
           server_name yourdomain.com www.yourdomain.com;

           # SSL Configuration
           ssl_certificate /etc/nginx/ssl/fullchain.pem;
           ssl_certificate_key /etc/nginx/ssl/privkey.pem;
           ssl_protocols TLSv1.2 TLSv1.3;
           ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
           ssl_prefer_server_ciphers off;

           # Security headers
           add_header X-Frame-Options DENY;
           add_header X-Content-Type-Options nosniff;
           add_header X-XSS-Protection "1; mode=block";
           add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

           # Frontend
           location / {
               limit_req zone=general burst=20 nodelay;
               proxy_pass http://frontend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }

           # Backend API
           location /api/ {
               limit_req zone=api burst=10 nodelay;
               proxy_pass http://backend;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }

           # Static files
           location /static/ {
               alias /app/staticfiles/;
               expires 1y;
               add_header Cache-Control "public, immutable";
           }

           # Media files
           location /media/ {
               alias /app/media/;
               expires 1y;
               add_header Cache-Control "public";
           }
       }
   }
   ```

#### 2.3 SSL Certificate Setup

1. **Let's Encrypt SSL:**

   ```bash
   # Install Certbot
   apt install -y certbot python3-certbot-nginx

   # Obtain SSL certificate
   certbot --nginx -d yourdomain.com -d www.yourdomain.com

   # Test renewal
   certbot renew --dry-run

   # Add to crontab (automatic renewal)
   crontab -e
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Phase 3: Monitoring & Maintenance (Week 3)

#### 3.1 Application Monitoring

1. **Health Check Endpoints:**

   ```python
   # Add to Django views
   from django.http import JsonResponse
   from django.db import connection
   from redis import Redis

   def health_check(request):
       try:
           # Database check
           with connection.cursor() as cursor:
               cursor.execute("SELECT 1")

           # Redis check
           redis_client = Redis.from_url(settings.REDIS_URL)
           redis_client.ping()

           return JsonResponse({
               'status': 'healthy',
               'database': 'connected',
               'redis': 'connected',
               'timestamp': timezone.now().isoformat()
           })
       except Exception as e:
           return JsonResponse({
               'status': 'unhealthy',
               'error': str(e)
           }, status=500)
   ```

2. **Logging Configuration:**
   ```python
   # settings_prod.py
   LOGGING = {
       'version': 1,
       'disable_existing_loggers': False,
       'formatters': {
           'verbose': {
               'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
               'style': '{',
           },
       },
       'handlers': {
           'file': {
               'level': 'INFO',
               'class': 'logging.FileHandler',
               'filename': '/var/log/minerva/django.log',
               'formatter': 'verbose',
           },
           'console': {
               'level': 'INFO',
               'class': 'logging.StreamHandler',
               'formatter': 'verbose',
           },
       },
       'root': {
           'handlers': ['console', 'file'],
           'level': 'INFO',
       },
   }
   ```

#### 3.2 Performance Monitoring

1. **System Monitoring:**

   ```bash
   # Install monitoring tools
   apt install -y htop iotop nethogs

   # Create system monitoring script
   nano /usr/local/bin/monitor-system.sh

   #!/bin/bash
   echo "=== System Status $(date) ==="
   echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
   echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')"
   echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
   echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
   ```

2. **Application Performance:**

   ```python
   # Add performance middleware
   import time
   from django.utils.deprecation import MiddlewareMixin

   class PerformanceMiddleware(MiddlewareMixin):
       def process_request(self, request):
           request.start_time = time.time()

       def process_response(self, request, response):
           if hasattr(request, 'start_time'):
               duration = time.time() - request.start_time
               response['X-Response-Time'] = str(duration)
           return response
   ```

## 🚀 Deployment Commands

### Initial Deployment

```bash
# Build and start production stack
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### Ongoing Maintenance

```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Database backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U minerva_user minerva > backup.sql

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication only
- [ ] Fail2ban installed and configured
- [ ] Non-root user created for application
- [ ] Database passwords are strong and unique
- [ ] SSL certificate installed and configured

### Post-Deployment Security

- [ ] Security headers configured in Nginx
- [ ] Rate limiting implemented
- [ ] Database backups encrypted
- [ ] Monitoring and alerting configured
- [ ] Regular security updates scheduled
- [ ] Access logs monitored

## 📊 Post-Deployment Verification

### Health Checks

1. **Application Health:**

   - [ ] Health check endpoint responds
   - [ ] Database connection working
   - [ ] Redis connection working
   - [ ] Static files serving correctly

2. **Performance Verification:**

   - [ ] Page load times under 3 seconds
   - [ ] API response times under 500ms
   - [ ] Database query performance acceptable
   - [ ] Memory usage within limits

3. **Security Verification:**
   - [ ] HTTPS redirects working
   - [ ] Security headers present
   - [ ] Rate limiting functional
   - [ ] SSL certificate valid

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors:**

   - Check PostgreSQL service status
   - Verify connection string and credentials
   - Check firewall rules

2. **Static Files Not Loading:**

   - Verify collectstatic was run
   - Check Nginx configuration
   - Verify file permissions

3. **SSL Certificate Issues:**
   - Check certificate expiration
   - Verify domain configuration
   - Check Nginx SSL configuration

### Emergency Procedures

1. **Immediate Rollback:**

   ```bash
   # Stop current deployment
   docker-compose -f docker-compose.prod.yml down

   # Restart previous version
   git checkout HEAD~1
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Database Recovery:**
   ```bash
   # Restore from backup
   docker-compose -f docker-compose.prod.yml exec db psql -U minerva_user minerva < backup.sql
   ```

## 📈 Scaling Considerations

### Vertical Scaling

- Increase server resources (CPU, RAM, storage)
- Optimize database queries and indexing
- Implement caching strategies

### Horizontal Scaling

- Load balancer for multiple application instances
- Database read replicas
- CDN for static assets

### Auto-scaling

- Container orchestration (Kubernetes)
- Cloud provider auto-scaling groups
- Monitoring-based scaling triggers

## 🎯 Platform-Specific Considerations

### Digital Ocean

This guide provides detailed Digital Ocean deployment instructions. The setup process is straightforward and cost-effective for small to medium projects.

### AWS

For AWS deployment using modern cloud-native practices:

- **[AWS Deployment Guide](aws/README.md)** - Complete AWS deployment strategy
- **[AWS Infrastructure](aws/infrastructure.md)** - Terraform configurations and AWS services
- **[AWS Monitoring](aws/monitoring.md)** - CloudWatch and AWS-specific observability

### Azure

For Azure deployment using Microsoft cloud services:

- **[Azure Deployment Guide](azure/README.md)** - Complete Azure deployment strategy
- **[Azure Infrastructure](azure/infrastructure.md)** - Bicep/ARM templates and Azure services
- **[Azure Monitoring](azure/monitoring.md)** - Application Insights and Azure-specific observability

---

## 📚 Next Steps

After successful production deployment:

1. **Set up monitoring and alerting** (see [monitoring-logging.md](monitoring-logging.md))
2. **Implement CI/CD pipeline** (see [ci-cd-pipeline.md](ci-cd-pipeline.md))
3. **Configure backup and recovery** (see [backup-recovery.md](backup-recovery.md))
4. **Performance optimization** (see [performance-optimization.md](performance-optimization.md))

### Platform-Specific Next Steps

- **For Digital Ocean**: Continue with this guide's monitoring and maintenance sections
- **For AWS**: Follow the [AWS Deployment Guide](aws/README.md) for advanced AWS features
- **For Azure**: Follow the [Azure Deployment Guide](azure/README.md) for Azure-specific optimizations

For additional deployment guidance, refer to the other documents in this directory or consult the platform-specific documentation.
