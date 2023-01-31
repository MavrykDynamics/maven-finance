output "vpc_id" {
    description = "The unique identifier for the VPC"
    value       = digitalocean_vpc.this.id
    sensitive   = true
}