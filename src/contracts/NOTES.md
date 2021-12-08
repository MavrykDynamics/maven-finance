# Notes for contracts

### Commands:

**To compile:** `tuffle compile`

**Deploy to Granana:** `truffle migrate --network granada`

**Things to do after deployment to Granada:**

1. Make sure you are connected to the Alice account on Temple wallet. Get the account info from `./scripts/sandbox/accounts.js`
2. Make sure that you have the MVK tokens in your wallet. If you don't see them in your wallet, then you need to add them as an asset using the contract address for the MVK token. You can get it from the terminal output of deploying to Granada. You will find the contract address under _2_deploy_mvk_token.js_ terminal output.
3. Afterwards, you should have 50k MVK tokens in your wallet and be able to stake/unstake and so on.
4. Go into the directory `../frontend` and run the command `npm run import-contracts` which will update the contract addresses in the `src/deployments` directory
