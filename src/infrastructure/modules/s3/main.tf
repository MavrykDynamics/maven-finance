resource "aws_kms_key" "this" {
  description               = "AWS KMS key used to encrypt AWS resources."
  key_usage                 = "ENCRYPT_DECRYPT"
  customer_master_key_spec  = "SYMMETRIC_DEFAULT"
}

resource "aws_s3_bucket" "this" {
  bucket                    = var.name
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.this.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled        = true
  }
}

resource "aws_s3_bucket_acl" "this" {
  bucket                    = aws_s3_bucket.this.id
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                    = aws_s3_bucket.this.id
  block_public_acls         = true
  block_public_policy       = true
  ignore_public_acls        = true
  restrict_public_buckets   = true
}
