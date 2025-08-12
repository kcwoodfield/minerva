# AWS Deployment Guide

## Overview

This guide covers deploying Minerva to Amazon Web Services (AWS) using modern cloud-native practices, including infrastructure as code, container orchestration, and managed services.

## 🎯 AWS Deployment Strategy

### Architecture Overview
```
Internet → CloudFront → ALB → ECS Fargate → RDS + ElastiCache
    ↓           ↓        ↓         ↓           ↓
  HTTPS    CDN    Load Balancer  Containers  Database
```

### Service Selection
- **Compute**: ECS Fargate (serverless containers)
- **Database**: RDS PostgreSQL (managed database)
- **Caching**: ElastiCache Redis (managed Redis)
- **Storage**: S3 (static assets + media files)
- **CDN**: CloudFront (global content delivery)
- **Load Balancing**: Application Load Balancer
- **Monitoring**: CloudWatch + X-Ray

## 🚀 Infrastructure Setup

### 1. Prerequisites

#### AWS Account Setup
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure
# Enter your Access Key ID, Secret Access Key, region

# Verify configuration
aws sts get-caller-identity
```

#### Required Tools
```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs)"
sudo apt-get update && sudo apt-get install terraform

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Infrastructure as Code (Terraform)

#### Project Structure
```
aws/
├── terraform/
│   ├── main.tf              # Main configuration
│   ├── variables.tf         # Variable definitions
│   ├── outputs.tf           # Output values
│   ├── providers.tf         # Provider configuration
│   ├── vpc.tf              # VPC and networking
│   ├── security.tf          # Security groups and IAM
│   ├── database.tf          # RDS configuration
│   ├── cache.tf             # ElastiCache configuration
│   ├── ecs.tf               # ECS cluster and services
│   ├── alb.tf               # Load balancer configuration
│   ├── s3.tf                # S3 buckets
│   └── cloudfront.tf        # CDN configuration
├── docker/
│   ├── Dockerfile.backend   # Backend container
│   └── Dockerfile.frontend  # Frontend container
└── scripts/
    ├── deploy.sh            # Deployment script
    └── destroy.sh           # Cleanup script
```

#### Main Configuration (`terraform/main.tf`)
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "minerva-terraform-state"
    key    = "minerva/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "minerva"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC and networking
module "vpc" {
  source = "./modules/vpc"

  environment        = var.environment
  vpc_cidr          = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

# Security groups and IAM
module "security" {
  source = "./modules/security"

  environment = var.environment
  vpc_id     = module.vpc.vpc_id
}

# Database
module "database" {
  source = "./modules/database"

  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  security_group = module.security.rds_security_group_id
}

# ElastiCache
module "cache" {
  source = "./modules/cache"

  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  security_group = module.security.cache_security_group_id
}

# ECS cluster and services
module "ecs" {
  source = "./modules/ecs"

  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids

  backend_security_group = module.security.ecs_security_group_id
  frontend_security_group = module.security.ecs_security_group_id

  database_endpoint = module.database.endpoint
  cache_endpoint    = module.cache.endpoint
}

# Load balancer
module "alb" {
  source = "./modules/alb"

  environment        = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  security_group    = module.security.alb_security_group_id

  target_group_arns = module.ecs.target_group_arns
}

# S3 buckets
module "storage" {
  source = "./modules/storage"

  environment = var.environment
}

# CloudFront
module "cloudfront" {
  source = "./modules/cloudfront"

  environment = var.environment
  alb_domain = module.alb.domain_name
  s3_bucket  = module.storage.media_bucket_id
}
```

#### VPC Configuration (`terraform/vpc.tf`)
```hcl
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "minerva-vpc-${var.environment}"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway = true
  single_nat_gateway = var.environment == "dev"

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = var.environment
  }
}
```

#### Security Configuration (`terraform/security.tf`)
```hcl
# Security Groups
resource "aws_security_group" "alb" {
  name        = "minerva-alb-${var.environment}"
  description = "Security group for Application Load Balancer"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "minerva-alb-${var.environment}"
  }
}

resource "aws_security_group" "ecs" {
  name        = "minerva-ecs-${var.environment}"
  description = "Security group for ECS services"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "minerva-ecs-${var.environment}"
  }
}

resource "aws_security_group" "rds" {
  name        = "minerva-rds-${var.environment}"
  description = "Security group for RDS database"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "minerva-rds-${var.environment}"
  }
}

resource "aws_security_group" "cache" {
  name        = "minerva-cache-${var.environment}"
  description = "Security group for ElastiCache"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "minerva-cache-${var.environment}"
  }
}
```

### 3. Database Setup (RDS)

#### RDS Configuration (`terraform/database.tf`)
```hcl
resource "aws_db_subnet_group" "main" {
  name       = "minerva-db-subnet-group-${var.environment}"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "minerva-db-subnet-group-${var.environment}"
  }
}

resource "aws_db_instance" "main" {
  identifier = "minerva-db-${var.environment}"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.environment == "prod" ? "db.t3.micro" : "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "minerva"
  username = "minerva_user"
  password = var.db_password

  vpc_security_group_ids = [var.security_group_id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = "minerva-db-${var.environment}-final"

  tags = {
    Name = "minerva-db-${var.environment}"
  }
}
```

### 4. Container Orchestration (ECS)

#### ECS Cluster (`terraform/ecs.tf`)
```hcl
resource "aws_ecs_cluster" "main" {
  name = "minerva-cluster-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "minerva-cluster-${var.environment}"
  }
}

# Backend Service
resource "aws_ecs_service" "backend" {
  name            = "minerva-backend-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.environment == "prod" ? 2 : 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.backend_security_group]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.backend]

  tags = {
    Name = "minerva-backend-${var.environment}"
  }
}

# Frontend Service
resource "aws_ecs_service" "frontend" {
  name            = "minerva-frontend-${var.environment}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.environment == "prod" ? 2 : 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.frontend_security_group]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.frontend]

  tags = {
    Name = "minerva-frontend-${var.environment}"
  }
}
```

#### Task Definitions
```hcl
resource "aws_ecs_task_definition" "backend" {
  family                   = "minerva-backend-${var.environment}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.environment == "prod" ? 512 : 256
  memory                   = var.environment == "prod" ? 1024 : 512
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${var.ecr_repository_url}:latest"

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "DJANGO_SETTINGS_MODULE"
          value = "minervahome.settings_prod"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://minerva_user:${var.db_password}@${var.database_endpoint}:5432/minerva"
        },
        {
          name  = "REDIS_URL"
          value = "redis://${var.cache_endpoint}:6379"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = {
    Name = "minerva-backend-${var.environment}"
  }
}
```

### 5. Load Balancer Configuration

#### ALB Setup (`terraform/alb.tf`)
```hcl
resource "aws_lb" "main" {
  name               = "minerva-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod"

  tags = {
    Name = "minerva-alb-${var.environment}"
  }
}

# Target Groups
resource "aws_lb_target_group" "backend" {
  name     = "minerva-backend-${var.environment}"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "minerva-backend-${var.environment}"
  }
}

resource "aws_lb_target_group" "frontend" {
  name     = "minerva-frontend-${var.environment}"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "minerva-frontend-${var.environment}"
  }
}

# Listeners
resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

resource "aws_lb_listener" "frontend" {
  load_balancer_arn = aws_lb.main.arn
  port              = "3000"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}
```

## 🐳 Container Configuration

### 1. Backend Dockerfile (`docker/Dockerfile.backend`)
```dockerfile
FROM python:3.11-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create non-root user
RUN groupadd -r minerva && useradd -r -g minerva minerva
RUN chown -R minerva:minerva /app
USER minerva

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "minervahome.wsgi:application"]
```

### 2. Frontend Dockerfile (`docker/Dockerfile.frontend`)
```dockerfile
FROM node:18-alpine as dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine as production

WORKDIR /app

# Copy built application
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

EXPOSE 3000

CMD ["npm", "start"]
```

## 🚀 Deployment Process

### 1. Initial Setup
```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://minerva-terraform-state

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket minerva-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name minerva-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### 2. Deploy Infrastructure
```bash
cd aws/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var-file="environments/dev.tfvars"

# Apply changes
terraform apply -var-file="environments/dev.tfvars"
```

### 3. Build and Push Images
```bash
# Build backend image
docker build -f docker/Dockerfile.backend -t minerva-backend:latest backend/

# Build frontend image
docker build -f docker/Dockerfile.frontend -t minerva-frontend:latest frontend/

# Tag for ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag minerva-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/minerva-backend:latest
docker tag minerva-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/minerva-frontend:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/minerva-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/minerva-frontend:latest
```

### 4. Deploy Application
```bash
# Update ECS services with new images
aws ecs update-service \
  --cluster minerva-cluster-dev \
  --service minerva-backend-dev \
  --force-new-deployment

aws ecs update-service \
  --cluster minerva-cluster-dev \
  --service minerva-frontend-dev \
  --force-new-deployment
```

## 📊 Monitoring and Observability

### 1. CloudWatch Dashboards
```hcl
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "minerva-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ServiceName", "minerva-backend-${var.environment}", "ClusterName", "minerva-cluster-${var.environment}"],
            [".", "MemoryUtilization", ".", ".", ".", "."]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "ECS Service Metrics"
        }
      }
    ]
  })
}
```

### 2. Logging Configuration
```hcl
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/minerva-backend-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name = "minerva-backend-${var.environment}"
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/minerva-frontend-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name = "minerva-frontend-${var.environment}"
  }
}
```

## 🔒 Security and Compliance

### 1. IAM Roles and Policies
```hcl
resource "aws_iam_role" "ecs_execution_role" {
  name = "minerva-ecs-execution-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_role_policy" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
```

### 2. Encryption
```hcl
# Enable encryption at rest for RDS
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "minerva-rds-${var.environment}"
  }
}

# Enable encryption in transit
resource "aws_security_group_rule" "alb_https" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
}
```

## 💰 Cost Optimization

### 1. Resource Sizing
```hcl
locals {
  # Environment-based resource sizing
  resource_sizing = {
    dev = {
      backend_cpu    = 256
      backend_memory = 512
      frontend_cpu   = 256
      frontend_memory = 512
      db_instance_class = "db.t3.micro"
    }
    prod = {
      backend_cpu    = 512
      backend_memory = 1024
      frontend_cpu   = 512
      frontend_memory = 1024
      db_instance_class = "db.t3.small"
    }
  }
}
```

### 2. Auto Scaling
```hcl
resource "aws_appautoscaling_target" "backend" {
  max_capacity       = var.environment == "prod" ? 10 : 3
  min_capacity       = var.environment == "prod" ? 2 : 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "backend_cpu" {
  name               = "minerva-backend-cpu-${var.environment}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.backend.resource_id
  scalable_dimension = aws_appautoscaling_target.backend.scalable_dimension
  service_namespace  = aws_appautoscaling_target.backend.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

## 🚨 Disaster Recovery

### 1. Backup Strategy
```hcl
# Automated RDS snapshots
resource "aws_db_instance" "main" {
  # ... existing configuration ...

  backup_retention_period = 7
  backup_window          = "03:00-04:00"

  # Enable point-in-time recovery
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  # Enable deletion protection in production
  deletion_protection = var.environment == "prod"
}
```

### 2. Multi-Region Setup
```hcl
# Secondary region configuration
provider "aws" {
  alias  = "secondary"
  region = "us-west-2"
}

# Cross-region S3 replication
resource "aws_s3_bucket_replication_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  role = aws_iam_role.replication.arn

  destination {
    bucket = aws_s3_bucket.secondary.arn
    region = "us-west-2"
  }
}
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] AWS account configured with appropriate permissions
- [ ] Terraform state bucket created
- [ ] Environment variables configured
- [ ] Docker images built and tested locally
- [ ] Database migrations prepared

### Infrastructure Deployment
- [ ] VPC and networking configured
- [ ] Security groups and IAM roles created
- [ ] RDS database instance running
- [ ] ElastiCache cluster operational
- [ ] ECS cluster and services deployed
- [ ] Load balancer configured and healthy

### Application Deployment
- [ ] Docker images pushed to ECR
- [ ] ECS services updated with new images
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Static files collected and served

### Post-Deployment
- [ ] Application accessible via load balancer
- [ ] SSL certificates configured
- [ ] Monitoring and alerting operational
- [ ] Backup procedures tested
- [ ] Performance benchmarks met

---

## 📚 Next Steps

After successful AWS deployment:
1. **Set up monitoring and alerting** with CloudWatch
2. **Configure CI/CD pipeline** for automated deployments
3. **Implement backup and recovery** procedures
4. **Set up cost monitoring** and optimization

For additional AWS guidance, refer to the AWS documentation or consult the other deployment guides in this directory.
