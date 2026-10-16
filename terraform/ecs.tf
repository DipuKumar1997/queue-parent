# # -----------------------------------------------------------------------------
# # ECS Cluster
# # -----------------------------------------------------------------------------
# resource "aws_ecs_cluster" "main" {
#   name = "queue-cluster"
# }
#
# # -----------------------------------------------------------------------------
# # CloudWatch Unified Log Group
# # -----------------------------------------------------------------------------
# resource "aws_cloudwatch_log_group" "ecs_logs" {
#   name              = "/ecs/queue-logs"
#   retention_in_days = 1
# }
#
# # -----------------------------------------------------------------------------
# # IAM Task Execution Role & Policies
# # -----------------------------------------------------------------------------
# resource "aws_iam_role" "ecs_execution_role" {
#   name = "ecs_execution_role"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Action    = "sts:AssumeRole"
#       Effect    = "Allow"
#       Principal = { Service = "ecs-tasks.amazonaws.com" }
#     }]
#   })
# }
#
# resource "aws_iam_role_policy_attachment" "ecs_execution_attach" {
#   role       = aws_iam_role.ecs_execution_role.name
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
# }
#
# resource "aws_iam_policy" "ecs_ssm_policy" {
#   name        = "ecs_execution_ssm_policy"
#   description = "Allow ECS Execution Role to fetch secrets from SSM Parameter Store"
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Action = [
#           "ssm:GetParameters",
#           "ssm:GetParameter"
#         ]
#         Resource = [
#           aws_ssm_parameter.db_password.arn,
#           aws_ssm_parameter.jwt_private_key.arn,
#           aws_ssm_parameter.jwt_public_key.arn
#         ]
#       },
#       {
#         Effect = "Allow"
#         Action = [
#           "kms:Decrypt"
#         ]
#         Resource = "*"
#       }
#     ]
#   })
# }
#
# resource "aws_iam_role_policy_attachment" "ecs_ssm_attach" {
#   role       = aws_iam_role.ecs_execution_role.name
#   policy_arn = aws_iam_policy.ecs_ssm_policy.arn
# }
#
# # -----------------------------------------------------------------------------
# # Cloud Map Service Discovery for API Gateway
# # -----------------------------------------------------------------------------
# resource "aws_service_discovery_service" "gateway_sd" {
#   name         = "api-gateway"
#   namespace_id = aws_service_discovery_private_dns_namespace.queue_ns.id
#
#   dns_config {
#     namespace_id = aws_service_discovery_private_dns_namespace.queue_ns.id
#
#     dns_records {
#       ttl  = 10
#       type = "A"
#     }
#
#     routing_policy = "MULTIVALUE"
#   }
# }
#
# # -----------------------------------------------------------------------------
# # ECS Task Definitions
# # -----------------------------------------------------------------------------
#
# # 1. Auth Service Task Definition
# resource "aws_ecs_task_definition" "auth_service" {
#   family                   = "auth-service-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"
#   execution_role_arn       = aws_iam_role.ecs_execution_role.arn
#
#   container_definitions = jsonencode([{
#     name      = "auth-service"
#     image     = "${aws_ecr_repository.auth_service.repository_url}:latest"
#     essential = true
#     portMappings = [{ containerPort = 8081, hostPort = 8081 }]
#     secrets = [
#       { name = "DB_PASSWORD",     valueFrom = aws_ssm_parameter.db_password.arn },
#       { name = "JWT_PRIVATE_KEY", valueFrom = aws_ssm_parameter.jwt_private_key.arn }
#     ]
#     environment = [
#       { name = "DB_HOST",     value = aws_db_instance.mysql.address },
#       { name = "DB_PORT",     value = "3306" },
#       { name = "DB_NAME",     value = "queaqe" },
#       { name = "DB_USERNAME", value = "root" }
#     ]
#     logConfiguration = {
#       logDriver = "awslogs"
#       options = {
#         "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
#         "awslogs-region"        = "ap-south-1"
#         "awslogs-stream-prefix" = "auth-service"
#       }
#     }
#   }])
# }
#
# # 2. Chat Service Task Definition
# resource "aws_ecs_task_definition" "chat_service" {
#   family                   = "chat-service-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"
#   execution_role_arn       = aws_iam_role.ecs_execution_role.arn
#
#   container_definitions = jsonencode([{
#     name      = "chat-service"
#     image     = "${aws_ecr_repository.chat_service.repository_url}:latest"
#     essential = true
#     portMappings = [{ containerPort = 8082, hostPort = 8082 }]
#     secrets = [
#       { name = "JWT_PUBLIC_KEY", valueFrom = aws_ssm_parameter.jwt_public_key.arn }
#     ]
#     environment = [
#       { name = "SPRING_DATA_MONGODB_URI", value = "***REMOVED***" },
#       { name = "KAFKA_SERVERS",            value = "localhost:9092" }
#     ]
#     logConfiguration = {
#       logDriver = "awslogs"
#       options = {
#         "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
#         "awslogs-region"        = "ap-south-1"
#         "awslogs-stream-prefix" = "chat-service"
#       }
#     }
#   }])
# }
#
# # 3. Spring Cloud API Gateway Task Definition
# resource "aws_ecs_task_definition" "api_gateway" {
#   family                   = "api-gateway-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"
#   execution_role_arn       = aws_iam_role.ecs_execution_role.arn
#
#   container_definitions = jsonencode([{
#     name      = "api-gateway"
#     image     = "${aws_ecr_repository.api_gateway.repository_url}:latest"
#     essential = true
#     portMappings = [{ containerPort = 8084, hostPort = 8084 }]
#     environment = [
#       { name = "AUTH_SERVICE_URL", value = "http://auth-service.queue.internal:8081" },
#       { name = "CHAT_SERVICE_URL", value = "http://chat-service.queue.internal:8082" }
#     ]
#     logConfiguration = {
#       logDriver = "awslogs"
#       options = {
#         "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
#         "awslogs-region"        = "ap-south-1"
#         "awslogs-stream-prefix" = "api-gateway"
#       }
#     }
#   }])
# }
#
# # 4. Frontend Task Definition (Nginx handles proxying to http://api-gateway.queue.internal:8084)
# resource "aws_ecs_task_definition" "frontend" {
#   family                   = "frontend-task"
#   network_mode             = "awsvpc"
#   requires_compatibilities = ["FARGATE"]
#   cpu                      = "256"
#   memory                   = "512"
#   execution_role_arn       = aws_iam_role.ecs_execution_role.arn
#
#   container_definitions = jsonencode([{
#     name      = "frontend"
#     image     = "${aws_ecr_repository.frontend.repository_url}:latest"
#     essential = true
#     portMappings = [{ containerPort = 80, hostPort = 80 }]
#     environment = [
#       { name = "NODE_ENV", value = "production" }
#     ]
#     logConfiguration = {
#       logDriver = "awslogs"
#       options = {
#         "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
#         "awslogs-region"        = "ap-south-1"
#         "awslogs-stream-prefix" = "frontend"
#       }
#     }
#   }])
# }
#
# # -----------------------------------------------------------------------------
# # ECS Services
# # -----------------------------------------------------------------------------
#
# # 1. Auth Service
# resource "aws_ecs_service" "auth_service" {
#   name            = "auth-service"
#   cluster         = aws_ecs_cluster.main.id
#   task_definition = aws_ecs_task_definition.auth_service.arn
#   desired_count   = 1
#   launch_type     = "FARGATE"
#
#   network_configuration {
#     subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#     security_groups  = [aws_security_group.ecs_tasks_sg.id]
#     assign_public_ip = true
#   }
#
#   service_registries {
#     registry_arn = aws_service_discovery_service.auth_sd.arn
#   }
#   load_balancer {
#     target_group_arn = aws_lb_target_group.auth_service.arn
#     container_name   = "auth-service"
#     container_port   = 8081
#   }
# }
#
# # 2. Chat Service
# resource "aws_ecs_service" "chat_service" {
#   name            = "chat-service"
#   cluster         = aws_ecs_cluster.main.id
#   task_definition = aws_ecs_task_definition.chat_service.arn
#   desired_count   = 1
#   launch_type     = "FARGATE"
#
#   network_configuration {
#     subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#     security_groups  = [aws_security_group.ecs_tasks_sg.id]
#     assign_public_ip = true
#   }
#
#   service_registries {
#     registry_arn = aws_service_discovery_service.chat_sd.arn
#   }
#   load_balancer {
#     target_group_arn = aws_lb_target_group.chat_service.arn
#     container_name   = "chat-service"
#     container_port   = 8082
#   }
# }
#
# # 3. API Gateway Service
# resource "aws_ecs_service" "api_gateway" {
#   name            = "api-gateway"
#   cluster         = aws_ecs_cluster.main.id
#   task_definition = aws_ecs_task_definition.api_gateway.arn
#   desired_count   = 1
#   launch_type     = "FARGATE"
#
#   network_configuration {
#     subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#     security_groups  = [aws_security_group.ecs_tasks_sg.id]
#     assign_public_ip = true
#   }
#
#   service_registries {
#     registry_arn = aws_service_discovery_service.gateway_sd.arn
#   }
# }
#
# # 4. Frontend Service
# resource "aws_ecs_service" "frontend" {
#   name            = "frontend"
#   cluster         = aws_ecs_cluster.main.id
#   task_definition = aws_ecs_task_definition.frontend.arn
#   desired_count   = 1
#   launch_type     = "FARGATE"
#
#   network_configuration {
#     subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#     security_groups  = [aws_security_group.ecs_tasks_sg.id]
#     assign_public_ip = true
#   }
#   load_balancer {
#     target_group_arn = aws_lb_target_group.frontend.arn
#     container_name   = "frontend"
#     container_port   = 80
#   }
# }




# -----------------------------------------------------------------------------
# ECS Cluster
# -----------------------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "queue-cluster"
}

# -----------------------------------------------------------------------------
# CloudWatch Unified Log Group
# -----------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/queue-logs"
  retention_in_days = 1
}

# -----------------------------------------------------------------------------
# IAM Task Execution Role & Policies
# -----------------------------------------------------------------------------
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_policy" "ecs_ssm_policy" {
  name        = "ecs_execution_ssm_policy"
  description = "Allow ECS Execution Role to fetch secrets from SSM Parameter Store"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = [
          aws_ssm_parameter.db_password.arn,
          aws_ssm_parameter.jwt_private_key.arn,
          aws_ssm_parameter.jwt_public_key.arn
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_ssm_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.ecs_ssm_policy.arn
}

# -----------------------------------------------------------------------------
# ECS Task Definitions
# -----------------------------------------------------------------------------

# 1. Auth Service Task Definition
resource "aws_ecs_task_definition" "auth_service" {
  family                   = "auth-service-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = "auth-service"
    image     = "${aws_ecr_repository.auth_service.repository_url}:latest"
    essential = true
    portMappings = [{ containerPort = 8081, hostPort = 8081 }]
    secrets = [
      { name = "DB_PASSWORD",     valueFrom = aws_ssm_parameter.db_password.arn },
      { name = "JWT_PRIVATE_KEY", valueFrom = aws_ssm_parameter.jwt_private_key.arn }
    ]
    environment = [
      { name = "DB_HOST",     value = aws_db_instance.mysql.address },
      { name = "DB_PORT",     value = "3306" },
      { name = "DB_NAME",     value = "queaqe" },
      { name = "DB_USERNAME", value = "root" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
        "awslogs-region"        = "ap-south-1"
        "awslogs-stream-prefix" = "auth-service"
      }
    }
  }])
}

# 2. Chat Service Task Definition
resource "aws_ecs_task_definition" "chat_service" {
  family                   = "chat-service-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = "chat-service"
    image     = "${aws_ecr_repository.chat_service.repository_url}:latest"
    essential = true
    portMappings = [{ containerPort = 8082, hostPort = 8082 }]
    secrets = [
      { name = "JWT_PUBLIC_KEY", valueFrom = aws_ssm_parameter.jwt_public_key.arn }
    ]
    environment = [
      { name = "SPRING_DATA_MONGODB_URI", value = "***REMOVED***" },
      { name = "KAFKA_SERVERS",            value = "localhost:9092" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
        "awslogs-region"        = "ap-south-1"
        "awslogs-stream-prefix" = "chat-service"
      }
    }
  }])
}

# 3. Frontend Task Definition
resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = "frontend"
    image     = "${aws_ecr_repository.frontend.repository_url}:latest"
    essential = true
    portMappings = [{ containerPort = 80, hostPort = 80 }]
    environment = [
      { name = "NODE_ENV", value = "production" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
        "awslogs-region"        = "ap-south-1"
        "awslogs-stream-prefix" = "frontend"
      }
    }
  }])
}

# -----------------------------------------------------------------------------
# ECS Services (Attached to ALB Target Groups)
# -----------------------------------------------------------------------------

# 1. Auth Service
resource "aws_ecs_service" "auth_service" {
  name            = "auth-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.auth_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.auth_service.arn
    container_name   = "auth-service"
    container_port   = 8081
  }
}

# 2. Chat Service
resource "aws_ecs_service" "chat_service" {
  name            = "chat-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.chat_service.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.chat_service.arn
    container_name   = "chat-service"
    container_port   = 8082
  }
}

# 3. Frontend Service
resource "aws_ecs_service" "frontend" {
  name            = "frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }
}