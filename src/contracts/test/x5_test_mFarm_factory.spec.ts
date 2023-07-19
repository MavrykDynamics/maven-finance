import { MVK, Utils } from "./helpers/Utils";
import { farmStorageType } from "../storage/storageTypes/farmStorageType";

const chai = require("chai");
const assert = require("chai").assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);   
chai.should();

// ------------------------------------------------------------------------------
// Contract Address
// ------------------------------------------------------------------------------

import contractDeployments from './contractDeployments.json'

// ------------------------------------------------------------------------------
// Contract Helpers
// ------------------------------------------------------------------------------

import { bob, alice, eve } from "../scripts/sandbox/accounts";
import * as helperFunctions from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("FarmFactory for Farm mToken", async () => {
    
    var utils: Utils;
    let tezos 

    let tokenId = 0

    let farmInstance;
    let farmStorage;

    let farmAddress
    let farmFactoryAddress
    let mvkTokenAddress
    let lpTokenAddress 
    let doormanAddress
    let treasuryAddress
    let lendingControllerAddress
    let mockFa12TokenAddress
    let mTokenUsdtAddress
    let mockUsdMockFa12TokenAggregatorAddress

    let farmFactoryInstance;
    let farmFactoryStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    let doormanInstance;
    let doormanStorage;

    let mvkTokenInstance;
    let mvkTokenStorage;

    let lendingControllerInstance;
    let lendingControllerStorage;

    let mockFa12TokenInstance;
    let mTokenUsdtInstance;
    let compoundOperation

    let updateOperatorsOperation

    const farmMetadataBase = Buffer.from(
      JSON.stringify({
        name: 'MAVRYK mUSDT Farm',
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

    before("setup", async () => {
        
        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos 

        farmAddress                             = contractDeployments.farm.address;
        farmFactoryAddress                      = contractDeployments.farmFactory.address;
        mvkTokenAddress                         = contractDeployments.mvkToken.address;
        lpTokenAddress                          = contractDeployments.mTokenUsdt.address;
        treasuryAddress                         = contractDeployments.treasury.address;
        doormanAddress                          = contractDeployments.doorman.address;
        lendingControllerAddress                = contractDeployments.lendingController.address;
        mTokenUsdtAddress                       = contractDeployments.mTokenUsdt.address;
        mockFa12TokenAddress                    = contractDeployments.mavrykFa12Token.address;
        mockUsdMockFa12TokenAggregatorAddress   = contractDeployments.mockUsdMockFa12TokenAggregator.address;
        
        farmFactoryInstance         = await utils.tezos.contract.at(farmFactoryAddress);
        mvkTokenInstance            = await utils.tezos.contract.at(mvkTokenAddress);
        lpTokenInstance             = await utils.tezos.contract.at(lpTokenAddress);
        doormanInstance             = await utils.tezos.contract.at(doormanAddress);
        lendingControllerInstance   = await utils.tezos.contract.at(lendingControllerAddress);
        mockFa12TokenInstance       = await utils.tezos.contract.at(mockFa12TokenAddress);
        mTokenUsdtInstance          = await utils.tezos.contract.at(mTokenUsdtAddress);

        farmFactoryStorage          = await farmFactoryInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        lpTokenStorage              = await lpTokenInstance.storage();
        doormanStorage              = await doormanInstance.storage();
        lendingControllerStorage    = await lendingControllerInstance.storage();

    });

    beforeEach("storage", async () => {
        farmFactoryStorage = await farmFactoryInstance.storage();
        lpTokenStorage    = await lpTokenInstance.storage();
        lendingControllerStorage    = await lendingControllerInstance.storage();
        doormanStorage    = await doormanInstance.storage();
        mvkTokenStorage    = await mvkTokenInstance.storage();
        await helperFunctions.signerFactory(tezos, bob.sk)
    })

    // describe('%setLoanToken - setup and test lending controller %setLoanToken entrypoint', function () {

    //     it('admin can set mock FA12 as a loan token', async () => {

    //         try{        
                
    //             // init variables
    //             await helperFunctions.signerFactory(tezos, bob.sk);

    //             const setLoanTokenActionType                = "createLoanToken";

    //             const tokenName                             = "usdt";
    //             const tokenContractAddress                  = mockFa12TokenAddress;
    //             const tokenType                             = "fa12";
    //             const tokenDecimals                         = 6;

    //             const oracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;

    //             const mTokenContractAddress                 = mTokenUsdtAddress;

    //             const interestRateDecimals                  = 27;
    //             const reserveRatio                          = 1000; // 10% reserves (4 decimals)
    //             const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
    //             const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
    //             const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
    //             const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
    //             const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

    //             const minRepaymentAmount                    = 10000;

    //             // check if loan token exists
    //             const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

    //             if(checkLoanTokenExists === undefined){

    //                 const adminSetMockFa12LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
    //                     setLoanTokenActionType,

    //                     tokenName,
    //                     tokenDecimals,

    //                     oracleAddress,

    //                     mTokenContractAddress,
                        
    //                     reserveRatio,
    //                     optimalUtilisationRate,
    //                     baseInterestRate,
    //                     maxInterestRate,
    //                     interestRateBelowOptimalUtilisation,
    //                     interestRateAboveOptimalUtilisation,

    //                     minRepaymentAmount,

    //                     // fa12 token type - token contract address
    //                     tokenType,
    //                     tokenContractAddress,

    //                 ).send();
    //                 await adminSetMockFa12LoanTokenOperation.confirmation();

    //                 lendingControllerStorage  = await lendingControllerInstance.storage();
    //                 const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
    
    //                 assert.equal(mockFa12LoanToken.mTokensTotal          , 0);
    //                 assert.equal(mockFa12LoanToken.mTokenAddress         , mTokenContractAddress);
    
    //                 assert.equal(mockFa12LoanToken.reserveRatio           , reserveRatio);
    //                 assert.equal(mockFa12LoanToken.tokenPoolTotal         , 0);
    //                 assert.equal(mockFa12LoanToken.totalBorrowed          , 0);
    //                 assert.equal(mockFa12LoanToken.totalRemaining         , 0);
    
    //                 assert.equal(mockFa12LoanToken.optimalUtilisationRate , optimalUtilisationRate);
    //                 assert.equal(mockFa12LoanToken.baseInterestRate       , baseInterestRate);
    //                 assert.equal(mockFa12LoanToken.maxInterestRate        , maxInterestRate);
                    
    //                 assert.equal(mockFa12LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
    //                 assert.equal(mockFa12LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    
    //             } else {

    //                 lendingControllerStorage  = await lendingControllerInstance.storage();
    //                 const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
    //                 // other variables will be affected by repeated tests
    //                 assert.equal(mockFa12LoanToken.tokenName              , tokenName);

    //             }

    //         } catch(e){
    //             console.log(e);
    //         } 
    //     });
    // })

    // 
    // Test: Add Liquidity into Lending Pool
    //
    describe('%addLiquidity', function () {
    
        it('user (bob) can add liquidity for mock FA12 (usdt) token into Lending Controller token pool (30 MockFA12 Tokens) and receive mUSDT tokens', async () => {
            try{

            // init variables
            await helperFunctions.signerFactory(tezos, bob.sk);
            const loanTokenName   = "usdt";
            const liquidityAmount = 30000000; // 30 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage                = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage      = await mTokenUsdtInstance.storage();
            
            // get initial bob's Mock FA12 Token balance
            const bobMockFa12Ledger                   = await mockFa12TokenStorage.ledger.get(bob.pkh);            
            const bobInitialMockFa12TokenBalance      = bobMockFa12Ledger == undefined ? 0 : bobMockFa12Ledger.balance.toNumber();

            // get initial bob's mEurl Token - Mock FA12 Token - balance
            const bobMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(bob.pkh);            
            const bobInitialMUsdtTokenTokenBalance    = bobMUsdtTokenLedger == undefined ? 0 : bobMUsdtTokenLedger.toNumber();

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // bob resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
                liquidityAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // bob deposits mock FA12 tokens into lending controller token pool
            const bobDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount
            ).send();
            await bobDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedMUsdtTokenTokenStorage           = await mTokenUsdtInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Bob's Mock FA12 Token balance
            const updatedBobMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(bob.pkh);            
            assert.equal(updatedBobMockFa12Ledger.balance, bobInitialMockFa12TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

            // check Bob's mUsdt Token Token balance
            const updatedBobMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(bob.pkh);            
            assert.equal(updatedBobMUsdtTokenLedger, bobInitialMUsdtTokenTokenBalance + liquidityAmount);        

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });


        it('user (alice) can add liquidity for mock FA12 (usdt) token into Lending Controller token pool (30 MockFA12 Tokens) and receive mUSDT tokens', async () => {
            try{

            // init variables
            await helperFunctions.signerFactory(tezos, alice.sk);
            const loanTokenName   = "usdt";
            const liquidityAmount = 30000000; // 30 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage                = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage      = await mTokenUsdtInstance.storage();
            
            // get initial alice's Mock FA12 Token balance
            const aliceMockFa12Ledger                   = await mockFa12TokenStorage.ledger.get(alice.pkh);            
            const aliceInitialMockFa12TokenBalance      = aliceMockFa12Ledger == undefined ? 0 : aliceMockFa12Ledger.balance.toNumber();

            // get initial alice's mToken - Mock FA12 Token (USDT) - balance
            compoundOperation                           = await mTokenUsdtInstance.methods.compound([alice.pkh]).send();
            await compoundOperation.confirmation();
            const aliceMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(alice.pkh);            
            const aliceInitialMUsdtTokenTokenBalance    = aliceMUsdtTokenLedger == undefined ? 0 : aliceMUsdtTokenLedger.toNumber();

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // alice resets mock FA12 tokens allowance then set new allowance to deposit amount
            // reset token allowance
            const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
                0
            ).send();
            await resetTokenAllowance.confirmation();

            // set new token allowance
            const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                lendingControllerAddress,
                liquidityAmount
            ).send();
            await setNewTokenAllowance.confirmation();

            // alice deposits mock FA12 tokens into lending controller token pool
            const aliceDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount
            ).send();
            await aliceDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedMUsdtTokenTokenStorage           = await mTokenUsdtInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check alice's Mock FA12 Token balance
            const updatedAliceMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(alice.pkh);            
            assert.equal(updatedAliceMockFa12Ledger.balance, aliceInitialMockFa12TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

            // check alice's mUsdt Token Token balance
            const updatedAliceMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(alice.pkh);            
            assert.equal(updatedAliceMUsdtTokenLedger, aliceInitialMUsdtTokenTokenBalance + liquidityAmount);        

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });
    })

    describe('Farm Factory', function() {
        describe('%createFarmMToken', function() {
            it('Create a farm being the admin', async () => {
                try{
                    // Create a transaction for initiating a farm
                    const operation = await farmFactoryInstance.methods.createFarmMToken(
                        "testFarm",
                        'usdt',
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        mTokenUsdtAddress,
                        0,
                        "fa2",
                    ).send();
                    await operation.confirmation()

                    // Created farms
                    farmFactoryStorage    = await farmFactoryInstance.storage();

                    // Get the new farm
                    farmAddress                             = farmFactoryStorage.trackedFarms[0];
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
                    farmStorage                             = await farmInstance.storage();

                    assert.strictEqual(farmStorage.config.lpToken.tokenAddress, mTokenUsdtAddress);
                    assert.equal(farmStorage.config.loanToken, "usdt");
                    assert.equal(farmStorage.config.lpToken.tokenId, 0);
                    assert.equal(farmStorage.config.lpToken.tokenBalance.toNumber(), 0);
                    assert.equal(Object.keys(farmStorage.config.lpToken.tokenStandard)[0], "fa2");
                    assert.equal(farmStorage.config.plannedRewards.currentRewardPerBlock, 100);
                    assert.equal(farmStorage.config.plannedRewards.totalBlocks, 12000);
                    assert.equal(farmStorage.open, true);
                    assert.equal(farmStorage.init, true);
                    
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Create a farm without being the admin', async () => {
                try{
                    await helperFunctions.signerFactory(tezos, alice.sk)
                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.createFarmMToken(
                        "testFarm",
                        "usdt",
                        false,
                        false,
                        false,
                        12000,
                        0,
                        farmMetadataBase,
                        mTokenUsdtAddress,
                        0,
                        "fa2"
                    ).send()).to.be.rejected;
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Create a farm being the admin but without specific duration and finite', async () => {
                try{
                    // Create a transaction for initiating a farm
                    const operation = await farmFactoryInstance.methods.createFarmMToken(
                        "testFarm",
                        "usdt",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        mTokenUsdtAddress,
                        0,
                        "fa2"
                    ).send();
                    await operation.confirmation()

                    // Created farms
                    farmFactoryStorage    = await farmFactoryInstance.storage();

                    // Get the new farm
                    farmAddress                             = farmFactoryStorage.trackedFarms[0];
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
                    farmStorage                             = await farmInstance.storage();

                    assert.strictEqual(farmStorage.config.lpToken.tokenAddress, mTokenUsdtAddress);
                    assert.equal(farmStorage.config.loanToken, "usdt");
                    assert.equal(farmStorage.config.lpToken.tokenId, 0);
                    assert.equal(farmStorage.config.lpToken.tokenBalance.toNumber(), 0);
                    assert.equal(Object.keys(farmStorage.config.lpToken.tokenStandard)[0], "fa2");
                    assert.equal(farmStorage.config.plannedRewards.currentRewardPerBlock, 100);
                    assert.equal(farmStorage.config.plannedRewards.totalBlocks, 12000);
                    assert.equal(farmStorage.open, true);
                    assert.equal(farmStorage.init, true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

        });

        describe('%setAdmin', function() {
            it('Admin should be able to set a new admin', async() => {
                try{
                    // Initial values
                    const previousAdmin = farmFactoryStorage.admin;

                    // Create a transaction for initiating a farm
                    const operation = await farmFactoryInstance.methods.setAdmin(alice.pkh).send();
                    await operation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Assertion
                    assert.strictEqual(farmFactoryStorage.admin,alice.pkh);
                    assert.strictEqual(previousAdmin,bob.pkh);

                    // Reset admin
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    const resetOperation = await farmFactoryInstance.methods.setAdmin(bob.pkh).send();
                    await resetOperation.confirmation();
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to set a new admin', async() => {
                try{
                    // Create a transaction for initiating a farm
                    await helperFunctions.signerFactory(tezos, eve.sk)
                    const operation = farmFactoryInstance.methods.setAdmin(bob.pkh);
                    await chai.expect(operation.send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Assertion
                    assert.strictEqual(farmFactoryStorage.admin,bob.pkh)
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%pauseAll', function() {
            it('Admin should be able to pause all entrypoints on the factory and the tracked farms', async() => {
                try{
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;
                    const trackedFarms = await farmFactoryStorage.trackedFarms;
                    const farmAddress = trackedFarms[0]
                    const farmInstance   = await utils.tezos.contract.at(farmAddress);
                    var farmStorage: farmStorageType = await farmInstance.storage();
                    const depositIsPaused = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPaused = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPaused = farmStorage.breakGlassConfig.claimIsPaused;

                    // Create an operation
                    const operation = await farmFactoryInstance.methods.pauseAll().send();
                    await operation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    farmStorage = await farmInstance.storage();
                    const depositIsPausedEnd = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPausedEnd = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPausedEnd = farmStorage.breakGlassConfig.claimIsPaused;
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.createFarmMToken(
                        "testFarm",
                        "usdt",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        mTokenUsdtAddress,
                        0,
                        "fa2"
                    ).send()).to.be.rejected;
                    await chai.expect(farmFactoryInstance.methods.untrackFarm(farmAddress).send()).to.be.rejected;
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
                    await chai.expect(farmInstance.methods.deposit(MVK(2)).send()).to.be.rejected;
                    await chai.expect(farmInstance.methods.withdraw(MVK()).send()).to.be.rejected;
                    await chai.expect(farmInstance.methods.claim([bob.pkh]).send()).to.be.rejected;

                    // Assertion
                    assert.notEqual(depositIsPaused,depositIsPausedEnd);
                    assert.notEqual(withdrawIsPaused,withdrawIsPausedEnd);
                    assert.notEqual(claimIsPaused,claimIsPausedEnd);
                    assert.notEqual(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.notEqual(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.notEqual(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to pause all entrypoints', async() => {
                try{
                    // Change signer
                    await helperFunctions.signerFactory(tezos, alice.sk);

                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.pauseAll().send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Assertion
                    assert.equal(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.equal(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

        });

        describe('%unpauseAll', function() {
            it('Admin should be able to unpause all entrypoints and all tracked farms', async() => {
                try{
                    // Initial values
                    await helperFunctions.signerFactory(tezos, bob.sk)
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;
                    const trackedFarms = await farmFactoryStorage.trackedFarms;
                    const farmAddress = trackedFarms[0]
                    const farmInstance   = await utils.tezos.contract.at(farmAddress);
                    var farmStorage: farmStorageType = await farmInstance.storage();
                    const depositIsPaused = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPaused = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPaused = farmStorage.breakGlassConfig.claimIsPaused;

                    // Create an operation
                    const operation = await farmFactoryInstance.methods.unpauseAll().send();
                    await operation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    farmStorage = await farmInstance.storage();
                    const depositIsPausedEnd = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPausedEnd = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPausedEnd = farmStorage.breakGlassConfig.claimIsPaused;
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Test calls
                    const createFarmOperation = await farmFactoryInstance.methods.createFarmMToken(
                        "testFarm",
                        "usdt",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        mTokenUsdtAddress,
                        0,
                        "fa2"
                    ).send();
                    await createFarmOperation.confirmation();
                    
                    const untrackFarmOperation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                    await untrackFarmOperation.confirmation();
                    
                    const trackFarmOperation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
                    await trackFarmOperation.confirmation();

                    // Update operators for farm
                    updateOperatorsOperation = await helperFunctions.updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    const depositOperation = await farmInstance.methods.deposit(2).send();
                    await depositOperation.confirmation();

                    const withdrawOperation = await farmInstance.methods.withdraw(1).send();
                    await withdrawOperation.confirmation();

                    const claimOperation = await farmInstance.methods.claim([bob.pkh]).send();
                    await claimOperation.confirmation();

                    // Assertion
                    assert.notEqual(depositIsPaused,depositIsPausedEnd);
                    assert.notEqual(withdrawIsPaused,withdrawIsPausedEnd);
                    assert.notEqual(claimIsPaused,claimIsPausedEnd);
                    assert.notEqual(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.notEqual(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.notEqual(trackFarmIsPaused,trackFarmIsPausedEnd);

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to unpause all entrypoints', async() => {
                try{
                    // Change signer
                    await helperFunctions.signerFactory(tezos, alice.sk);

                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.unpauseAll().send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    const untrackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;
                    
                    // Assertion
                    assert.equal(createFarmIsPaused,createFarmIsPausedEnd);
                    assert.equal(untrackFarmIsPaused,untrackFarmIsPausedEnd);
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to unpause all entrypoints on all tracked farms', async() => {
                try{
                    // Change signer
                    await helperFunctions.signerFactory(tezos, alice.sk);

                    // Initial values
                    const trackedFarms = await farmFactoryStorage.trackedFarms;
                    const farmAddress = trackedFarms[0]
                    const farmInstance   = await utils.tezos.contract.at(farmAddress);
                    var farmStorage: farmStorageType = await farmInstance.storage();

                    const depositIsPaused = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPaused = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPaused = farmStorage.breakGlassConfig.claimIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.unpauseAll().send()).to.be.rejected;

                    // Final values
                    farmStorage = await farmInstance.storage();
                    const depositIsPausedEnd = farmStorage.breakGlassConfig.depositIsPaused;
                    const withdrawIsPausedEnd = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const claimIsPausedEnd = farmStorage.breakGlassConfig.claimIsPaused;
                    
                    // Assertion
                    assert.equal(depositIsPaused,depositIsPausedEnd);
                    assert.equal(withdrawIsPaused,withdrawIsPausedEnd);
                    assert.equal(claimIsPaused,claimIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%togglePauseEntrypoint', function() {
            it('Admin should be able to pause and unpause the createFarm entrypoint', async() => {
                try{
                    // Initial values
                    const createFarmIsPaused = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;

                    // Create an operation
                    const pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarmMToken", true).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedPause = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.createFarmMToken(
                        "testFarm",
                        "usdt",
                        false,
                        false,
                        false,
                        12000,
                        100,
                        farmMetadataBase,
                        mTokenUsdtAddress,
                        0,
                        "fa2"
                    ).send()).to.be.rejected;

                    // Create an operation
                    const unpauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("createFarmMToken", false).send();
                    await unpauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const createFarmIsPausedUnpause = farmFactoryStorage.breakGlassConfig.createFarmMTokenIsPaused;

                    // Assertion
                    assert.notEqual(createFarmIsPaused,createFarmIsPausedPause);
                    assert.equal(createFarmIsPaused,createFarmIsPausedUnpause);

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should be able to pause and unpause the untrackFarm entrypoint', async() => {
                try{
                    // Initial values
                    const untrackFarmIsPaused = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Create an operation
                    const pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", true).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const untrackFarmIsPausedPause = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.untrackFarm(farmAddress).send()).to.be.rejected;

                    // Create an operation
                    const unpauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("untrackFarm", false).send();
                    await unpauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const untrackFarmIsPausedUnpause = farmFactoryStorage.breakGlassConfig.untrackFarmIsPaused;

                    // Assertion
                    assert.notEqual(untrackFarmIsPaused,untrackFarmIsPausedPause);
                    assert.equal(untrackFarmIsPaused,untrackFarmIsPausedUnpause);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
            
            it('Admin should be able to pause and unpause the trackFarm entrypoint', async() => {
                try{
                    // Initial values
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Create an operation
                    const pauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", true).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const trackFarmIsPausedPause = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Test calls
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;

                    // Create an operation
                    const unpauseOperation = await farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", false).send();
                    await unpauseOperation.confirmation();

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const trackFarmIsPausedUnpause = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Assertion
                    assert.notEqual(trackFarmIsPaused,trackFarmIsPausedPause);
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedUnpause);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to pause and unpause the trackFarm entrypoint', async() => {
                try{
                    // Change signer
                    await helperFunctions.signerFactory(tezos, alice.sk);

                    // Initial values
                    const trackFarmIsPaused = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;

                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.togglePauseEntrypoint("trackFarm", true).send()).to.be.rejected;

                    // Final values
                    farmFactoryStorage = await farmFactoryInstance.storage();
                    const trackFarmIsPausedEnd = farmFactoryStorage.breakGlassConfig.trackFarmIsPaused;
                    
                    // Assertion
                    assert.equal(trackFarmIsPaused,trackFarmIsPausedEnd);
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%untrackFarm', function() {
            it('Untrack the previously created farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    const operation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                    await operation.confirmation();

                    // Farm storage
                    farmFactoryStorage      = await farmFactoryInstance.storage();
                    const createdFarm       = await farmFactoryStorage.trackedFarms.includes(farmAddress);
                    assert.equal(createdFarm,false);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Untrack an unexisting farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.untrackFarm(alice.pkh).send()).to.be.rejected;
                }catch(e){
                    console.log(e)
                }
            })
        });

        describe('%trackFarm', function() {
            it('Admin should be able to track the previously untracked farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    const operation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
                    await operation.confirmation();

                    // Farm storage
                    farmFactoryStorage      = await farmFactoryInstance.storage();
                    const createdFarm       = await farmFactoryStorage.trackedFarms.includes(farmAddress);
                    assert.equal(createdFarm,true);
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Admin should not be able to track an already tracked farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to track a farm', async () => {
                try{
                    // Create a transaction for initiating a farm
                    await helperFunctions.signerFactory(tezos, alice.sk);
                    await chai.expect(farmFactoryInstance.methods.trackFarm(farmAddress).send()).to.be.rejected;
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

    });

    describe('Newly created farm', function() {
        describe('%claim', function() {
            it('Create a farm, deposit and try to claim in it', async () => {
                try{
                    // Deposit
                    const amountToDeposit = 2;

                    // Create a transaction for initiating a farm
                    const createFarmOperation = await farmFactoryInstance.methods.createFarmMToken(
                        "testFarm",
                        "usdt",
                        false,
                        false,
                        false,
                        100,
                        12000,
                        farmMetadataBase,
                        mTokenUsdtAddress,
                        0,
                        "fa2"
                    ).send();
                    await createFarmOperation.confirmation()

                    // Created farms
                    farmFactoryStorage    = await farmFactoryInstance.storage();

                    // Get the new farm
                    farmAddress                             = farmFactoryStorage.trackedFarms[farmFactoryStorage.trackedFarms.length - 1];
                    farmInstance                            = await utils.tezos.contract.at(farmAddress);
                    farmStorage                             = await farmInstance.storage();

                     // Create a transaction for allowing farm to spend LP Token in the name of Bob
                    const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);

                    // Update operators for farm
                    updateOperatorsOperation = await helperFunctions.updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Deposit operation
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Claim operation after a few blocks
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    const claimOperation = await farmInstance.methods.claim([bob.pkh]).send();
                    await claimOperation.confirmation()
                    
                    farmStorage = await farmInstance.storage();
                    doormanStorage = await doormanInstance.storage();

                    // Depositor's record
                    const depositorRecord = await farmStorage.depositorLedger.get(bob.pkh)
                    console.log("User's deposit in Farm Contract")
                    console.log(depositorRecord)

                    // Stake's record
                    const doormanRecord = await doormanStorage.userStakeBalanceLedger.get(bob.pkh)
                    console.log("User's balance in Doorman Contract")
                    console.log(doormanRecord)

                    // Doorman's balance in MVK Token Contract
                    const doormanLedger = await mvkTokenStorage.ledger.get(doormanAddress)
                    console.log("Doorman's ledger in MVK Token Contract")
                    console.log(doormanLedger)
                }catch(e){
                    console.dir(e, {depth: 5});
                }
            })

            it('Create a farm, deposit and try to claim in it with a farm unknown to the farm factory', async () => {
                try{
                    // Deposit
                    const amountToDeposit = 2;
                    
                    // Untrack the farm
                    const untrackOperation = await farmFactoryInstance.methods.untrackFarm(farmAddress).send();
                    await untrackOperation.confirmation();

                    // Create a transaction for allowing farm to spend LP Token in the name of Bob
                    const bobLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);

                    // Update operators for farm
                    updateOperatorsOperation = await helperFunctions.updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();
                    
                    // Deposit operation
                    const depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Claim operation after a few blocks
                    await new Promise(resolve => setTimeout(resolve, 6000));
                    await chai.expect(farmInstance.methods.claim([bob.pkh]).send()).to.be.rejected;
                }catch(e){
                    console.log(e)
                }
            })
        });
    });
});