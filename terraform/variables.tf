variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for tagging"
  default     = "baby-shop"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

variable "db_username" {
  description = "Database admin username"
  type        = string
  sensitive   = true
  default     = "dbadmin"
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
  default     = "SecurePass123!" # In production, use AWS Secrets Manager or TF_VAR
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.micro"
}
