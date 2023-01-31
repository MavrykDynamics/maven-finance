# Generate a Digital Ocean provider block and terraform configuration
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = "1.1.7"
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "2.25.2"
    }
    aws = {
      source = "hashicorp/aws"
      version = "4.50.0"
    }
  }
}

provider "digitalocean" {
}
EOF
}

# Configure Terragrunt to automatically store tfstate files in an S3 bucket
remote_state {
  backend = "s3"
  config = {
    key                         = "${path_relative_to_include()}/terraform.tfstate"
    region                      = "ap-southeast-1" // needed
    bucket                      = "mavryk-dynamics-infra" // name of your space
    encrypt                     = true
    kms_key_id                  = "610eca57-ee83-43ec-b7eb-7a8e915df96b"
  }
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}
