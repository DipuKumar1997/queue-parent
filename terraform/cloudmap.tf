# Private internal DNS namespace for your VPC
resource "aws_service_discovery_private_dns_namespace" "queue_ns" {
  name        = "queue.internal"
  description = "Private Service Discovery for Microservices"
  vpc         = aws_vpc.main.id
}

# Service Discovery record for Auth Service
resource "aws_service_discovery_service" "auth_sd" {
  name = "auth-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.queue_ns.id
    dns_records {
      ttl  = 10
      type = "A"
    }
    routing_policy = "MULTIVALUE"
  }
}

# Service Discovery record for Chat Service
resource "aws_service_discovery_service" "chat_sd" {
  name = "chat-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.queue_ns.id
    dns_records {
      ttl  = 10
      type = "A"
    }
    routing_policy = "MULTIVALUE"
  }
}