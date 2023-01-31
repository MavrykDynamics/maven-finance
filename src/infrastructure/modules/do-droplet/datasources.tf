data "digitalocean_ssh_keys" "this" {
    filter {
        key     = "name"
        values  = var.ssh_keys_names
    }
}