git push origin main
# resource "aws_vpc" "main" {
#   cidr_block           = "10.0.0.0/16"
#   enable_dns_hostnames = true
#   tags = { Name = "queue-vpc" }
# }
#
# # Public Subnet for ALB and Gateway
# resource "aws_subnet" "public_1" {
#   vpc_id                  = aws_vpc.main.id
#   cidr_block              = "10.0.1.0/24"
#   availability_zone       = "${var.aws_region}a"
#   map_public_ip_on_launch = true
# }
#
# resource "aws_subnet" "public_2" {
#   vpc_id                  = aws_vpc.main.id
#   cidr_block              = "10.0.2.0/24"
#   availability_zone       = "${var.aws_region}b"
#   map_public_ip_on_launch = true
# }
#
# # Private Subnet for Databases
# resource "aws_subnet" "private_1" {
#   vpc_id            = aws_vpc.main.id
#   cidr_block        = "10.0.3.0/24"
#   availability_zone = "${var.aws_region}a"
# }
#
# resource "aws_subnet" "private_2" {
#   vpc_id            = aws_vpc.main.id
#   cidr_block        = "10.0.4.0/24"
#   availability_zone = "${var.aws_region}b"
# }
#
# resource "aws_internet_gateway" "igw" {
#   vpc_id = aws_vpc.main.id
# }
#
# resource "aws_route_table" "public" {
#   vpc_id = aws_vpc.main.id
#   route {
#     cidr_block = "0.0.0.0/0"
#     gateway_id = aws_internet_gateway.igw.id
#   }
# }
#
# resource "aws_route_table_association" "pub_1" {
#   subnet_id      = aws_subnet.public_1.id
#   route_table_id = aws_route_table.public.id
# }
#
# resource "aws_vpc_endpoint" "ssm" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.ap-south-1.ssm"
#   vpc_endpoint_type   = "Interface"
#   security_group_ids  = [aws_security_group.ecs_tasks_sg.id]
#   subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#   private_dns_enabled = true
# }
# # 1. ECR API Interface Endpoint
# resource "aws_vpc_endpoint" "ecr_api" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.ap-south-1.ecr.api"
#   vpc_endpoint_type   = "Interface"
#   security_group_ids  = [aws_security_group.ecs_tasks_sg.id]
#   subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#   private_dns_enabled = true
# }
#
# # 2. ECR DKR Interface Endpoint (Docker image pull)
# resource "aws_vpc_endpoint" "ecr_dkr" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.ap-south-1.ecr.dkr"
#   vpc_endpoint_type   = "Interface"
#   security_group_ids  = [aws_security_group.ecs_tasks_sg.id]
#   subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#   private_dns_enabled = true
# }
#
# # 3. S3 Gateway Endpoint (ECR image layer storage)
# resource "aws_vpc_endpoint" "s3" {
#   vpc_id            = aws_vpc.main.id
#   service_name      = "com.amazonaws.ap-south-1.s3"
#   vpc_endpoint_type = "Gateway"
#   route_table_ids   = [aws_route_table.public.id]
# }
# # CloudWatch Logs VPC Interface Endpoint
# resource "aws_vpc_endpoint" "logs" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.ap-south-1.logs"
#   vpc_endpoint_type   = "Interface"
#   security_group_ids  = [aws_security_group.ecs_tasks_sg.id]
#   subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
#   private_dns_enabled = true
# }
#




resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = { Name = "queue-vpc" }
}

# Public Subnet 1 (AZ-a)
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags                    = { Name = "queue-public-1" }
}

# Public Subnet 2 (AZ-b)
resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags                    = { Name = "queue-public-2" }
}

# Private Subnet 1 (AZ-a)
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"
  tags              = { Name = "queue-private-1" }
}

# Private Subnet 2 (AZ-b)
resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"
  tags              = { Name = "queue-private-2" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "queue-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  tags = { Name = "queue-public-rt" }
}

# Route Table Association for Public Subnet 1
resource "aws_route_table_association" "pub_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

# Route Table Association for Public Subnet 2 (Fixes network timeouts in AZ-b)
resource "aws_route_table_association" "pub_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# VPC Endpoints
resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-south-1.ssm"
  vpc_endpoint_type   = "Interface"
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-south-1.ecr.api"
  vpc_endpoint_type   = "Interface"
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-south-1.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.ap-south-1.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.public.id]
}

resource "aws_vpc_endpoint" "logs" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.ap-south-1.logs"
  vpc_endpoint_type   = "Interface"
  security_group_ids  = [aws_security_group.vpc_endpoints_sg.id]
  subnet_ids          = [aws_subnet.public_1.id, aws_subnet.public_2.id]
  private_dns_enabled = true
}