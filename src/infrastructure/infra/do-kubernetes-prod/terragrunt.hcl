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
  source = "../../modules//do-kubernetes"
}

inputs = {
  name                        = "prod"
  region                      = local.do_region
  vpc_id                      = dependency.vpc.outputs.vpc_id
  high_availability_enabled   = false
  tags                        = [
    "mavryk",
    "prod",
    "k8s",
  ]
  default_node_pool_name      = "default"
  default_node_pool_size      = "s-4vcpu-8gb"
  default_node_pool_min_nodes = 3
  default_node_pool_max_nodes = 3
  default_node_pool_tags      = [
    "mavryk",
    "k8s",
    "default"
  ]
}