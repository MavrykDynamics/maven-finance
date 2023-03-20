output "region" {
    description = "The name of the region"
    value       = digitalocean_spaces_bucket.this.region
}

output "bucket_domain_name" {
    description = "The FQDN of the bucket"
    value       = digitalocean_spaces_bucket.this.bucket_domain_name
    sensitive   = true
}

output "urn" {
    description = "The uniform resource name for the bucket"
    value       = digitalocean_spaces_bucket.this.urn
    sensitive   = true
}