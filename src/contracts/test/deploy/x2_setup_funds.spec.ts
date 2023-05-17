import { TransactionOperation } from "@taquito/taquito"

import { MVK, TEZ, Utils } from "../helpers/Utils"

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
chai.should()

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice } from '../../scripts/sandbox/accounts'
import { 
    signerFactory, 
    getStorageMapValue,
    fa12Transfer,
    fa2Transfer,
    updateOperators,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts,
    calcStakedMvkRequiredForActionApproval, 
    calcTotalVotingPower 
} from './../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Deployment Start
// ------------------------------------------------------------------------------

describe('Setup and deploy funds for relevant contracts', async () => {
  
    var utils: Utils
    var tezos

    let tokenId = 0
    let transferOperation

    before('setup', async () => {
        try{

            const mvkTokenInstance          = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            const treasuryInstance          = await utils.tezos.contract.at(contractDeployments.treasury.address);
            const mavrykFa12TokenInstance   = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
            const mavrykFa2TokenInstance    = await utils.tezos.contract.at(contractDeployments.mavrykFa2Token.address);

            const councilAddress            = contractDeployments.council.address;

            await signerFactory(tezos, alice.sk);
            
            // make transfers if environment is not production
            if (utils.production !== "true"){

                const sender         = alice.pkh;
                const mvkTokenAmount = MVK(100);
                const tezAmount      = 100;
                const tokenAmount    = 10000000; 

                // transfer MVK to Treasury and Council contract
                const transferToTreasury = await mvkTokenInstance.methods.transfer(
                [
                    {
                        from_: sender,
                        txs: [
                            {
                                to_: contractDeployments.treasury.address,
                                token_id: 0,
                                amount: mvkTokenAmount,
                            },
                            {
                                to_: contractDeployments.council.address,
                                token_id: 0,
                                amount: mvkTokenAmount,
                            }
                        ],
                    },
                ]).send()
                await transferToTreasury.confirmation();

                // transfer xtz to Treasury
                const transferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryInstance.address, amount: tezAmount});
                await transferTezToTreasuryOperation.confirmation();

                // transfer 25 Mavryk FA12 Tokens to Council
                transferOperation = await fa12Transfer(mavrykFa12TokenInstance, sender, councilAddress, tokenAmount);
                await transferOperation.confirmation();

                // transfer 25 Mavryk FA2 Tokens to Council
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, sender, councilAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
            }

            // Update operators for treasury
            const updateOperatorsTreasury = await treasuryInstance.methods.updateMvkOperators(
            [
                {
                    add_operator: {
                        owner: contractDeployments.treasury.address,
                        operator: contractDeployments.doorman.address,
                        token_id: 0,
                    },
                }
            ]).send()
        
            await updateOperatorsTreasury.confirmation();

        } catch(e){
            console.dir(e, {depth: 5})
        }

    })

    it(`funds deployed `, async () => {
        try {
            console.log('-- -- -- -- -- -- -- -- -- -- -- -- --')
        } catch (e) {
            console.log(e)
        }
    })


})