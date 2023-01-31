include "root" {
  path = find_in_parent_folders()
}

locals {
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  do_region   = local.region_vars.locals.do_region
}

terraform {
  source = "../../modules//aws-s3"
}

inputs = {
  name                  = "mavryk-loki"
  versioning_enabled    = false
}