variable "aws_access_key" {
    type        = string
    description = "Access key for the AWS tenant"
}

variable "aws_secret_key" {
    type        = string
    description = "Secret key for the AWS tenant"
}

variable "region" {
    type        = string
    description = "Name of the bucket"
    default     = "ap-southeast-1"
}

variable "name" {
    type        = string
    description = "Name of the bucket"
}

variable "acl" {
    type        = string
    description = "Canned ACL applied on bucket creation (private or public-read)"
    default     = "private"
}

variable "versioning_enabled" {
    type        = bool
    description = "Enable versioning"
}
