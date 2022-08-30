# Ansible

## Introduction

This playbook is used to install and configure a TimescaleDB on a virtual machine running Ubuntu.
It's working with the [DigitalOcean inventory plugin](https://galaxy.ansible.com/community/digitalocean) that retrieve a list of virtual machines (droplets) from DigitalOcean based on the configuration described [here](./digitalocean.yml).

## Requirements

### CLI, Softwares and Packages

- [Ansible 2.13.1](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

### Environment Variables

```sh
$DO_API_TOKEN
Digital Ocean ACCESS_TOKEN. Used to access to Digital Ocean Droplets from Ansible
```

## Cheatsheet

- Ansible doc: https://docs.ansible.com/
- `ansible-inventory -i ./digitalocean.yml --graph`: list all virtual machines reachable by Ansible for the given inventory file
- `ansible-playbook playbook.yml -i ./digitalocean.yml --check --diff -u root`: dry-run the playbook on the virtual machines of the provided inventory as root. You can add `--tags [TAG]` to target a particular role (see the role list [here](./playbook.yml)).
- `ansible-playbook playbook.yml -i ./digitalocean.yml -u root`: to execute the playbook on the virtual machines of the provided inventory as root. You can add `--tags [TAG]` to target a particular role (see the role list [here](./playbook.yml)).
