resource "digitalocean_droplet" "this" {
  image     = var.image
  name      = var.name
  region    = var.region
  size      = var.size
  vpc_uuid  = var.vpc_id
  tags      = var.tags
  ssh_keys  = var.import_ssh_keys ? data.digitalocean_ssh_keys.this.ssh_keys[*].id : []
}
