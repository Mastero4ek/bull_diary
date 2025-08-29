#!/bin/bash

# Common functions for all scripts in the Diary project
# This file should be sourced by other scripts

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_status() {
    echo -e "ℹ️ ${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "✅ ${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "⚠️ ${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "❌ ${RED}[ERROR]${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

validate_project_structure() {
    local missing_dirs=()
    
    if [ ! -d "$PROJECT_ROOT/server" ]; then
        missing_dirs+=("server")
    fi
    
    if [ ! -d "$PROJECT_ROOT/client" ]; then
        missing_dirs+=("client")
    fi
    
    if [ ! -d "$PROJECT_ROOT/scripts" ]; then
        missing_dirs+=("scripts")
    fi
    
    if [ ${#missing_dirs[@]} -ne 0 ]; then
        print_error "Missing required directories: ${missing_dirs[*]}"
        print_error "Please run this script from the project root directory"
        print_error "Current directory: $(pwd)"
        print_error "Expected project root: $PROJECT_ROOT"
        exit 1
    fi
    
    print_success "Project structure validated"
}

get_project_path() {
    local relative_path="$1"
    echo "$PROJECT_ROOT/$relative_path"
}

ensure_project_root() {
    if [ ! -f "$PROJECT_ROOT/package.json" ] && [ ! -f "$PROJECT_ROOT/server/package.json" ]; then
        print_error "This script must be run from the project root directory"
        print_error "Current directory: $(pwd)"
        print_error "Expected project root: $PROJECT_ROOT"
        exit 1
    fi
}

ensure_directory() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    fi
}

check_prerequisites() {
    local missing_tools=()
    
    if ! command_exists npm; then
        missing_tools+=("npm")
    fi
    
    if ! command_exists node; then
        missing_tools+=("node")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and try again"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

run_command() {
    local command="$1"
    local description="$2"
    
    print_status "Running: $description"
    if eval "$command"; then
        print_success "Completed: $description"
        return 0
    else
        print_error "Failed: $description"
        return 1
    fi
}

file_exists() {
    local file="$1"
    [ -f "$file" ]
}

directory_exists() {
    local dir="$1"
    [ -d "$dir" ]
}

get_timestamp() {
    date +%Y%m%d-%H%M%S
}

create_backup() {
    local source="$1"
    local backup_dir="$2"
    local timestamp=$(get_timestamp)
    local backup_name="$(basename "$source")-$timestamp"
    
    ensure_directory "$backup_dir"
    
    if [ -f "$source" ]; then
        cp "$source" "$backup_dir/$backup_name"
        print_success "Backup created: $backup_dir/$backup_name"
    elif [ -d "$source" ]; then
        cp -r "$source" "$backup_dir/$backup_name"
        print_success "Backup created: $backup_dir/$backup_name"
    else
        print_warning "Source not found: $source"
        return 1
    fi
}

clean_old_backups() {
    local backup_dir="$1"
    local max_age_days="${2:-30}"
    
    if [ -d "$backup_dir" ]; then
        find "$backup_dir" -name "*-*" -type f -mtime +$max_age_days -delete
        print_status "Cleaned backups older than $max_age_days days"
    fi
}

validate_environment() {
    local required_vars=("$@")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        return 1
    fi
    
    print_success "Environment validation passed"
    return 0
}

show_script_header() {
    local script_name="$1"
    local description="$2"
    
    echo "🔧 $script_name"
    echo "=================================="
    echo ""
    echo "Description: $description"
    echo "Project Root: $PROJECT_ROOT"
    echo "Script Directory: $SCRIPT_DIR"
    echo "Timestamp: $(date)"
    echo ""
}

show_script_footer() {
    local script_name="$1"
    local exit_code="$2"
    
    echo ""
    echo "📊 $script_name Summary"
    echo "========================="
    
    if [ "$exit_code" -eq 0 ]; then
        print_success "Script completed successfully!"
    else
        print_error "Script completed with errors (exit code: $exit_code)"
    fi
}

export -f print_status
export -f print_success
export -f print_warning
export -f print_error
export -f command_exists
export -f validate_project_structure
export -f get_project_path
export -f ensure_project_root
export -f ensure_directory
export -f check_prerequisites
export -f run_command
export -f file_exists
export -f directory_exists
export -f get_timestamp
export -f create_backup
export -f clean_old_backups
export -f validate_environment
export -f show_script_header
export -f show_script_footer

# Export variables
export SCRIPT_DIR
export PROJECT_ROOT
export RED GREEN YELLOW BLUE NC
