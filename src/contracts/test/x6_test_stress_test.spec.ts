import { Estimate, OpKind } from "@taquito/taquito";

import randomUserAccounts from "./helpers/random_accounts.json";
import { MVK, Utils } from "./helpers/Utils";

const chai              = require("chai");
const chaiAsPromised    = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve, mallory, trudy, oscar } from "../scripts/sandbox/accounts";
import accounts from "../scripts/sandbox/accounts";
import { createLambdaBytes } from "@mavrykdynamics/create-lambda-bytes"
import { ledger } from "../storage/mvkTokenStorage";

import { 
    signerFactory
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Stress tests", async () => {
    
    var utils: Utils
    let tezos

    let admin
    let adminSk

    let doormanInstance;
    let delegationInstance;
    let mvkTokenInstance;
    let governanceInstance;
    let governanceSatelliteInstance;
    let governanceFinancialInstance;
    let aggregatorInstance;
    let councilInstance;
    let aggregatorFactoryInstance;
    let governanceProxyInstance;
    let farmFactoryInstance;
    let farmInstance;
    let lpTokenInstance;
    
    let doormanStorage;
    let delegationStorage;
    let mvkTokenStorage;
    let governanceStorage;
    let governanceSatelliteStorage;
    let governanceFinancialStorage;
    let aggregatorStorage;
    let councilStorage;
    let aggregatorFactoryStorage;
    let governanceProxyStorage;
    let farmFactoryStorage;
    let farmStorage;
    let lpTokenStorage;

    before("setup", async () => {
        try{

            utils = new Utils();
            await utils.init(bob.sk);
            tezos = utils.tezos

            admin   = bob.pkh;
            adminSk = bob.sk;
            
            doormanInstance                 = await utils.tezos.contract.at(contractDeployments.doorman.address);
            delegationInstance              = await utils.tezos.contract.at(contractDeployments.delegation.address);
            mvkTokenInstance                = await utils.tezos.contract.at(contractDeployments.mvkToken.address);
            governanceInstance              = await utils.tezos.contract.at(contractDeployments.governance.address);
            governanceSatelliteInstance     = await utils.tezos.contract.at(contractDeployments.governanceSatellite.address);
            aggregatorInstance              = await utils.tezos.contract.at(contractDeployments.aggregator.address);
            governanceFinancialInstance     = await utils.tezos.contract.at(contractDeployments.governanceFinancial.address);
            councilInstance                 = await utils.tezos.contract.at(contractDeployments.council.address);
            aggregatorFactoryInstance       = await utils.tezos.contract.at(contractDeployments.aggregatorFactory.address);
            governanceProxyInstance         = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);
            farmFactoryInstance             = await utils.tezos.contract.at(contractDeployments.farmFactory.address);
            farmInstance                    = await utils.tezos.contract.at(contractDeployments.farm.address);
            lpTokenInstance                 = await utils.tezos.contract.at(contractDeployments.mavrykFa12Token.address);
    
            doormanStorage                  = await doormanInstance.storage();
            delegationStorage               = await delegationInstance.storage();
            mvkTokenStorage                 = await mvkTokenInstance.storage();
            governanceStorage               = await governanceInstance.storage();
            governanceSatelliteStorage      = await governanceSatelliteInstance.storage();
            aggregatorStorage               = await aggregatorInstance.storage();
            governanceFinancialStorage      = await governanceFinancialInstance.storage();
            councilStorage                  = await councilInstance.storage();
            aggregatorFactoryStorage        = await aggregatorFactoryInstance.storage();
            governanceProxyStorage          = await governanceProxyInstance.storage();
            farmFactoryStorage              = await farmFactoryInstance.storage();
            farmStorage                     = await farmInstance.storage();
            lpTokenStorage                  = await lpTokenInstance.storage();

            // Send all MVK to a single address (bob)
            mvkTokenStorage             = await mvkTokenInstance.storage();
            for(let accountName in accounts){
                let account = accounts[accountName];
                if(ledger.has(account.pkh)){
                    let balance = await getStorageMapValue(mvkTokenStorage, 'ledger', account.pkh);
                    if(balance !== undefined && balance.toNumber() > 0 && account.pkh !== admin){
                        // Transfer all funds to bob
                        await signerFactory(tezos, account.sk);
                        console.log("account:", account)
                        console.log("balance:", balance)
                        let operation = await mvkTokenInstance.methods.transfer([
                            {
                                from_: account.pkh,
                                txs: [
                                {
                                    to_: admin,
                                    token_id: 0,
                                    amount: balance.toNumber(),
                                }
                                ],
                            },
                            ])
                            .send()
                        await operation.confirmation();
                    }
                }
            }

            // Transfer TEZ and MVK for each user
            await signerFactory(tezos, adminSk);
            mvkTokenStorage             = await mvkTokenInstance.storage();
            const mainUserMVKBalance    = await getStorageMapValue(mvkTokenStorage, 'ledger', admin);
            const batchSize             = 50
            const tezAmount             = 50
            const userAmount            = randomUserAccounts.length;
            const mvkAmount             = Math.trunc((mainUserMVKBalance.div(userAmount + 1)).div(MVK()).toNumber());
            const batchesCount          = Math.ceil(userAmount / batchSize);
            var txsTransferList         = []

            console.log("Users in stress test:", userAmount)

            for(let i = 0; i < batchesCount; i++) {
                const batch: any = utils.tezos.wallet.batch();
                for (const indexStr in randomUserAccounts){

                    const index: number = parseInt(indexStr);
                    const account: any  = randomUserAccounts[index];

                    if ((index) < (batchSize * (i + 1)) && ((index) >= batchSize * i)){
                        // Prepare a transfer of MVK
                        txsTransferList.push({
                            to_: account.pkh,
                            token_id: 0,
                            amount: MVK(mvkAmount),
                        })
                        // Transfer only if receiver has less than 1XTZ
                        const userBalance   = await utils.tezos.tz.getBalance(account.pkh);
                        if(userBalance.toNumber() < tezAmount){
                            batch.withTransfer({ to: account.pkh, amount: tezAmount })
                            const transferEstimation    = await utils.tezos.estimate.transfer({ to: account.pkh, amount: tezAmount })
                            console.log("Transfer estimation for",account.pkh,":",transferEstimation)
                        }
                    }
                }
                if(batch.operations.length > 0){
                    const batchOperation    = await batch.send()
                    await batchOperation.confirmation()
                }
            }
            
            const transferOperation = await mvkTokenInstance.methods.transfer([
                {
                    from_: admin,
                    txs: txsTransferList
                }
            ]).send()
            await transferOperation.confirmation()

            // Update delegation config for max satellites
            const updateConfigOperation = await delegationInstance.methods.updateConfig(userAmount,"configMaxSatellites").send();
            await updateConfigOperation.confirmation()

        } catch(e) {
            console.dir(e, {depth: 5})
        }
    });

    describe("registering as satellite", async () => {

        it('%update_operators / %stake / %registerAsSatellite', async () => {
            try{
                // Initial values
                mvkTokenStorage         = await mvkTokenInstance.storage();
                var minimalCost         = {
                    batchIndex: 0,
                    totalCostMutez: MVK(999999),
                    estimations: []
                }
                var maximalCost         = {
                    batchIndex: 0,
                    totalCostMutez: 0,
                    estimations: []
                }

                // Operation
                for (const indexStr in randomUserAccounts){
                    
                    const index: number         = parseInt(indexStr);
                    delegationStorage           = await delegationInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const accessAmount          = delegationStorage.config.minimumStakedMvkBalance.toNumber() > doormanStorage.config.minMvkAmount.toNumber() ? delegationStorage.config.minimumStakedMvkBalance.toNumber() : doormanStorage.config.minMvkAmount.toNumber();
                    const account: any          = randomUserAccounts[index];
                    var satelliteRecord         = await getStorageMapValue(delegationStorage, 'satelliteLedger', account.pkh);
                    const satelliteName         = account.pkh;
                    const satelliteDescription  = "Test Description";
                    const satelliteImage        = "https://placeholder.com/300";
                    const satelliteWebsite      = "https://placeholder.com/300";
                    const satelliteFee          = Math.trunc(Math.random() * 1000);
                    const satellitePublicKey    = account.pk
                    const satellitePeerId       = account.peerId
                    const stakeAmount           = MVK(Math.trunc(15 * Math.random())) + accessAmount + 1;
                    await signerFactory(tezos, account.sk);

                    if(satelliteRecord===undefined){

                        // Calculate each operation gas cost estimation
                        const operatorsParams       = await mvkTokenInstance.methods.update_operators([
                        {
                            add_operator: {
                            owner: account.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                            },
                        }]).toTransferParams({})
                        const stakeParams           = await doormanInstance.methods.stake(stakeAmount).toTransferParams({})
                        const registerParams        = await delegationInstance.methods.registerAsSatellite(
                            satelliteName, 
                            satelliteDescription, 
                            satelliteImage, 
                            satelliteWebsite,
                            satelliteFee,
                            satellitePublicKey,
                            satellitePeerId
                        ).toTransferParams({})
                        const batchOpEstimate = await utils.tezos.estimate
                        .batch([
                            { kind: OpKind.TRANSACTION, to: contractDeployments.mvkToken.address, parameter: operatorsParams.parameter, amount: 0},
                            { kind: OpKind.TRANSACTION, to: contractDeployments.doorman.address, parameter: stakeParams.parameter, amount: 0},
                            { kind: OpKind.TRANSACTION, to: contractDeployments.delegation.address, parameter: registerParams.parameter, amount: 0},
                        ])

                        // Create a complete operation batch
                        const userBatch = utils.tezos.wallet.batch()
                        .withContractCall(mvkTokenInstance.methods.update_operators([
                        {
                            add_operator: {
                            owner: account.pkh,
                            operator: contractDeployments.doorman.address,
                            token_id: 0,
                            },
                        }]))
                        .withContractCall(doormanInstance.methods.stake(stakeAmount))
                        .withContractCall(delegationInstance.methods.registerAsSatellite(
                            satelliteName, 
                            satelliteDescription, 
                            satelliteImage, 
                            satelliteWebsite,
                            satelliteFee,
                            satellitePublicKey,
                            satellitePeerId
                        ));

                        // Send the batch
                        const batchOperation    = await userBatch.send()
                        await batchOperation.confirmation()

                        var batchTotalCost      = []
                        var totalCost           = 0
                        batchOpEstimate.forEach((estimate: Estimate) => {
                            batchTotalCost.push({
                                estimate: estimate,
                                totalCostMutez: estimate.totalCost
                            })
                            totalCost   += estimate.totalCost
                        })

                        // Calculate difference between min and max for the registering operation
                        const registeringCost           = batchOpEstimate[batchOpEstimate.length-1].totalCost;
                        const minimalRegisteringCost    = minimalCost.estimations.length > 0 ? minimalCost.estimations[minimalCost.estimations.length-1].totalCost : MVK(999999);
                        const maximalRegisteringCost    = maximalCost.estimations.length > 0 ? maximalCost.estimations[maximalCost.estimations.length-1].totalCost : 0;
                        minimalCost         = {
                            batchIndex: minimalRegisteringCost > registeringCost ? index : minimalCost.batchIndex,
                            totalCostMutez: minimalRegisteringCost > registeringCost ? totalCost : minimalCost.totalCostMutez,
                            estimations: minimalRegisteringCost > registeringCost ? batchTotalCost : minimalCost.estimations
                        }
                        maximalCost         = {
                            batchIndex: maximalRegisteringCost < registeringCost ? index : maximalCost.batchIndex,
                            totalCostMutez: maximalRegisteringCost < registeringCost ? totalCost : maximalCost.totalCostMutez,
                            estimations: maximalRegisteringCost < registeringCost ? batchTotalCost : maximalCost.estimations
                        }

                        // Print the result and the estimations
                        delegationStorage       = await delegationInstance.storage();
                        satelliteRecord         = await getStorageMapValue(delegationStorage, 'satelliteLedger', account.pkh);
                        console.log("Satellite record for", account.pkh, ":", satelliteRecord);
                        console.log("   - Batch estimation :", batchTotalCost);
                    }
                }

                console.log("Registering complete")
                console.dir(minimalCost, {depth: 5});
                console.dir(maximalCost, {depth: 5});
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

    })

    describe("starting a proposal round", async () => {

        before("setup", async() => {
            try{
                // Update config for shorter rounds
                await signerFactory(tezos, adminSk)
                var updateGovernanceConfig  = await governanceInstance.methods.updateConfig(0, "configBlocksPerProposalRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerVotingRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configBlocksPerTimelockRound").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinProposalRoundVotePct").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(0, "configMinQuorumPercentage").send();
                await updateGovernanceConfig.confirmation();
                updateGovernanceConfig      = await governanceInstance.methods.updateConfig(1, "configMinYayVotePercentage").send();
                await updateGovernanceConfig.confirmation();
            } catch(e){
                console.dir(e, {depth: 5});
            }
        })

        it('%startNextRound', async () => {
            try{
                // Initial values
                await signerFactory(tezos, randomUserAccounts[0].sk);
                governanceStorage           = await governanceInstance.storage();

                // Operation
                const operationParams       = await governanceInstance.methods.startNextRound(false).toTransferParams({})
                const operationEstimation   = await utils.tezos.estimate.transfer(operationParams);
                const operation             = await governanceInstance.methods.startNextRound(false).send();
                await operation.confirmation();

                // Final values
                governanceStorage           = await governanceInstance.storage();
                const currentRound          = governanceStorage.currentCycleInfo.round;

                // Print Estimation
                const operationTotalCost    = {
                    estimate: operationEstimation,
                    totalCostMutez: operationEstimation.totalCost
                }
                console.log("Round: ", currentRound)
                console.log("Operation total cost: ", operationTotalCost)
            } catch(e){
                console.dir(e, {depth: 5});
            }
        })
    })

    describe("creating a governance satellite action", async () => {

        it('%suspendSatellite', async () => {
            try{
                // Initial values
                await signerFactory(tezos, randomUserAccounts[0].sk);
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                const satelliteToSuspend    = randomUserAccounts[1].pkh;
                const purpose               = "Stress test"
                const actionId              = governanceSatelliteStorage.governanceSatelliteCounter;

                // Operation
                const operationParams       = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToSuspend, purpose).toTransferParams({})
                const operationEstimation   = await utils.tezos.estimate.transfer(operationParams);

                // Print Estimation
                const operationTotalCost    = {
                    estimate: operationEstimation,
                    totalCostMutez: operationEstimation.totalCost
                }
                console.log("Operation total cost: ", operationTotalCost)

                // Operation
                const operation             = await governanceSatelliteInstance.methods.suspendSatellite(satelliteToSuspend, purpose).send();
                await operation.confirmation();

                // Final values
                governanceSatelliteStorage  = await governanceSatelliteInstance.storage();
                const satelliteAction       = await getStorageMapValue(governanceSatelliteStorage, 'governanceSatelliteActionLedger', actionId);
                console.log("Governance satellite action:", satelliteAction)

            } catch(e){
                console.dir(e, {depth: 5});
            }
        })
    })

    describe("creating a governance financial action", async () => {

        it('council contract should be able to call this entrypoint and mint MVK', async () => {
            try{

                // some init constants
                councilStorage                  = await councilInstance.storage();
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialActionId         = governanceFinancialStorage.financialRequestCounter;
                const councilActionId           = councilStorage.actionCounter;
                const financialRequestID        = governanceFinancialStorage.financialRequestCounter;

                // request mint params
                const treasury                  = contractDeployments.treasury.address;
                const tokenAmount               = MVK(1000); // 1000 MVK
                const purpose                   = "Test Council Request Mint 1000 MVK";            

                // Council member (bob) requests for MVK to be minted and transferred from the Treasury
                await signerFactory(tezos, trudy.sk);
                const councilRequestsMintOperation = await councilInstance.methods.councilActionRequestMint(
                        treasury, 
                        contractDeployments.council.address,
                        tokenAmount,
                        purpose
                    ).send();
                await councilRequestsMintOperation.confirmation();

                // council members sign action, and action is executed once threshold of 3 signers is reached
                await signerFactory(tezos, alice.sk);
                const firstVoteParams                       = await councilInstance.methods.signAction(councilActionId).toTransferParams({})
                const firstVoteEstimation                   = await utils.tezos.estimate.transfer(firstVoteParams);

                // Print Estimation
                const firstVoteTotalCost    = {
                    estimate: firstVoteEstimation,
                    totalCostMutez: firstVoteEstimation.totalCost
                }
                console.log("First council vote operation total cost: ", firstVoteTotalCost)

                // First sign operation
                const aliceSignsRequestMintActionOperation  = await councilInstance.methods.signAction(councilActionId).send();
                await aliceSignsRequestMintActionOperation.confirmation();

                await signerFactory(tezos, eve.sk);
                const secondVoteParams                       = await councilInstance.methods.signAction(councilActionId).toTransferParams({})
                const secondVoteEstimation                   = await utils.tezos.estimate.transfer(secondVoteParams);

                // Print Estimation
                const secondVoteTotalCost    = {
                    estimate: secondVoteEstimation,
                    totalCostMutez: secondVoteEstimation.totalCost
                }
                console.log("Second council vote operation total cost: ", secondVoteTotalCost)

                const eveSignsRequestMintActionOperation = await councilInstance.methods.signAction(councilActionId).send();
                await eveSignsRequestMintActionOperation.confirmation();

                // Final values
                governanceFinancialStorage      = await governanceFinancialInstance.storage();
                const financialAction           = await getStorageMapValue(governanceFinancialStorage, 'financialRequestLedger', financialActionId);

                console.log("Governance financial action:", financialAction)
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
    });

    describe("distribute SMVK rewards to all satellite", async () => {

        before("add admin to delegation whitelist contracts", async () => {
            try{
                await signerFactory(tezos, adminSk)
                const updateWhitelistContractsOperation = await delegationInstance.methods.updateWhitelistContracts(admin, 'update').send()
                await updateWhitelistContractsOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%distributeReward", async () => {
            try{

                // Initial values
                var satellitesSet   = []
                for (const index in randomUserAccounts){
                    const account: any  = randomUserAccounts[index];
                    satellitesSet.push(account.pkh)
                }

                // Estimation
                const distributeRewardParams        = await delegationInstance.methods.distributeReward(satellitesSet,MVK(50)).toTransferParams({})
                const distributeRewardEstimation    = await utils.tezos.estimate.transfer(distributeRewardParams);
                const distributeRewardTotalCost     = {
                    estimate: distributeRewardEstimation,
                    totalCostMutez: distributeRewardEstimation.totalCost
                }
                console.log("Estimate: ", distributeRewardTotalCost)

                // Operation
                const distributeRewardOperation     = await delegationInstance.methods.distributeReward(satellitesSet,MVK(50)).send();
                await distributeRewardOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
    })

    describe("participate in a farm", async () => {

        before("admin transfers farm LP Token to each user and initialize the farm", async () => {
            try{
                await signerFactory(tezos, adminSk)

                // Transfer Farm LP to each users
                lpTokenStorage          = await lpTokenInstance.storage();
                const adminLPRecord     = await getStorageMapValue(lpTokenStorage, 'ledger', admin);
                const adminLPBalance    = adminLPRecord.balance.toNumber();
                const batchSize         = 50
                const userAmount        = randomUserAccounts.length;
                const batchesCount      = Math.ceil(userAmount / batchSize);
                const userLPGiveaway    = Math.floor(adminLPBalance / userAmount);
                console.log("LP TOKEN PER USER:", userLPGiveaway)
                console.log("MAX LP:", adminLPBalance)
                console.log("USER AMOUNT:", userAmount)

                for(let i = 0; i < batchesCount; i++) {
                    const batch = utils.tezos.wallet.batch();
                    for (const indexStr in randomUserAccounts){
                        const index: number = parseInt(indexStr);
                        const account: any  = randomUserAccounts[index];

                        if ((index) < (batchSize * (i + 1)) && ((index) >= batchSize * i)){
                            // Transfer only if receiver as less than 1XTZ
                            const userLPRecord  = await getStorageMapValue(lpTokenStorage, 'ledger', account.pkh);
                            const userLPBalance = userLPRecord !== undefined ? userLPRecord.balance.toNumber() : 0;
                            if(userLPBalance < 1){
                                batch.withContractCall(lpTokenInstance.methods.transfer(admin, account.pkh, userLPGiveaway))
                                const transferParams        = await lpTokenInstance.methods.transfer(admin, account.pkh, userLPGiveaway).toTransferParams({})
                                const transferEstimation    = await utils.tezos.estimate.transfer(transferParams);
                                console.log("LP transfer estimation for",account.pkh,":",transferEstimation)
                            }
                        }
                    }
                    const batchOperation    = await batch.send()
                    await batchOperation.confirmation()
                }

                // Initialize the farm
                farmStorage             = await farmInstance.storage();
                if(!farmStorage.init){
                    const initOperation = await farmInstance.methods.initFarm(
                        12000,
                        500,
                        false,
                        false
                    ).send();
                    await initOperation.confirmation();
                }

                // Farm factory tracks farm
                farmFactoryStorage      = await farmFactoryInstance.storage();
                const trackOperation    = await farmFactoryInstance.methods.trackFarm(contractDeployments.farm.address).send();
                await trackOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("all users deposit in the farm", async() => {
            try {
                for (const index in randomUserAccounts){
                    
                    // Initial values
                    lpTokenStorage              = await lpTokenInstance.storage();
                    farmStorage                 = await farmInstance.storage();
                    const account: any          = randomUserAccounts[index];
                    const accountLPRecord       = await getStorageMapValue(lpTokenStorage, 'ledger', account.pkh);
                    const accountLPBalance      = accountLPRecord !== undefined ? accountLPRecord.balance.toNumber() : 0;
                    const acccountLPAllowances  = await getStorageMapValue(accountLPRecord, 'allowances', contractDeployments.farm.address);
                    const amountToDeposit       = Math.floor(Math.random() * accountLPBalance);
                    const depositBatch: any     = utils.tezos.wallet.batch();
                    var approvals               = 0;

                    // Approval operation
                    await signerFactory(tezos, account.sk)
                    if(acccountLPAllowances===undefined || acccountLPAllowances.toNumber()<=0){
                        approvals               = acccountLPAllowances===undefined ? amountToDeposit : Math.abs(acccountLPAllowances.toNumber() - amountToDeposit);
                        depositBatch.withContractCall(lpTokenInstance.methods.approve(contractDeployments.farm.address, approvals))
                    }

                    // Deposit operation
                    depositBatch.withContractCall(farmInstance.methods.deposit(amountToDeposit))

                    // Estimate
                    const approveParams     = await lpTokenInstance.methods.approve(contractDeployments.farm.address, approvals).toTransferParams({})
                    const depositParams     = await farmInstance.methods.deposit(amountToDeposit).toTransferParams({})
                    const batchOpEstimate   = await utils.tezos.estimate.batch([
                        { kind: OpKind.TRANSACTION, to: contractDeployments.mavrykFa12Token.address, parameter: approveParams.parameter, amount: 0},
                        { kind: OpKind.TRANSACTION, to: contractDeployments.farm.address, parameter: depositParams.parameter, amount: 0},
                    ])

                    // Send batch
                    if(depositBatch.operations.length > 0){
                        const depositBatchOperation = await depositBatch.send()
                        await depositBatchOperation.confirmation()
                    }

                    // Print Estimation
                    farmStorage             = await farmInstance.storage();
                    const depositRecord     = await getStorageMapValue(farmStorage, 'depositorLedger', account.pkh)
                    
                    var batchTotalCost      = []
                    batchOpEstimate.forEach((estimate: Estimate) => {
                        batchTotalCost.push({
                            estimate: estimate,
                            totalCostMutez: estimate.totalCost
                        })
                    })

                    console.log("USER", account.pkh, "DEPOSITED", amountToDeposit, "LP TOKEN IN THE FARM");
                    for(const i in batchTotalCost){
                        console.log(batchTotalCost[i])
                    }
                    console.log("FARM STATE:",
                    "\n     - LastBlockUpdate:", farmStorage.lastBlockUpdate.toNumber(),
                    "\n     - AccumulatedRewardsPerShare:", farmStorage.accumulatedRewardsPerShare.toNumber(),
                    "\n     - ClaimedRewards:", farmStorage.claimedRewards,
                    "\n     - DepositorRecord:", depositRecord)
                }

            } catch(e) {
                console.dir(e, {depth: 5});
            }
        })

        it("all users withdraw from the farm", async() => {
            try {
                for (const index in randomUserAccounts){
                    
                    // Initial values
                    lpTokenStorage              = await lpTokenInstance.storage();
                    farmStorage                 = await farmInstance.storage();
                    const account: any          = randomUserAccounts[index];
                    var depositRecord           = await getStorageMapValue(farmStorage, 'depositorLedger', account.pkh);
                    const depositorBalance      = depositRecord !== undefined ? depositRecord.balance.toNumber() : 0;
                    const amountToWithdraw      = Math.floor(Math.random() * depositorBalance);
    
                    if(depositorBalance > 0){

                        // Estimate
                        await signerFactory(tezos, account.sk)
                        const withdrawParams    = await farmInstance.methods.withdraw(amountToWithdraw).toTransferParams({})
                        const withdrawEstimate  = await utils.tezos.estimate.transfer(withdrawParams);
        
                        // Send operation
                        const withdrawOperation = await farmInstance.methods.withdraw(amountToWithdraw).send();
                        await withdrawOperation.confirmation(),
        
                        // Print Estimation
                        farmStorage             = await farmInstance.storage();
                        depositRecord           = await getStorageMapValue(farmStorage, 'depositorLedger', account.pkh)
        
                        console.log("USER", account.pkh, "WITHDREW", amountToWithdraw, "LP TOKEN FROM THE FARM");
                        console.log("ESTIMATE:", withdrawEstimate, 
                        "\nTotal cost mutez:", withdrawEstimate.totalCost)
                        console.log("FARM STATE:",
                        "\n     - LastBlockUpdate:", farmStorage.lastBlockUpdate.toNumber(),
                        "\n     - AccumulatedRewardsPerShare:", farmStorage.accumulatedRewardsPerShare.toNumber(),
                        "\n     - ClaimedRewards:", farmStorage.claimedRewards,
                        "\n     - DepositorRecord:", depositRecord)

                    }
                }
    
            } catch(e) {
                console.dir(e, {depth: 5});
            }
        })
    
        it("all users claim from the farm", async() => {
            try {
                // Track farm if it isn't tracked
                farmFactoryStorage      = await farmFactoryInstance.storage();
                if(!farmFactoryStorage.trackedFarms.includes(contractDeployments.farm.address)){
                    await signerFactory(tezos, adminSk)
                    const trackFarmOperation    = await farmFactoryInstance.methods.trackFarm(contractDeployments.farm.address).send();
                    await trackFarmOperation.confirmation();
                }

                // Process test
                for (const index in randomUserAccounts){
                    
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    doormanStorage          = await doormanInstance.storage();
                    farmFactoryStorage      = await farmFactoryInstance.storage();
                    const account: any      = randomUserAccounts[index];
                    const initSMVKRecord    = await getStorageMapValue(doormanStorage, 'userStakeBalanceLedger', account.pkh);
                    const initSMVKBalance   = initSMVKRecord !== undefined ? initSMVKRecord.balance.toNumber() : 0;
                    var depositRecord       = await getStorageMapValue(farmStorage, 'depositorLedger', account.pkh);
                    const depositorBalance  = depositRecord !== undefined ? depositRecord.balance.toNumber() : 0;

                    if(depositorBalance > 0){

                        // Estimate
                        await signerFactory(tezos, account.sk)
                        const claimParams       = await farmInstance.methods.claim([account.pkh]).toTransferParams({})
                        const claimEstimate     = await utils.tezos.estimate.transfer(claimParams);
        
                        // Send operation
                        const claimOperation    = await farmInstance.methods.claim([account.pkh]).send();
                        await claimOperation.confirmation(),
        
                        // Print Estimation
                        farmStorage             = await farmInstance.storage();
                        doormanStorage          = await doormanInstance.storage();
                        const finalSMVKRecord   = await getStorageMapValue(doormanStorage, 'userStakeBalanceLedger', account.pkh);
                        const finalSMVKBalance  = finalSMVKRecord !== undefined ? finalSMVKRecord.balance.toNumber() : 0;
                        depositRecord           = await getStorageMapValue(farmStorage, 'depositorLedger', account.pkh)
        
                        console.log("USER", account.pkh, "CLAIM REWARDS FROM THE FARM");
                        console.log("ESTIMATE:", claimEstimate, 
                        "\nTotal cost mutez:", claimEstimate.totalCost);
                        console.log("USER SMVK BALANCE:\n   Start:", initSMVKBalance, "\n End:", finalSMVKBalance);
                        console.log("FARM STATE:",
                        "\n     - LastBlockUpdate:", farmStorage.lastBlockUpdate.toNumber(),
                        "\n     - AccumulatedRewardsPerShare:", farmStorage.accumulatedRewardsPerShare.toNumber(),
                        "\n     - ClaimedRewards:", farmStorage.claimedRewards,
                        "\n     - DepositorRecord:", depositRecord);

                    }
                }
                // Urack farm if it isn't tracked
                farmFactoryStorage      = await farmFactoryInstance.storage();
                if(farmFactoryStorage.trackedFarms.includes(contractDeployments.farm.address)){
                    await signerFactory(tezos, adminSk)
                    const untrackFarmOperation  = await farmFactoryInstance.methods.untrackFarm(contractDeployments.farm.address).send();
                    await untrackFarmOperation.confirmation();
                }
            } catch(e) {
                console.dir(e, {depth: 5});
            }
        })
    })

    describe("run though a governance cycle", async () => {

        before("set farm factory admin to proxy contract", async () => {
            try{
                await signerFactory(tezos, adminSk)
                const setAdminOperation = await farmFactoryInstance.methods.setAdmin(contractDeployments.governanceProxy.address).send();
                await setAdminOperation.confirmation();
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it('council contract should be able to call this entrypoint and mint MVK', async () => {
            try{
                // Initial values
                await signerFactory(tezos, randomUserAccounts[0].sk);
                governanceStorage           = await governanceInstance.storage();
                farmFactoryStorage          = await farmFactoryInstance.storage();
                const proposalId            = governanceStorage.nextProposalId.toNumber();
                const proposalName          = "Create a farm";
                const proposalDesc          = "Details about new proposal";
                const proposalIpfs          = "ipfs://QM123456789";
                const proposalSourceCode    = "Proposal Source Code";

                const farmMetadataBase = Buffer.from(
                    JSON.stringify({
                    name: 'MAVRYK PLENTY-USDTz Farm',
                    description: 'MAVRYK Farm Contract',
                    version: 'v1.0.0',
                    liquidityPairToken: {
                        tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
                        origin: ['Plenty'],
                        token0: {
                            symbol: ['PLENTY'],
                            tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
                        },
                        token1: {
                            symbol: ['USDtz'],
                            tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
                        }
                    },
                    authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
                    }),
                    'ascii',
                ).toString('hex')

                // Create a farm compiled params
                const lambdaFunction        = await createLambdaBytes(
                    tezos.rpc.url,
                    contractDeployments.governanceProxy.address,
                    
                    'createFarm',
                    [
                        contractDeployments.farmFactory.address,
                        "testFarm",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        contractDeployments.mavrykFa12Token.address,
                        0,
                        "FA12"
                    ]
                );

                const proposalData      = [
                    {
                        addOrSetProposalData: {
                            title: "FirstFarm#1",
                            encodedCode: lambdaFunction,
                            codeDescription: ""
                        }
                    }
                ]

                // Start governance rounds
                var nextRoundOperation      = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                const proposeOperation      = await governanceInstance.methods.propose(proposalName, proposalDesc, proposalIpfs, proposalSourceCode, proposalData).send({amount: 1});
                await proposeOperation.confirmation();
                const lockOperation         = await governanceInstance.methods.lockProposal(proposalId).send();
                await lockOperation.confirmation();

                for (const index in randomUserAccounts){
                    const account: any  = randomUserAccounts[index];
                    await signerFactory(tezos, account.sk);
                    const proposalVoteParams        = await governanceInstance.methods.proposalRoundVote(proposalId).toTransferParams({})
                    const proposalVoteEstimation    = await utils.tezos.estimate.transfer(proposalVoteParams);
                    const proposalVoteTotalCost     = {
                        estimate: proposalVoteEstimation,
                        totalCostMutez: proposalVoteEstimation.totalCost
                    }
                    var voteOperation               = await governanceInstance.methods.proposalRoundVote(proposalId).send();
                    await voteOperation.confirmation();
                    console.log(account.pkh, "voted for proposal #", proposalId, "during the proposal round")
                    console.log("Estimation: ", proposalVoteTotalCost)
                }
                nextRoundOperation          = await governanceInstance.methods.startNextRound().send();
                await nextRoundOperation.confirmation();
                // Votes operation -> all satellites vote
                for (const index in randomUserAccounts){
                    const account: any  = randomUserAccounts[index];
                    await signerFactory(tezos, account.sk);

                    const votingVoteParams          = await governanceInstance.methods.votingRoundVote("yay").toTransferParams({})
                    const votingVoteEstimation      = await utils.tezos.estimate.transfer(votingVoteParams);
                    const votingVoteTotalCost       = {
                        estimate: votingVoteEstimation,
                        totalCostMutez: votingVoteEstimation.totalCost
                    }

                    var votingRoundVoteOperation    = await governanceInstance.methods.votingRoundVote("yay").send();
                    await votingRoundVoteOperation.confirmation();
                    console.log(account.pkh, "voted for proposal #", proposalId, "during the voting round")
                    console.log("Estimation: ", votingVoteTotalCost)
                }

                // Execute proposal
                var startNextRoundParams        = await governanceInstance.methods.startNextRound(true).toTransferParams({})
                var startNextRoundEstimation    = await utils.tezos.estimate.transfer(startNextRoundParams);
                var startNextRoundTotalCost     = {
                    estimate: startNextRoundEstimation,
                    totalCostMutez: startNextRoundEstimation.totalCost
                }
                console.log("startNextRound #1 estimation: ", startNextRoundTotalCost)

                nextRoundOperation              = await governanceInstance.methods.startNextRound(true).send();
                await nextRoundOperation.confirmation();

                startNextRoundParams            = await governanceInstance.methods.startNextRound(false).toTransferParams({})
                startNextRoundEstimation        = await utils.tezos.estimate.transfer(startNextRoundParams);
                var startNextRoundTotalCost     = {
                    estimate: startNextRoundEstimation,
                    totalCostMutez: startNextRoundEstimation.totalCost
                }

                console.log("startNextRound #2 estimation: ", startNextRoundTotalCost)
                nextRoundOperation              = await governanceInstance.methods.startNextRound(false).send();
                await nextRoundOperation.confirmation();

                // Final values
                governanceStorage               = await governanceInstance.storage();
                const proposal                  = await getStorageMapValue(governanceStorage, 'proposalLedger', proposalId);
                console.log("Final proposal: ", proposal)
            } catch(e){
                console.dir(e, {depth: 5})
            } 
        });
    });

    describe("staking on the Doorman contract", async () => {
        it("all users stake SMVK", async() => {
            try{
                for (const index in randomUserAccounts){
                    
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    doormanStorage          = await doormanInstance.storage();
                    mvkTokenStorage         = await mvkTokenInstance.storage();
                    const account: any      = randomUserAccounts[index];
                    const initSMVKRecord    = await getStorageMapValue(doormanStorage, 'userStakeBalanceLedger', account.pkh);
                    const initSMVKBalance   = initSMVKRecord !== undefined ? initSMVKRecord.balance.toNumber() : 0;
                    const mvkBalance        = (await getStorageMapValue(mvkTokenStorage, 'ledger', account.pkh)).toNumber();
                    const amountToStake     = Math.floor(Math.random() * (mvkBalance - doormanStorage.config.minMvkAmount.toNumber())) + doormanStorage.config.minMvkAmount.toNumber();

                    if(amountToStake > 0){

                        // Estimate
                        await signerFactory(tezos, account.sk)
                        const updateOperatorsParams = await mvkTokenInstance.methods.update_operators([{
                            add_operator: {
                                owner: account.pkh,
                                operator: contractDeployments.doorman.address,
                                token_id: 0,
                            }
                        }]).toTransferParams({});
                        const stakeParams           = await doormanInstance.methods.stake(amountToStake).toTransferParams({});
                        const batchOpEstimate       = await utils.tezos.estimate.batch([
                            { kind: OpKind.TRANSACTION, to: contractDeployments.mvkToken.address, parameter: updateOperatorsParams.parameter, amount: 0},
                            { kind: OpKind.TRANSACTION, to: contractDeployments.doorman.address, parameter: stakeParams.parameter, amount: 0},
                        ])

                        // Send operation
                        const stakeBatch            = utils.tezos.wallet.batch()
                            .withContractCall(mvkTokenInstance.methods.update_operators([{
                                add_operator: {
                                    owner: account.pkh,
                                    operator: contractDeployments.doorman.address,
                                    token_id: 0,
                                }
                            }]))
                            .withContractCall(doormanInstance.methods.stake(amountToStake));
                        const stakeBatchOperation   = await stakeBatch.send()
                        await stakeBatchOperation.confirmation()

                        var batchTotalCost      = []
                        batchOpEstimate.forEach((estimate: Estimate) => {
                            batchTotalCost.push({
                                estimate: estimate,
                                totalCostMutez: estimate.totalCost
                            })
                        })
        
                        // Print Estimation
                        doormanStorage          = await doormanInstance.storage();
                        const finalSMVKRecord   = await getStorageMapValue(doormanStorage, 'userStakeBalanceLedger', account.pkh);
                        const finalSMVKBalance  = finalSMVKRecord !== undefined ? finalSMVKRecord.balance.toNumber() : 0;
        
                        console.log("USER", account.pkh, "STAKE", amountToStake, "MVK IN THE DOORMAN CONTRACT");
                        for(const i in batchTotalCost){
                            console.log(batchTotalCost[i])
                        }
                        console.log("USER SMVK BALANCE:\n   Start:", initSMVKBalance, "\n   End:", finalSMVKBalance);

                    }
                }
            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })
        it("all users unstake SMVK", async() => {
            try{
                for (const index in randomUserAccounts){
                    
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    doormanStorage          = await doormanInstance.storage();
                    mvkTokenStorage         = await mvkTokenInstance.storage();
                    const account: any      = randomUserAccounts[index];
                    const initSMVKRecord    = await getStorageMapValue(doormanStorage, 'userStakeBalanceLedger', account.pkh);
                    const initSMVKBalance   = initSMVKRecord !== undefined ? initSMVKRecord.balance.toNumber() : 0;
                    const amountToUnstake   = Math.floor(Math.random() * (initSMVKBalance - doormanStorage.config.minMvkAmount.toNumber())) + doormanStorage.config.minMvkAmount.toNumber();
                    const initMVKBalance    = (await getStorageMapValue(mvkTokenStorage, 'ledger', account.pkh)).toNumber();
                    const smvkTotalSupply   = (await getStorageMapValue(mvkTokenStorage, 'ledger', contractDeployments.doorman.address)).toNumber();
                    const mvkTotalSupply    = mvkTokenStorage.totalSupply.toNumber();
                    const mli               = smvkTotalSupply * 100 / mvkTotalSupply;
                    const exitFee           = 30 - 0.525 * mli + 0.0025 * mli *mli;
                    const paidFee           = Math.floor(amountToUnstake * exitFee / 100);

                    if(amountToUnstake > 0){

                        // Estimate
                        await signerFactory(tezos, account.sk)
                        const unstakeParams     = await doormanInstance.methods.unstake(amountToUnstake).toTransferParams({})
                        const unstakeEstimate   = await utils.tezos.estimate.transfer(unstakeParams);
        
                        // Send operation
                        const unstakeOperation  = await doormanInstance.methods.unstake(amountToUnstake).send();
                        await unstakeOperation.confirmation(),
        
                        // Print Estimation
                        doormanStorage          = await doormanInstance.storage();
                        mvkTokenStorage         = await mvkTokenInstance.storage();
                        const finalMVKBalance   = (await getStorageMapValue(mvkTokenStorage, 'ledger', account.pkh)).toNumber();
                        const finalSMVKRecord   = await getStorageMapValue(doormanStorage, 'userStakeBalanceLedger', account.pkh);
                        const finalSMVKBalance  = finalSMVKRecord !== undefined ? finalSMVKRecord.balance.toNumber() : 0;
                        const finalAmount       = finalMVKBalance - initMVKBalance;
        
                        console.log("USER", account.pkh, "UNSTAKES", amountToUnstake, "MVK FROM THE DOORMAN CONTRACT, PAYS:", paidFee,"AND GETS:", finalAmount);
                        console.log("ESTIMATE:", unstakeEstimate, 
                        "\nTotal cost mutez:", unstakeEstimate.totalCost);
                        console.log("USER SMVK BALANCE:\n   Start:", initSMVKBalance, "\n   End:", finalSMVKBalance);
                        console.log("MVK TOTAL SUPPLY:", mvkTotalSupply, ", SMVK TOTAL SUPPLY:", smvkTotalSupply)
                        console.log("MLI:", mli, ", EXIT FEE:", exitFee);
                        console.log("DOORMAN STATE:",
                        "\n     - Unclaimed rewards:", doormanStorage.unclaimedRewards.toNumber(),
                        "\n     - AccumulatedFeesPerShare:", doormanStorage.accumulatedFeesPerShare.toNumber(),
                        "\n     - Init record:", initSMVKRecord,
                        "\n     - Final record:", finalSMVKRecord);

                    }
                }
            } catch(e) {
                console.dir(e, {depth: 5})
            }

        });

    });

});