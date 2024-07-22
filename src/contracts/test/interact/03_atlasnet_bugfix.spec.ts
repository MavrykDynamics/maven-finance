import { MVN, Utils } from "../helpers/Utils";
import { BigNumber } from "bignumber.js"
import assert from "assert";

const chai = require("chai");
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from '../contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, susie, eve, trudy, alice, oscar } from "../../scripts/sandbox/accounts";
import {
    signerFactory,
    updateOperators
} from '../helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Testnet Setup
// ------------------------------------------------------------------------------

describe("Atlasnet bugfixing", async () => {
    
    var utils: Utils
    var tezos

    let user, userSk 
    let currentMockLevel

    let doormanAddress
    let tokenId = 0
    
    let lendingControllerAddress, lendingControllerInstance, lendingControllerStorage
    let usdtTokenAddress, usdtTokenInstance, usdtTokenStorage
    let vaultId, vaultRecord, vaultHandle, vaultOwner

    let newMockLevel, mockLevelChange, markedForLiquidationLevel, liquidationEndLevel

    let initialVaultLoanOutstandingTotal, initialVaultLoanPrincipalTotal, initialVaultBorrowIndex

    let liquidationDelayInMins, liquidationMaxDuration, maxVaultLiquidationPercent, adminLiquidationFeePercent, liquidationFeePercent, interestTreasuryShare
    let oneMinuteLevelBlocks, oneDayLevelBlocks, oneMonthLevelBlocks, oneYearLevelBlocks

    // operations
    let resetTokenAllowanceOperation, setTokenAllowanceOperation
    let liquidateVaultOperation

    before("setup", async () => {
        try{

            // -------------------------------------------
            // Set user/admin to interact with contracts
            // -------------------------------------------

            user    = bob.pkh
            userSk  = bob.sk

            utils = new Utils();
            await utils.init(userSk);
            tezos = utils.tezos;

            // -------------------------------------------
            // Setup contract instances
            // -------------------------------------------

            lendingControllerAddress      = "KT1CV9redTDyiFw9roAMSGDBX5oVbEzzWDbz"
            lendingControllerInstance     = await utils.tezos.contract.at(lendingControllerAddress);
            lendingControllerStorage      = await lendingControllerInstance.storage();

            usdtTokenAddress              = "KT1StUZzJ34MhSNjkQMSyvZVrR9ppkHMFdFf"
            usdtTokenInstance             = await utils.tezos.contract.at(usdtTokenAddress);
            usdtTokenStorage              = await usdtTokenInstance.storage();

            // config variables
            liquidationDelayInMins        = lendingControllerStorage.config.liquidationDelayInMins.toNumber();
            liquidationMaxDuration        = lendingControllerStorage.config.liquidationMaxDuration.toNumber();
            maxVaultLiquidationPercent    = lendingControllerStorage.config.maxVaultLiquidationPercent.toNumber();
            adminLiquidationFeePercent    = lendingControllerStorage.config.adminLiquidationFeePercent.toNumber();
            liquidationFeePercent         = lendingControllerStorage.config.liquidationFeePercent.toNumber();
            interestTreasuryShare         = lendingControllerStorage.config.interestTreasuryShare.toNumber();

            // 3 seconds blocks (docker sandbox) 
            // - to be changed for atlasnet
            oneMinuteLevelBlocks          = 20
            oneDayLevelBlocks             = 28800
            oneMonthLevelBlocks           = 864000
            oneYearLevelBlocks            = 10512000 // 365 days
            
        } catch(e){
            console.log(e)
        }
    });

    describe("Lending Controller bugfixing", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            lendingControllerStorage  = await lendingControllerInstance.storage();
            await signerFactory(tezos, userSk);
        });

        describe("Vault Liquidation interaction", async () => {

            before("Setup vault", async () => {
                vaultId     = "7"
                vaultOwner  = "mv1TMgthRwT69X8WMqRyeMYLPEcoEfCKqX2w"
                vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                };
            });

            it('mark for liquidation', async () => {
                try{

                    const markVaultForLiquidationOperation = await lendingControllerInstance.methods.markForLiquidation(vaultId, vaultOwner).send();
                    await markVaultForLiquidationOperation.confirmation();

                    lendingControllerStorage                = await lendingControllerInstance.storage();
                    vaultRecord                             = await lendingControllerStorage.vaults.get(vaultHandle);
                    currentMockLevel                        = lendingControllerStorage.config.mockLevel.toNumber();            

                    const expectedMarkedForLiquidationLevel = currentMockLevel;
                    const expectedLiquidationEndLevel       = currentMockLevel + (liquidationMaxDuration * oneMinuteLevelBlocks);

                    initialVaultLoanOutstandingTotal        = vaultRecord.loanOutstandingTotal;
                    initialVaultLoanPrincipalTotal          = vaultRecord.loanPrincipalTotal;
                    initialVaultBorrowIndex                 = vaultRecord.borrowIndex;

                    const vaultMarkedForLiquidationLevel    = vaultRecord.markedForLiquidationLevel;
                    const vaultLiquidationEndLevel          = vaultRecord.liquidationEndLevel;

                    // assert.equal(vaultMarkedForLiquidationLevel, expectedMarkedForLiquidationLevel);
                    // assert.equal(vaultLiquidationEndLevel, expectedLiquidationEndLevel);

                } catch(e) {
                    console.dir(e, {depth: 5});
                }
            });

            it('update mock level and liquidate vault', async () => {
                try{

                    currentMockLevel = lendingControllerStorage.config.mockLevel;
                    console.log("currentMockLevel: ", currentMockLevel)

                    // vault record
                    vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);
                    console.log("vaultRecord: ", vaultRecord)

                    liquidationEndLevel = vaultRecord.liquidationEndLevel;
                    newMockLevel        = liquidationEndLevel.toNumber() - 1000;

                    const setMockLevelOperationOne = await lendingControllerInstance.methods.updateConfig(newMockLevel, 'configMockLevel').send();
                    await setMockLevelOperationOne.confirmation();

                    // update storage
                    lendingControllerStorage  = await lendingControllerInstance.storage();

                    const liquidationAmount = 100;

                    liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
                    await liquidateVaultOperation.confirmation();

                } catch(e) {
                    console.dir(e, {depth: 5});
                }
            });

            it('only liquidate vault', async () => {
                try{

                    const liquidationAmount = 10000000;

                    liquidateVaultOperation = await lendingControllerInstance.methods.liquidateVault(vaultId, vaultOwner, liquidationAmount).send();
                    await liquidateVaultOperation.confirmation();

                } catch(e) {
                    console.dir(e, {depth: 5});
                }
            });

        })

    })
});