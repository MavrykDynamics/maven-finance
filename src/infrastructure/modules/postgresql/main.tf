resource "digitalocean_database_cluster" "this" {
    name                    = var.name
    engine                  = "pg"
    version                 = var.pg_version
    size                    = var.size
    region                  = var.region
    node_count              = var.node_count
    tags                    = var.tags
    private_network_uuid    = var.vpc_id
}

resource "digitalocean_database_db" "database-example" {
    count       = length(var.pg_additional_database)
    cluster_id  = digitalocean_database_cluster.this.id
    name        = var.pg_additional_database[count.index]
}

resource "digitalocean_database_firewall" "this" {
    count       = var.k8s_firewall_enabled ? 1 : 0
    cluster_id  = digitalocean_database_cluster.this.id

    rule {
        type  = "k8s"
        value = var.k8s_id
    }
}