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

dependency "k8s" {
  config_path = "../mavryk-cluster"
}

terraform {
  source = "../../modules/postgresql"
}

inputs = {
  name                    = "indexer-database"
  region                  = local.do_region
  vpc_id                  = dependency.vpc.outputs.vpc_id
  k8s_firewall_enabled    = true
  k8s_id                  = dependency.k8s.outputs.k8s_id
  pg_additional_database  = [
    "dipdup",
    "dipdup-dev"
  ]
  tags                    = [
    "mavryk",
    "indexer",
    "postgresql",
    "dipdup"
  ]
}