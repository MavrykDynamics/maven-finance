include "root" {
  path = find_in_parent_folders()
}

dependency "prod" {
  config_path = "../do-kubernetes-prod"
}

dependency "timescaledb-maven-finance-indexer" {
  config_path = "../do-droplet-timescaledb-maven-finance-indexer"
}

dependency "timescaledb-maven-finance-indexer-2" {
  config_path = "../do-droplet-timescaledb-maven-finance-indexer-2"
}

terraform {
  source = "../../modules//do-firewall"
}

inputs = {
  name                        = "timescaledb"
  droplet_ids                 = [
    dependency.timescaledb-maven-finance-indexer.outputs.id,
    dependency.timescaledb-maven-finance-indexer-2.outputs.id,
  ]
  inbound_rules               = [
    {
      protocol              = "tcp"
      port_range            = "22"
      source_addresses      = ["0.0.0.0/0", "::/0"]
      source_kubernetes_ids = []
    },
    {
      protocol              = "tcp"
      port_range            = "5432"
      source_addresses      = []
      source_kubernetes_ids = [dependency.prod.outputs.k8s_id]
    },
    {
      protocol              = "tcp"
      port_range            = "80"
      source_addresses      = []
      source_kubernetes_ids = [dependency.prod.outputs.k8s_id]
    },
    {
      protocol              = "tcp"
      port_range            = "443"
      source_addresses      = []
      source_kubernetes_ids = [dependency.prod.outputs.k8s_id]
    },
  ]
  outbound_rules              = [
    {
      protocol                    = "tcp"
      port_range                  = "1-65535"
      destination_addresses       = ["0.0.0.0/0", "::/0"]
      destination_kubernetes_ids  = []
    },
    {
      protocol                    = "udp"
      port_range                  = "1-65535"
      destination_addresses       = ["0.0.0.0/0", "::/0"]
      destination_kubernetes_ids  = []
    }
  ]
  tags                        = [
    "maven",
    "indexer",
    "timescaledb"
  ]
}