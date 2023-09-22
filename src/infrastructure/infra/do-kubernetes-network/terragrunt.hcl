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
  name                        = "network"
  region                      = local.do_region
  vpc_id                      = dependency.vpc.outputs.vpc_id
  k8s_version                 = "1.27.4-do.0"
  high_availability_enabled   = false
  tags                        = [
    "mavryk",
    "testnet",
    "network",
    "k8s"
  ]
  default_node_pool_name      = "default"
  default_node_pool_size      = "s-4vcpu-8gb"
  default_node_pool_min_nodes = 1
  default_node_pool_max_nodes = 1
  default_node_pool_tags      = [
    "mavryk",
    "k8s",
    "default"
  ]
  additional_node_pools       = [
    /* {
      name        = "node-0",
      size        = "s-4vcpu-8gb",
      node_count  = 1,
      tags        = [
        "mavryk",
        "k8s",
        "basenet",
        "mavryk-node"
      ],
      labels      = {
        "type"  = "mavryk-node"
      },
      taint       = {
        key     = "mavryk-node",
        value   = "0",
        effect  = "NoSchedule"
      }
    },
    {
      name        = "node-1",
      size        = "s-4vcpu-8gb",
      node_count  = 1,
      tags        = [
        "mavryk",
        "k8s",
        "basenet",
        "mavryk-node"
      ],
      labels      = {
        "type"  = "mavryk-node"
      },
      taint       = {
        key     = "mavryk-node",
        value   = "1",
        effect  = "NoSchedule"
      }
    },
    {
      name        = "node-2",
      size        = "s-4vcpu-8gb",
      node_count  = 1,
      tags        = [
        "mavryk",
        "k8s",
        "basenet",
        "mavryk-node"
      ],
      labels      = {
        "type"  = "mavryk-node"
      },
      taint       = {
        key     = "mavryk-node",
        value   = "2",
        effect  = "NoSchedule"
      }
    } */
  ]
}