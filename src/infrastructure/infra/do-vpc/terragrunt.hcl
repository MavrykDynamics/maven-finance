include "root" {
  path = find_in_parent_folders()
}

locals {
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  do_region   = local.region_vars.locals.do_region
}

terraform {
  source = "../../modules//vpc"
}

inputs = {
  name                  = "mavryk-dynamics-vpc-sgp1"
  region                = local.do_region
  ip_range              = "10.10.12.0/24"
}