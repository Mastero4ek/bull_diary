#!/bin/bash

# Start Docker Script for Diary Project
# This script starts the full stack in containers for development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

validate_project_structure

check_docker_prerequisites() {
    if ! command_exists docker; then
        print_error "Docker is not installed! Install Docker and try again."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed! Install Docker Compose and try again."
        exit 1
    fi
    
    print_success "Docker prerequisites check passed"
}

# Function to clean Docker cache for Diary project
clean_docker_cache() {
    local force_clean="${1:-false}"
    
    if [ "$force_clean" = "true" ]; then
        print_status "Force cleaning Docker cache for Diary project..."
        
        # Stop and remove containers
        print_status "Stopping and removing existing containers..."
        docker-compose -f "$(get_project_path "docker-compose.yml")" down --volumes --remove-orphans 2>/dev/null || true
        
        # Remove images
        print_status "Removing Diary Docker images..."
        docker rmi diary-server diary-client 2>/dev/null || true
        
        # Remove volumes
        print_status "Removing Diary Docker volumes..."
        docker volume rm $(docker volume ls -q | grep diary) 2>/dev/null || true
        
        # Remove networks
        print_status "Removing Diary Docker networks..."
        docker network rm diary_diary-network 2>/dev/null || true
        
        print_success "Docker cache cleaned for Diary project"
    else
        # Check available disk space
        local available_space=$(df -h . | awk 'NR==2 {print $4}' | sed 's/[^0-9]//g')
        local available_space_mb=$(df -m . | awk 'NR==2 {print $4}')
        
        print_status "Available disk space: ${available_space}GB"
        
        # If less than 2GB available, suggest cleaning
        if [ "$available_space_mb" -lt 2048 ]; then
            print_warning "Low disk space detected (${available_space}GB available)"
            print_status "Consider running with --force-clean flag to clean Docker cache"
            print_status "Usage: $0 --force-clean"
        fi
    fi
}

start_docker_containers() {
    local docker_compose_file="$(get_project_path "docker-compose.yml")"
    
    if [ ! -f "$docker_compose_file" ]; then
        print_error "docker-compose.yml not found"
        exit 1
    fi
    
    print_status "Loading environment variables"
    if [ -f "$(get_project_path "server/.env")" ]; then
        export $(cat "$(get_project_path "server/.env")" | xargs)
        print_success "Environment variables loaded"
    else
        print_warning "server/.env file not found"
    fi
    
    print_status "Stopping existing containers"
    docker-compose -f "$docker_compose_file" down --volumes=false 2>/dev/null || true
    
    print_status "Building containers"
    print_status "Building images"
    if run_command "docker-compose -f \"$docker_compose_file\" build" "Building Docker images"; then
        print_success "Docker images built successfully"
    else
        print_error "Failed to build Docker images"
        exit 1
    fi
    
    print_status "Starting containers"
    if run_command "docker-compose -f \"$docker_compose_file\" up -d" "Starting Docker containers"; then
        print_success "Docker containers started successfully"
    else
        print_error "Failed to start Docker containers"
        exit 1
    fi
    
    sleep 10
    
    if docker ps | grep -q "diary-server-dev" && \
       docker ps | grep -q "diary-client-dev" && \
       docker ps | grep -q "diary-mongo-dev" && \
       docker ps | grep -q "diary-redis" && \
       docker ps | grep -q "diary-vault"; then
        print_success "All containers started successfully"
    else
        print_error "Error starting containers"
        docker-compose -f "$docker_compose_file" logs
        exit 1
    fi
}

check_service_connections() {
    print_status "Checking MongoDB connection"
    sleep 5
    
    if docker exec -it diary-mongo-dev mongosh -u root_dev -p root_dev --authenticationDatabase admin --eval "db.adminCommand('ping')" &> /dev/null; then
        print_success "MongoDB connection verified"
    else
        print_error "Error connecting to MongoDB"
        exit 1
    fi
    
    print_status "Checking Redis connection"
    sleep 5
    
    if docker exec -it diary-redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis connection verified"
    else
        print_error "Error connecting to Redis"
        exit 1
    fi
    
    print_status "Checking Vault connection"
    sleep 5
    
    if curl -f http://localhost:8200/v1/sys/health &> /dev/null; then
        print_success "Vault connection verified"
    else
        print_warning "Vault health check failed (maybe still starting)"
    fi
    
    print_status "Checking Server connection"
    sleep 5
    
    if curl -f http://localhost:5001/health &> /dev/null; then
        print_success "Server health check passed"
    else
        print_warning "Server health check failed (maybe still starting)"
    fi
}

show_service_info() {
    echo ""
    echo "🐳 All services started in containers for development 🐳"
    echo ""
    echo "🌐 Available addresses for development:"
    echo "   - Frontend: ${BLUE}http://localhost:5173${NC}"
    echo "   - Backend: ${BLUE}http://localhost:5001${NC}"
    echo "   - Health Check: ${BLUE}http://localhost:5001/health${NC}"
    echo "   - MongoDB: ${BLUE}localhost:27017${NC}"
    echo "   - Redis: ${BLUE}localhost:6380${NC}"
    echo "   - Vault: ${BLUE}http://localhost:8200${NC}"
    echo ""
    echo "📝 Useful commands for development:"
    echo "   - View logs of all services: ${GREEN}docker-compose -f docker-compose.yml logs -f${NC}"
    echo "   - View logs of a specific service: ${GREEN}docker-compose -f docker-compose.yml logs -f server${NC}"
    echo "   - View logs of a specific service: ${GREEN}docker-compose -f docker-compose.yml logs -f client${NC}"
    echo "   - Stop all containers: ${GREEN}docker-compose -f docker-compose.yml down${NC}"
    echo "   - Restart a specific service: ${GREEN}docker-compose -f docker-compose.yml restart server${NC}"
    echo "   - Start admin seeder: ${GREEN}docker exec -it diary-server-dev node scripts/admin-seeder.js${NC}"
    echo "   - Start users seeder: ${GREEN}docker exec -it diary-server-dev node scripts/users-seeder.js${NC}"
    echo "   - Clean database: ${GREEN}docker exec -it diary-server-dev node scripts/clean-database.js${NC}"
    echo "   - Clean uploads: ${GREEN}docker exec -it diary-server-dev node scripts/clean-uploads.js${NC}"
    echo ""
}

main() {
    local force_clean=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force-clean)
                force_clean=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --force-clean    Force clean Docker cache before starting"
                echo "  --help, -h       Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0               Start Docker environment normally"
                echo "  $0 --force-clean Start Docker environment with cache cleanup"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                print_status "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    show_script_header "Start Docker" "Start full stack in containers for development"
    
    # Check Docker prerequisites
    check_docker_prerequisites
    echo ""
    
    # Clean Docker cache if requested
    if [ "$force_clean" = "true" ]; then
        clean_docker_cache "true"
        echo ""
    else
        clean_docker_cache "false"
        echo ""
    fi
    
    # Start containers
    start_docker_containers
    echo ""
    
    # Check connections
    check_service_connections
    echo ""
    
    # Show information
    show_service_info
    
    show_script_footer "Start Docker" 0
}

main "$@"