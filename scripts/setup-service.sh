#!/bin/bash

SERVICE_NAME="cms-git-sync"
SERVICE_FILE="$HOME/.config/systemd/user/$SERVICE_NAME.service"
SCRIPT_PATH="$(pwd)/scripts/git-watcher.js"
NODE_PATH=$(which node)

# Ensure config dir exists
mkdir -p "$HOME/.config/systemd/user"

echo "Creating service file at $SERVICE_FILE..."

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=CMS Feedback Git Watcher
After=network.target

[Service]
Type=simple
WorkingDirectory=$(pwd)
ExecStart=$NODE_PATH $SCRIPT_PATH
Restart=on-failure
RestartSec=10
Environment=PATH=$PATH

[Install]
WantedBy=default.target
EOF

echo "Reloading systemd daemon..."
systemctl --user daemon-reload

echo "Enabling and starting service..."
systemctl --user enable --now $SERVICE_NAME

echo "Status:"
systemctl --user status $SERVICE_NAME --no-pager
