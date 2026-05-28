#!/bin/bash
set -e

# ==============================================================================
# TokenShield Unified Deployment Script
# Provides a single command to build and deploy the entire TokenShield platform.
# ==============================================================================

# Default configurations
ENV="local"
NAMESPACE="tokenshield"
REGISTRY="ghcr.io/yourusername"
VERSION=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -e|--env) ENV="$2"; shift ;;
        -r|--registry) REGISTRY="$2"; shift ;;
        -h|--help) 
            echo "Usage: ./deploy.sh [OPTIONS]"
            echo "Options:"
            echo "  -e, --env       Target environment: 'local' (docker-compose) or 'k8s' (kubernetes/helm). Default is 'local'."
            echo "  -r, --registry  Container registry prefix for k8s deployment. Default is 'ghcr.io/yourusername'."
            echo "  -h, --help      Display this help message."
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

echo -e "\n🚀 Starting deployment for environment: \033[1;32m$ENV\033[0m"

# ==========================================
# LOCAL ENVIRONMENT DEPLOYMENT (Docker Compose)
# ==========================================
if [ "$ENV" == "local" ]; then
    echo -e "🐳 Tearing down existing local containers..."
    docker-compose -f infra/docker-compose.yml down
    
    echo -e "📦 Building frontend, backend, and marketing containers..."
    docker-compose -f infra/docker-compose.yml build
    
    echo -e "🟢 Booting up the TokenShield stack..."
    docker-compose -f infra/docker-compose.yml up -d

    echo -e "\n✅ Local Deployment Successful!"
    echo "Endpoints:"
    echo " - Marketing Site: http://localhost:3001"
    echo " - Admin Dashboard: http://localhost:3000"
    echo " - FastAPI Backend: http://localhost:8000"
    exit 0

# ==========================================
# KUBERNETES ENVIRONMENT DEPLOYMENT (Helm)
# ==========================================
elif [ "$ENV" == "k8s" ]; then
    echo -e "📦 Building container images (Version: $VERSION)..."
    docker build -t $REGISTRY/tokenshield-backend:$VERSION ./backend
    docker build -t $REGISTRY/tokenshield-frontend:$VERSION ./frontend
    docker build -t $REGISTRY/tokenshield-marketing:$VERSION ./marketing

    echo -e "☁️ Pushing images to registry ($REGISTRY)..."
    docker push $REGISTRY/tokenshield-backend:$VERSION
    docker push $REGISTRY/tokenshield-frontend:$VERSION
    docker push $REGISTRY/tokenshield-marketing:$VERSION

    echo -e "☸️ Upgrading Helm Release in namespace '$NAMESPACE'..."
    helm upgrade --install tokenshield ./helm/tokenshield \
        --namespace $NAMESPACE \
        --create-namespace \
        --set backend.image.repository=$REGISTRY/tokenshield-backend \
        --set backend.image.tag=$VERSION \
        --set frontend.image.repository=$REGISTRY/tokenshield-frontend \
        --set frontend.image.tag=$VERSION \
        --set marketing.image.repository=$REGISTRY/tokenshield-marketing \
        --set marketing.image.tag=$VERSION \
        --wait

    echo -e "\n✅ Kubernetes Deployment Successful!"
    kubectl get pods -n $NAMESPACE
    exit 0

else
    echo -e "❌ Invalid environment specified. Use 'local' or 'k8s'."
    exit 1
fi
