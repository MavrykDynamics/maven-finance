output "region" {
    description = "The name of the region"
    value       = aws_s3_bucket.this.region
}

output "bucket_domain_name" {
    description = "The FQDN of the bucket"
    value       = aws_s3_bucket.this.bucket_domain_name
    sensitive   = true
}

output "arn" {
    description = "The ARN for the bucket"
    value       = aws_s3_bucket.this.arn
    sensitive   = true
}