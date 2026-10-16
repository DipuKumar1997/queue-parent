
# -----------------------------------------------------------------------------
# Security Group for RDS MySQL Database
# -----------------------------------------------------------------------------
resource "aws_security_group" "rds_sg" {
  name        = "queue-rds-sg"
  description = "Allow inbound MySQL traffic from within VPC"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "queue-rds-sg"
  }
}


####===========================================

resource "aws_security_group" "alb_sg" {
  name        = "queue-alb-sg"
  description = "Allow inbound HTTP traffic from the internet"
  vpc_id      = aws_vpc.main.id
  # Inbound: Allow anyone on the Internet to access Port 80
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # Outbound: Allow ALB to forward traffic anywhere inside the VPC
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = "queue-alb-sg" }
}

# -----------------------------------------------------------------------------
# Security Group for ECS Fargate Tasks & VPC Endpoints
# -----------------------------------------------------------------------------
resource "aws_security_group" "ecs_tasks_sg" {
  name        = "queue-ecs-tasks-sg"
  description = "Security group for ECS tasks and VPC endpoints"
  vpc_id      = aws_vpc.main.id

  # Inbound: ONLY allow traffic coming from alb_sg
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }
  # Allow all outbound egress (Required for ECR image pull over HTTPS port 443)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "queue-ecs-tasks-sg"
  }
}

# -----------------------------------------------------------------------------
# Security Group for VPC Interface Endpoints (Fixes SSM & ECR Timeout)
# -----------------------------------------------------------------------------
resource "aws_security_group" "vpc_endpoints_sg" {
  name        = "queue-vpc-endpoints-sg"
  description = "Allow ECS tasks to reach ECR, SSM, and CloudWatch endpoints over HTTPS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks_sg.id]
    cidr_blocks     = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "queue-vpc-endpoints-sg" }
}