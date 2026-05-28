#!/bin/bash
# ==========================================================
# Zero-Trust Firewall Configuration Script
# Must be run as root (e.g. sudo ./secure_firewall.sh)
# ==========================================================

echo "Configuring UFW for Zero-Trust Deployment..."

# 1. Deny all incoming traffic by default
ufw default deny incoming

# 2. Allow all outgoing traffic (so containers can reach out)
ufw default allow outgoing

# 3. Allow SSH (Port 22) - Essential to keep access to your server!
# Optional: If you use Tailscale or a VPN, change this to only allow from your VPN IP range.
ufw allow 22/tcp

# 4. Enable UFW forcefully
ufw --force enable

echo "----------------------------------------------------"
echo "✅ Firewall locked down!"
echo "❌ Ports 80 and 443 are NOW BLOCKED."
echo "✅ SSH (22) is open."
echo "✅ All incoming web traffic will flow securely from Cloudflare -> Cloudflared Container -> Traefik -> Web App."
echo "----------------------------------------------------"
