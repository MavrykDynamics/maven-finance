resource "digitalocean_firewall" "this" {
  name        = var.name
  droplet_ids = var.droplet_ids
  tags        = var.tags
  
  dynamic "inbound_rule" {
    for_each = var.inbound_rules
    content {
      protocol                = inbound_rule.value.protocol
      port_range              = inbound_rule.value.port_range
      source_addresses        = inbound_rule.value.source_addresses
      source_kubernetes_ids   = inbound_rule.value.source_kubernetes_ids
    }
  }
  
  dynamic "outbound_rule" {
    for_each = var.outbound_rules
    content {
      protocol                    = outbound_rule.value.protocol
      port_range                  = outbound_rule.value.port_range
      destination_addresses       = outbound_rule.value.destination_addresses
      destination_kubernetes_ids  = outbound_rule.value.destination_kubernetes_ids
    }
  }
}
