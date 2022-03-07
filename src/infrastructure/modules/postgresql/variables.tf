variable "name" {
    type        = string
    description = "Name of the PostgreSQL database cluster"
}

variable "region" {
    type        = string
    description = "Region where the cluster should be created"
}

variable "pg_version" {
    type        = string
    description = "PostgreSQL version to use"
    default     = "14"
}

variable "size" {
    type        = string
    description = "Node size to use"
    default     = "db-s-1vcpu-1gb"
}

variable "node_count" {
    type        = number
    description = "Number of nodes for the cluster"
    default     = 1
}

variable "vpc_id" {
    type        = string
    description = "The ID of the VPC where the database cluster will be located"
}

variable "pg_additional_database" {
    type        = list(string)
    description = "List of databases to add to the cluster"
    default     = []
}

variable "k8s_firewall_enabled" {
    type        = bool
    description = "Whether or not link the created cluster to an existing k8s cluster"
    default     = false
}

variable "k8s_id" {
    type        = string
    description = "The ID of the Kubernetes where the database cluster will be located"
    default     = ""
}

variable "tags" {
    type        = list(string)
    description = "List of tags to be added to the created cluster"
    default     = []
}