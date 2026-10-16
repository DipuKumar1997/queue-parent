version: '3.8'

services:
  mysql-db:
    image: mysql:8.0
    container_name: mysql-db
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "3306:3306"

  auth-service:
    build: ./auth-service
    container_name: auth-service
    ports:
      - "8081:8081"
    environment:
      - DB_HOST=mysql-db
      - DB_PORT=3306
      - DB_NAME=${DB_NAME}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_PRIVATE_KEY=${JWT_PRIVATE_KEY}
    depends_on:
      - mysql-db

  api-gateway:
    build: ./api-gateway
    container_name: api-gateway
    ports:
      - "8084:8084"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:8081
      - CHAT_SERVICE_URL=http://chat-service:8082