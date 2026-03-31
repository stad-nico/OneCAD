# Deployment Guide

This guide covers deploying OpenTSCAD projects in various environments, from development to production, including best practices for packaging, distribution, and server deployment.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Local Development](#local-development)
- [Production Build](#production-build)
- [Server Deployment](#server-deployment)
- [Static File Hosting](#static-file-hosting)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [CDN Integration](#cdn-integration)
- [Security Considerations](#security-considerations)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)

## Deployment Overview

OpenTSCAD applications consist of three main components:
1. **CLI Package**: For project management and development
2. **Core Server**: WebSocket server for real-time visualization
3. **Frontend**: Angular application for 3D visualization
4. **Build Output**: Compiled models and assets

### Deployment Scenarios

| Scenario | CLI | Server | Frontend | Use Case |
|----------|-----|--------|----------|-----------|
| Development | Local | Local | Dev Server | Local development |
| Team Development | Local | Shared | Dev Server | Team collaboration |
| Staging | CI/CD | Staging | Built | Testing environment |
| Production | CI/CD | Production | Built | Live deployment |

## Local Development

### Quick Start
```bash
# Start all services locally
npm run dev

# Custom configuration
opentscad dev --host 0.0.0.0 --port 3000
```

### Development Server Configuration
```json
{
  "server": {
    "host": "localhost",
    "port": 8080,
    "autoReload": true,
    "cors": {
      "origin": "http://localhost:3000"
    }
  },
  "watch": {
    "enabled": true,
    "debounce": 300
  }
}
```

### Environment Variables
```bash
# .env.local
NODE_ENV=development
OPENTSCAD_SERVER_URL=http://localhost:8080
OPENTSCAD_AUTO_CONNECT=true
OPENTSCAD_LOG_LEVEL=debug
```

## Production Build

### Building for Production

#### Step 1: Optimize Configuration
```json
{
  "build": {
    "optimize": true,
    "minify": true,
    "sourceMaps": false,
    "target": "ES2022",
    "treeshake": true
  },
  "server": {
    "compression": true,
    "rateLimit": {
      "enabled": true,
      "max": 100
    }
  }
}
```

#### Step 2: Build Commands
```bash
# Clean previous builds
npm run clean

# Build optimized version
npm run build --optimize

# Verify build output
ls -la dist/
```

#### Step 3: Build Output Structure
```
dist/
├── models/                 # Compiled model files
│   ├── main.js
│   └── components/
├── assets/                # Static assets
│   ├── textures/
│   └── materials/
├── server/                # Server build
│   ├── main.js
│   └── config.json
├── frontend/              # Frontend build
│   ├── index.html
│   ├── main.js
│   └── assets/
└── package.json           # Production dependencies
```

### Build Verification
```bash
# Test production build locally
opentscad serve --production --port 8080

# Run basic health checks
curl http://localhost:8080/health
curl http://localhost:8080/api/status
```

## Server Deployment

### Standalone Server

#### Systemd Service (Linux)
```ini
# /etc/systemd/system/opentscad.service
[Unit]
Description=OpenTSCAD Server
After=network.target

[Service]
Type=simple
User=opentscad
WorkingDirectory=/opt/opentscad
ExecStart=/usr/bin/node dist/server/main.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable opentscad
sudo systemctl start opentscad
sudo systemctl status opentscad
```

#### PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'opentscad-server',
    script: 'dist/server/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: '/var/log/opentscad/error.log',
    out_file: '/var/log/opentscad/access.log',
    log_file: '/var/log/opentscad/combined.log'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Reverse Proxy Configuration

#### Nginx
```nginx
# /etc/nginx/sites-available/opentscad
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Frontend static files
    location / {
        root /opt/opentscad/dist/frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # WebSocket proxy for server
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
        proxy_connect_timeout 86400;
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache
```apache
# VirtualHost configuration
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /opt/opentscad/dist/frontend

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/your-domain.crt
    SSLCertificateKeyFile /etc/ssl/private/your-domain.key

    # Frontend static files
    <Directory "/opt/opentscad/dist/frontend">
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # WebSocket proxy
    ProxyRequests Off
    ProxyPreserveHost On
    
    ProxyPass /ws ws://localhost:8080/ws
    ProxyPassReverse /ws ws://localhost:8080/ws
    
    ProxyPass /api http://localhost:8080/api
    ProxyPassReverse /api http://localhost:8080/api

    # Enable mod_rewrite for SPA
    RewriteEngine On
    RewriteRule ^(?!.*\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|json)).*$ /index.html [L]
</VirtualHost>
```

## Static File Hosting

### CDN Configuration

#### CloudFront (AWS)
```json
{
  "DistributionConfig": {
    "CallerReference": "opentscad-2024",
    "Origins": {
      "Quantity": 2,
      "Items": [
        {
          "Id": "frontend-origin",
          "DomainName": "your-bucket.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        },
        {
          "Id": "api-origin",
          "DomainName": "api.your-domain.com",
          "CustomOriginConfig": {
            "HTTPPort": 80,
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "https-only"
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "frontend-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "CachePolicyId": "optimized-caching"
    },
    "CacheBehaviors": {
      "Quantity": 2,
      "Items": [
        {
          "PathPattern": "/ws/*",
          "TargetOriginId": "api-origin",
          "ViewerProtocolPolicy": "https-only",
          "CachePolicyId": "no-caching"
        },
        {
          "PathPattern": "/api/*",
          "TargetOriginId": "api-origin",
          "ViewerProtocolPolicy": "https-only",
          "CachePolicyId": "no-caching"
        }
      ]
    }
  }
}
```

#### Cloudflare
```javascript
// Cloudflare Workers for dynamic routing
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route WebSocket connections
    if (url.pathname.startsWith('/ws')) {
      return fetch(`https://api.your-domain.com${url.pathname}`, request);
    }
    
    // Route API calls
    if (url.pathname.startsWith('/api')) {
      return fetch(`https://api.your-domain.com${url.pathname}`, request);
    }
    
    // Serve static frontend
    return env.ASSETS.fetch(request);
  }
};
```

### Build and Deploy Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting OpenTSCAD deployment..."

# Build production version
echo "📦 Building production bundle..."
npm run build

# Upload frontend to S3
echo "⬆️ Uploading frontend to S3..."
aws s3 sync dist/frontend/ s3://your-bucket-name/ --delete

# Deploy server to EC2
echo "🖥️ Deploying server..."
rsync -avz dist/server/ ubuntu@your-server:/opt/opentscad/

# Restart services
echo "🔄 Restarting services..."
ssh ubuntu@your-server 'sudo systemctl restart opentscad'

# Invalidate CDN cache
echo "🗑️ Invalidating CDN cache..."
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "✅ Deployment completed successfully!"
```

## Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S opentscad -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=opentscad:nodejs /app/dist ./dist
COPY --from=builder --chown=opentscad:nodejs /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

USER opentscad

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/server/main.js"]
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  opentscad-server:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped
    networks:
      - opentscad

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - opentscad

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/private
      - ./dist/frontend:/usr/share/nginx/html
    depends_on:
      - opentscad-server
    restart: unless-stopped
    networks:
      - opentscad

volumes:
  redis_data:

networks:
  opentscad:
    driver: bridge
```

### Kubernetes Deployment
```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: opentscad-server
  labels:
    app: opentscad-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: opentscad-server
  template:
    metadata:
      labels:
        app: opentscad-server
    spec:
      containers:
      - name: server
        image: your-registry/opentscad-server:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "8080"
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: opentscad-service
spec:
  selector:
    app: opentscad-server
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: opentscad-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: opentscad-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: opentscad-service
            port:
              number: 80
```

## Cloud Platforms

### AWS Deployment

#### Using AWS App Runner
```yaml
# apprunner.yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm ci
      - npm run build
run:
  runtime-version: 18
  command: node dist/server/main.js
  network:
    port: 8080
  env:
    - name: NODE_ENV
      value: production
```

#### Using Elastic Beanstalk
```json
{
  ".platform/nginx/conf.d/websocket.conf": {
    "upstream websocket {
      "server 127.0.0.1:8080;
    }
    
    "location /ws {
      "proxy_pass http://websocket;
      "proxy_http_version 1.1;
      "proxy_set_header Upgrade $http_upgrade;
      "proxy_set_header Connection \"upgrade\";
    }
  }
}
```

### Vercel Deployment
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/frontend/**",
      "use": "@vercel/static"
    },
    {
      "src": "dist/server/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/dist/server/main.js" },
    { "src": "/ws", "dest": "/dist/server/main.js" },
    { "src": "/(.*)", "dest": "/dist/frontend/$1" }
  ],
  "functions": {
    "dist/server/main.js": {
      "maxDuration": 30
    }
  }
}
```

### Netlify Deployment
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist/frontend"

[[redirects]]
  from = "/api/*"
  to = "https://api.your-domain.com/api/:splat"
  status = 200

[[redirects]]
  from = "/ws"
  to = "https://api.your-domain.com/ws"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Security Considerations

### SSL/TLS Configuration
```bash
# Generate SSL certificate with Let's Encrypt
certbot --nginx -d your-domain.com

# Or manually configure
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/opentscad.key \
  -out /etc/ssl/certs/opentscad.crt
```

### Environment Variables Security
```bash
# Use secrets management
export OPENTSCAD_JWT_SECRET=$(openssl rand -base64 32)
export OPENTSCAD_DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id prod/db/password --query SecretString --output text)
```

### Rate Limiting
```javascript
// Express rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api', limiter);
```

### Content Security Policy
```javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' ws: wss:; " +
    "img-src 'self' data: blob:;"
  );
  next();
});
```

## Monitoring & Logging

### Application Monitoring
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    connections: websocketConnections.length,
    models_compiled: compilationCount,
    errors_last_hour: errorCount,
    response_time_avg: averageResponseTime
  });
});
```

### Logging Configuration
```javascript
// Winston logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'opentscad-server' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Performance Monitoring
```bash
# Install monitoring tools
npm install prometheus-client
npm install @opentelemetry/api

# CPU and memory monitoring
top -p $(pgrep -f "node.*opentscad")
htop -p $(pgrep -f "node.*opentscad")
```

## Performance Optimization

### Server Optimization
```javascript
// Cluster mode for multi-core utilization
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numWorkers = os.cpus().length;
  
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Start application server
  require('./app.js');
}
```

### Caching Strategy
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache compiled models
const cacheKey = `model:${modelHash}`;
const cached = await client.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
} else {
  const compiled = await compileModel(source);
  await client.setex(cacheKey, 3600, JSON.stringify(compiled));
  return compiled;
}
```

### CDN Optimization
```javascript
// Optimal cache headers
app.use('/static', express.static('dist/frontend', {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));
```

## Troubleshooting Deployment Issues

### Common Problems

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules dist .opentscad
npm install
npm run build

# Check for missing dependencies
npm audit
npm update
```

#### WebSocket Connection Issues
```bash
# Test WebSocket connection
websocat ws://localhost:8080/ws

# Check firewall settings
sudo ufw status
sudo ufw allow 8080/tcp

# Verify proxy configuration
nginx -t
systemctl reload nginx
```

#### Performance Issues
```bash
# Monitor resource usage
htop
iotop
netstat -tlnp

# Profile Node.js application
node --inspect dist/server/main.js
```

#### SSL/TLS Problems
```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Check certificate expiration
openssl x509 -in /etc/ssl/certs/your-domain.crt -text -noout

# Renew Let's Encrypt certificate
certbot renew --dry-run
```

This deployment guide provides comprehensive coverage of deploying OpenTSCAD applications across different environments and platforms. Choose the deployment method that best fits your infrastructure and requirements.