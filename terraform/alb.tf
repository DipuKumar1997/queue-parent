# 1. Main Application Load Balancer
resource "aws_lb" "main" {
  name               = "queue-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  tags               = { Name = "queue-alb" }
}

# 2. Target Group for Frontend (Port 80)
resource "aws_lb_target_group" "frontend" {
  name        = "queue-tg-frontend"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

# 3. Target Group for Auth Service (Port 8081)
resource "aws_lb_target_group" "auth_service" {
  name        = "queue-tg-auth"
  port        = 8081
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/actuator/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

# 4. Target Group for Chat Service (Port 8082)
resource "aws_lb_target_group" "chat_service" {
  name        = "queue-tg-chat"
  port        = 8082
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/actuator/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }
}

# 5. Main HTTP Listener on Port 80 (Default -> Frontend)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# 6. Route Rule: /api/v1/auth/* -> Auth Service Target Group
resource "aws_lb_listener_rule" "auth_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth_service.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/auth/*"]
    }
  }
}

# 7. Route Rule: /api/v1/users/* and /ws/* -> Chat Service Target Group
resource "aws_lb_listener_rule" "chat_route" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.chat_service.arn
  }

  condition {
    path_pattern {
      values = ["/api/v1/users*", "/ws*"]
    }
  }
}