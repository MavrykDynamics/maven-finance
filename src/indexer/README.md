# Mavryk Dipdup Indexer

# Requirements

- [Python 3.10.4](https://www.python.org/downloads/): required to install Ansible.
- [Poetry 1.1.13](https://python-poetry.org/): NPM/Yarn equivalent for Python
- [Docker](https://www.docker.com/get-started/): Container manager

# Install Python dependencies

1. When Python and poetry are both installed, run `poetry shell` to init your **virtualenv** (Poetry comes with a preconfigured Python **virtualenv**).
2. Run `poetry install` to install all the Python dependencies like **dipdup**.
3. Every time you'll need to run `poetry shell` to start working with dipdup (the dipdup cli will only be installed on this **virtualenv** and not with your others Python packages).

# Project structure explanation

```s
.
├── mavryk
│   ├── graphql
│   ├── handlers
│   ├── hooks
│   ├── sql
│   ├── sql_model
│   ├── types
│   └── utils
├── .gitignore
├── dipdup.yml
├── docker-compose.yml
├── Dockerfile
├── env.sh
├── poetry.lock
├── pyproject.toml
└── README.md
```

- _pyproject.toml/poetry.lock_: these two files were generated when Poetry was initialized for the first time.
- _env.sh_: contains all the environment variables needed for dipdup to work. This file needs to be sourced with the `source ./env.sh` command before starting the indexer.
- _Dockerfile_: contains the Docker image definition of the Indexer for its build (see section)
- _docker-compose.yml_: contains the definition of a local test environment for the indexer. Starts a test instance of **Hasura** and a test instance of **TimescaleDB**.
- _.gitignore_: ignored files for the git repo.
- _README.md_: yes, that's this file.
- _dipdup.yml_: configuration file needed for dipdup to the project file structure and what to index. ([See documentation here](https://dipdup.net/docs/getting-started/creating-config.html))
- _mavryk_: folder containing all the indexer code. It was generated with the `dipdup init` command and it follows the _dipdup.yml_ configuration file. ([See documentation here](https://dipdup.net/docs/getting-started/project-structure.html))

# Run the indexer locally

1. `poetry shell`: starts the virtual environment
2. `source ./env.sh`: source the environment variables needed for **dipdup**
3. `docker-compose up -d`: run test instances of **Hasura** and **TimescaleDB**.
4. `dipdup run`: start to index
5. Go to https://localhost:42000/ to log to **Hasura** admin console (password: **_hasura12345_**)

# Build and Push an indexer image on Dockerhub

1. Get the latest **_mavryk-indexer_** image tag on dockerhub: https://hub.docker.com/repository/docker/tezosdynamics/mavryk-indexer
2. Setup a new tag based on the previous one and respecting the `vX.Y.Z` nomenclature:
   - _X_: Major version (in our case **0** for now)
     - Major indexer upgrade (example: first ever mainnet version etc.)
     - Contains breaking changes
   - _Y_: Minor version
     - Can contains breaking changes
     - Minor indexer upgrade (example: a new contract is indexed, an index is refactored)
   - _Z_: Bugfix
     - A bug is fixed
3. _(Do once)_ Login on Dockerhub with the TezosDynamics account with `docker login`
4. Build the image with `docker build . -t tezosdynamics/mavryk-indexer:TAG`. Don't forget to replace `TAG` by your tag.
5. Push the image on Dockerhub with `docker push tezosdynamics/mavryk-indexer:TAG`. Don't forget to replace `TAG` by your tag.

# Deploy the indexer on Kubernetes

The documentation about the deployment is inside de **Infrastructure** subfolder [here](../infrastructure/helm-charts/mavryk-indexer/README.md).

# Indexer debug and update useful info

- All the Indexer DB Tables are defined in the **sql_model** subfolder and imported in the **models.py** files. If you want to index a new contract, I suggest you create another file in this subfolder to define its classes.
- Some contracts contain entrypoints that work technically the same (like creating a Governance Satellite or Financial action for example). To simplify the saving process in the indexer a **persister.py** has been created in the `./mavryk/utils/` folder. This folder contains helper functions used in various handlers throughout the project.
- Use the `breakpoint()` python function as much as possible when implementing or updating a handler to debug your code easily: https://www.digitalocean.com/community/tutorials/python-breakpoint
