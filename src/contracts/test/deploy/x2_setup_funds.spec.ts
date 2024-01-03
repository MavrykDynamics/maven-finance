import { TransactionOperation } from "@taquito/taquito"

import { MVN, TEZ, Utils } from "../helpers/Utils"

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

import { isaac, bob } from '../../scripts/sandbox/accounts'
import { 
    signerFactory, 
    fa12Transfer,
    fa2Transfer
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

            utils = new Utils()
            await utils.init(isaac.sk)
            tezos = utils.tezos;

            const councilAddress            = contractDeployments.council.address;
            const treasuryAddress           = contractDeployments.treasury.address;

            const mvnTokenInstance          = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
            const treasuryInstance          = await utils.tezos.contract.at(treasuryAddress);
            const mavenFa12TokenInstance   = await utils.tezos.contract.at(contractDeployments.mavenFa12Token.address);
            const mavenFa2TokenInstance    = await utils.tezos.contract.at(contractDeployments.mavenFa2Token.address);
            
            // make transfers if environment is not production
            if (utils.production !== "true"){

                var sender           = isaac.pkh;
                const mvnTokenAmount = MVN(1000);
                const tezAmount      = 100;
                const tokenAmount    = 30000000; 

                // ------------------------------------------------------------------
                // MVN Token Transfer
                // ------------------------------------------------------------------

                // transfer MVN tokens to Treasury and Council contract
                await signerFactory(tezos, isaac.sk);
                const transferMvnTokens = await mvnTokenInstance.methods.transfer(
                [
                    {
                        from_: sender,
                        txs: [
                            {
                                to_: treasuryAddress,
                                token_id: 0,
                                amount: mvnTokenAmount,
                            },
                            {
                                to_: councilAddress,
                                token_id: 0,
                                amount: mvnTokenAmount,
                            }
                        ],
                    },
                ]).send()
                await transferMvnTokens.confirmation();

                // ------------------------------------------------------------------
                // XTZ Transfer
                // ------------------------------------------------------------------

                // transfer xtz to Treasury
                await signerFactory(tezos, bob.sk)
                sender           = bob.pkh;
                const transferTezToTreasuryOperation = await utils.tezos.contract.transfer({ to: treasuryAddress, amount: tezAmount});
                await transferTezToTreasuryOperation.confirmation();

                // transfer xtz to Council
                const transferTezToCouncilOperation = await utils.tezos.contract.transfer({ to: councilAddress, amount: tezAmount});
                await transferTezToCouncilOperation.confirmation();

                // ------------------------------------------------------------------
                // Mock FA12 Token Transfer
                // ------------------------------------------------------------------

                // transfer 30 Maven FA12 Tokens to Council
                transferOperation = await fa12Transfer(mavenFa12TokenInstance, sender, councilAddress, tokenAmount);
                await transferOperation.confirmation();

                // transfer 30 Maven FA12 Tokens to Treasury
                transferOperation = await fa12Transfer(mavenFa12TokenInstance, sender, treasuryAddress, tokenAmount);
                await transferOperation.confirmation();

                // ------------------------------------------------------------------
                // Mock FA2 Token Transfer
                // ------------------------------------------------------------------

                // transfer 30 Maven FA2 Tokens to Council
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, sender, councilAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                // transfer 30 Maven FA2 Tokens to Treasury
                transferOperation = await fa2Transfer(mavenFa2TokenInstance, sender, treasuryAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
            }

            // Update operators for treasury
            await signerFactory(tezos, bob.sk)
            const updateOperatorsTreasury = await treasuryInstance.methods.updateTokenOperators(
                contractDeployments.mvnToken.address,
                [
                    {
                        add_operator: {
                            owner: treasuryAddress,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                        },
                    }
                ]
            ).send()
        
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