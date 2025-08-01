# Deploying Minerva Backend to Digital Ocean

## Prerequisites

1. A Digital Ocean account
2. A domain name (optional but recommended)
3. SSH access to your local machine

## Step 1: Create a Digital Ocean Droplet

1. Log in to your Digital Ocean account
2. Click "Create" and select "Droplets"
3. Choose Ubuntu 22.04 LTS
4. Select a plan (Basic is fine for starting)
5. Choose a datacenter region close to your users
6. Add your SSH key
7. Choose a hostname (e.g., minerva-backend)
8. Click "Create Droplet"

## Step 2: Set Up the Server

1. SSH into your droplet:

```bash
ssh root@your-droplet-ip
```

2. Update the system:

```bash
apt update && apt upgrade -y
```

3. Install required packages:

```bash
apt install python3-pip python3-venv nginx supervisor -y
```

4. Create a directory for the application:

```bash
mkdir -p /var/www/minerva
```

## Step 3: Deploy the Application

1. Clone your repository:

```bash
cd /var/www/minerva
git clone your-repository-url .
```

2. Create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file:

```bash
nano .env
```

Add the following (replace with your values):

```
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=minervahome.settings_prod
DOMAIN_NAME=your-domain.com
FRONTEND_DOMAIN=your-frontend-domain.com
```

5. Collect static files:

```bash
python manage.py collectstatic --noinput
```

6. Run migrations:

```bash
python manage.py migrate
```

## Step 4: Configure Nginx

1. Create an Nginx configuration file:

```bash
nano /etc/nginx/sites-available/minerva
```

Add the following:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }

    location /static/ {
        root /var/www/minerva/src;
    }

    location /media/ {
        root /var/www/minerva/src;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }
}
```

2. Enable the site:

```bash
ln -s /etc/nginx/sites-available/minerva /etc/nginx/sites-enabled
nginx -t
systemctl restart nginx
```

## Step 5: Configure Gunicorn

1. Install Gunicorn:

```bash
pip install gunicorn
```

2. Create a Gunicorn service file:

```bash
nano /etc/supervisor/conf.d/minerva.conf
```

Add the following:

```ini
[program:minerva]
directory=/var/www/minerva/src
command=/var/www/minerva/venv/bin/gunicorn minervahome.wsgi:application --workers 3 --bind unix:/run/gunicorn.sock
autostart=true
autorestart=true
stderr_logfile=/var/log/minerva/gunicorn.err.log
stdout_logfile=/var/log/minerva/gunicorn.out.log
```

3. Start the service:

```bash
mkdir -p /var/log/minerva
supervisorctl reread
supervisorctl update
supervisorctl start minerva
```

## Step 6: Set Up SSL (Optional but Recommended)

1. Install Certbot:

```bash
apt install certbot python3-certbot-nginx -y
```

2. Obtain SSL certificate:

```bash
certbot --nginx -d your-domain.com
```

## Step 7: Update Frontend Configuration

Update your frontend's API URL to point to your new backend:

```typescript
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

## Monitoring and Maintenance

1. Check logs:

```bash
tail -f /var/log/minerva/gunicorn.err.log
tail -f /var/log/minerva/gunicorn.out.log
```

2. Restart the application:

```bash
supervisorctl restart minerva
```

3. Update the application:

```bash
cd /var/www/minerva
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
supervisorctl restart minerva
```

## Troubleshooting

1. Check Nginx status:

```bash
systemctl status nginx
```

2. Check Gunicorn status:

```bash
supervisorctl status minerva
```

3. Check Nginx error logs:

```bash
tail -f /var/log/nginx/error.log
```

4. Check application logs:

```bash
tail -f /var/log/minerva/gunicorn.err.log
```
