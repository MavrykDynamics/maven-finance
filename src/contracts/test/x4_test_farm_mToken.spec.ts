import { Utils } from "./helpers/Utils";

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

import { bob, alice, eve, mallory } from "../scripts/sandbox/accounts";
import {
    signerFactory,
    updateOperators,
    wait
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Farm mToken", async () => {
    
    var utils: Utils;
    let tezos 

    let tokenId = 0

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

    let farmInstance;
    let farmStorage;

    let mvkTokenInstance;
    let mvkTokenStorage;

    let lpTokenInstance;
    let lpTokenStorage;

    let farmFactoryInstance;
    let farmFactoryStorage;

    let treasuryInstance;
    let treasuryStorage;

    let doormanInstance;
    let doormanStorage;

    let lendingControllerInstance;
    let lendingControllerStorage;

    let mockFa12TokenInstance
    let mTokenUsdtInstance

    let depositOperation
    let updateOperatorsOperation

    before("setup", async () => {
        
        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        farmAddress                             = contractDeployments.farmMToken.address;
        farmFactoryAddress                      = contractDeployments.farmFactory.address;
        mvkTokenAddress                         = contractDeployments.mvkToken.address;
        lpTokenAddress                          = contractDeployments.mavrykFa12Token.address;
        treasuryAddress                         = contractDeployments.treasury.address;
        doormanAddress                          = contractDeployments.doorman.address;
        lendingControllerAddress                = contractDeployments.lendingController.address;
        mTokenUsdtAddress                       = contractDeployments.mTokenUsdt.address;
        mockFa12TokenAddress                    = contractDeployments.mavrykFa12Token.address;
        mockUsdMockFa12TokenAggregatorAddress   = contractDeployments.mockUsdMockFa12TokenAggregator.address;
        
        
        farmInstance                = await utils.tezos.contract.at(farmAddress);
        farmFactoryInstance         = await utils.tezos.contract.at(farmFactoryAddress);
        mvkTokenInstance            = await utils.tezos.contract.at(mvkTokenAddress);
        lpTokenInstance             = await utils.tezos.contract.at(lpTokenAddress);
        treasuryInstance            = await utils.tezos.contract.at(treasuryAddress);
        doormanInstance             = await utils.tezos.contract.at(doormanAddress);
        lendingControllerInstance   = await utils.tezos.contract.at(lendingControllerAddress);
        mockFa12TokenInstance       = await utils.tezos.contract.at(mockFa12TokenAddress);
        mTokenUsdtInstance          = await utils.tezos.contract.at(mTokenUsdtAddress);

        farmStorage                 = await farmInstance.storage();
        farmFactoryStorage          = await farmFactoryInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        lpTokenStorage              = await lpTokenInstance.storage();
        treasuryStorage             = await treasuryInstance.storage();
        doormanStorage              = await doormanInstance.storage();
        lendingControllerStorage    = await lendingControllerInstance.storage();

        // Make farm factory track the farm
        if(!farmFactoryStorage.trackedFarms.includes(farmAddress)){
            const trackOperation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
            await trackOperation.confirmation();
        }
    });

    beforeEach("storage", async () => {

        farmStorage         = await farmInstance.storage();
        farmFactoryStorage  = await farmFactoryInstance.storage();
        mvkTokenStorage     = await mvkTokenInstance.storage();
        lpTokenStorage      = await lpTokenInstance.storage();

        await signerFactory(tezos, bob.sk);
    })


    describe('%setLoanToken - setup and test lending controller %setLoanToken entrypoint', function () {

        it('admin can set mock FA12 as a loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const setLoanTokenActionType                = "createLoanToken";

                const tokenName                             = "usdt";
                const tokenContractAddress                  = mockFa12TokenAddress;
                const tokenType                             = "fa12";
                const tokenDecimals                         = 6;

                const oracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;

                const mTokenContractAddress                = mTokenUsdtAddress;

                const interestRateDecimals                  = 27;
                const reserveRatio                          = 1000; // 10% reserves (4 decimals)
                const optimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));  // 30% utilisation rate kink
                const baseInterestRate                      = 5  * (10 ** (interestRateDecimals - 2));  // 5%
                const maxInterestRate                       = 25 * (10 ** (interestRateDecimals - 2));  // 25% 
                const interestRateBelowOptimalUtilisation   = 10 * (10 ** (interestRateDecimals - 2));  // 10% 
                const interestRateAboveOptimalUtilisation   = 20 * (10 ** (interestRateDecimals - 2));  // 20%

                const minRepaymentAmount                    = 10000;

                // check if loan token exists
                const checkLoanTokenExists   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                if(checkLoanTokenExists === undefined){

                    const adminSetMockFa12LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(
                        
                        setLoanTokenActionType,

                        tokenName,
                        tokenDecimals,

                        oracleAddress,

                        mTokenContractAddress,
                        
                        reserveRatio,
                        optimalUtilisationRate,
                        baseInterestRate,
                        maxInterestRate,
                        interestRateBelowOptimalUtilisation,
                        interestRateAboveOptimalUtilisation,

                        minRepaymentAmount,

                        // fa12 token type - token contract address
                        tokenType,
                        tokenContractAddress,

                    ).send();
                    await adminSetMockFa12LoanTokenOperation.confirmation();

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
    
                    assert.equal(mockFa12LoanToken.mTokensTotal          , 0);
                    assert.equal(mockFa12LoanToken.mTokenAddress         , mTokenContractAddress);
    
                    assert.equal(mockFa12LoanToken.reserveRatio           , reserveRatio);
                    assert.equal(mockFa12LoanToken.tokenPoolTotal         , 0);
                    assert.equal(mockFa12LoanToken.totalBorrowed          , 0);
                    assert.equal(mockFa12LoanToken.totalRemaining         , 0);
    
                    assert.equal(mockFa12LoanToken.optimalUtilisationRate , optimalUtilisationRate);
                    assert.equal(mockFa12LoanToken.baseInterestRate       , baseInterestRate);
                    assert.equal(mockFa12LoanToken.maxInterestRate        , maxInterestRate);
                    
                    assert.equal(mockFa12LoanToken.interestRateBelowOptimalUtilisation       , interestRateBelowOptimalUtilisation);
                    assert.equal(mockFa12LoanToken.interestRateAboveOptimalUtilisation       , interestRateAboveOptimalUtilisation);
    
                } else {

                    lendingControllerStorage  = await lendingControllerInstance.storage();
                    const mockFa12LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 
                
                    // other variables will be affected by repeated tests
                    assert.equal(mockFa12LoanToken.tokenName              , tokenName);

                }

            } catch(e){
                console.log(e);
            } 
        });
    })

    // 
    // Test: Add Liquidity into Lending Pool
    //
    describe('%addLiquidity', function () {
    
        it('user (bob) can add liquidity for mock FA12 (usdt) token into Lending Controller token pool (30 MockFA12 Tokens) and receive mUSDT tokens', async () => {
            try{

            // init variables
            await signerFactory(tezos, bob.sk);
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
            await signerFactory(tezos, alice.sk);
            const loanTokenName   = "usdt";
            const liquidityAmount = 30000000; // 30 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage                = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage      = await mTokenUsdtInstance.storage();
            
            // get initial alice's Mock FA12 Token balance
            const aliceMockFa12Ledger                   = await mockFa12TokenStorage.ledger.get(alice.pkh);            
            const aliceInitialMockFa12TokenBalance      = aliceMockFa12Ledger == undefined ? 0 : aliceMockFa12Ledger.balance.toNumber();

            // get initial alice's mEurl Token - Mock FA12 Token - balance
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

        it('user (eve) can add liquidity for mock FA12 (usdt) token into Lending Controller token pool (30 MockFA12 Tokens) and receive mUSDT tokens', async () => {
    
            // init variables
            await signerFactory(tezos, eve.sk);
            const loanTokenName = "usdt";
            const liquidityAmount = 30000000; // 30 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage   = await mTokenUsdtInstance.storage();
            
            // get initial eve's Mock FA12 Token balance
            const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

            // get initial eve's mEurl Token - Mock FA12 Token - balance
            const eveMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(eve.pkh);            
            const eveInitialMUsdtTokenTokenBalance    = eveMUsdtTokenLedger == undefined ? 0 : eveMUsdtTokenLedger.toNumber();

            // get initial lending controller's Mock FA12 Token balance
            const lendingControllerMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            const lendingControllerInitialMockFa12TokenBalance   = lendingControllerMockFa12Ledger == undefined ? 0 : lendingControllerMockFa12Ledger.balance.toNumber();

            // get initial lending controller token pool total
            const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
            const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

            // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
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

            // eve deposits mock FA12 tokens into lending controller token pool
            const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                loanTokenName,
                liquidityAmount, 
            ).send();
            await eveDepositTokenOperation.confirmation();

            // get updated storages
            const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
            const updatedMockFa12TokenStorage             = await mockFa12TokenInstance.storage();
            const updatedMUsdtTokenTokenStorage  = await mTokenUsdtInstance.storage();

            // check new balance for loan token pool total
            const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
            assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

            // check Eve's Mock FA12 Token balance
            const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

            // check Eve's mUsdt Token Token balance
            const updatedEveMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(eve.pkh);            
            assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance + liquidityAmount);        

        });

    });


    describe("Non-initialized farm", function() {

        describe("%deposit", function() {
            it('User should not be able to deposit in a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const farmInit          = farmStorage.init;
                    const amountToDeposit   = 2000000;
    
                    if(farmInit == false){

                        // Update operators for farm
                        updateOperatorsOperation = await updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                        await updateOperatorsOperation.confirmation();
        
                        // Operation
                        await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

                        // Assertion
                        assert.equal(farmInit, false);

                    }

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%withdraw", function() {
            it('User should not be able to withdraw from a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmInit          = farmStorage.init;
                    const amountToWithdraw  = 1000000;
    
                    // Operation
                    if(farmInit == false){
                        await chai.expect(farmInstance.methods.withdraw(amountToWithdraw).send()).to.be.rejected;
                        // Assertion
                        assert.equal(farmInit, false);
                    }

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe("%claim", function() {
            it('User should not be able to claim in a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmInit          = farmStorage.init;
    
                    // Operation
                    if(farmInit == false){
                        await chai.expect(farmInstance.methods.claim([bob.pkh]).send()).to.be.rejected;
                        
                        // Assertion
                        assert.equal(farmInit, false);
                    }

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })

    })


    describe("Initialized farm", function() {
        describe('%setAdmin', function() {
            it('Admin should be able to set a new admin', async() => {
                try{

                    // Initial values
                    const previousAdmin = farmStorage.admin;

                    // Create a transaction for initiating a farm
                    const operation = await farmInstance.methods.setAdmin(alice.pkh).send();
                    await operation.confirmation();

                    // Final values
                    farmStorage = await farmInstance.storage();

                    // Assertion
                    assert.strictEqual(farmStorage.admin,alice.pkh);
                    assert.strictEqual(previousAdmin,bob.pkh);

                    // Reset admin
                    await signerFactory(tezos, alice.sk);
                    const resetOperation = await farmInstance.methods.setAdmin(bob.pkh).send();
                    await resetOperation.confirmation();

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Non-admin should not be able to set a new admin', async() => {
                try{
                    
                    // Create a transaction for initiating a farm
                    await signerFactory(tezos, eve.sk)
                    const operation = farmInstance.methods.setAdmin(bob.pkh);
                    await chai.expect(operation.send()).to.be.rejected;

                    // Final values
                    farmStorage = await farmInstance.storage();

                    // Assertion
                    assert.strictEqual(farmStorage.admin,bob.pkh)

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        })

        describe('%initFarm', function() {
            it('User should not be able to initialize a farm', async () => {
                try{
                    // Switch signer to Alice
                    await signerFactory(tezos, alice.sk);

                    // Operation
                    await chai.expect(farmInstance.methods.initFarm(
                        12000,
                        100,
                        false,
                        false
                    ).send()).to.be.rejected;

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should not be able to initialize without a proper duration', async () => {
                try{
                    // Operation
                    await chai.expect(farmInstance.methods.initFarm(
                        0,
                        100,
                        false,
                        false
                    ).send()).to.be.rejected;

                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should be able to initialize a farm', async () => {
                try{
                    
                    farmStorage    = await farmInstance.storage();
                    
                    if(farmStorage.open == false){
                        // Operation
                        const operation = await farmInstance.methods.initFarm(
                            12000,
                            100,
                            false,
                            false
                        ).send();
                        await operation.confirmation()

                        // Final values
                        farmStorage    = await farmInstance.storage();
                        
                        // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                        // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())

                        // Assertions
                        assert.equal(farmStorage.open, true);
                        assert.equal(farmStorage.init, true);
                        assert.equal(farmStorage.config.plannedRewards.totalBlocks, 12000);
                        assert.equal(farmStorage.config.plannedRewards.currentRewardPerBlock, 100);
                    }
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })

            it('Admin should not be able to initialize the same farm twice', async () => {
                try{
                    // Operation
                    await chai.expect(farmInstance.methods.initFarm(
                        12000,
                        100,
                        false,
                        false
                    ).send()).to.be.rejected;
                }catch(e){
                    console.dir(e, {depth: 5})
                }
            })
        });

        describe('%deposit', function() {
            
            it('User (bob) should be able to deposit LP Tokens into a farm', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const lpBalanceStart    = await lpTokenStorage.ledger.get(bob.pkh);
                    
                    const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    const amountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpBalanceEnd      = await lpTokenStorage.ledger.get(bob.pkh);

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
                    assert.equal(lpBalanceEnd, lpBalanceStart - amountToDeposit);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User (alice) should be able to deposit LP Tokens into a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, alice.sk)
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const lpBalanceStart    = await lpTokenStorage.ledger.get(alice.pkh);
                    
                    const depositRecord     = await farmStorage.depositorLedger.get(alice.pkh);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    const amountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, alice.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(alice.pkh);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpBalanceEnd      = await lpTokenStorage.ledger.get(alice.pkh);

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
                    assert.equal(lpBalanceEnd, lpBalanceStart - amountToDeposit);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Multiple users should be able to deposit LP Tokens into a farm', async () => {
                try{

                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const lpBalanceStart    = await lpTokenStorage.ledger.get(bob.pkh);
                    
                    const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    const amountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpBalanceEnd      = await lpTokenStorage.ledger.get(bob.pkh);

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
                    assert.equal(lpBalanceEnd, lpBalanceStart - amountToDeposit);

                    await signerFactory(tezos, alice.sk)
                    lpTokenStorage           = await lpTokenInstance.storage();
                    farmStorage              = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const aliceLpBalanceStart    = await lpTokenStorage.ledger.get(alice.pkh);
                    
                    const aliceDepositRecord     = await farmStorage.depositorLedger.get(alice.pkh);
                    const aliceDepositBalance    = aliceDepositRecord === undefined ? 0 : aliceDepositRecord.balance.toNumber();
                    const aliceAmountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, alice.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(aliceAmountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const aliceDepositRecordEnd  = await farmStorage.depositorLedger.get(alice.pkh);
                    const aliceDepositBalanceEnd = aliceDepositRecordEnd === undefined ? 0 : aliceDepositRecordEnd.balance.toNumber();
                    const aliceLpBalanceEnd      = await lpTokenStorage.ledger.get(alice.pkh);

                    // Assertions
                    assert.equal(aliceDepositBalanceEnd, aliceDepositBalance + aliceAmountToDeposit);
                    assert.equal(aliceLpBalanceEnd, aliceLpBalanceStart - aliceAmountToDeposit);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to able to deposit more LP Tokens than he has', async () => {
                try{
                    // Initial values
                    lpTokenStorage                  = await lpTokenInstance.storage();
                    farmStorage                     = await farmInstance.storage();
                    
                    const lpBalanceStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const amountToDeposit   = lpBalanceStart + 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5})
                } 
            })


        })

        describe('%withdraw', function() {
            it('User (bob) should be able to withdraw LP Tokens from a farm', async () => {
                try{

                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedgerStart      = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalance : number = lpLedgerStart.toNumber();

                    const depositRecord      = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalance : number = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    
                    const amountToWithdraw : number = 100000;

                    // const bobWithdrawParam        = await farmInstance.methods.withdraw(amountToWithdraw).toTransferParams();
                    // const bobEstimate             = await utils.tezos.estimate.transfer(bobWithdrawParam);
                    // console.log("BOB Withdraw Farm MToken ESTIMATION: ", bobEstimate);
                    // console.log("BOB FARM MTOKEN Withdraw Total Cost Estimate: ", bobEstimate.totalCost);

                    // Operation
                    const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalanceEnd : number = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
                    const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalanceEnd : number = lpLedgerEnd.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - amountToWithdraw);
                    assert.equal(lpBalanceEnd, (lpBalance + amountToWithdraw));

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User (alice) should be able to withdraw LP Tokens from a farm', async () => {
                try{

                    // Initial values
                    await signerFactory(tezos, alice.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedgerStart      = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalance : number = lpLedgerStart.toNumber();

                    const depositRecord      = await farmStorage.depositorLedger.get(alice.pkh);
                    const depositBalance : number = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    
                    const amountToWithdraw : number = 10000;

                    // Operation
                    const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(alice.pkh);
                    const depositBalanceEnd : number = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
                    const lpLedgerEnd       = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalanceEnd : number = lpLedgerEnd.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - amountToWithdraw);
                    assert.equal(lpBalanceEnd, (lpBalance + amountToWithdraw));

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to withdraw LP Tokens from a farm if it never deposited into it', async () => {
                try{

                    // Initial values
                    await signerFactory(tezos, eve.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const amountToWithdraw  = 1;

                    // Operation
                    await chai.expect(farmInstance.methods.withdraw(amountToWithdraw).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });


            it('Multiple users should be able to withdraw tokens', async () => {
                try{

                    // Initial values
                    lpTokenStorage                  = await lpTokenInstance.storage();
                    farmStorage                     = await farmInstance.storage();
                    const firstLpLedgerStart        = await lpTokenStorage.ledger.get(bob.pkh);
                    const firstLpBalance            = firstLpLedgerStart.toNumber();
                    
                    const firstDepositRecord        = await farmStorage.depositorLedger.get(bob.pkh);
                    const firstDepositBalance       = firstDepositRecord === undefined ? 0 : firstDepositRecord.balance.toNumber();
                    
                    const firstAmountToWithdraw     = 500000;
                    
                    const secondLpLedgerStart       = await lpTokenStorage.ledger.get(alice.pkh);
                    const secondLpBalance           = secondLpLedgerStart.toNumber();

                    const secondDepositRecord       = await farmStorage.depositorLedger.get(alice.pkh);
                    const secondDepositBalance      = secondDepositRecord === undefined ? 0 : secondDepositRecord.balance.toNumber();
                    
                    const secondAmountToWithdraw    = 4;

                    await signerFactory(tezos, bob.sk)
                    var withdrawOperation            = await farmInstance.methods.withdraw(firstAmountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    await signerFactory(tezos, bob.sk)
                    farmStorage                     = await farmInstance.storage();
                    lpTokenStorage                  = await lpTokenInstance.storage();
                    
                    const firstDepositRecordEnd     = await farmStorage.depositorLedger.get(bob.pkh);
                    const firstDepositBalanceEnd    = firstDepositRecordEnd === undefined ? 0 : firstDepositRecordEnd.balance.toNumber();
                    
                    const firstLpLedgerEnd          = await lpTokenStorage.ledger.get(bob.pkh);
                    const firstLpBalanceEnd         = firstLpLedgerEnd.toNumber();

                    // Operations
                    await signerFactory(tezos, alice.sk)
                    var withdrawOperation            = await farmInstance.methods.withdraw(secondAmountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    await signerFactory(tezos, alice.sk)
                    farmStorage                     = await farmInstance.storage();
                    lpTokenStorage                  = await lpTokenInstance.storage();

                    const secondDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);
                    const secondDepositBalanceEnd   = secondDepositRecordEnd === undefined ? 0 : secondDepositRecordEnd.balance.toNumber();
                    
                    const secondLpLedgerEnd         = await lpTokenStorage.ledger.get(alice.pkh);
                    const secondLpBalanceEnd        = secondLpLedgerEnd.toNumber();

                    // Assertions
                    assert.equal(firstDepositBalanceEnd, firstDepositBalance - firstAmountToWithdraw);
                    assert.equal(firstLpBalanceEnd, firstLpBalance + firstAmountToWithdraw);
                    
                    assert.equal(secondDepositBalanceEnd, secondDepositBalance - secondAmountToWithdraw);
                    assert.equal(secondLpBalanceEnd, secondLpBalance + secondAmountToWithdraw);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to withdraw more LP Tokens than it deposited', async () => {
                try{

                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalance         = lpLedgerStart === undefined ? 0 : lpLedgerStart.toNumber();

                    // const farmLpLedgerStart     = await lpTokenStorage.ledger.get(farmAddress);
                    // const farmLpBalance         = farmLpLedgerStart === undefined ? 0 : farmLpLedgerStart.toNumber();

                    // console.log('bob lpLedgerStart');
                    // console.log(lpLedgerStart);

                    // console.log('farm lpLedgerStart');
                    // console.log(farmLpLedgerStart);

                    const depositRecord     = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();

                    // console.log('bob depositRecord');
                    // console.log(depositRecord);
                    
                    const excessAmount      = 100;
                    const amountToWithdraw  = depositBalance + excessAmount;

                    // Operation
                    const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
                    const lpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
                    const lpBalanceEnd      = lpLedgerEnd === undefined ? 0 : lpLedgerEnd.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - depositBalance);
                    assert.equal(lpBalanceEnd, lpBalance + amountToWithdraw - excessAmount);

                    // reset - deposit some lpToken into farm again for subsequent tests

                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const amountToDeposit   = 10000;

                    await signerFactory(tezos, bob.sk);
                    const updateBobOperatorsOperation = await lpTokenInstance.methods.update_operators([
                    {
                        add_operator: {
                            owner: bob.pkh,
                            operator: farmAddress,
                            token_id: 0,
                        },
                    }])
                    .send()
                    await updateBobOperatorsOperation.confirmation();

                    // Operation
                    const depositOperation          = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        });



        describe('%claim', function() {
            it('User should not be able to claim in a farm if it never deposited into it', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, eve.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();

                    // Operation
                    await chai.expect(farmInstance.methods.claim([eve.pkh]).send()).to.be.rejected;
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('User should not be able to claim in a farm if it has no rewards to claim', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, mallory.sk);
                    lpTokenStorage              = await lpTokenInstance.storage();
                    farmStorage                 = await farmInstance.storage();
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await wait(2 * blockTime * 1000);
                    // const firstClaimOperation   = await farmInstance.methods.claim([mallory.pkh]).send();
                    // await firstClaimOperation.confirmation();
                    await chai.expect(farmInstance.methods.claim([mallory.pkh]).send()).to.be.rejected;

                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to claim rewards from a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await wait(2 * blockTime * 1000);
                    const firstClaimOperation   = await farmInstance.methods.claim([bob.pkh]).send();
                    await firstClaimOperation.confirmation();

                    // Final values
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // console.log(`userSMVKBalance: ${userSMVKBalance}`);
                    // console.log(`userSMVKBalanceEnd: ${userSMVKBalanceEnd}`);

                    // Assertions
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)
                    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('User should be able to withdraw all its LP Tokens then claim the remaining rewards', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();
                    const userLpLedgerStart     = await lpTokenStorage.ledger.get(bob.pkh);
                    const userLpBalance         = userLpLedgerStart;
                    
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    
                    const userDepositRecordEnd  = await farmStorage.depositorLedger.get(bob.pkh);
                    const userDepositBalanceEnd = userDepositRecordEnd === undefined ? 0 : userDepositRecordEnd.balance.toNumber();
                    
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await wait(12 * blockTime * 1000);
                    const withdrawOperation     = await farmInstance.methods.withdraw(userDepositBalanceEnd).send();
                    await withdrawOperation.confirmation();
                    
                    const firstClaimOperation   = await farmInstance.methods.claim([bob.pkh]).send();
                    await firstClaimOperation.confirmation();

                    // Final values
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();
                    const userLpLedgerEnd       = await lpTokenStorage.ledger.get(bob.pkh);
                    const userLpBalanceEnd      = userLpLedgerEnd;
                    
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // console.log(`userSMVKBalance: ${userSMVKBalance}`);
                    // console.log(`userSMVKBalanceEnd: ${userSMVKBalanceEnd}`);

                    // console.log(`userLpBalance: ${userLpBalance}`);
                    // console.log(`userLpBalanceEnd: ${userLpBalanceEnd}`);

                    // Assertions
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)
                    assert.notEqual(userLpBalanceEnd, userLpBalance)
                    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })
        })
        
        describe("%pauseAll", async () => {

            beforeEach("Set signer to admin", async () => {
                await signerFactory(tezos, bob.sk)
            });

            it('Admin should be able to call the entrypoint and pause all entrypoints in the contract', async () => {
                try{
                    // Initial Values
                    farmStorage       = await farmInstance.storage();
                    for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
                        assert.equal(value, false);
                    }

                    // Operation
                    var pauseOperation = await farmInstance.methods.pauseAll().send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage       = await farmInstance.storage();
                    for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
                        assert.equal(value, true);
                    }
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.pauseAll().send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%unpauseAll", async () => {

            beforeEach("Set signer to admin", async () => {
                await signerFactory(tezos, bob.sk)
            });

            it('Admin should be able to call the entrypoint and unpause all entrypoints in the contract', async () => {
                try{
                    // Initial Values
                    farmStorage       = await farmInstance.storage();
                    for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
                        assert.equal(value, true);
                    }

                    // Operation
                    var pauseOperation = await farmInstance.methods.unpauseAll().send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage       = await farmInstance.storage();
                    for (let [key, value] of Object.entries(farmStorage.breakGlassConfig)){
                        assert.equal(value, false);
                    }
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.unpauseAll().send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe("%togglePauseEntrypoint", async () => {
            
            beforeEach("Set signer to admin", async () => {
                await signerFactory(tezos, bob.sk)
            });

            it('Admin should be able to call the entrypoint and pause/unpause the deposit entrypoint', async () => {
                try{
                    // Initial Values
                    farmStorage         = await farmInstance.storage();
                    const initState     = farmStorage.breakGlassConfig.depositIsPaused;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("deposit", true).send();
                    await pauseOperation.confirmation();

                    // Mid values
                    farmStorage         = await farmInstance.storage();
                    const midState      = farmStorage.breakGlassConfig.depositIsPaused;
                    const lpLedgerStart = await lpTokenStorage.ledger.get(bob.pkh);
                    const testAmount    = 1;

                    // Update operators for farm
                    await signerFactory(tezos, bob.sk);
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    await chai.expect(farmInstance.methods.deposit(testAmount).send()).to.be.rejected;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("deposit", false).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage         = await farmInstance.storage();
                    const endState      = farmStorage.breakGlassConfig.depositIsPaused;

                    const testOperation = await farmInstance.methods.deposit(testAmount).send();
                    await testOperation.confirmation();

                    // Assertions
                    assert.equal(initState, false)
                    assert.equal(midState, true)
                    assert.equal(endState, false)

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Admin should be able to call the entrypoint and pause/unpause the withdraw entrypoint', async () => {
                try{
                    // Initial Values
                    farmStorage         = await farmInstance.storage();
                    const initState     = farmStorage.breakGlassConfig.withdrawIsPaused;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("withdraw", true).send();
                    await pauseOperation.confirmation();

                    // Mid values
                    farmStorage         = await farmInstance.storage();
                    const midState      = farmStorage.breakGlassConfig.withdrawIsPaused;
                    const testAmount    = 1;

                    // Test operation
                    await chai.expect(farmInstance.methods.withdraw(testAmount).send()).to.be.rejected;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("withdraw", false).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage         = await farmInstance.storage();
                    const endState      = farmStorage.breakGlassConfig.withdrawIsPaused;

                    // Test operation
                    const testOperation = await farmInstance.methods.withdraw(testAmount).send();
                    await testOperation.confirmation();

                    // Assertions
                    assert.equal(initState, false)
                    assert.equal(midState, true)
                    assert.equal(endState, false)

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Admin should be able to call the entrypoint and pause/unpause the claim entrypoint', async () => {
                try{
                    // Initial Values
                    farmStorage         = await farmInstance.storage();
                    const initState     = farmStorage.breakGlassConfig.claimIsPaused;
                    const blockTime     = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("claim", true).send();
                    await pauseOperation.confirmation();

                    // Mid values
                    farmStorage         = await farmInstance.storage();
                    const midState      = farmStorage.breakGlassConfig.claimIsPaused;

                    // Test operation
                    await wait(2 * blockTime * 1000);
                    await chai.expect(farmInstance.methods.claim([bob.pkh]).send()).to.be.rejected;

                    // Operation
                    var pauseOperation  = await farmInstance.methods.togglePauseEntrypoint("claim", false).send();
                    await pauseOperation.confirmation();

                    // Final values
                    farmStorage         = await farmInstance.storage();
                    const endState      = farmStorage.breakGlassConfig.claimIsPaused;

                    // Test operation
                    await wait(2 * blockTime * 1000);
                    const testOperation = await farmInstance.methods.claim([bob.pkh]).send();
                    await testOperation.confirmation();

                    // Assertions
                    assert.equal(initState, false)
                    assert.equal(midState, true)
                    assert.equal(endState, false)

                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });

            it('Non-admin should not be able to call the entrypoint', async () => {
                try{
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.togglePauseEntrypoint("deposit", true).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                }
            });
        })

        describe('%updateConfig', function() {

            it('Admin should be able to force the rewards to come from transfers instead of minting', async () => {
                try{
                    // Initial values
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    mvkTokenStorage         = await mvkTokenInstance.storage();
                    const mvkTotalSupply    = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupply   = await mvkTokenStorage.ledger.get(doormanAddress);
                    
                    const toggleTransfer    = farmStorage.config.forceRewardFromTransfer;
                    const blockTime         = farmStorage.minBlockTimeSnapshot.toNumber();
                    const amountToDeposit   = 10000;

                    // Approval operation
                    await signerFactory(tezos, bob.sk);
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation - deposit amount so user balance will be greater than zero
                    depositOperation  = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Wait at least one block before claiming rewards
                    await wait(12 * blockTime * 1000);

                    farmStorage                    = await farmInstance.storage();
                    const userDepositRecordMid     = await farmStorage.depositorLedger.get(bob.pkh);
                    const userDepositBalanceMid    = userDepositRecordMid === undefined ? 0 : userDepositRecordMid.balance.toNumber();

                    // First claim operation - sMVK rewards should be minted (hence increase in sMVK total supply)
                    var claimOperation  = await farmInstance.methods.claim([bob.pkh]).send();
                    await claimOperation.confirmation();

                    // Updated values
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const mvkTotalSupplyFirstUpdate     = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupplyFirstUpdate    = (await mvkTokenStorage.ledger.get(doormanAddress)).toNumber();
                    const treasuryFirstUpdate           = (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber();

                    // Operation  - set forceRewardFromTransfer to TRUE
                    const firstToggleOperation      = await farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send();
                    await firstToggleOperation.confirmation();

                    // Updated values
                    farmStorage                     = await farmInstance.storage();
                    const toggleTransferFirstUpdate = farmStorage.config.forceRewardFromTransfer;

                    // Do another claim - sMVK rewards should be transferred from Farm Treasury
                    await wait(12 * blockTime * 1000);
                    claimOperation = await farmInstance.methods.claim([bob.pkh]).send();
                    await claimOperation.confirmation();

                    // Updated values
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const mvkTotalSupplySecondUpdate    = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupplySecondUpdate   = (await mvkTokenStorage.ledger.get(doormanAddress)).toNumber();
                    const treasurySecondUpdate          = (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber();

                    // Toggle back to mint 
                    const secondToggleOperation = await farmInstance.methods.updateConfig(0, "configForceRewardFromTransfer").send();
                    await secondToggleOperation.confirmation();

                    // Updated values
                    farmStorage = await farmInstance.storage();
                    const toggleTransferSecondUpdate = farmStorage.config.forceRewardFromTransfer;

                    //Do another claim
                    await wait(12 * blockTime * 1000);
                    claimOperation = await farmInstance.methods.claim([bob.pkh]).send();
                    await claimOperation.confirmation();

                    // Updated values
                    mvkTokenStorage                     = await mvkTokenInstance.storage();
                    const mvkTotalSupplyThirdUpdate     = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupplyThirdUpdate    = (await mvkTokenStorage.ledger.get(doormanAddress)).toNumber();
                    const treasuryThirdUpdate           = (await mvkTokenStorage.ledger.get(treasuryAddress)).toNumber();

                    // Assertions
                    assert.notEqual(mvkTotalSupply,mvkTotalSupplyFirstUpdate);
                    assert.equal(mvkTotalSupplySecondUpdate,mvkTotalSupplyFirstUpdate);
                    assert.notEqual(mvkTotalSupplySecondUpdate,mvkTotalSupplyThirdUpdate);

                    assert.notEqual(toggleTransferFirstUpdate,toggleTransfer);
                    assert.equal(toggleTransfer,toggleTransferSecondUpdate);

                    assert.notEqual(smvkTotalSupply,smvkTotalSupplyFirstUpdate);
                    assert.notEqual(smvkTotalSupply,smvkTotalSupplySecondUpdate);
                    assert.notEqual(smvkTotalSupplyFirstUpdate,smvkTotalSupplySecondUpdate);
                    assert.notEqual(smvkTotalSupplySecondUpdate,smvkTotalSupplyThirdUpdate);

                    // console.log("MVK total supply at beginning: ",mvkTotalSupply)
                    // console.log("MVK total supply after first mint: ",mvkTotalSupplyFirstUpdate)
                    // console.log("MVK total supply after transfer: ",mvkTotalSupplySecondUpdate)
                    // console.log("MVK total supply after second mint: ",mvkTotalSupplyThirdUpdate)
                    // console.log("Transfer forced after first toggling: ",toggleTransferFirstUpdate)
                    // console.log("Transfer forced after second toggling: ",toggleTransferSecondUpdate)
                    // console.log("SMVK total supply after first mint: ", smvkTotalSupplyFirstUpdate)
                    // console.log("SMVK total supply after transfer: ", smvkTotalSupplySecondUpdate)
                    // console.log("SMVK total supply after second mint: ", smvkTotalSupplyThirdUpdate)
                    // console.log("Treasury after first mint: ",treasuryFirstUpdate)
                    // console.log("Treasury after transfer: ",treasurySecondUpdate)
                    // console.log("Treasury after second mint: ",treasuryThirdUpdate)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Admin should be able to increase the rewards of a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    farmStorage                     = await farmInstance.storage();
                    const currentTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const currentRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();
                    const newRewards                = 150;

                    // Operation
                    const operation = await farmInstance.methods.updateConfig(newRewards, "configRewardPerBlock").send();
                    await operation.confirmation()

                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const updatedTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const updatedRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();

                    // Assertions
                    assert.equal(updatedRewardsPerBlock, newRewards);
                    assert.equal(updatedRewardsPerBlock > currentRewardsPerBlock, true);
                    assert.notEqual(currentRewardsPerBlock, updatedRewardsPerBlock);
                    assert.notEqual(currentTotalRewards, updatedTotalRewards);

                    // Logs
                    // console.log("Initial :")
                    // console.log("  Total rewards:", currentTotalRewards)
                    // console.log("  Rewards per block:", currentRewardsPerBlock)
                    // console.log("Updated :")
                    // console.log("  Total rewards:", updatedTotalRewards)
                    // console.log("  Rewards per block:", updatedRewardsPerBlock)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Admin should be able to decrease the rewards of a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    farmStorage                     = await farmInstance.storage();
                    const currentTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const currentRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();
                    const newRewards                = 120;

                    // Operation
                    const operation = await farmInstance.methods.updateConfig(newRewards, "configRewardPerBlock").send();
                    await operation.confirmation()

                    // Final values
                    farmStorage                     = await farmInstance.storage();
                    const updatedTotalRewards       = farmStorage.config.plannedRewards.totalRewards.toNumber();
                    const updatedRewardsPerBlock    = farmStorage.config.plannedRewards.currentRewardPerBlock.toNumber();

                    // Assertions
                    assert.equal(updatedRewardsPerBlock, newRewards);
                    assert.equal(updatedRewardsPerBlock > currentRewardsPerBlock, false);
                    assert.notEqual(currentRewardsPerBlock, updatedRewardsPerBlock);
                    assert.notEqual(currentTotalRewards, updatedTotalRewards);

                    // Logs
                    // console.log("Initial :")
                    // console.log("  Total rewards:", currentTotalRewards)
                    // console.log("  Rewards per block:", currentRewardsPerBlock)
                    // console.log("Updated :")
                    // console.log("  Total rewards:", updatedTotalRewards)
                    // console.log("  Rewards per block:", updatedRewardsPerBlock)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Non-admin should not be able to force the rewards to come from transfers instead of minting', async () => {
                try{
                    // Toggle to transfer
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.updateConfig(1, "configForceRewardFromTransfer").send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        });

        describe('%closeFarm', function() {

            it('Non-admin should not be able to close a farm', async () => {
                try{
                    // Toggle to transfer
                    await signerFactory(tezos, alice.sk);
                    await chai.expect(farmInstance.methods.closeFarm().send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('Admin should be able to close a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    farmStorage             = await farmInstance.storage();
                    const farmOpen          = farmStorage.open;
                    
                    // Operation
                    const closeOperation    = await farmInstance.methods.closeFarm().send();
                    await closeOperation.confirmation();

                    // Final values
                    farmStorage             = await farmInstance.storage();
                    const farmOpenEnd       = farmStorage.open;

                    // Assertions
                    assert.equal(farmOpenEnd, false);
                    assert.notEqual(farmOpenEnd, farmOpen);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not be able to deposit in a closed farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, bob.sk);
                    lpTokenStorage          = await lpTokenInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmOpen          = farmStorage.open;
                    const amountToDeposit   = 1;

                    // Approval operation
                    await signerFactory(tezos, bob.sk);
                    updateOperatorsOperation = await updateOperators(lpTokenInstance, bob.pkh, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();
                    
                    // Operation
                    await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

                    // Assertions
                    assert.equal(farmOpen, false);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should be able to claim in a closed farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, eve.sk);
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    const farmOpen              = farmStorage.open;
                    
                    // Operation
                    await wait(10 * blockTime * 1000);
                    const claimOperation        = await farmInstance.methods.claim([bob.pkh]).send();
                    await claimOperation.confirmation();

                    // Final values
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(bob.pkh);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // Assertions
                    assert.equal(farmOpen, false);
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should not see any increase in rewards even if it still has LP Token deposited in the farm', async () => {
                try{

                    await signerFactory(tezos, alice.sk);
                    farmStorage                 = await farmInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();
                    
                    const lpLedgerStart         = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalance             = lpLedgerStart.toNumber();
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    const farmOpen                  = farmStorage.open;
                    const initialAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare;
                    
                    // Operation - let alice claim her eligible rewards 
                    await wait(4 * blockTime * 1000);
                    const claimOperation = await farmInstance.methods.claim([alice.pkh]).send();
                    await claimOperation.confirmation();

                    // Update storage
                    doormanStorage                = await doormanInstance.storage();
                    farmStorage                   = await farmInstance.storage();

                    var updatedAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare; 

                    const userSMVKLedger          = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                    const userSMVKBalance         = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber();

                    var userDepositRecord     = await farmStorage.depositorLedger.get(alice.pkh);

                    // Assertions - there should be no increase in accumulated rewards per share for the farm
                    assert.equal(farmOpen, false);
                    assert.equal(initialAccRewardsPerShare.toNumber(), updatedAccRewardsPerShare.toNumber());

                    // Second operation to check no change in sMVK balance
                    await wait(4 * blockTime * 1000);
                    const secondClaimOperation = await farmInstance.methods.claim([alice.pkh]).send();
                    await secondClaimOperation.confirmation();

                    // Update storage
                    doormanStorage                = await doormanInstance.storage();
                    farmStorage                   = await farmInstance.storage();

                    const userDepositRecordEnd    = await farmStorage.depositorLedger.get(alice.pkh);

                    const userSMVKLedgerEnd       = await doormanStorage.userStakeBalanceLedger.get(alice.pkh);
                    const userSMVKBalanceEnd      = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // Assertions - user should have no change in unclaimed rewards, claimed rewards and participation rewards per share
                    assert.equal(farmOpen, false);
                    assert.equal(userSMVKBalanceEnd, userSMVKBalance);
                    
                    assert.equal(userDepositRecordEnd.unclaimedRewards.toNumber(), userDepositRecord.unclaimedRewards.toNumber());
                    assert.equal(userDepositRecordEnd.claimedRewards.toNumber(), userDepositRecord.claimedRewards.toNumber());
                    assert.equal(userDepositRecordEnd.participationRewardsPerShare.toNumber(), userDepositRecord.participationRewardsPerShare.toNumber());

                    assert.notEqual(lpBalance, 0);


                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('User should be able to withdraw in a closed farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, alice.sk);
                    farmStorage                 = await farmInstance.storage();
                    lpTokenStorage              = await lpTokenInstance.storage();
                    const lpLedgerStart         = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalance             = lpLedgerStart === undefined ? 0 : lpLedgerStart.toNumber();
                    const amountToWithdraw      = 1;
                    const farmOpen              = farmStorage.open;
                    
                    // Operation
                    const withdrawOperation     = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    lpTokenStorage              = await lpTokenInstance.storage();
                    const lpLedgerStartEnd      = await lpTokenStorage.ledger.get(alice.pkh);
                    const lpBalanceEnd          = lpLedgerStartEnd.balance;

                    // Assertions
                    assert.equal(farmOpen, false);
                    assert.notEqual(lpBalanceEnd, lpBalance)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        })
    })

});
