# Deploy the contracts on Ghostnet and update the dev indexer

## Deploy all contracts on the Ghostnet

- Checkout to the branch you want to deploy the contract from

```bash
git checkout [REVISION]
```

- go to the contract folder

```bash
cd src/contracts
```

- Compile all contracts (it may slow your computer a lot)

```bash
yarn compile
```

- Deploy all contracts. In case of a failure during deployment

```bash
yarn test-net-deploy
```

## Index the new contracts

- Backup the deployment folder

```bash
cp -R ./deployments ./deployments-bckp
```

- Checkout to the branch where the most updated indexer is

```bash
git checkout [REVISION]
```

- Replace the deployments folder with your backup

```bash
rm -rf ./deployments
mv ./deployments-bckp ./deployments
```

- Go to the indexer folder

```bash
cd ../indexer
```

- Run Poetry

```bash
poetry shell
```

- Perform a poetry update and/or install of all dependencies

```bash
poetry install
poetry update
```

- Run the dipdup config update script

```bash
python import-contracts.py
```

- Commit and push all your changes

```bash
git add .
git commit -m "[YOUR COMMIT MESSAGE]"
git push
```

- Go to the indexer updater workflow on [github](https://github.com/mavrykfinance/mavryk-dapp/actions/workflows/main.yml)

- Start a new workflow:
  - Click on **Run workflow** and fill the form
  - _Use workflow from_: select the branch where you just pushed your commit
  - _Environment to update_: select **dev**
  - _Dipdup image tag_: go check the [indexer Grafana dashboard](https://grafana.mavryk.io/d/J1QevDF4k/mavryk-indexer). Switch between all three environments and look at the **Docker image** panel. The tag should be like this **vX.Y.Z**. You should take the most updated one and increment it (e.g. if the current tag is v0.25.10, your tag could be v0.25.11. See [this page](../indexer/README.md#build-and-push-an-indexer-image-on-dockerhub) for more details on tags)
  - _Service to link to api.mavryk.io_: go check the [indexer Grafana dashboard](https://grafana.mavryk.io/d/J1QevDF4k/mavryk-indexer). Scroll down and look at **Prod Ingress Redirection** panel. Since you're only updated **dev**, you should use the same in the form. If you want to update **prod** you should select **hasura-prod2**. If you want to update **prod2** you should select **hasura-prod**.
  - _(optional) Wipe database_: since you're working with an entire new set of contracts, you should tick this box.
