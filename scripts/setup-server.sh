#!/bin/bash
# Server Configuration & Hardening Script (Ubuntu)

# 1. Update Packages
echo "Updating packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# 2. Install Nginx & Fail2Ban
echo "Installing Nginx, Fail2Ban, and AWS CLI..."
sudo apt-get install nginx fail2ban awscli -y

# 3. Configure Nginx Reverse Proxy
echo "Configuring Nginx..."
sudo cp ../nginx.conf /etc/nginx/sites-available/babypro
sudo ln -sf /etc/nginx/sites-available/babypro /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 4. SSH Hardening
echo "Hardening SSH..."
# Disable Root Login & Password Auth (Require SSH Key)
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 5. Configure Fail2Ban
echo "Configuring Fail2Ban..."
sudo bash -c 'cat > /etc/fail2ban/jail.local <<EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF'
sudo systemctl restart fail2ban

# 6. Configure UFW Firewall
echo "Configuring UFW Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw --force enable

# 7. Configure Log Rotation
echo "Configuring Logrotate..."
sudo bash -c 'cat > /etc/logrotate.d/babypro <<EOF
/var/log/babypro/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0660 node node
    sharedscripts
    postrotate
        systemctl reload nginx >/dev/null 2>&1 || true
    endscript
}
EOF'

# 8. Configure Cron Job for Database Backups
echo "Configuring Cron Job for database backups..."
CRON_JOB="0 2 * * * /bin/bash $(pwd)/backup.sh"
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "Server setup and hardening complete!"
