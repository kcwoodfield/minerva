# Deployment guide

**Target:** `minerva.kevinwoodfield.com`  
**Recommended stack:** AWS ECS Fargate + RDS PostgreSQL + Cloudflare DNS

---

## Architecture

```
Cloudflare DNS (minerva.kevinwoodfield.com)
    ↓
Application Load Balancer (ALB)
    ↓  /api/* → minerva-api-tg (port 8080)
    ↓  /*     → minerva-client-tg (port 80)
ECS Fargate (API container + Client container)
    ↓
RDS PostgreSQL (private subnet)
```

---

## Prerequisites

```bash
aws --version   # AWS CLI installed and configured
docker ps       # Docker running
```

---

## Step 1 — RDS PostgreSQL

Via AWS Console:

1. RDS → Create database → PostgreSQL 15
2. Template: Free tier (db.t3.micro)
3. Master username: `postgres`, auto-generate password (save it)
4. VPC: default, public access enabled (or private + bastion)
5. Security group: allow port 5432 from your IP
6. Initial database name: `minerva`
7. Wait ~10 min; copy the endpoint

Connection string format:
```
Host=minerva.xxxxx.us-east-1.rds.amazonaws.com;Port=5432;Database=minerva;Username=postgres;Password=<password>
```

Store in Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name minerva/db-connection \
  --secret-string "Host=...;Port=5432;Database=minerva;Username=postgres;Password=<password>"
```

Apply migrations from local machine:
```bash
cd src/Minerva.Api
export ConnectionStrings__DefaultConnection="<RDS connection string>"
dotnet ef database update
```

---

## Step 2 — ECR repositories

```bash
aws ecr create-repository --repository-name minerva-api    --region us-east-1
aws ecr create-repository --repository-name minerva-client --region us-east-1
# Note the URIs: 123456789012.dkr.ecr.us-east-1.amazonaws.com/minerva-{api,client}
```

---

## Step 3 — Dockerfiles

**`src/Minerva.Api/Dockerfile`**
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Minerva.Api.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Minerva.Api.dll"]
```

**`src/Minerva.Client/Dockerfile`**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and push:
```bash
# Login
aws ecr get-login-password --region us-east-1 \
  | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# API
cd src/Minerva.Api
docker build -t minerva-api .
docker tag minerva-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/minerva-api:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/minerva-api:latest

# Client (VITE_API_URL = ALB DNS, set before creating frontend image)
cd src/Minerva.Client
docker build --build-arg VITE_API_URL=http://<ALB-DNS> -t minerva-client .
docker tag minerva-client:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/minerva-client:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/minerva-client:latest
```

---

## Step 4 — ECS cluster

```bash
aws ecs create-cluster --cluster-name minerva-cluster --region us-east-1
```

---

## Step 5 — Application Load Balancer

Via AWS Console → EC2 → Load Balancers → Create:

- Scheme: Internet-facing, IPv4
- Security group: allow HTTP (80) and HTTPS (443) from anywhere
- Target groups:
  - `minerva-api-tg` — IP, HTTP:8080, health check `/health`
  - `minerva-client-tg` — IP, HTTP:80, health check `/`
- Listener rules:
  - Path `/api/*` → `minerva-api-tg`
  - Default → `minerva-client-tg`

Note the ALB DNS name.

---

## Step 6 — CloudWatch log groups

```bash
aws logs create-log-group --log-group-name /ecs/minerva-api
aws logs create-log-group --log-group-name /ecs/minerva-client
```

---

## Step 7 — Task definitions

Register via AWS Console or CLI. Key values:

| Setting | API | Client |
|---------|-----|--------|
| Launch type | FARGATE | FARGATE |
| CPU / Memory | 512 / 1024 | 256 / 512 |
| Container port | 8080 | 80 |
| Secret | `ConnectionStrings__DefaultConnection` from Secrets Manager | — |
| Log group | `/ecs/minerva-api` | `/ecs/minerva-client` |

---

## Step 8 — ECS services

```bash
# API
aws ecs create-service \
  --cluster minerva-cluster \
  --service-name minerva-api-service \
  --task-definition minerva-api \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<subnet-a>,<subnet-b>],securityGroups=[<sg>],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=<minerva-api-tg-arn>,containerName=minerva-api,containerPort=8080"

# Client
aws ecs create-service \
  --cluster minerva-cluster \
  --service-name minerva-client-service \
  --task-definition minerva-client \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<subnet-a>,<subnet-b>],securityGroups=[<sg>],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=<minerva-client-tg-arn>,containerName=minerva-client,containerPort=80"
```

---

## Step 9 — DNS (Cloudflare)

1. Cloudflare → DNS → Add record
2. Type: `CNAME`, Name: `minerva`, Target: `<ALB DNS name>`
3. Proxy status: Proxied (orange cloud) — free SSL + CDN
4. SSL/TLS mode: Flexible or Full

---

## Step 10 — Verify

```bash
# Service health
aws ecs describe-services --cluster minerva-cluster \
  --services minerva-api-service minerva-client-service

# Target health
aws elbv2 describe-target-health --target-group-arn <arn>

# Live logs
aws logs tail /ecs/minerva-api --follow
```

Browser smoke test:
- [ ] https://minerva.kevinwoodfield.com loads
- [ ] Add a book via ISBN
- [ ] Generate haiku
- [ ] Check Insights page
- [ ] Test on mobile

---

## Cost estimates

| Option | Monthly |
|--------|---------|
| AWS ECS Fargate + RDS (free tier yr 1) | ~$15–20 |
| AWS ECS Fargate + RDS (after free tier) | ~$30–50 |
| Google Cloud Run + Cloud SQL | ~$10–15 |

---

## Alternative: Google Cloud Run

Simpler and cheaper for personal use (~60–90 min setup vs ~2–2.5 hr for ECS):

```bash
gcloud auth login
gcloud config set project minerva-prod

# Cloud SQL
gcloud sql instances create minerva-db \
  --database-version=POSTGRES_15 --tier=db-f1-micro --region=us-central1
gcloud sql databases create minerva --instance=minerva-db

# Deploy API
cd src/Minerva.Api
gcloud run deploy minerva-api \
  --source . --platform managed --region us-central1 --allow-unauthenticated \
  --set-env-vars ConnectionStrings__DefaultConnection="<Cloud SQL connection string>"

# Deploy client
cd src/Minerva.Client
gcloud run deploy minerva-client \
  --source . --platform managed --region us-central1 --allow-unauthenticated \
  --set-env-vars VITE_API_URL="https://minerva-api-xxx.run.app"

# Map domain
gcloud run domain-mappings create --service minerva-client --domain minerva.kevinwoodfield.com
```

Trade-off: cold starts (2–3 s) vs simpler ops. Fine for personal use.
