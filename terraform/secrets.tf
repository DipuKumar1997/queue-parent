# 1. Automatically generate a random strong database password
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# 2. Automatically generate an RSA 2048-bit Private/Public Key pair for JWT
resource "tls_private_key" "jwt_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}