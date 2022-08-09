variable "name" {
    type        = string
    description = "Name of the droplet"
}

variable "region" {
    type        = string
    description = "Region where the droplet should be created"
}

variable "image" {
    type        = string
    description = "Droplet image ID or slug"
}

variable "size" {
    type        = string
    description = "Droplet size to use"
}

variable "import_ssh_keys" {
    type        = bool
    default     = false
    description = "Whether or not import the ssh keys into the created droplet"
}

variable "vpc_id" {
    type        = string
    description = "The ID of the VPC where the droplet will be located"
}

variable "tags" {
    type        = list(string)
    description = "List of tags to be added to the created cluster"
    default     = []
}