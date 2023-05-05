# Mavryk Dipdup Indexer

# Requirements

- [Python 3.10.4](https://www.python.org/downloads/): required to install dipdup.
- [Poetry 1.1.13](https://python-poetry.org/): NPM/Yarn equivalent for Python
- [Docker](https://www.docker.com/get-started/): Container manager
- [Node/NPM](https://nodejs.org/): Package manager
- [Yarn](https://yarnpkg.com/): Package manager

# Install Python dependencies

1. When Python, poetry, npm and yarn are all installed, run `yarn poetry` to init your **virtualenv** (Poetry comes with a preconfigured Python **virtualenv**).
2. Run `yarn setup-env` to install all the Python dependencies like **dipdup**.
3. Every time you'll need to run `yarn poetry` to start working with dipdup (the dipdup cli will only be installed on this **virtualenv** and not with your others Python packages).

# Project structure explanation

```
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
├── dipdup.contract.yml
├── dipdup.local.yml
├── dipdup.prod.yml
├── dipdup.wipe.yml
├── docker-compose.yml
├── Dockerfile
├── package.json
├── poetry.lock
├── pyproject.toml
└── README.md
```

- _pyproject.toml/poetry.lock_: these two files were generated when Poetry was initialized for the first time.
- _package.json_: contains all the scripts you can run using npm/yarn during the indexer development.
- _Dockerfile_: contains the Docker image definition of the Indexer for its build (see section)
- _docker-compose.yml_: contains the definition of a local test environment for the indexer. Starts a test instance of **Hasura** and a test instance of **TimescaleDB**.
- _.gitignore_: ignored files for the git repo.
- _README.md_: yes, that's this file.
- _dipdup.\*.yml_: configuration file needed for dipdup to the project file structure and what to index. ([See documentation here](https://dipdup.net/docs/getting-started/creating-config.html)):
  - _dipdup.yml_: You should only edit this file when implementing updates for the indexer.
  - _dipdup.local.yml_: Configuration file used by the indexer when used locally
  - _dipdup.prod.yml_: Configuration file used by the indexer when deployed
  - _dipdup.wipe.yml_: Same as above but without the hasura configuration in it. Used in the Github CI when wiping one indexer's database before running a full sync.
- _mavryk_: folder containing all the indexer code. It was generated with the `dipdup init` command and it follows the _dipdup.yml_ configuration file. ([See documentation here](https://dipdup.net/docs/getting-started/project-structure.html))

# Run the indexer locally

1. `yarn shell`: starts the virtual environment
2. `yarn up`: run test instances of **Hasura** and **TimescaleDB**.
3. `yarn start`: start to index
4. Go to https://localhost:42000/ to log to **Hasura** admin console (password: **_hasura12345_**)

# Build, Push and Deploy an indexer (CI/CD)

1. Commit and push all your changes

```bash
git add .
git commit -m "[YOUR COMMIT MESSAGE]"
git push
```

2. Go to the indexer updater workflow on [github](https://github.com/mavrykfinance/mavryk-dapp/actions/workflows/main.yml)

3. Start a new workflow:

- Click on **Run workflow** and fill the form
- _Use workflow from_: select the branch where you just pushed your commit
- _Environment to update_: select **dev**
- _Dipdup image tag_: go check the [indexer Grafana dashboard](https://grafana.mavryk.io/d/J1QevDF4k/mavryk-indexer). Switch between all three environments and look at the **Docker image** panel. The tag should be like this **vX.Y.Z**. You should take the most updated one and increment it (e.g. if the current tag is v0.25.10, your tag could be v0.25.11. See [this page](../indexer/README.md#build-and-push-an-indexer-image-on-dockerhub) for more details on tags)
- _Service to link to api.mavryk.io_: go check the [indexer Grafana dashboard](https://grafana.mavryk.io/d/J1QevDF4k/mavryk-indexer). Scroll down and look at **Prod Ingress Redirection** panel. Since you're only updated **dev**, you should use the same in the form. If you want to update **prod** you should select **hasura-prod2**. If you want to update **prod2** you should select **hasura-prod**.
- _(optional) Wipe database_: since you're working with an entire new set of contracts, you should tick this box.

# Deploy the indexer on Kubernetes manually (advanced)

The documentation about the deployment is inside de **Infrastructure** subfolder [here](../infrastructure/helm-charts/mavryk-indexer/README.md).

# Debugging / Updating the indexer

- Understanding how dipdup works: https://dipdup.net/docs/
- All the Indexer DB Tables are defined in the [**sql_model**](./mavryk/sql_model/) subfolder and imported in the [**models.py**](./mavryk/models.py) files. If you want to index a new contract, I suggest you create another file in this subfolder to define its classes.
- Some contracts contain entrypoints that work technically the same (like creating a Governance Satellite or Financial action for example). To simplify the saving process in the indexer a [**persister.py**](./mavryk/utils/persisters.py) has been created in the [`./mavryk/utils/`](./mavryk/utils/) folder. This folder contains helper functions used in various handlers throughout the project.
- Use the `breakpoint()` python function as much as possible when implementing or updating a handler to debug your code easily: https://www.digitalocean.com/community/tutorials/python-breakpoint
