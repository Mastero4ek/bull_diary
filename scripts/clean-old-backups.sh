#!/bin/bash

# Clean Old Backups Script for Diary Project
# This script removes old backup files to free up disk space

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

validate_project_structure

clean_old_backups() {
    local backup_dir="$1"
    local max_age_days="${2:-7}"
    local pattern="${3:-backup-*}"
    
    print_status "Cleaning old backups in $backup_dir (older than $max_age_days days)..."
    
    if [ ! -d "$backup_dir" ]; then
        print_warning "Backup directory $backup_dir does not exist"
        return 0
    fi
    
    local files_before=$(find "$backup_dir" -maxdepth 1 -type d -name "$pattern" | wc -l)
    
    if find "$backup_dir" -maxdepth 1 -type d -name "$pattern" -mtime +$max_age_days -exec rm -rf {} \; 2>/dev/null; then
        local files_after=$(find "$backup_dir" -maxdepth 1 -type d -name "$pattern" | wc -l)
        local removed=$((files_before - files_after))
        
        if [ $removed -gt 0 ]; then
            print_success "Removed $removed old backup directories from $backup_dir"
        else
            print_status "No old backup directories found in $backup_dir"
        fi
    else
        print_warning "No backup directories to clean in $backup_dir"
    fi
}

clean_old_logs() {
    local logs_dir="$1"
    local max_age_days="${2:-30}"
    
    print_status "Cleaning old log files in $logs_dir (older than $max_age_days days)..."
    
    if [ ! -d "$logs_dir" ]; then
        print_warning "Logs directory $logs_dir does not exist"
        return 0
    fi
    
    local files_before=$(find "$logs_dir" -name "*.log" | wc -l)
    
    if find "$logs_dir" -name "*.log" -mtime +$max_age_days -delete 2>/dev/null; then
        local files_after=$(find "$logs_dir" -name "*.log" | wc -l)
        local removed=$((files_before - files_after))
        
        if [ $removed -gt 0 ]; then
            print_success "Removed $removed old log files from $logs_dir"
        else
            print_status "No old log files found in $logs_dir"
        fi
    else
        print_warning "No log files to clean in $logs_dir"
    fi
}

clean_old_security_reports() {
    local reports_dir="$(get_project_path "security_reports")"
    local max_age_days="${1:-30}"
    
    print_status "Cleaning old security reports (older than $max_age_days days)..."
    
    if [ ! -d "$reports_dir" ]; then
        print_warning "Security reports directory does not exist"
        return 0
    fi
    
    local files_before=$(find "$reports_dir" -name "security-report-*.txt" | wc -l)
    
    if find "$reports_dir" -name "security-report-*.txt" -mtime +$max_age_days -delete 2>/dev/null; then
        local files_after=$(find "$reports_dir" -name "security-report-*.txt" | wc -l)
        local removed=$((files_before - files_after))
        
        if [ $removed -gt 0 ]; then
            print_success "Removed $removed old security reports"
        else
            print_status "No old security reports found"
        fi
    else
        print_warning "No security reports to clean"
    fi
}

main() {
    local max_backup_age="${1:-7}"
    local max_log_age="${2:-30}"
    local max_report_age="${3:-30}"
    
    show_script_header "Clean Old Backups" "Remove old backup files, logs, and reports to free up disk space"
    
    check_prerequisites
    echo ""
    
    clean_old_backups "$(get_project_path "server/backups/mongodb")" "$max_backup_age"
    echo ""
    
    clean_old_backups "$(get_project_path "server/backups")" "$max_backup_age"
    echo ""
    
    clean_old_logs "$(get_project_path "server/logs")" "$max_log_age"
    echo ""
    
    clean_old_security_reports "$max_report_age"
    echo ""
    
    print_status "Current disk usage:"
    du -sh "$(get_project_path "server/backups")" 2>/dev/null || print_warning "Backups directory not found"
    du -sh "$(get_project_path "server/logs")" 2>/dev/null || print_warning "Logs directory not found"
    du -sh "$(get_project_path "security_reports")" 2>/dev/null || print_warning "Security reports directory not found"
    echo ""
    
    print_success "Clean old backups completed successfully!"
    show_script_footer "Clean Old Backups" 0
}

main "$@"
