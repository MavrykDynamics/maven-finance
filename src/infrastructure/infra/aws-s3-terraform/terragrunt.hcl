include "root" {
  path = find_in_parent_folders()
}

terraform {
  source = "../../modules//aws-s3"
}

inputs = {
  name                  = "mavryk-dynamics-infra"
  versioning_enabled    = true
}