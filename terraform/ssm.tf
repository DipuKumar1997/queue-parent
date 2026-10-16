resource "aws_ssm_parameter" "db_password" {
  name        = "/queue/production/db_password"
  type        = "SecureString"
  value       = random_password.db_password.result
}

# Write the auto-generated RSA Private Key to SSM
resource "aws_ssm_parameter" "jwt_private_key" {
  name        = "/queue/production/jwt_private_key"
  type        = "SecureString"
  value       = tls_private_key.jwt_key.private_key_pem_pkcs8
}

# Write the auto-generated RSA Public Key to SSM
resource "aws_ssm_parameter" "jwt_public_key" {
  name        = "/queue/production/jwt_public_key"
  type        = "SecureString"
  value       = tls_private_key.jwt_key.public_key_pem
}