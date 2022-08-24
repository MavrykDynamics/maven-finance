include "root" {
  path = find_in_parent_folders()
}

locals {
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  do_region   = local.region_vars.locals.do_region
}

dependency "vpc" {
  config_path = "../mavryk-vpc"
}

terraform {
  source = "../../modules//droplet"
}

inputs = {
  name                        = "mavryk-indexer-timescale-db-droplet"
  region                      = local.do_region
  import_ssh_keys             = true
  vpc_id                      = dependency.vpc.outputs.vpc_id
  image                       = "ubuntu-20-04-x64"
  size                        = "s-1vcpu-2gb-intel"
  tags                        = [
    "mavryk",
    "indexer",
    "timescaledb",
    "dipdup"
  ]
}