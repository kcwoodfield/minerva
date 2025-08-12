# Azure Deployment Guide

## Overview

This guide covers deploying Minerva to Microsoft Azure using modern cloud-native practices, including infrastructure as code, container orchestration, and managed services.

## 🎯 Azure Deployment Strategy

### Architecture Overview

```
Internet → Azure CDN → Application Gateway → AKS → Azure SQL + Azure Cache
    ↓           ↓            ↓              ↓           ↓
  HTTPS    Global CDN    Load Balancer   Containers   Database
```

### Service Selection

- **Compute**: Azure Kubernetes Service (AKS) - managed Kubernetes
- **Database**: Azure SQL Database (PostgreSQL) - managed database
- **Caching**: Azure Cache for Redis - managed Redis
- **Storage**: Azure Blob Storage - static assets + media files
- **CDN**: Azure CDN - global content delivery
- **Load Balancing**: Azure Application Gateway - advanced load balancing
- **Monitoring**: Azure Monitor + Application Insights

## 🚀 Infrastructure Setup

### 1. Prerequisites

#### Azure Account Setup

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "Your Subscription Name"

# Verify configuration
az account show
```

#### Required Tools

```bash
# Install kubectl for Kubernetes management
az aks install-cli

# Install Helm for package management
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Infrastructure as Code (Bicep)

#### Project Structure

```
azure/
├── bicep/
│   ├── main.bicep              # Main configuration
│   ├── parameters.bicep        # Parameter definitions
│   ├── outputs.bicep           # Output values
│   ├── modules/
│   │   ├── network.bicep       # VNet and networking
│   │   ├── aks.bicep           # AKS cluster configuration
│   │   ├── database.bicep      # Azure SQL configuration
│   │   ├── cache.bicep         # Azure Cache configuration
│   │   ├── storage.bicep       # Blob storage configuration
│   │   ├── cdn.bicep           # CDN configuration
│   │   └── monitoring.bicep    # Monitoring and logging
├── docker/
│   ├── Dockerfile.backend      # Backend container
│   └── Dockerfile.frontend     # Frontend container
└── scripts/
    ├── deploy.sh               # Deployment script
    └── destroy.sh              # Cleanup script
```

#### Main Configuration (`bicep/main.bicep`)

```bicep
@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Azure region for resources')
param location string = resourceGroup().location

@description('Resource name prefix')
param namePrefix string = 'minerva'

@description('AKS node count')
param aksNodeCount int = 1

@description('AKS node size')
param aksNodeSize string = 'Standard_B2s'

@description('Database admin username')
param dbAdminUsername string

@description('Database admin password')
@secure()
param dbAdminPassword string

// Network resources
module network 'modules/network.bicep' = {
  name: 'network'
  params: {
    location: location
    environment: environment
    namePrefix: namePrefix
  }
}

// AKS cluster
module aks 'modules/aks.bicep' = {
  name: 'aks'
  params: {
    location: location
    environment: environment
    namePrefix: namePrefix
    nodeCount: aksNodeCount
    nodeSize: aksNodeSize
    vnetId: network.outputs.vnetId
    subnetId: network.outputs.aksSubnetId
  }
}

// Azure SQL Database
module database 'modules/database.bicep' = {
  name: 'database'
  params: {
    location: location
    environment: environment
    namePrefix: namePrefix
    adminUsername: dbAdminUsername
    adminPassword: dbAdminPassword
    subnetId: network.outputs.dbSubnetId
  }
}

// Azure Cache for Redis
module cache 'modules/cache.bicep' = {
  name: 'cache'
  params: {
    location: location
    environment: environment
    namePrefix: namePrefix
    subnetId: network.outputs.cacheSubnetId
  }
}

// Blob Storage
module storage 'modules/storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    environment: environment
    namePrefix: namePrefix
  }
}

// CDN
module cdn 'modules/cdn.bicep' = {
  name: 'cdn'
  params: {
    location: location
    environment: environment
    namePrefix: namePrefix
    storageAccountName: storage.outputs.storageAccountName
  }
}

// Monitoring
module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  params: {
    location: location
    environment: environment
    namePrefix: namePrefix
    aksResourceId: aks.outputs.aksResourceId
  }
}

// Outputs
output aksClusterName string = aks.outputs.clusterName
output aksResourceGroup string = aks.outputs.resourceGroup
output databaseServerName string = database.outputs.serverName
output databaseName string = database.outputs.databaseName
output cacheHostName string = cache.outputs.hostName
output storageAccountName string = storage.outputs.storageAccountName
output cdnEndpoint string = cdn.outputs.endpoint
```

#### Network Configuration (`bicep/modules/network.bicep`)

```bicep
@description('Azure region for resources')
param location string

@description('Environment name')
param environment string

@description('Resource name prefix')
param namePrefix string

// Virtual Network
resource vnet 'Microsoft.Network/virtualNetworks@2023-05-01' = {
  name: '${namePrefix}-vnet-${environment}'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.0.0.0/16'
      ]
    }
    subnets: [
      {
        name: 'aks-subnet'
        properties: {
          addressPrefix: '10.0.1.0/24'
          networkSecurityGroup: aksNsg
        }
      }
      {
        name: 'db-subnet'
        properties: {
          addressPrefix: '10.0.2.0/24'
          networkSecurityGroup: dbNsg
        }
      }
      {
        name: 'cache-subnet'
        properties: {
          addressPrefix: '10.0.3.0/24'
          networkSecurityGroup: cacheNsg
        }
      }
    ]
  }
}

// Network Security Groups
resource aksNsg 'Microsoft.Network/networkSecurityGroups@2023-05-01' = {
  name: '${namePrefix}-aks-nsg-${environment}'
  location: location
  properties: {
    securityRules: [
      {
        name: 'allow-http'
        properties: {
          priority: 100
          access: 'Allow'
          direction: 'Inbound'
          destinationPortRange: '80'
          protocol: 'Tcp'
          sourceAddressPrefix: 'Internet'
        }
      }
      {
        name: 'allow-https'
        properties: {
          priority: 110
          access: 'Allow'
          direction: 'Inbound'
          destinationPortRange: '443'
          protocol: 'Tcp'
          sourceAddressPrefix: 'Internet'
        }
      }
    ]
  }
}

resource dbNsg 'Microsoft.Network/networkSecurityGroups@2023-05-01' = {
  name: '${namePrefix}-db-nsg-${environment}'
  location: location
  properties: {
    securityRules: [
      {
        name: 'allow-aks-to-db'
        properties: {
          priority: 100
          access: 'Allow'
          direction: 'Inbound'
          destinationPortRange: '5432'
          protocol: 'Tcp'
          sourceAddressPrefix: '10.0.1.0/24'
        }
      }
    ]
  }
}

resource cacheNsg 'Microsoft.Network/networkSecurityGroups@2023-05-01' = {
  name: '${namePrefix}-cache-nsg-${environment}'
  location: location
  properties: {
    securityRules: [
      {
        name: 'allow-aks-to-cache'
        properties: {
          priority: 100
          access: 'Allow'
          direction: 'Inbound'
          destinationPortRange: '6379'
          protocol: 'Tcp'
          sourceAddressPrefix: '10.0.1.0/24'
        }
      }
    ]
  }
}

// Outputs
output vnetId string = vnet.id
output aksSubnetId string = vnet.properties.subnets[0].id
output dbSubnetId string = vnet.properties.subnets[1].id
output cacheSubnetId string = vnet.properties.subnets[2].id
```

### 3. AKS Cluster Setup

#### AKS Configuration (`bicep/modules/aks.bicep`)

```bicep
@description('Azure region for resources')
param location string

@description('Environment name')
param environment string

@description('Resource name prefix')
param namePrefix string

@description('Number of AKS nodes')
param nodeCount int

@description('AKS node size')
param nodeSize string

@description('Virtual network ID')
param vnetId string

@description('AKS subnet ID')
param subnetId string

// AKS Cluster
resource aks 'Microsoft.ContainerService/managedClusters@2023-07-02-preview' = {
  name: '${namePrefix}-aks-${environment}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    kubernetesVersion: '1.27.7'
    dnsPrefix: '${namePrefix}${environment}'
    agentPoolProfiles: [
      {
        name: 'nodepool1'
        count: nodeCount
        vmSize: nodeSize
        osType: 'Linux'
        mode: 'System'
        vnetSubnetID: subnetId
        enableAutoScaling: true
        minCount: 1
        maxCount: 5
      }
    ]
    networkProfile: {
      networkPlugin: 'azure'
      networkPolicy: 'azure'
      serviceCidr: '10.96.0.0/12'
      dnsServiceIP: '10.96.0.10'
      dockerBridgeCidr: '172.17.0.1/16'
    }
    addonProfiles: {
      'azure-policy': {
        enabled: true
      }
      'omsagent': {
        enabled: true
        config: {
          'logAnalyticsWorkspaceResourceID': monitoring.outputs.workspaceId
        }
      }
    }
  }
}

// Outputs
output clusterName string = aks.name
output resourceGroup string = resourceGroup().name
output aksResourceId string = aks.id
```

### 4. Database Setup (Azure SQL)

#### Azure SQL Configuration (`bicep/modules/database.bicep`)

```bicep
@description('Azure region for resources')
param location string

@description('Environment name')
param environment string

@description('Resource name prefix')
param namePrefix string

@description('Database admin username')
param adminUsername string

@description('Database admin password')
@secure()
param adminPassword string

@description('Database subnet ID')
param subnetId string

// Azure SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: '${namePrefix}-sql-${environment}'
  location: location
  properties: {
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
  }
}

// Azure SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: 'minerva'
  location: location
  sku: {
    name: environment == 'prod' ? 'S1' : 'Basic'
    tier: environment == 'prod' ? 'Standard' : 'Basic'
  }
  properties: {
    collation: 'en_US.utf8'
    maxSizeBytes: environment == 'prod' ? 2147483648 : 2147483648 // 2GB
  }
}

// Private Endpoint for Azure SQL
resource sqlPrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  name: '${namePrefix}-sql-pe-${environment}'
  location: location
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'sql-private-link'
        properties: {
          privateLinkServiceId: sqlServer.id
          groupIds: [
            'sqlServer'
          ]
        }
      }
    ]
  }
}

// Outputs
output serverName string = sqlServer.name
output databaseName string = sqlDatabase.name
output connectionString string = 'Server=tcp:${sqlServer.name}.database.windows.net,1433;Database=${sqlDatabase.name};User ID=${adminUsername};Password=${adminPassword};Encrypt=true;Connection Timeout=30;'
```

### 5. Container Orchestration (AKS)

#### Kubernetes Manifests

**Backend Deployment (`k8s/backend-deployment.yaml`):**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minerva-backend
  labels:
    app: minerva-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: minerva-backend
  template:
    metadata:
      labels:
        app: minerva-backend
    spec:
      containers:
        - name: backend
          image: minerva-backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: DJANGO_SETTINGS_MODULE
              value: 'minervahome.settings_prod'
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: minerva-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: minerva-secrets
                  key: redis-url
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health/
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
```

**Frontend Deployment (`k8s/frontend-deployment.yaml`):**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minerva-frontend
  labels:
    app: minerva-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: minerva-frontend
  template:
    metadata:
      labels:
        app: minerva-frontend
    spec:
      containers:
        - name: frontend
          image: minerva-frontend:latest
          ports:
            - containerPort: 3000
          env:
            - name: NEXT_PUBLIC_API_URL
              value: 'https://api.yourdomain.com'
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

**Services (`k8s/services.yaml`):**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: minerva-backend-service
spec:
  selector:
    app: minerva-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: minerva-frontend-service
spec:
  selector:
    app: minerva-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

**Ingress (`k8s/ingress.yaml`):**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: minerva-ingress
  annotations:
    kubernetes.io/ingress.class: 'nginx'
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    nginx.ingress.kubernetes.io/force-ssl-redirect: 'true'
spec:
  tls:
    - hosts:
        - yourdomain.com
        - www.yourdomain.com
      secretName: minerva-tls
  rules:
    - host: yourdomain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: minerva-frontend-service
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: minerva-backend-service
                port:
                  number: 80
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
# Create resource group
az group create --name minerva-rg --location eastus

# Deploy infrastructure
cd azure/bicep
az deployment group create \
  --resource-group minerva-rg \
  --template-file main.bicep \
  --parameters environment=dev \
  --parameters dbAdminUsername=minerva_admin \
  --parameters dbAdminPassword="YourSecurePassword123!"
```

### 2. Deploy to AKS

```bash
# Get AKS credentials
az aks get-credentials --resource-group minerva-rg --name minerva-aks-dev

# Create namespace
kubectl create namespace minerva

# Apply Kubernetes manifests
kubectl apply -f k8s/ -n minerva

# Check deployment status
kubectl get pods -n minerva
kubectl get services -n minerva
kubectl get ingress -n minerva
```

### 3. Build and Push Images

```bash
# Build backend image
docker build -f docker/Dockerfile.backend -t minerva-backend:latest backend/

# Build frontend image
docker build -f docker/Dockerfile.frontend -t minerva-frontend:latest frontend/

# Tag for Azure Container Registry (if using)
az acr login --name yourregistryname
docker tag minerva-backend:latest yourregistryname.azurecr.io/minerva-backend:latest
docker tag minerva-frontend:latest yourregistryname.azurecr.io/minerva-frontend:latest

# Push to registry
docker push yourregistryname.azurecr.io/minerva-backend:latest
docker push yourregistryname.azurecr.io/minerva-frontend:latest
```

### 4. Update Deployments

```bash
# Update image in deployment
kubectl set image deployment/minerva-backend backend=yourregistryname.azurecr.io/minerva-backend:latest -n minerva
kubectl set image deployment/minerva-frontend frontend=yourregistryname.azurecr.io/minerva-frontend:latest -n minerva

# Check rollout status
kubectl rollout status deployment/minerva-backend -n minerva
kubectl rollout status deployment/minerva-frontend -n minerva
```

## 📊 Monitoring and Observability

### 1. Application Insights

```bicep
// Add to monitoring.bicep
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${namePrefix}-ai-${environment}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

// Add to AKS deployment
resource aks 'Microsoft.ContainerService/managedClusters@2023-07-02-preview' = {
  // ... existing configuration ...
  properties: {
    // ... existing properties ...
    addonProfiles: {
      'azure-policy': {
        enabled: true
      }
      'omsagent': {
        enabled: true
        config: {
          'logAnalyticsWorkspaceResourceID': monitoring.outputs.workspaceId
        }
      }
      'applicationmonitoring': {
        enabled: true
        config: {
          'ApplicationInsightsResourceID': appInsights.id
        }
      }
    }
  }
}
```

### 2. Azure Monitor Dashboards

```bicep
resource dashboard 'Microsoft.Portal/dashboards@2020-09-01-preview' = {
  name: '${namePrefix}-dashboard-${environment}'
  location: 'global'
  properties: {
    lenses: [
      {
        order: 0
        parts: [
          {
            position: {
              x: 0
              y: 0
              colSpan: 6
              rowSpan: 4
            }
            metadata: {
              inputs: [
                {
                  name: 'queryInputs',
                  isOptional: true
                }
              ]
              type: 'Extension/Microsoft_OperationsManagementSuite_Workspace/PartType/LogsDashboardPart',
              settings: {
                content: {
                  Query: 'Perf | where ObjectName == "Processor" | summarize avg(CounterValue) by bin(TimeGenerated, 5m) | render timechart'
                  PartTitle: 'CPU Usage'
                }
              }
            }
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security and Compliance

### 1. Managed Identity

```bicep
// Enable managed identity for AKS
resource aks 'Microsoft.ContainerService/managedClusters@2023-07-02-preview' = {
  // ... existing configuration ...
  identity: {
    type: 'SystemAssigned'
  }
}

// Grant AKS access to Azure SQL
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  // ... existing configuration ...
}

resource sqlServerAdmin 'Microsoft.Sql/servers/administrators@2022-05-01-preview' = {
  parent: sqlServer
  name: 'ActiveDirectory'
  properties: {
    administratorType: 'ActiveDirectory'
    login: 'Azure AD Admin'
    sid: aks.identity.principalId
    tenantId: subscription().tenantId
  }
}
```

### 2. Network Security

```bicep
// Private endpoints for all services
resource sqlPrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  // ... existing configuration ...
}

resource cachePrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  name: '${namePrefix}-cache-pe-${environment}'
  location: location
  properties: {
    subnet: {
      id: subnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'cache-private-link'
        properties: {
          privateLinkServiceId: redisCache.id
          groupIds: [
            'redisCache'
          ]
        }
      }
    ]
  }
}
```

## 💰 Cost Optimization

### 1. Resource Sizing

```bicep
// Environment-based resource sizing
var resourceSizing = {
  dev: {
    aksNodeCount: 1
    aksNodeSize: 'Standard_B2s'
    dbSku: 'Basic'
    cacheSku: 'Basic'
  }
  prod: {
    aksNodeCount: 3
    aksNodeSize: 'Standard_D2s_v2'
    dbSku: 'S1'
    cacheSku: 'Standard'
  }
}

// Use in resource definitions
resource aks 'Microsoft.ContainerService/managedClusters@2023-07-02-preview' = {
  // ... existing configuration ...
  properties: {
    agentPoolProfiles: [
      {
        count: resourceSizing[environment].aksNodeCount
        vmSize: resourceSizing[environment].aksNodeSize
        // ... other properties
      }
    ]
  }
}
```

### 2. Auto-scaling

```bicep
// Enable auto-scaling for AKS
resource aks 'Microsoft.ContainerService/managedClusters@2023-07-02-preview' = {
  // ... existing configuration ...
  properties: {
    agentPoolProfiles: [
      {
        enableAutoScaling: true
        minCount: 1
        maxCount: environment == 'prod' ? 10 : 3
        // ... other properties
      }
    ]
  }
}
```

## 🚨 Disaster Recovery

### 1. Backup Strategy

```bicep
// Enable backup for Azure SQL
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  // ... existing configuration ...
  properties: {
    // ... existing properties ...
    backupStorageRedundancy: 'Geo'
    requestedBackupStorageRedundancy: 'Geo'
  }
}

// Long-term backup retention
resource longTermRetentionPolicy 'Microsoft.Sql/servers/databases/backupLongTermRetentionPolicies@2022-05-01-preview' = {
  parent: sqlDatabase
  name: 'Default'
  properties: {
    weeklyRetention: 'P1W'
    monthlyRetention: 'P1M'
    yearlyRetention: 'P1Y'
  }
}
```

### 2. Multi-Region Setup

```bicep
// Secondary region configuration
param secondaryLocation string = 'westus2'

// Cross-region replication for storage
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  // ... existing configuration ...
}

resource storageAccountReplication 'Microsoft.Storage/storageAccounts/managementPolicies@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    policy: {
      rules: [
        {
          name: 'CrossRegionReplication'
          enabled: true
          type: 'Lifecycle'
          definition: {
            actions: {
              baseBlob: {
                tierToCool: {
                  daysAfterModificationGreaterThan: 30
                }
                tierToArchive: {
                  daysAfterModificationGreaterThan: 90
                }
              }
            }
          }
        }
      ]
    }
  }
}
```

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Azure account configured with appropriate permissions
- [ ] Resource group created in target region
- [ ] Environment variables configured
- [ ] Docker images built and tested locally
- [ ] Database migrations prepared

### Infrastructure Deployment

- [ ] VNet and networking configured
- [ ] AKS cluster operational
- [ ] Azure SQL database running
- [ ] Azure Cache for Redis operational
- [ ] Blob storage configured
- [ ] CDN endpoint operational

### Application Deployment

- [ ] Kubernetes manifests applied
- [ ] Docker images deployed to AKS
- [ ] Health checks passing
- [ ] Database migrations applied
- [ ] Ingress configured and accessible

### Post-Deployment

- [ ] Application accessible via domain
- [ ] SSL certificates configured
- [ ] Monitoring and alerting operational
- [ ] Backup procedures tested
- [ ] Performance benchmarks met

---

## 📚 Next Steps

After successful Azure deployment:

1. **Set up monitoring and alerting** with Application Insights
2. **Configure CI/CD pipeline** for automated deployments
3. **Implement backup and recovery** procedures
4. **Set up cost monitoring** and optimization

### Additional Azure Resources

- **[Azure Infrastructure](infrastructure.md)** - Detailed Bicep templates and Azure services
- **[Azure Monitoring](monitoring.md)** - Application Insights and Azure-specific observability

For additional Azure guidance, refer to the Azure documentation or consult the other deployment guides in this directory.
