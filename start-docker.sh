#!/bin/bash

# Server, Client, MongoDB, Redis

set -e

echo ""
echo "🐳 Starting full stack in containers for development 🐳"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo "ℹ️ ${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo "✅ ${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo "⚠️ ${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo "❌ ${RED}[ERROR]${NC} $1"
}

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed! Install Docker and try again."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed! Install Docker Compose and try again."
    exit 1
fi

print_status "Loading environment variables"
export $(cat server/.env | xargs)

print_status "Stopping existing containers"
docker-compose -f docker-compose.yml down --volumes=false 2>/dev/null || true

print_status "Building containers"

print_status "Building images"
docker-compose -f docker-compose.yml build

print_status "Loading environment variables"
export $(cat server/.env | xargs)

print_status "Starting containers"
docker-compose -f docker-compose.yml up -d

sleep 10

if docker ps | grep -q "diary-server-dev" && \
   docker ps | grep -q "diary-client-dev" && \
   docker ps | grep -q "diary-mongo-dev" && \
   docker ps | grep -q "diary-redis" && \
   docker ps | grep -q "diary-vault"; then
    print_success "All containers started successfully"
else
    print_error "Error starting containers"
    docker-compose -f docker-compose.yml logs
    exit 1
fi

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

print_success "Full stack started"

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