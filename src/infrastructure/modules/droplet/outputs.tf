output "ipv4_address" {
    description = "Droplet's IPV4 address"
    value       = digitalocean_droplet.this.ipv4_address
    sensitive   = true
}

output "id" {
    description = "Droplet's id"
    value       = digitalocean_droplet.this.id
    sensitive   = true
}
