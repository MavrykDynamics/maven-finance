include "root" {
  path = find_in_parent_folders()
}

locals {
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  do_region   = local.region_vars.locals.do_region
}

dependency "vpc" {
  config_path = "../do-vpc"
}

terraform {
  source = "../../modules//do-droplet"
}

inputs = {
  name                        = "timescaledb-maven-finance-indexer"
  region                      = local.do_region
  ssh_keys_names              = ["Tristan"]
  vpc_id                      = dependency.vpc.outputs.vpc_id
  image                       = "ubuntu-20-04-x64"
  size                        = "s-1vcpu-2gb-intel"
  tags                        = [
    "maven",
    "indexer",
    "timescaledb",
    "dipdup"
  ]
}