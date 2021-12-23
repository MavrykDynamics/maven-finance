# Notes for contracts

### Commands:

**To compile:** `npm run compile`  
This compiles all of the contracts in contracts/main and generates the .tez michelson files inside the ```contracts/compiled``` directory

**Deploy to Hangzhou:** `npm run migrate`

**Things to do after deployment to Granada:**

1. Make sure you're connected to the Alice account on Temple wallet. Get the account info from `./scripts/sandbox/accounts.js`
2. Make sure that you have the MVK tokens in your wallet. If you don't see the tokens in your browser wallet, you need to add them as an asset using the contract address for the MVK token. You can get it from the terminal output of deploying to the hangzhounet. You will find the contract address under _2_deploy_mvk_token.js_ terminal output.
3. Afterwards, you should have 50k MVK tokens in your wallet and be able to stake/unstake and so on.
4. Make sure that the `REACT_APP_NETWORK` and `REACT_APP_RPC_PROVIDER` are set to `hangzhounet` and `https://hangzhounet.smartpy.io/` respectively
5. Go into the directory `../frontend` and run the command `npm run import-contracts` which will update the contract addresses in the `src/deployments` directory
