#!/bin/bash
set -e

# Automatically retrieve your active AWS Account ID and Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="ap-south-1"

# 1. Log in Docker CLI to AWS ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# 2. Build and Push auth-service
echo "=== Building & Pushing auth-service ==="
docker build -t queue-auth-service ./auth-service
docker tag queue-auth-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-auth-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-auth-service:latest

# 3. Build and Push chat-service
echo "=== Building & Pushing chat-service ==="
docker build -t queue-chat-service ./chat-service
docker tag queue-chat-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-chat-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-chat-service:latest

# 4. Build and Push api-gateway
echo "=== Building & Pushing api-gateway ==="
docker build -t queue-api-gateway ./api-gatewy
docker tag queue-api-gateway:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-api-gateway:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-api-gateway:latest

# 5. Build and Push queaqe-frontend
echo "=== Building & Pushing queaqe-frontend ==="
docker build -t queue-frontend ./queaqe-frontend
docker tag queue-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/queue-frontend:latest

echo "All 4 Docker images successfully built and pushed to ECR!"