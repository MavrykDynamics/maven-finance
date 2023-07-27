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
    wait,
    getStorageMapValue,
    fa2Transfer,
    mistakenTransferFa2Token,
    updateWhitelistContracts,
    updateGeneralContracts
} from './helpers/helperFunctions'

// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Farm mToken", async () => {
    
    var utils: Utils;
    let tezos 

    let userOne;
    let userOneSk;

    let userTwo;
    let userTwoSk;

    let userThree;
    let userThreeSk;

    let admin;
    let adminSk;
    let tokenId = 0;

    let mavrykFa2TokenAddress;
    let mavrykFa2TokenInstance;
    let mavrykFa2TokenStorage;

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
    let mTokenUsdtStorage;

    let depositOperation
    let compoundOperation
    let updateOperatorsOperation

    // housekeeping operations
    let setAdminOperation;
    let setGovernanceOperation;
    let resetAdminOperation;
    let updateWhitelistContractsOperation;
    let updateGeneralContractsOperation;
    let mistakenTransferOperation;
    let pauseOperation;
    let pauseAllOperation;
    let unpauseOperation;
    let unpauseAllOperation;
    let transferOperation

    // contract map value
    let storageMap;
    let contractMapKey;
    let initialContractMapValue;
    let updatedContractMapValue;

    before("setup", async () => {
        
        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos

        admin       = bob.pkh
        adminSk     = bob.sk

        userOne     = eve.pkh
        userOneSk   = eve.sk

        userTwo     = alice.pkh
        userTwoSk   = alice.sk

        userThree   = mallory.pkh
        userThreeSk = mallory.sk

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
        treasuryInstance            = await utils.tezos.contract.at(treasuryAddress);
        doormanInstance             = await utils.tezos.contract.at(doormanAddress);
        lendingControllerInstance   = await utils.tezos.contract.at(lendingControllerAddress);
        mockFa12TokenInstance       = await utils.tezos.contract.at(mockFa12TokenAddress);
        mTokenUsdtInstance          = await utils.tezos.contract.at(mTokenUsdtAddress);

        farmStorage                 = await farmInstance.storage();
        farmFactoryStorage          = await farmFactoryInstance.storage();
        mvkTokenStorage             = await mvkTokenInstance.storage();
        treasuryStorage             = await treasuryInstance.storage();
        doormanStorage              = await doormanInstance.storage();
        lendingControllerStorage    = await lendingControllerInstance.storage();
        mTokenUsdtStorage           = await mTokenUsdtInstance.storage();

        // for mistaken transfers
        mavrykFa2TokenAddress   = contractDeployments.mavrykFa2Token.address 
        mavrykFa2TokenInstance  = await utils.tezos.contract.at(mavrykFa2TokenAddress);
        mavrykFa2TokenStorage   = await mavrykFa2TokenInstance.storage();

        // Make farm factory track the farm
        if(!farmFactoryStorage.trackedFarms.includes(farmAddress)){
            const trackOperation = await farmFactoryInstance.methods.trackFarm(farmAddress).send();
            await trackOperation.confirmation();
        }

        // ----------------------------------------------
        // Loan token setup
        // ----------------------------------------------

        const setLoanTokenActionType                = "createLoanToken";

        const tokenName                             = "usdt";
        const tokenContractAddress                  = mockFa12TokenAddress;
        const tokenType                             = "fa12";
        const tokenDecimals                         = 6;

        const oracleAddress                         = contractDeployments.mockUsdMockFa12TokenAggregator.address;

        const mTokenContractAddress                 = mTokenUsdtAddress;

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

            assert.equal(mockFa12LoanToken.rawMTokensTotalSupply , 0);
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
    });

    beforeEach("storage", async () => {

        farmStorage         = await farmInstance.storage();
        farmFactoryStorage  = await farmFactoryInstance.storage();
        mvkTokenStorage     = await mvkTokenInstance.storage();
        mTokenUsdtStorage      = await mTokenUsdtInstance.storage();

        await signerFactory(tezos, adminSk);
    })

    // 
    // Test: Add Liquidity into Lending Pool
    //
    describe('%addLiquidity', function () {
    
        it('user (bob) can add liquidity for mock FA12 (usdt) token into Lending Controller token pool (30 MockFA12 Tokens) and receive mUSDT tokens', async () => {
            try{

            // init variables
            await signerFactory(tezos, adminSk);
            const loanTokenName   = "usdt";
            const liquidityAmount = 30000000; // 30 Mock FA12 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();
            
            // get mock fa12 token storage and lp token pool mock fa12 token storage
            const mockFa12TokenStorage                = await mockFa12TokenInstance.storage();
            const mTokenPoolMockFa12TokenStorage      = await mTokenUsdtInstance.storage();
            
            // get initial bob's Mock FA12 Token balance
            const bobMockFa12Ledger                   = await mockFa12TokenStorage.ledger.get(admin);            
            const bobInitialMockFa12TokenBalance      = bobMockFa12Ledger == undefined ? 0 : bobMockFa12Ledger.balance.toNumber();

            // get initial bob's mToken - Mock FA12 Token (USDT) - balance
            compoundOperation                         = await mTokenUsdtInstance.methods.compound([admin]).send();
            await compoundOperation.confirmation();
            const bobMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(admin);            
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
            const updatedBobMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(admin);            
            assert.equal(updatedBobMockFa12Ledger.balance, bobInitialMockFa12TokenBalance - liquidityAmount);

            // check Lending Controller's Mock FA12 Token Balance
            const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
            assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

            // check Bob's mUsdt Token Token balance
            const updatedBobMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(admin);            
            assert.equal(updatedBobMUsdtTokenLedger, bobInitialMUsdtTokenTokenBalance + liquidityAmount);        

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });


        it('user (alice) can add liquidity for mock FA12 (usdt) token into Lending Controller token pool (30 MockFA12 Tokens) and receive mUSDT tokens', async () => {
            try{

                // init variables
                await signerFactory(tezos, userTwoSk);
                const loanTokenName   = "usdt";
                const liquidityAmount = 30000000; // 30 Mock FA12 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();
                
                // get mock fa12 token storage and lp token pool mock fa12 token storage
                const mockFa12TokenStorage                = await mockFa12TokenInstance.storage();
                const mTokenPoolMockFa12TokenStorage      = await mTokenUsdtInstance.storage();
                
                // get initial alice's Mock FA12 Token balance
                const aliceMockFa12Ledger                   = await mockFa12TokenStorage.ledger.get(userTwo);            
                const aliceInitialMockFa12TokenBalance      = aliceMockFa12Ledger == undefined ? 0 : aliceMockFa12Ledger.balance.toNumber();

                // get initial alice's mToken - Mock FA12 Token (USDT) - balance
                compoundOperation                           = await mTokenUsdtInstance.methods.compound([userTwo]).send();
                await compoundOperation.confirmation();
                const aliceMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(userTwo);            
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
                const updatedAliceMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(userTwo);            
                assert.equal(updatedAliceMockFa12Ledger.balance, aliceInitialMockFa12TokenBalance - liquidityAmount);

                // check Lending Controller's Mock FA12 Token Balance
                const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
                assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

                // check alice's mUsdt Token Token balance
                const updatedAliceMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(userTwo);            
                assert.equal(updatedAliceMUsdtTokenLedger, aliceInitialMUsdtTokenTokenBalance + liquidityAmount);        

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

        it('user (eve) can add liquidity for mock FA12 (usdt) token into Lending Controller token pool (30 MockFA12 Tokens) and receive mUSDT tokens', async () => {
            try{
                // init variables
                await signerFactory(tezos, userOneSk);
                const loanTokenName = "usdt";
                const liquidityAmount = 30000000; // 30 Mock FA12 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();
                
                // get mock fa12 token storage and lp token pool mock fa12 token storage
                const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
                const mTokenPoolMockFa12TokenStorage   = await mTokenUsdtInstance.storage();
                
                // get initial eve's Mock FA12 Token balance
                const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(userOne);            
                const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

                // get initial eve's mToken - Mock FA12 Token (USDT) - balance
                compoundOperation                         = await mTokenUsdtInstance.methods.compound([userOne]).send();
                await compoundOperation.confirmation();
                const eveMUsdtTokenLedger                 = await mTokenPoolMockFa12TokenStorage.ledger.get(userOne);            
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
                const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(userOne);            
                assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - liquidityAmount);

                // check Lending Controller's Mock FA12 Token Balance
                const lendingControllerMockFa12Account  = await updatedMockFa12TokenStorage.ledger.get(lendingControllerAddress);            
                assert.equal(lendingControllerMockFa12Account.balance, lendingControllerInitialMockFa12TokenBalance + liquidityAmount);

                // check Eve's mUsdt Token Token balance
                const updatedEveMUsdtTokenLedger        = await updatedMUsdtTokenTokenStorage.ledger.get(userOne);            
                assert.equal(updatedEveMUsdtTokenLedger, eveInitialMUsdtTokenTokenBalance + liquidityAmount);        

            } catch (e) {
                console.dir(e, {depth: 5})
            }
        });

    });


    describe("Non-initialized farm", function() {

        beforeEach("Set signer to userOne (eve)", async () => {
            farmStorage = await farmInstance.storage();
            farmFactoryStorage = await farmFactoryInstance.storage();
            mvkTokenStorage = await mvkTokenInstance.storage();
            mTokenUsdtStorage = await mTokenUsdtInstance.storage();
            await signerFactory(tezos, userOneSk);
        });

        describe("%deposit", function() {
            it('user (eve) should not be able to deposit in a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const farmInit          = farmStorage.init;
                    const amountToDeposit   = 2000000;
    
                    if(!farmInit){

                        // Update operators for farm
                        updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userOne, farmAddress, tokenId);
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
            it('user (eve) should not be able to withdraw from a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
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
            it('user (eve) should not be able to claim in a farm that has not been initialized yet', async () => {
                try{
                    // Initial values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmInit          = farmStorage.init;
    
                    // Operation
                    if(farmInit == false){
                        await chai.expect(farmInstance.methods.claim([admin]).send()).to.be.rejected;
                        
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

        describe('%initFarm', function() {

            beforeEach("Set signer to admin (bob)", async () => {
                farmStorage = await farmInstance.storage();
                farmFactoryStorage = await farmFactoryInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();
                mTokenUsdtStorage = await mTokenUsdtInstance.storage();
                await signerFactory(tezos, adminSk);
            });

            it('user (eve) should not be able to initialize a farm', async () => {
                try{
                    // Switch signer to Alice
                    await signerFactory(tezos, userOneSk);

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

            it('admin (bob) should not be able to initialize without a proper duration', async () => {
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

            it('admin (bob) should be able to initialize a farm', async () => {
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

            it('admin (bob) should not be able to initialize the same farm twice', async () => {
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

            beforeEach("Set signer to user (eve)", async () => {
                farmStorage = await farmInstance.storage();
                farmFactoryStorage = await farmFactoryInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();
                mTokenUsdtStorage = await mTokenUsdtInstance.storage();
                await signerFactory(tezos, userOneSk);
            });
            
            it('user (eve) should be able to deposit LP Tokens into a farm', async () => {
                try{
                    // Initial values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const lpBalanceStart    = await mTokenUsdtStorage.ledger.get(userOne);
                    
                    const depositRecord     = await farmStorage.depositorLedger.get(userOne);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    const amountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userOne, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(userOne);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpBalanceEnd      = await mTokenUsdtStorage.ledger.get(userOne);

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
                    assert.equal(lpBalanceEnd, lpBalanceStart - amountToDeposit);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('user (alice) should be able to deposit LP Tokens into a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, userTwoSk)
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const lpBalanceStart    = await mTokenUsdtStorage.ledger.get(userTwo);
                    
                    const depositRecord     = await farmStorage.depositorLedger.get(userTwo);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    const amountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userTwo, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(userTwo);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpBalanceEnd      = await mTokenUsdtStorage.ledger.get(userTwo);

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
                    assert.equal(lpBalanceEnd, lpBalanceStart - amountToDeposit);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('multiple users (eve/alice) should be able to deposit LP Tokens into a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, userOneSk);
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const lpBalanceStart    = await mTokenUsdtStorage.ledger.get(userOne);
                    
                    const depositRecord     = await farmStorage.depositorLedger.get(userOne);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    const amountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userOne, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(userOne);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    const lpBalanceEnd      = await mTokenUsdtStorage.ledger.get(userOne);

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance + amountToDeposit);
                    assert.equal(lpBalanceEnd, lpBalanceStart - amountToDeposit);

                    await signerFactory(tezos, userTwoSk)
                    mTokenUsdtStorage           = await mTokenUsdtInstance.storage();
                    farmStorage              = await farmInstance.storage();
                    lendingControllerStorage = await lendingControllerInstance.storage();
                    
                    const aliceLpBalanceStart    = await mTokenUsdtStorage.ledger.get(userTwo);
                    
                    const aliceDepositRecord     = await farmStorage.depositorLedger.get(userTwo);
                    const aliceDepositBalance    = aliceDepositRecord === undefined ? 0 : aliceDepositRecord.balance.toNumber();
                    const aliceAmountToDeposit   = 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userTwo, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    depositOperation = await farmInstance.methods.deposit(aliceAmountToDeposit).send();
                    await depositOperation.confirmation();

                    // Final values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    // console.log("REWARDS: ", farmStorage.config.plannedRewards)
                    // console.log("TIME: ", farmStorage.minBlockTimeSnapshot.toNumber())
                    
                    const aliceDepositRecordEnd  = await farmStorage.depositorLedger.get(userTwo);
                    const aliceDepositBalanceEnd = aliceDepositRecordEnd === undefined ? 0 : aliceDepositRecordEnd.balance.toNumber();
                    const aliceLpBalanceEnd      = await mTokenUsdtStorage.ledger.get(userTwo);

                    // Assertions
                    assert.equal(aliceDepositBalanceEnd, aliceDepositBalance + aliceAmountToDeposit);
                    assert.equal(aliceLpBalanceEnd, aliceLpBalanceStart - aliceAmountToDeposit);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('user (eve) should not be able to able to deposit more LP Tokens than it has', async () => {
                try{
                    // Initial values
                    mTokenUsdtStorage                  = await mTokenUsdtInstance.storage();
                    farmStorage                     = await farmInstance.storage();
                    
                    const lpBalanceStart     = await mTokenUsdtStorage.ledger.get(userOne);
                    const amountToDeposit   = lpBalanceStart + 1000000;

                    // Update operators for farm
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userOne, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5})
                } 
            })
        })

        describe('%withdraw', function() {

            beforeEach("Set signer to user (eve)", async () => {
                farmStorage = await farmInstance.storage();
                farmFactoryStorage = await farmFactoryInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();
                mTokenUsdtStorage = await mTokenUsdtInstance.storage();
                await signerFactory(tezos, userOneSk);
            });

            it('user (eve) should be able to withdraw LP Tokens from a farm', async () => {
                try{

                    // Initial values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedgerStart      = await mTokenUsdtStorage.ledger.get(userOne);
                    const lpBalance : number = lpLedgerStart.toNumber();

                    const depositRecord      = await farmStorage.depositorLedger.get(userOne);
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
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(userOne);
                    const depositBalanceEnd : number = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
                    const lpLedgerEnd       = await mTokenUsdtStorage.ledger.get(userOne);
                    const lpBalanceEnd : number = lpLedgerEnd.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - amountToWithdraw);
                    assert.equal(lpBalanceEnd, (lpBalance + amountToWithdraw));

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('user (alice) should be able to withdraw LP Tokens from a farm', async () => {
                try{

                    // Initial values
                    await signerFactory(tezos, userTwoSk);
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedgerStart      = await mTokenUsdtStorage.ledger.get(userTwo);
                    const lpBalance : number = lpLedgerStart.toNumber();

                    const depositRecord      = await farmStorage.depositorLedger.get(userTwo);
                    const depositBalance : number = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();
                    
                    const amountToWithdraw : number = 10000;

                    // Operation
                    const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(userTwo);
                    const depositBalanceEnd : number = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
                    const lpLedgerEnd       = await mTokenUsdtStorage.ledger.get(userTwo);
                    const lpBalanceEnd : number = lpLedgerEnd.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - amountToWithdraw);
                    assert.equal(lpBalanceEnd, (lpBalance + amountToWithdraw));

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('user (mallory) should not be able to withdraw LP Tokens from a farm if it never deposited into it', async () => {
                try{

                    // Initial values
                    await signerFactory(tezos, userThreeSk);
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const amountToWithdraw  = 1;

                    // Operation
                    await chai.expect(farmInstance.methods.withdraw(amountToWithdraw).send()).to.be.rejected;

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });


            it('multiple users (eve/alice) should be able to withdraw tokens', async () => {
                try{

                    // Initial values
                    mTokenUsdtStorage                  = await mTokenUsdtInstance.storage();
                    farmStorage                     = await farmInstance.storage();
                    const firstLpLedgerStart        = await mTokenUsdtStorage.ledger.get(userOne);
                    const firstLpBalance            = firstLpLedgerStart.toNumber();
                    
                    const firstDepositRecord        = await farmStorage.depositorLedger.get(userOne);
                    const firstDepositBalance       = firstDepositRecord === undefined ? 0 : firstDepositRecord.balance.toNumber();
                    
                    const firstAmountToWithdraw     = 500000;
                    
                    const secondLpLedgerStart       = await mTokenUsdtStorage.ledger.get(userTwo);
                    const secondLpBalance           = secondLpLedgerStart.toNumber();

                    const secondDepositRecord       = await farmStorage.depositorLedger.get(userTwo);
                    const secondDepositBalance      = secondDepositRecord === undefined ? 0 : secondDepositRecord.balance.toNumber();
                    
                    const secondAmountToWithdraw    = 4;

                    await signerFactory(tezos, userOneSk)
                    var withdrawOperation            = await farmInstance.methods.withdraw(firstAmountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    await signerFactory(tezos, userOneSk)
                    farmStorage                     = await farmInstance.storage();
                    mTokenUsdtStorage                  = await mTokenUsdtInstance.storage();
                    
                    const firstDepositRecordEnd     = await farmStorage.depositorLedger.get(userOne);
                    const firstDepositBalanceEnd    = firstDepositRecordEnd === undefined ? 0 : firstDepositRecordEnd.balance.toNumber();
                    
                    const firstLpLedgerEnd          = await mTokenUsdtStorage.ledger.get(userOne);
                    const firstLpBalanceEnd         = firstLpLedgerEnd.toNumber();

                    // Operations
                    await signerFactory(tezos, userTwoSk)
                    var withdrawOperation            = await farmInstance.methods.withdraw(secondAmountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    await signerFactory(tezos, userTwoSk)
                    farmStorage                     = await farmInstance.storage();
                    mTokenUsdtStorage                  = await mTokenUsdtInstance.storage();

                    const secondDepositRecordEnd    = await farmStorage.depositorLedger.get(userTwo);
                    const secondDepositBalanceEnd   = secondDepositRecordEnd === undefined ? 0 : secondDepositRecordEnd.balance.toNumber();
                    
                    const secondLpLedgerEnd         = await mTokenUsdtStorage.ledger.get(userTwo);
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

            it('user (eve) should not be able to withdraw more LP Tokens than it deposited', async () => {
                try{

                    // Initial values
                    await signerFactory(tezos, userOneSk);
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const lpLedgerStart     = await mTokenUsdtStorage.ledger.get(userOne);
                    const lpBalance         = lpLedgerStart === undefined ? 0 : lpLedgerStart.toNumber();

                    // const farmLpLedgerStart     = await mTokenUsdtStorage.ledger.get(farmAddress);
                    // const farmLpBalance         = farmLpLedgerStart === undefined ? 0 : farmLpLedgerStart.toNumber();

                    // console.log('bob lpLedgerStart');
                    // console.log(lpLedgerStart);

                    // console.log('farm lpLedgerStart');
                    // console.log(farmLpLedgerStart);

                    const depositRecord     = await farmStorage.depositorLedger.get(userOne);
                    const depositBalance    = depositRecord === undefined ? 0 : depositRecord.balance.toNumber();

                    // console.log('bob depositRecord');
                    // console.log(depositRecord);
                    
                    const excessAmount      = 100;
                    const amountToWithdraw  = depositBalance + excessAmount;

                    // Operation
                    const withdrawOperation  = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const depositRecordEnd  = await farmStorage.depositorLedger.get(userOne);
                    const depositBalanceEnd = depositRecordEnd === undefined ? 0 : depositRecordEnd.balance.toNumber();
                    
                    const lpLedgerEnd       = await mTokenUsdtStorage.ledger.get(userOne);
                    const lpBalanceEnd      = lpLedgerEnd === undefined ? 0 : lpLedgerEnd.toNumber();

                    // Assertions
                    assert.equal(depositBalanceEnd, depositBalance - depositBalance);
                    assert.equal(lpBalanceEnd, lpBalance + amountToWithdraw - excessAmount);

                    // reset - deposit some lpToken into farm again for subsequent tests

                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    
                    const amountToDeposit   = 10000;

                    await signerFactory(tezos, userOneSk);
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userOne, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation
                    const depositOperation          = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });
        });



        describe('%claim', function() {

            beforeEach("Set signer to user (eve)", async () => {
                farmStorage = await farmInstance.storage();
                farmFactoryStorage = await farmFactoryInstance.storage();
                mvkTokenStorage = await mvkTokenInstance.storage();
                mTokenUsdtStorage = await mTokenUsdtInstance.storage();
                await signerFactory(tezos, userOneSk);
            });

            it('user (mallory) should not be able to claim in a farm if it never deposited into it', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, userThreeSk);
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();

                    // Operation
                    await chai.expect(farmInstance.methods.claim([userThree]).send()).to.be.rejected;
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('user (eve) should be able to claim rewards from a farm', async () => {
                try{
                    // Initial values
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(userOne);
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await wait(2 * blockTime * 1000);
                    const firstClaimOperation   = await farmInstance.methods.claim([userOne]).send();
                    await firstClaimOperation.confirmation();

                    // Final values
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(userOne);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // console.log(`userSMVKBalance: ${userSMVKBalance}`);
                    // console.log(`userSMVKBalanceEnd: ${userSMVKBalanceEnd}`);

                    // Assertions
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)
                    
                } catch(e) {
                    console.dir(e, {depth: 5})
                }
            })

            it('user (alice) should be able to withdraw all its LP Tokens then claim the remaining rewards', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, userTwoSk);
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    mTokenUsdtStorage              = await mTokenUsdtInstance.storage();
                    const userLpLedgerStart     = await mTokenUsdtStorage.ledger.get(userTwo);
                    const userLpBalance         = userLpLedgerStart;
                    
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(userTwo);
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    
                    const userDepositRecordEnd  = await farmStorage.depositorLedger.get(userTwo);
                    const userDepositBalanceEnd = userDepositRecordEnd === undefined ? 0 : userDepositRecordEnd.balance.toNumber();
                    
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    // Operations
                    await wait(12 * blockTime * 1000);
                    const withdrawOperation     = await farmInstance.methods.withdraw(userDepositBalanceEnd).send();
                    await withdrawOperation.confirmation();
                    
                    const firstClaimOperation   = await farmInstance.methods.claim([userTwo]).send();
                    await firstClaimOperation.confirmation();

                    // Final values
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    mTokenUsdtStorage              = await mTokenUsdtInstance.storage();
                    const userLpLedgerEnd       = await mTokenUsdtStorage.ledger.get(userTwo);
                    const userLpBalanceEnd      = userLpLedgerEnd;
                    
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(userTwo);
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
        
        describe('%updateConfig', function() {

            it('admin (bob) should be able to force the rewards to come from transfers instead of minting', async () => {
                try{
                    // Initial values
                    mTokenUsdtStorage       = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    mvkTokenStorage         = await mvkTokenInstance.storage();
                    const mvkTotalSupply    = mvkTokenStorage.totalSupply.toNumber();
                    const smvkTotalSupply   = await mvkTokenStorage.ledger.get(doormanAddress);
                    
                    const toggleTransfer    = farmStorage.config.forceRewardFromTransfer;
                    const blockTime         = farmStorage.minBlockTimeSnapshot.toNumber();
                    const amountToDeposit   = 10000;

                    // Approval operation
                    await signerFactory(tezos, adminSk);
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, admin, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();

                    // Operation - deposit amount so user balance will be greater than zero
                    depositOperation  = await farmInstance.methods.deposit(amountToDeposit).send();
                    await depositOperation.confirmation();

                    // Wait at least one block before claiming rewards
                    await wait(12 * blockTime * 1000);

                    farmStorage                    = await farmInstance.storage();
                    const userDepositRecordMid     = await farmStorage.depositorLedger.get(admin);
                    const userDepositBalanceMid    = userDepositRecordMid === undefined ? 0 : userDepositRecordMid.balance.toNumber();

                    // First claim operation - sMVK rewards should be minted (hence increase in sMVK total supply)
                    var claimOperation  = await farmInstance.methods.claim([admin]).send();
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
                    claimOperation = await farmInstance.methods.claim([admin]).send();
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
                    claimOperation = await farmInstance.methods.claim([admin]).send();
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
        });

        describe('%closeFarm', function() {

            it('non-admin (eve) should not be able to close a farm', async () => {
                try{
                    // Toggle to transfer
                    await signerFactory(tezos, userOneSk);
                    await chai.expect(farmInstance.methods.closeFarm().send()).to.be.rejected;
                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('admin (bob) should be able to close a farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, adminSk);
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

            it('user (eve) should not be able to deposit in a closed farm', async () => {
                try{
                    // Initial values
                    mTokenUsdtStorage          = await mTokenUsdtInstance.storage();
                    farmStorage             = await farmInstance.storage();
                    const farmOpen          = farmStorage.open;
                    const amountToDeposit   = 1;

                    // Approval operation
                    await signerFactory(tezos, userOneSk);
                    updateOperatorsOperation = await updateOperators(mTokenUsdtInstance, userOne, farmAddress, tokenId);
                    await updateOperatorsOperation.confirmation();
                    
                    // Operation
                    await chai.expect(farmInstance.methods.deposit(amountToDeposit).send()).to.be.rejected;

                    // Assertions
                    assert.equal(farmOpen, false);

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('user (eve) should be able to claim in a closed farm', async () => {
                try{
                    // Initial values
                    farmStorage                 = await farmInstance.storage();
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedger        = await doormanStorage.userStakeBalanceLedger.get(userOne);
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();
                    const userSMVKBalance       = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber()
                    const farmOpen              = farmStorage.open;
                    
                    // Operation
                    await wait(10 * blockTime * 1000);
                    const claimOperation        = await farmInstance.methods.claim([userOne]).send();
                    await claimOperation.confirmation();

                    // Final values
                    doormanStorage              = await doormanInstance.storage();
                    const userSMVKLedgerEnd     = await doormanStorage.userStakeBalanceLedger.get(userOne);
                    const userSMVKBalanceEnd    = userSMVKLedgerEnd === undefined ? 0 : userSMVKLedgerEnd.balance.toNumber()

                    // Assertions
                    assert.equal(farmOpen, false);
                    assert.notEqual(userSMVKBalanceEnd, userSMVKBalance)

                } catch(e){
                    console.dir(e, {depth: 5});
                } 
            });

            it('user (eve) should not see any increase in rewards even if it still has LP Token deposited in the farm', async () => {
                try{

                    farmStorage                 = await farmInstance.storage();
                    mTokenUsdtStorage              = await mTokenUsdtInstance.storage();
                    
                    const lpLedgerStart         = await mTokenUsdtStorage.ledger.get(userOne);
                    const lpBalance             = lpLedgerStart.toNumber();
                    const blockTime             = farmStorage.minBlockTimeSnapshot.toNumber();

                    const farmOpen                  = farmStorage.open;
                    const initialAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare;
                    
                    // Operation - let alice claim her eligible rewards 
                    await wait(4 * blockTime * 1000);
                    const claimOperation = await farmInstance.methods.claim([userOne]).send();
                    await claimOperation.confirmation();

                    // Update storage
                    doormanStorage                = await doormanInstance.storage();
                    farmStorage                   = await farmInstance.storage();

                    var updatedAccRewardsPerShare = farmStorage.accumulatedRewardsPerShare; 

                    const userSMVKLedger          = await doormanStorage.userStakeBalanceLedger.get(userOne);
                    const userSMVKBalance         = userSMVKLedger === undefined ? 0 : userSMVKLedger.balance.toNumber();

                    var userDepositRecord     = await farmStorage.depositorLedger.get(userOne);

                    // Assertions - there should be no increase in accumulated rewards per share for the farm
                    assert.equal(farmOpen, false);
                    assert.equal(initialAccRewardsPerShare.toNumber(), updatedAccRewardsPerShare.toNumber());

                    // Second operation to check no change in sMVK balance
                    await wait(4 * blockTime * 1000);
                    const secondClaimOperation = await farmInstance.methods.claim([userOne]).send();
                    await secondClaimOperation.confirmation();

                    // Update storage
                    doormanStorage                = await doormanInstance.storage();
                    farmStorage                   = await farmInstance.storage();

                    const userDepositRecordEnd    = await farmStorage.depositorLedger.get(userOne);

                    const userSMVKLedgerEnd       = await doormanStorage.userStakeBalanceLedger.get(userOne);
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

            it('user (eve) should be able to withdraw in a closed farm', async () => {
                try{
                    // Initial values
                    await signerFactory(tezos, userOneSk);
                    farmStorage                 = await farmInstance.storage();
                    mTokenUsdtStorage           = await mTokenUsdtInstance.storage();
                    const lpLedgerStart         = await mTokenUsdtStorage.ledger.get(userOne);
                    const lpBalance             = lpLedgerStart === undefined ? 0 : lpLedgerStart.toNumber();
                    const amountToWithdraw      = 1;
                    const farmOpen              = farmStorage.open;
                    
                    // Operation
                    const withdrawOperation     = await farmInstance.methods.withdraw(amountToWithdraw).send();
                    await withdrawOperation.confirmation();

                    // Final values
                    mTokenUsdtStorage              = await mTokenUsdtInstance.storage();
                    const lpLedgerStartEnd      = await mTokenUsdtStorage.ledger.get(userOne);
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


    describe("Housekeeping Entrypoints", async () => {

        beforeEach("Set signer to admin (bob)", async () => {
            farmStorage        = await farmInstance.storage();
            await signerFactory(tezos, adminSk);
        });

        it('%setAdmin                 - admin (bob) should be able to update the contract admin address', async () => {
            try{
                
                // Initial Values
                farmStorage     = await farmInstance.storage();
                const currentAdmin = farmStorage.admin;
                assert.strictEqual(currentAdmin, admin);

                // Operation
                setAdminOperation = await farmInstance.methods.setAdmin(userOne).send();
                await setAdminOperation.confirmation();

                // Final values
                farmStorage   = await farmInstance.storage();
                const newAdmin = farmStorage.admin;

                // Assertions
                assert.notStrictEqual(newAdmin, currentAdmin);
                assert.strictEqual(newAdmin, userOne);
                
                // reset admin
                await signerFactory(tezos, userOneSk);
                resetAdminOperation = await farmInstance.methods.setAdmin(admin).send();
                await resetAdminOperation.confirmation();

            } catch(e){
                console.dir(e, {depth: 5});;
            }
        });

        it('%setGovernance            - admin (bob) should be able to update the contract governance address', async () => {
            try{
                
                // Initial Values
                farmStorage       = await farmInstance.storage();
                const currentGovernance = farmStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await farmInstance.methods.setGovernance(userOne).send();
                await setGovernanceOperation.confirmation();

                // Final values
                farmStorage   = await farmInstance.storage();
                const updatedGovernance = farmStorage.governanceAddress;

                // reset governance
                setGovernanceOperation = await farmInstance.methods.setGovernance(contractDeployments.governance.address).send();
                await setGovernanceOperation.confirmation();

                // Assertions
                assert.notStrictEqual(updatedGovernance, currentGovernance);
                assert.strictEqual(updatedGovernance, userOne);
                assert.strictEqual(currentGovernance, contractDeployments.governance.address);

            } catch(e){
                console.dir(e, {depth: 5});;
            }
        });

        it('%updateMetadata           - admin (bob) should be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data', 'ascii').toString('hex')

                // Operation
                const updateOperation = await farmInstance.methods.updateMetadata(key, hash).send();
                await updateOperation.confirmation();

                // Final values
                farmStorage          = await farmInstance.storage();            

                const updatedData       = await farmStorage.metadata.get(key);
                assert.equal(hash, updatedData);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to force the rewards to come from transfers instead of minting', async () => {
            try{

                // Initial values
                const currentConfigVariable     = farmStorage.config.forceRewardFromTransfer;
                const newConfigVariable         = currentConfigVariable ? 0 : 1;

                // Operation
                const operation = await farmInstance.methods.updateConfig(newConfigVariable, "configForceRewardFromTransfer").send();
                await operation.confirmation()

                // Final values
                farmStorage                     = await farmInstance.storage();
                const updatedConfigVariable     = farmStorage.config.forceRewardFromTransfer;

                // Assertions
                assert.notEqual(currentConfigVariable, newConfigVariable);
                assert.equal(updatedConfigVariable, newConfigVariable);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to increase the rewards of a farm', async () => {
            try{
                // Initial values
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

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - admin (bob) should be able to decrease the rewards of a farm', async () => {
            try{
                // Initial values
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

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateWhitelistContracts - admin (bob) should be able to add userOne (eve) to the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = userOne;
                storageMap      = "whitelistContracts";

                initialContractMapValue           = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(farmInstance, contractMapKey, 'update');
                await updateWhitelistContractsOperation.confirmation()

                farmStorage = await farmInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map before adding her to it')
                assert.notStrictEqual(updatedContractMapValue, undefined,  'Eve (key) should be in the Whitelist Contracts map after adding her to it')

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it('%updateWhitelistContracts - admin (bob) should be able to remove userOne (eve) from the Whitelisted Contracts map', async () => {
            try {

                // init values
                contractMapKey  = userOne;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await updateWhitelistContracts(farmInstance, contractMapKey, 'remove');
                await updateWhitelistContractsOperation.confirmation()

                farmStorage = await farmInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                assert.notStrictEqual(initialContractMapValue, undefined, 'Eve (key) should be in the Whitelist Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'Eve (key) should not be in the Whitelist Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to add userOne (eve) to the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(farmInstance, contractMapKey, userOne, 'update');
                await updateGeneralContractsOperation.confirmation()

                farmStorage = await farmInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'eve (key) should not be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, userOne, 'eve (key) should be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it('%updateGeneralContracts   - admin (bob) should be able to remove userOne (eve) from the General Contracts map', async () => {
            try {

                // init values
                contractMapKey  = "eve";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await updateGeneralContracts(farmInstance, contractMapKey, userOne, 'remove');
                await updateGeneralContractsOperation.confirmation()

                farmStorage = await farmInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, userOne, 'eve (key) should be in the General Contracts map before adding her to it');
                assert.strictEqual(updatedContractMapValue, undefined, 'eve (key) should not be in the General Contracts map after adding her to it');

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it('%mistakenTransfer         - admin (bob) should be able to call this entrypoint for mock FA2 tokens', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - userThree (mallory) send 10 MavrykFa2Tokens to MVK Token Contract
                await signerFactory(tezos, userThreeSk);
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, userThree, farmAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const initialUserBalance    = (await mavrykFa2TokenStorage.ledger.get(userThree)).toNumber()

                await signerFactory(tezos, adminSk);
                mistakenTransferOperation = await mistakenTransferFa2Token(farmInstance, userThree, mavrykFa2TokenAddress, tokenId, tokenAmount).send();
                await mistakenTransferOperation.confirmation();

                mavrykFa2TokenStorage       = await mavrykFa2TokenInstance.storage();
                const updatedUserBalance    = (await mavrykFa2TokenStorage.ledger.get(userThree)).toNumber();

                // increase in updated balance
                assert.equal(updatedUserBalance, initialUserBalance + tokenAmount);

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it('%mistakenTransfer         - admin (bob) should not be able to call this entrypoint to transfer LP tokens (protected for farm contract)', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - userOne (eve) send 10 MavrykFa2Tokens to MVK Token Contract
                await signerFactory(tezos, userOneSk);
                transferOperation = await fa2Transfer(mTokenUsdtInstance, userOne, farmAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();
                
                mTokenUsdtStorage              = await mTokenUsdtInstance.storage();
                const initialUserBalance    = (await mTokenUsdtStorage.ledger.get(userOne)).balance.toNumber()

                await signerFactory(tezos, adminSk);
                mistakenTransferOperation = await mistakenTransferFa2Token(farmInstance, userOne, mTokenUsdtAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;
                
                mTokenUsdtStorage              = await mTokenUsdtInstance.storage();
                const updatedUserBalance    = (await mTokenUsdtStorage.ledger.get(userOne)).balance.toNumber()

                // no change in balance
                assert.equal(updatedUserBalance, initialUserBalance);

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })     


        it("%pauseAll                 - admin (bob) should be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = await farmInstance.methods.pauseAll().send(); 
                await pauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - admin (bob) should be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = await farmInstance.methods.unpauseAll().send(); 
                await unpauseAllOperation.confirmation();

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - admin (bob) should be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = await farmInstance.methods.togglePauseEntrypoint("deposit", true).send(); 
                await pauseOperation.confirmation();
                
                pauseOperation = await farmInstance.methods.togglePauseEntrypoint("withdraw", true).send(); 
                await pauseOperation.confirmation();

                pauseOperation = await farmInstance.methods.togglePauseEntrypoint("claim", true).send();
                await pauseOperation.confirmation();

                // update storage
                farmStorage = await farmInstance.storage();

                // check that entrypoints are paused
                assert.equal(farmStorage.breakGlassConfig.depositIsPaused                , true)
                assert.equal(farmStorage.breakGlassConfig.withdrawIsPaused               , true)
                assert.equal(farmStorage.breakGlassConfig.claimIsPaused                  , true)

                // unpause operations

                unpauseOperation = await farmInstance.methods.togglePauseEntrypoint("deposit", false).send();
                await unpauseOperation.confirmation();
                
                unpauseOperation = await farmInstance.methods.togglePauseEntrypoint("withdraw", false).send();
                await unpauseOperation.confirmation();

                unpauseOperation = await farmInstance.methods.togglePauseEntrypoint("claim", false).send();
                await unpauseOperation.confirmation();

                // update storage
                farmStorage = await farmInstance.storage();

                // check that entrypoints are unpaused
                assert.equal(farmStorage.breakGlassConfig.depositIsPaused                , false)
                assert.equal(farmStorage.breakGlassConfig.withdrawIsPaused               , false)
                assert.equal(farmStorage.breakGlassConfig.claimIsPaused                  , false)

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    });


    describe('Access Control Checks', function () {

        beforeEach("Set signer to non-admin (mallory)", async () => {
            await signerFactory(tezos, userThreeSk);
        });

        it('%setAdmin                 - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                farmStorage        = await farmInstance.storage();
                const currentAdmin  = farmStorage.admin;

                // Operation
                setAdminOperation = await farmInstance.methods.setAdmin(userThree);
                await chai.expect(setAdminOperation.send()).to.be.rejected;

                // Final values
                farmStorage    = await farmInstance.storage();
                const newAdmin  = farmStorage.admin;

                // Assertions
                assert.strictEqual(newAdmin, currentAdmin);

            } catch(e){
                console.dir(e, {depth: 5});;
            }
        });

        it('%setGovernance            - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try{
                // Initial Values
                farmStorage        = await farmInstance.storage();
                const currentGovernance  = farmStorage.governanceAddress;

                // Operation
                setGovernanceOperation = await farmInstance.methods.setGovernance(userThree);
                await chai.expect(setGovernanceOperation.send()).to.be.rejected;

                // Final values
                farmStorage    = await farmInstance.storage();
                const updatedGovernance  = farmStorage.governanceAddress;

                // Assertions
                assert.strictEqual(updatedGovernance, currentGovernance);

            } catch(e){
                console.dir(e, {depth: 5});;
            }
        });

        it('%updateMetadata           - non-admin (mallory) should not be able to update the contract metadata', async () => {
            try{
                // Initial values
                const key   = ''
                const hash  = Buffer.from('tezos-storage:data fail', 'ascii').toString('hex')

                farmStorage          = await farmInstance.storage();   
                const initialMetadata   = await farmStorage.metadata.get(key);

                // Operation
                const updateOperation = await farmInstance.methods.updateMetadata(key, hash);
                await chai.expect(updateOperation.send()).to.be.rejected;

                // Final values
                farmStorage          = await farmInstance.storage();            
                const updatedData       = await farmStorage.metadata.get(key);

                // check that there is no change in metadata
                assert.equal(updatedData, initialMetadata);
                assert.notEqual(updatedData, hash);

            } catch(e){
                console.dir(e, {depth: 5});
            } 
        });

        it('%updateConfig             - non-admin (mallory) should not be able to update contract config', async () => {
            try{
                
                // Initial Values
                farmStorage           = await farmInstance.storage();
                const initialConfigValue = farmStorage.config.forceRewardFromTransfer;
                const newConfigValue     = initialConfigValue == 1 ? 0 : 1;

                // Operation
                const updateConfigOperation = await farmInstance.methods.updateConfig(newConfigValue, "configForceRewardFromTransfer");
                await chai.expect(updateConfigOperation.send()).to.be.rejected;

                // Final values
                farmStorage           = await farmInstance.storage();
                const updatedConfigValue = farmStorage.config.forceRewardFromTransfer;

                // check that there is no change in config values
                assert.equal(updatedConfigValue, initialConfigValue);
                assert.notEqual(updatedConfigValue, newConfigValue);
                
            } catch(e){
                console.dir(e, {depth: 5});
            }
        });

        it('%updateWhitelistContracts - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = userThree;
                storageMap      = "whitelistContracts";

                initialContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateWhitelistContractsOperation = await farmInstance.methods.updateWhitelistContracts(contractMapKey, "update")
                await chai.expect(updateWhitelistContractsOperation.send()).to.be.rejected;

                farmStorage = await farmInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the Whitelist Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it('%updateGeneralContracts   - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // init values
                contractMapKey  = "mallory";
                storageMap      = "generalContracts";

                initialContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                updateGeneralContractsOperation = await farmInstance.methods.updateGeneralContracts(contractMapKey, userOne)
                await chai.expect(updateGeneralContractsOperation.send()).to.be.rejected;

                farmStorage          = await farmInstance.storage()
                updatedContractMapValue = await getStorageMapValue(farmStorage, storageMap, contractMapKey);

                assert.strictEqual(initialContractMapValue, undefined, 'mallory (key) should not be in the General Contracts map');

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it('%mistakenTransfer         - non-admin (mallory) should not be able to call this entrypoint', async () => {
            try {

                // Initial values
                const tokenAmount = 10;

                // Mistaken Operation - send 10 MavrykFa2Tokens to MVK Token Contract
                transferOperation = await fa2Transfer(mavrykFa2TokenInstance, userThree, farmAddress, tokenId, tokenAmount);
                await transferOperation.confirmation();

                // mistaken transfer operation
                mistakenTransferOperation = await mistakenTransferFa2Token(farmInstance, userThree, mavrykFa2TokenAddress, tokenId, tokenAmount);
                await chai.expect(mistakenTransferOperation.send()).to.be.rejected;

            } catch (e) {
                console.dir(e, {depth: 5});
            }
        })

        it("%pauseAll                 - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                pauseAllOperation = farmInstance.methods.pauseAll(); 
                await chai.expect(pauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%unpauseAll               - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                unpauseAllOperation = farmInstance.methods.unpauseAll(); 
                await chai.expect(unpauseAllOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%togglePauseEntrypoint    - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{
                
                // pause operations

                pauseOperation = farmInstance.methods.togglePauseEntrypoint("deposit", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;
                
                pauseOperation = farmInstance.methods.togglePauseEntrypoint("withdraw", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                pauseOperation = farmInstance.methods.togglePauseEntrypoint("claim", true); 
                await chai.expect(pauseOperation.send()).to.be.rejected;

                // unpause operations

                unpauseOperation = farmInstance.methods.togglePauseEntrypoint("deposit", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;
                
                unpauseOperation = farmInstance.methods.togglePauseEntrypoint("withdraw", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

                unpauseOperation = farmInstance.methods.togglePauseEntrypoint("claim", false); 
                await chai.expect(unpauseOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

        it("%setLambda                - non-admin (mallory) should not be able to call this entrypoint", async() => {
            try{

                // random lambda for testing
                const randomLambdaName  = "randomLambdaName";
                const randomLambdaBytes = "050200000cba0743096500000112075e09650000005a036e036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a0362036203620362036200000000036203620760036803690000000009650000000a0362036203620362036e00000000075e09650000006c09650000000a0362036203620362036200000000036e07610368036907650362036c036e036e07600368036e07600368036e09650000000e0359035903590359035903590359000000000761036e09650000000a036203620362036203620000000003620362076003680369000000000362075e07650765036203620362036c075e076507650368036e0362036e036200000000070702000001770743075e076507650368036e0362036e020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c03200342020000010e037a034c037a07430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700002034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f02000000090743036200810303270200000000072f020000000907430362009c0203270200000000070702000000600743036200808080809d8fc0d0bff2f1b26703420200000047037a034c037a0321052900080570000205290015034b031105710002031605700002033a0322072f020000001307430368010000000844495620627920300327020000000003160707020000001a037a037a03190332072c0200000002032002000000020327034f0707020000004d037a037a0790010000001567657447656e6572616c436f6e74726163744f70740563036e072f020000000b03200743036200a60603270200000012072f020000000203270200000004034c032000808080809d8fc0d0bff2f1b2670342020000092d037a057a000505700005037a034c07430362008f03052100020529000f0529000307430359030a034c03190325072c0200000002032702000000020320053d036d05700002072e02000008a4072e020000007c057000030570000405700005057000060570000705200005072e020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000002c072e0200000010072e02000000020320020000000203200200000010072e0200000002032002000000020320020000081c072e0200000044057000030570000405700005057000060570000705200005072e0200000010072e02000000020320020000000203200200000010072e020000000203200200000002032002000007cc072e0200000028057000030570000405700005057000060570000705200005072e02000000020320020000000203200200000798072e0200000774034c032003480521000305210003034c052900050316034c03190328072c020000000002000000090743036200880303270570000205210002034c0321052100030521000205290011034c0329072f020000002005290015074303620000074303620000074303620000074303620000054200050200000004034c03200743036200000521000203160319032a072c020000021c052100020521000407430362008e02057000020529000907430368010000000a64656c65676174696f6e034203420521000b034c0326034c07900100000016676574536174656c6c697465526577617264734f7074056309650000008504620000000725756e70616964046200000005257061696404620000001d2570617274696369706174696f6e52657761726473506572536861726504620000002425736174656c6c697465416363756d756c61746564526577617264735065725368617265046e0000001a25736174656c6c6974655265666572656e63654164647265737300000000072f0200000009074303620081030327020000001a072f02000000060743035903030200000008032007430359030a074303620000034c072c020000007303200521000205210004034205210007034c0326052100030521000205290008034205700007034c03260521000205290005034c05290007034b0311052100030316033a0521000b034c0322072f02000000130743036801000000084449562062792030032702000000000316034c0316031202000000060570000603200521000305210003034205210008034c0326052100030521000205700004052900030312055000030571000205210003052100030570000405290005031205500005057100020521000305700002052100030570000403160312031205500001034c05210003034c0570000305290013034b031105500013034c02000000060570000503200521000205290015055000080521000205700002052900110570000205700003034c0346034c0350055000110571000205210003052900070743036200000790010000000c746f74616c5f737570706c790362072f020000000907430362008a01032702000000000521000405290007074303620000037703420790010000000b6765745f62616c616e63650362072f02000000090743036200890103270200000000034c052100090743036200a40105210004033a033a0322072f0200000013074303680100000008444956206279203003270200000000031605210009074303620002033a0312052100090521000a07430362008803033a033a0322072f020000001307430368010000000844495620627920300327020000000003160743036200a401034c0322072f0200000013074303680100000008444956206279203003270200000000031605210004033a05210009052100020322072f0200000013074303680100000008444956206279203003270200000000031605210005034b0311052100060570000a052100040322072f0200000013074303680100000008444956206279203003270200000000031605700007052900130312055000130571000507430362008c0305210004052100070342034205210009034c0326032005700005057000030342052100050570000305700002037a034c0570000305700002034b0311074303620000052100020319032a072c020000003b05210002034c057000030322072f02000000130743036801000000084449562062792030032702000000000316057000020529001503120550001502000000080570000205200002057100030521000405210003034c05290011034c0329072f0200000009074303620089030327020000000003210521000507430362008b03057000020316057000020342034205700007034c03260320032105700004057000020316034b031105500001052100040529000707430362000005700003034205210004037705700002037a057000040655055f0765046e000000062566726f6d5f065f096500000026046e0000000425746f5f04620000000925746f6b656e5f696404620000000725616d6f756e7400000000000000042574787300000009257472616e73666572072f0200000008074303620027032702000000000743036a0000053d0765036e055f096500000006036e0362036200000000053d096500000006036e036203620000000005700004057000050570000705420003031b057000040342031b034d0743036200000521000303160319032a072c02000000440521000405210003034205700005034c032605210003052100020570000403160312055000010571000205210005034c0570000505290013034b031105500013057100030200000006057000040320034c052100040529001505500008034c0521000405700004052900110570000305210005034c0346034c03500550001105710002052100030570000207430362008e02057000020529000907430368010000000a64656c65676174696f6e0342034205700004034c03260655036e0000000e256f6e5374616b654368616e6765072f02000000090743036200b702032702000000000743036a000005700002034d053d036d034c031b034c031b02000000180570000305700004057000050570000605700007052000060200000036057000030570000405700005057000060570000705200005072e0200000010072e0200000002032002000000020320020000000203200342";

                const setLambdaOperation = farmInstance.methods.setLambda(randomLambdaName, randomLambdaBytes); 
                await chai.expect(setLambdaOperation.send()).to.be.rejected;

            } catch(e) {
                console.dir(e, {depth: 5})
            }
        })

    })

});
