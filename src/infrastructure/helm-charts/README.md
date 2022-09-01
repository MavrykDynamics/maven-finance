# Mavryk Kubernetes Cluster

## Requirements

- [Kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl): command-line tool used to interact with a Kubernetes cluster.
- [Helm 3.8.1](https://helm.sh/docs/intro/quickstart/): used to template Kubernetes manifest and to configure and install third-party apps easily on Kubernetes.
- [kubctx/kubens](https://github.com/ahmetb/kubectx): used to easily switch between namespaces and contexts on k8s.

## How to connect to the Mavryk Kubernetes Cluster

1. Install `kubectl`
2. Login to DigitalOcean and go to the [Kubernetes section](https://cloud.digitalocean.com/kubernetes/clusters)
3. Click on **mavryk-cluster**
4. Download the _kubeconfig_ file (configuration panel), place it in the `~/.kube` folder and rename it `config`
5. Run `kubectl get ns` to list all the namespaces on the cluster and test if you now have access to them. You can also run `kubens` for the same result if you installed `kubectx`

## Cheatsheet

### Kubens

- `kubens [NAMESPACE]` switch the current context to another namespace. **BE CAREFUL TO ALWAYS KNOW IN WHICH NAMESPACE YOU ARE BEFORE APPLYING A MANIFEST ON THE CLUSTER** (you don't want to install the indexer to the monitoring namespace for example).

### Interacting with resources

- Most used resources on Mavryk:
  - `pod` stateless instance of a docker image
  - `service` service for one or multiple pod (port exposition etc.)
  - `ingress` DNS and nginx configuration for a service
- `kubectl get [RESOURCE]`: list all the resources of the chosen type in the current namespace (you can add `-n NAMESPACE` to target a specific namespace or `-A` to target them all at once)
- `kubectl describe [RESOURCE] [NAME]`: describe a specific resource of the chosen type in the current namespace (you can add `-n NAMESPACE` to target a specific namespace or `-A` to target them all at once). Print the all the event encountered by the resource and can be useful to debug a resource that won't start properly.
- `kubectl logs [POD_NAME]`: print the logs of the targetted pod in the terminal (you can add `-f` to print them in real-time)

### Deploying / Removing resources

- `kubectl apply -f [MANIFEST]`: apply a configuration describe in a manifest file and create/update the resources accordingly. **BE CAREFUL TO ALWAYS KNOW IN WHICH NAMESPACE YOU ARE BEFORE APPLYING A MANIFEST ON THE CLUSTER** (you don't want to install the indexer to the monitoring namespace for example).
- `kubectl delete [RESOURCE] [NAME]`: destroy a resource of a chosen type. **ALWAYS KNOW WHAT YOU'RE DOING WHEN YOU DELETE A RESOURCE BECAUSE IT CAN HAVE HUGE IMPACTS ON THE CLUSTER OR ON OUR DEPLOYED PRODUCTS**. You can also do `kubectl delete -f [MANIFEST]` to delete all the resources described in the given manifest

## Namespaces

_Run `kubens` to list all the namespaces of the current cluster and `kubens [NAMESPACE]` to switch to one of them_

| Name                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| cert-manager          | TLS Certificate management                           |
| default               | Default Kuberntes namespace (should not be used)     |
| external-dns          | DNS management and automation                        |
| ingress-nginx         | Nginx server and routing for ingresses               |
| kube-node-lease       | Administration namespace **(SHOULD NOT BE CHANGED)** |
| kube-prometheus-stack | Monitogin namespace                                  |
| kube-public           | Administration namespace **(SHOULD NOT BE CHANGED)** |
| kube-system           | Administration namespace **(SHOULD NOT BE CHANGED)** |
| mavryk-api            | Mavryk Medium API for the frontend                   |
| mavryk-indexer        | Mavryk Indexer (DEV/PROD)                            |
| promscale             | Monitoring tool for TimescaleDB                      |
| sealed-secrets        | Secret management tool and encryption                |
