resource "digitalocean_kubernetes_cluster" "this" {
    name            = var.name
    region          = var.region
    version         = var.k8s_version
    vpc_uuid        = var.vpc_id
    auto_upgrade    = false
    ha              = var.high_availability_enabled
    tags            = var.tags

    node_pool {
        name        = var.default_node_pool_name
        size        = var.default_node_pool_size
        auto_scale  = var.default_node_pool_auto_scale
        min_nodes   = var.default_node_pool_min_nodes
        max_nodes   = var.default_node_pool_max_nodes
        node_count  = var.default_node_pool_min_nodes
        tags        = var.default_node_pool_tags
        labels      = var.default_node_pool_labels
    }
}