output "k8s_id" {
    description = "The unique identifier for the Kubernetes cluset"
    value       = digitalocean_kubernetes_cluster.this.id
    sensitive   = true
}

output "kube_config" {
    description = "A representation of the Kubernetes cluster's kubeconfig"
    value       = digitalocean_kubernetes_cluster.this.kube_config.0.raw_config
    sensitive   = true
}