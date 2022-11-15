variable "name" {
    type        = string
    description = "Name of the Kubernetes cluster"
}

variable "region" {
    type        = string
    description = "Region where the cluster should be created"
}

variable "k8s_version" {
    type        = string
    description = "Kubernetes version to use"
    default     = "1.24.4-do.0"
}

variable "vpc_id" {
    type        = string
    description = "The ID of the VPC where the database cluster will be located"
}

variable "high_availability_enabled" {
    type        = bool
    description = "Enable/disable the high availability control plane for a cluster"
    default     = false
}

variable "tags" {
    type        = list(string)
    description = "List of tags to be added to the created cluster"
    default     = []
}

variable "default_node_pool_name" {
    type        = string
    description = "Default node pool name"
}

variable "default_node_pool_size" {
    type        = string
    description = "The slug identifier for the type of Droplet to be used as workers in the node pool"
}

variable "default_node_pool_min_nodes" {
    type        = number
    description = "This represents the minimum number of nodes that the node pool can be scaled down to"
}

variable "default_node_pool_max_nodes" {
    type        = number
    description = "This represents the maximum number of nodes that the node pool can be scaled up to"
}

variable "default_node_pool_tags" {
    type        = list(string)
    description = "List of tags to be added to the default node pool"
    default     = []
}

variable "default_node_pool_labels" {
    type        = map(string)
    description = "Map of labels to be added to the default node pool"
    default     = {}
}

variable "additional_node_pools" {
    type        = list(object({
        name        = string,
        size        = string,
        node_count  = number,
        tags        = list(string),
        labels      = map(string),
        taint       = map(string)
    }))
    description = "List of additional node pools to add to the cluster"
    default     = []
}
