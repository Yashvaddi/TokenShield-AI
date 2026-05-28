#!/bin/bash
set -e

# ==============================================================================
# TokenShield EC2 Zero-Trust Bootstrap Script
# Run this on a fresh Ubuntu EC2 instance to set up everything automatically.
# Usage: ./bootstrap_ec2.sh
# ==============================================================================

echo -e "\n🚀 Starting TokenShield Production Zero-Trust Setup..."

# 1. Update system and install base dependencies
echo -e "\n📦 Updating system and installing dependencies (git, ufw)..."
sudo apt-get update -y
sudo apt-get install -y git curl ufw

# 2. Install Docker & Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo -e "\n🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    echo "Docker installed successfully."
else
    echo -e "\n✅ Docker is already installed."
fi

# 3. Clone Repository (if we aren't already in it)
if [ ! -f "infra/docker-compose.yml" ]; then
    echo -e "\n📥 Repository not detected in current directory."
    read -p "Enter the Git repository URL to clone (e.g., https://github.com/your-username/tokenshield.git): " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo "❌ No URL provided. Exiting."
        exit 1
    fi
    
    echo "Cloning repository..."
    git clone $REPO_URL tokenshield_prod
    cd tokenshield_prod
else
    echo -e "\n✅ Repository structure detected."
fi

# 4. Check Environment Variables
if [ ! -f ".env" ]; then
    echo -e "\n🔑 Missing .env file. Copying from .env.example..."
    cp .env.example .env
    
    echo -e "\n⚠️  WAIT! You need to configure your secrets before booting up."
    echo "Please edit the .env file with your Database Passwords and CLOUDFLARE_TUNNEL_TOKEN."
    echo "Run 'nano .env' to edit."
    echo "Once edited, simply run this script again!"
    exit 0
fi

# Ensure CLOUDFLARE_TUNNEL_TOKEN is set
if grep -q 'CLOUDFLARE_TUNNEL_TOKEN="your_tunnel_token_here"' .env; then
    echo -e "\n❌ ERROR: You have not set your CLOUDFLARE_TUNNEL_TOKEN in .env!"
    echo "Please edit the .env file, add your real token, and run this script again."
    exit 1
fi

# 5. Lock down the Firewall
echo -e "\n🛡️ Locking down firewall..."
sudo chmod +x infra/scripts/secure_firewall.sh
sudo ./infra/scripts/secure_firewall.sh

# 6. Bring up infrastructure
echo -e "\n🟢 Building and starting TokenShield containers securely..."
sudo docker compose -f infra/docker-compose.yml build
sudo docker compose -f infra/docker-compose.yml up -d

echo -e "\n🎉=======================================================🎉"
echo "✅ Deployment complete!"
echo "Your entire stack (Frontend, API, Marketing, Postgres, Redis) is now running."
echo "The Cloudflare Tunnel is connected and waiting for traffic."
echo "Your server firewall is locked down (only port 22 open)."
echo "==========================================================="
