variable "name" {
    type        = string
    description = "Name of the firewall"
}

variable "droplet_ids" {
    type        = list(string)
    description = "List of droplet connected to the created firewall"
}

variable "inbound_rules" {
    type        = list(object({
        protocol                = string
        port_range              = string
        source_addresses        = list(string)
        source_kubernetes_ids   = list(string)
    }))
    description = "List of inbound rules to be added to the created firewall"
    default     = []
}

variable "outbound_rules" {
    type        = list(object({
        protocol                    = string
        port_range                  = string
        destination_addresses       = list(string)
        destination_kubernetes_ids  = list(string)
    }))
    description = "List of tags to be added to the created firewall"
    default     = []
}

variable "tags" {
    type        = list(string)
    description = "List of tags to be added to the created cluster"
    default     = []
}