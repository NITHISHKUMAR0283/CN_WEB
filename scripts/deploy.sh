#!/bin/bash

# Event Registration System - Deployment Script
# This script helps deploy the application using Docker

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

print_header() {
    echo "=================================="
    print_color $BLUE "$1"
    echo "=================================="
}

print_success() {
    print_color $GREEN "✅ $1"
}

print_warning() {
    print_color $YELLOW "⚠️  $1"
}

print_error() {
    print_color $RED "❌ $1"
}

# Check if Docker is installed and running
check_docker() {
    print_header "Checking Docker Installation"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Build and start the application
deploy() {
    print_header "Deploying Event Registration System"

    # Stop existing containers
    print_color $YELLOW "Stopping existing containers..."
    docker-compose down --remove-orphans

    # Build and start containers
    print_color $YELLOW "Building and starting containers..."
    docker-compose up --build -d

    # Wait for services to be healthy
    print_color $YELLOW "Waiting for services to start..."
    sleep 10

    # Check service health
    check_services
}

# Check if services are running
check_services() {
    print_header "Checking Service Health"

    # Check MongoDB
    if docker-compose ps mongodb | grep -q "Up"; then
        print_success "MongoDB is running"
    else
        print_error "MongoDB failed to start"
        docker-compose logs mongodb
        exit 1
    fi

    # Check Backend
    if docker-compose ps backend | grep -q "Up"; then
        print_success "Backend API is running"
    else
        print_error "Backend API failed to start"
        docker-compose logs backend
        exit 1
    fi

    # Check Frontend
    if docker-compose ps frontend | grep -q "Up"; then
        print_success "Frontend is running"
    else
        print_error "Frontend failed to start"
        docker-compose logs frontend
        exit 1
    fi

    # Test API endpoint
    print_color $YELLOW "Testing API health endpoint..."
    sleep 5

    if curl -f http://localhost:5000/api/health &> /dev/null; then
        print_success "API health check passed"
    else
        print_warning "API health check failed - service might still be starting"
    fi
}

# Show application URLs
show_urls() {
    print_header "Application URLs"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:5000/api"
    echo "API Health: http://localhost:5000/api/health"
    echo "MongoDB: mongodb://localhost:27017"
    echo ""
    print_success "Deployment completed successfully!"
    print_color $YELLOW "Note: It may take a few minutes for all services to be fully ready."
}

# View logs
view_logs() {
    print_header "Viewing Application Logs"
    docker-compose logs -f
}

# Stop the application
stop() {
    print_header "Stopping Event Registration System"
    docker-compose down
    print_success "Application stopped"
}

# Clean up everything (including volumes)
cleanup() {
    print_header "Cleaning Up Event Registration System"
    print_warning "This will remove all containers, networks, and data volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_color $YELLOW "Cleanup cancelled"
    fi
}

# Show help
show_help() {
    echo "Event Registration System - Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Build and start the application (default)"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      View application logs"
    echo "  status    Check service status"
    echo "  cleanup   Remove all containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy   # Deploy the application"
    echo "  $0 logs     # View logs"
    echo "  $0 stop     # Stop the application"
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        check_docker
        deploy
        show_urls
        ;;
    "stop")
        stop
        ;;
    "restart")
        check_docker
        stop
        deploy
        show_urls
        ;;
    "logs")
        view_logs
        ;;
    "status")
        check_services
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac