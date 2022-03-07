variable "name" {
    type        = string
    description = "Name of the VPC created"
}

variable "region" {
    type        = string
    description = "Region where the vpc should be created"
}

variable "ip_range" {
    type        = string
    description = "The range of IP addresses for the VPC in CIDR notation"
}