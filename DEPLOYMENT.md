# Production Deployment Guide

Complete guide for deploying the Portfolio Platform to production environments.

## Prerequisites

- Node.js 18.17+ (LTS recommended)
- npm 9+ or yarn 1.22+
- A hosting platform (VPS, Docker, or Node.js hosting)
- Domain with SSL certificate (required for secure cookies)

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file (never commit this file):

```env
# REQUIRED: Admin credentials
ADMIN_USERNAME=your_secure_username
ADMIN_PASSWORD=your_very_secure_password_min_16_chars

# REQUIRED: Session secret (generate with: openssl rand -hex 32)
SESSION_SECRET=your_64_character_hex_string_here

# OPTIONAL: Node environment
NODE_ENV=production
```

### Generating Secure Values

```bash
# Generate a secure password
openssl rand -base64 24

# Generate session secret
openssl rand -hex 32
```

## Build for Production

```bash
# Install dependencies
npm ci --production=false

# Build optimized production bundle
npm run build

# Start production server
npm start
```

## Deployment Options

### Option 1: Traditional VPS (Recommended)

1. **Set up server**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone and build**
   ```bash
   git clone <your-repo-url>
   cd Portfolio
   npm ci --production=false
   npm run build
   ```

3. **Set up PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "portfolio" -- start
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       # Security headers
       add_header X-Frame-Options "DENY" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # Static files caching
       location /uploads/ {
           alias /path/to/Portfolio/public/uploads/;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  portfolio:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ADMIN_USERNAME=${ADMIN_USERNAME}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - SESSION_SECRET=${SESSION_SECRET}
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
    restart: unless-stopped
```

### Option 3: Vercel (Serverless)

> Note: File uploads will require external storage (e.g., AWS S3, Cloudinary)

```bash
npm install -g vercel
vercel --prod
```

## Security Checklist

- [ ] **Strong credentials** - Use passwords with 16+ characters
- [ ] **HTTPS only** - Ensure SSL is configured
- [ ] **Environment variables** - Never commit secrets
- [ ] **File permissions** - Uploads directory should be 755
- [ ] **Firewall** - Only expose ports 80, 443
- [ ] **Rate limiting** - Configured in middleware.js
- [ ] **Updates** - Keep dependencies updated

## File Storage Considerations

### Local Storage (Default)
- Files stored in `public/uploads/`
- Back up this directory regularly
- Consider storage limits

### For High Traffic / Multiple Instances

Consider using external storage:
- AWS S3
- Cloudinary
- DigitalOcean Spaces

Update `src/lib/upload.js` to use cloud storage SDK.

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs portfolio
```

### Health Check Endpoint

The app responds to root route. For custom health checks, add:

```javascript
// src/app/api/health/route.js
export async function GET() {
  return Response.json({ status: 'ok', timestamp: Date.now() });
}
```

## Backup Strategy

```bash
# Backup script (run daily via cron)
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf backup-$DATE.tar.gz data/ public/uploads/
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if Node.js process is running: `pm2 status`
   - Check logs: `pm2 logs portfolio`

2. **Session not persisting**
   - Ensure HTTPS is configured
   - Check SESSION_SECRET is set

3. **File uploads failing**
   - Check directory permissions: `chmod 755 public/uploads`
   - Verify disk space available

## Performance Optimization

```bash
# Analyze bundle size
npm run analyze

# Run production build
NODE_ENV=production npm run build
```
