variable "aws_region" {
  default = "ap-south-1"
}
#used for the monogodb prod url fetch live
data "aws_caller_identity" "current" {}