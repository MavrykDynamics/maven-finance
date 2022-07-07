include "root" {
  path = find_in_parent_folders()
}

dependency "mavryk-cluster" {
  config_path = "../mavryk-cluster"
}

dependency "indexer-timescaledb-droplet" {
  config_path = "../indexer-timescaledb-droplet"
}

terraform {
  source = "../../modules/firewall"
}

inputs = {
  name                        = "timescaledb-firewall"
  droplet_ids                 = [dependency.indexer-timescaledb-droplet.outputs.id]
  inbound_rules               = [
    {
      protocol              = "tcp"
      port_range            = "5432"
      source_addresses      = []
      source_kubernetes_ids = [dependency.mavryk-cluster.outputs.k8s_id]
    },
    {
      protocol              = "tcp"
      port_range            = "80"
      source_addresses      = []
      source_kubernetes_ids = [dependency.mavryk-cluster.outputs.k8s_id]
    },
    {
      protocol              = "tcp"
      port_range            = "443"
      source_addresses      = []
      source_kubernetes_ids = [dependency.mavryk-cluster.outputs.k8s_id]
    },
  ]
  tags                        = [
    "mavryk",
    "indexer",
    "timescaledb"
  ]
}