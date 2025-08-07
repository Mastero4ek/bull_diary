#!/bin/bash
find /backups -maxdepth 1 -type d -name 'backup-*' -mtime +7 -exec rm -rf {} \;
