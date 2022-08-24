variable "name" {
    type        = string
    description = "Name of the droplet"
}

variable "region" {
    type        = string
    description = "Region where the droplet should be created"
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
