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
        auto_scale  = true
        min_nodes   = var.default_node_pool_min_nodes
        max_nodes   = var.default_node_pool_max_nodes
        tags        = var.default_node_pool_tags
        labels      = var.default_node_pool_labels
    }
}

resource "digitalocean_kubernetes_node_pool" "this" {
    count           = length(var.additional_node_pools)
    cluster_id      = digitalocean_kubernetes_cluster.this.id

    name            = var.additional_node_pools[count.index].name
    size            = var.additional_node_pools[count.index].size
    node_count      = var.additional_node_pools[count.index].node_count
    tags            = var.additional_node_pools[count.index].tags

    labels          = var.additional_node_pools[count.index].labels
    
    taint {
        key    = var.additional_node_pools[count.index].taint.key
        value  = var.additional_node_pools[count.index].taint.value
        effect = var.additional_node_pools[count.index].taint.effect
    }
}