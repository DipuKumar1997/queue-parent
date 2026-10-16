resource "aws_ecr_repository" "auth_service" {
  name                 = "queue-auth-service"
  image_tag_mutability = "MUTABLE"
  force_delete = true
}
resource "aws_ecr_repository" "chat_service" {
  name                 = "queue-chat-service"
  image_tag_mutability = "MUTABLE"
  force_delete = true
}
resource "aws_ecr_repository" "api_gateway" {
  name                 = "queue-api-gateway"
  image_tag_mutability = "MUTABLE"
  force_delete = true
}
resource "aws_ecr_repository" "frontend" {
  name                 = "queue-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete = true
}