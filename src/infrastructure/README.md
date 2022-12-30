# Mavryk Infrastructure

## Architecture diagrams

### Cloud Architecture

![Cloud Architecture](./docs/cloud-architecture.png)

## Summary

[1. Connect to the Mavryk Kubernetes Cluster](./helm-charts/README.md)

[2. Configure a TimescaleDB on DigitalOcean with Ansible](./ansible/do-timescale-db/README.md)

[3. Deploy/Update the Mavryk Indexer](./helm-charts/mavryk-indexer/README.md)

## Requirements

_All of the listed tools versions are very important. Please follow them to avoid facing breaking changes._

### CLI, Softwares and Packages

- [Python 3.10.4](https://www.python.org/downloads/): required to install Ansible.
- [Ansible 2.13.1](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html): used to automatize software installation on virtual machines.
- [TFenv](https://github.com/tfutils/tfenv): used to control and properly install [Terraform](https://www.terraform.io/) versions. Terraform is used to deploy the infrastructure on DigitalOcean.
- [TGenv](https://github.com/cunymatthieu/tgenv): used to control and properly install [Terragrunt](https://terragrunt.gruntwork.io/). Terragrunt is used to template modules made with Terraform.
- [Kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl): command-line tool used to interact with a Kubernetes cluster.
- [Helm 3.8.1](https://helm.sh/docs/intro/quickstart/): used to template Kubernetes manifest and to configure and install third-party apps easily on Kubernetes.
- [kubctx/kubens](https://github.com/ahmetb/kubectx): used to easily switch between namespaces and contexts on k8s.

### Environment Variables

```sh
$SPACES_ACCESS_KEY_ID
Digital Ocean space ACCESS_ID. Used to store the Terraform created ressources (VM, DBs, etc.).

$SPACES_SECRET_ACCESS_KEY
Digital Ocean space ACCESS_KEY. Used to store the Terraform created ressources (VM, DBs, etc.).

$AWS_ACCESS_KEY_ID
Digital Ocean S3 ACCESS_KEY_ID. Used to store the Terraform TFState.

$AWS_SECRET_ACCESS_KEY
Digital Ocean S3 SECRET_ACCESS_KEY. Used to store the Terraform TFState.

$DIGITALOCEAN_ACCESS_TOKEN
Digital Ocean ACCESS_TOKEN. Used to access to Digital Ocean from the Terminal

$DO_API_TOKEN
Digital Ocean ACCESS_TOKEN. Used to access to Digital Ocean Droplets from Ansible

$POSTGRES_PASSWORD
Postgres Password for user dipdup. Used in the configuration of the TimescaleDB through Ansible
```

## Retriveve the required environment variables

- `$DIGITALOCEAN_ACCESS_TOKEN` / `$DO_API_TOKEN`

  _These two variables should have the same value_

  1. Login to DigitalOcean
  2. Go to the [API](https://cloud.digitalocean.com/account/api/tokens) section
  3. Generate a new **Personnal access token** and save it because you'll only be able to see it once. You have your variable!

- `$SPACES_ACCESS_KEY_ID` / `$SPACES_SECRET_ACCESS_KEY`

  _These two variables should have the same value_

  `$AWS_ACCESS_KEY_ID` / `$AWS_SECRET_ACCESS_KEY`

  _These two variables should have the same value_

  1. Login to DigitalOcean
  2. Go to the [API](https://cloud.digitalocean.com/account/api/tokens) section
  3. Generate new **Spaces access keys** and save them because you'll only be able to see them once. You have your variables!

- `$POSTGRES_PASSWORD`

  1. Go to the **mavryk-indexer** with `kubens mavryk-indexer`
  2. Retrieve the secret where the credential is stored with `kubectl get secret indexer -o yaml` (`-o yaml` print the result as a yaml format). **BE CAREFUL NOT TO SHARE THE RESULT OF THIS COMMAND BECAUSE IT CONTAINS ALL THE CREDENTIALS TO THE TIMESCALEDB**.
  3. The _$POSTGRES_PASSWORD_ is in _base64_ format (in fact, all data in the result are). To decode it use the command `echo [RETRIEVED_PASSWORD] | base64 -d`
