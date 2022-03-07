output "host" {
    description = "Database cluster's hostname"
    value       = digitalocean_database_cluster.this.host
    sensitive   = true
}

output "private_host" {
    description = "Database cluster's hostname for ressources in the same region"
    value       = digitalocean_database_cluster.this.private_host
    sensitive   = true
}

output "uri" {
    description = "The full URI for connecting to the database cluster"
    value       = digitalocean_database_cluster.this.uri
    sensitive   = true
}

output "private_uri" {
    description = "The full URI for connecting to the database cluster  for ressources in the same region"
    value       = digitalocean_database_cluster.this.private_uri
    sensitive   = true
}

output "port" {
    description = "Network port that the database cluster is listening on"
    value       = digitalocean_database_cluster.this.port
    sensitive   = true
}

output "user" {
    description = "Username for the cluster's default user"
    value       = digitalocean_database_cluster.this.user
    sensitive   = true
}

output "password" {
    description = "Password for the cluster's default user"
    value       = digitalocean_database_cluster.this.password
    sensitive   = true
}