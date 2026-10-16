resource "aws_db_subnet_group" "rds_subnet_grp" {
  name       = "queue-rds-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}
resource "aws_db_instance" "mysql" {
  allocated_storage      = 20
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t4g.micro"
  db_name                = "queaqe"
  username               = "root"
  password               = random_password.db_password.result # Auto-generated
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_grp.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
}

