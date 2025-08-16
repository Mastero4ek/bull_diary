#!/bin/bash
find ./server/backups/mongodb -maxdepth 1 -type d -name 'backup-*' -mtime +7 -exec rm -rf {} \;
