#!/bin/bash

# Security Check Script for Diary Project
# This script performs comprehensive security checks on both server and client

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

validate_project_structure
    run_security_audit() {
        local project=$1
        local project_dir="$PROJECT_ROOT/$2"
        
        print_status "Running security audit for $project..."
        
        if [ ! -d "$project_dir" ]; then
            print_error "Directory $project_dir does not exist"
            return 1
        fi
        
        cd "$project_dir" || return 1
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $project_dir"
        return 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for $project..."
        npm ci
    fi
    
    print_status "Running npm audit for $project..."
    if npm audit --audit-level=moderate; then
        print_success "No moderate or higher vulnerabilities found in $project"
    else
        print_warning "Vulnerabilities found in $project. Run 'npm audit fix' to attempt fixes."
    fi
    
    print_status "Running high-level security check for $project..."
    if npm run security:check; then
        print_success "High-level security check passed for $project"
    else
        print_warning "High-level security check failed for $project - vulnerabilities detected"
    fi
    
    cd - > /dev/null
}

check_security_issues() {
    print_status "Checking for common security issues..."
    
    cd "$PROJECT_ROOT" || return 1
    if git ls-files | grep -q "\.env$"; then
        print_error "Found .env files in git repository. These should be in .gitignore"
        return 1
    else
        print_success "No .env files found in git repository"
    fi
    
    print_status "Checking for potential hardcoded secrets..."
    local secrets_found=0
    
    if grep -r "password.*=.*['\"][^'\"]*['\"]" . --exclude-dir=node_modules --exclude-dir=.git --exclude=*.log > /dev/null 2>&1; then
        print_warning "Potential hardcoded passwords found"
        secrets_found=1
    fi
    
    if grep -r "secret.*=.*['\"][^'\"]*['\"]" . --exclude-dir=node_modules --exclude-dir=.git --exclude=*.log > /dev/null 2>&1; then
        print_warning "Potential hardcoded secrets found"
        secrets_found=1
    fi
    
    if grep -r "api_key.*=.*['\"][^'\"]*['\"]" . --exclude-dir=node_modules --exclude-dir=.git --exclude=*.log > /dev/null 2>&1; then
        print_warning "Potential hardcoded API keys found"
        secrets_found=1
    fi
    
    if [ $secrets_found -eq 0 ]; then
        print_success "No obvious hardcoded secrets found"
    fi
    
    print_status "Checking for outdated dependencies..."
    if command_exists npm-check-updates; then
        cd "$PROJECT_ROOT/server" || return 1
        if ncu --target minor | grep -q "upgrade"; then
            print_warning "Outdated dependencies found in server"
        else
            print_success "Server dependencies are up to date"
        fi
        cd "$PROJECT_ROOT" || return 1
        
        cd "$PROJECT_ROOT/client" || return 1
        if ncu --target minor | grep -q "upgrade"; then
            print_warning "Outdated dependencies found in client"
        else
            print_success "Client dependencies are up to date"
        fi
        cd "$PROJECT_ROOT" || return 1
    else
        print_warning "npm-check-updates not installed. Install with: npm install -g npm-check-updates"
    fi
}

generate_security_report() {
    local security_reports_dir="$(get_project_path "security_reports")"
    ensure_directory "$security_reports_dir"
    
    local report_file="$security_reports_dir/security-report-$(get_timestamp).txt"
    
    print_status "Generating security report: $report_file"
    
    {
        echo "Security Report - $(date)"
        echo "=================================="
        echo ""
        echo "Project: Diary"
        echo "Generated: $(date)"
        echo ""
        
        echo "Server Security Audit:"
        echo "----------------------"
        cd "$PROJECT_ROOT/server" || echo "Server directory not found"
        npm audit --audit-level=moderate --json 2>/dev/null || echo "Audit failed or vulnerabilities found"
        cd "$PROJECT_ROOT" || true
        
        echo ""
        echo "Client Security Audit:"
        echo "----------------------"
        cd "$PROJECT_ROOT/client" || echo "Client directory not found"
        npm audit --audit-level=moderate --json 2>/dev/null || echo "Audit failed or vulnerabilities found"
        cd "$PROJECT_ROOT" || true
        
        echo ""
        echo "Dependency Status:"
        echo "------------------"
        echo "Server dependencies: $(cd "$PROJECT_ROOT/server" && npm list --depth=0 | wc -l) packages"
        echo "Client dependencies: $(cd "$PROJECT_ROOT/client" && npm list --depth=0 | wc -l) packages"
        
    } > "$report_file"
    
    print_success "Security report generated: $report_file"
}

main() {
    show_script_header "Diary Project Security Check" "Comprehensive security checks on both server and client"
    
    check_prerequisites
    echo ""
    
    local server_audit_passed=true
    local client_audit_passed=true
    
    if ! run_security_audit "server" "server"; then
        server_audit_passed=false
    fi
    echo ""
    
    if ! run_security_audit "client" "client"; then
        client_audit_passed=false
    fi
    echo ""
    
    if ! check_security_issues; then
        print_warning "Some security issues were found"
    fi
    echo ""
    
    generate_security_report
    echo ""
    
    echo "📊 Security Check Summary"
    echo "========================="
    
    if [ "$server_audit_passed" = true ]; then
        print_success "Server security audit: PASSED"
    else
        print_error "Server security audit: FAILED"
    fi
    
    if [ "$client_audit_passed" = true ]; then
        print_success "Client security audit: PASSED"
    else
        print_error "Client security audit: FAILED"
    fi
    
    echo ""
    
    local exit_code=0
    if [ "$server_audit_passed" = true ] && [ "$client_audit_passed" = true ]; then
        print_success "All security checks passed!"
    else
        print_warning " Some security vulnerabilities detected. Please review and consider fixing issues."
        print_status "💡 Run 'npm audit fix' to attempt automatic fixes"
        print_status "💡 Run 'npm audit fix --force' for more aggressive fixes (may break things)"
        exit_code=1
    fi
    
    show_script_footer "Security Check" $exit_code
    exit $exit_code
}

main "$@"
