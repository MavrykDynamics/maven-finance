import assert from "assert";
import { Utils, zeroAddress, MAV } from "./helpers/Utils";

const chai = require("chai");
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

import { alice, baker, bob, eve, mallory } from "../scripts/sandbox/accounts";
import { vaultStorageType } from "../storage/storageTypes/vaultStorageType"
import { 
    signerFactory, 
    fa2Transfer,
    almostEqual,
    updateOperators,
} from './helpers/helperFunctions'


// ------------------------------------------------------------------------------
// Contract Tests
// ------------------------------------------------------------------------------

describe("Lending Controller Pause Loan/Collateral Token tests", async () => {
    
    var utils: Utils
    let tezos

    //  - eve: first vault loan token: mockFa12, second vault loan token: mockFa2, third vault loan token - mav
    //  - mallory: first vault loan token: mockFa12, second vault loan token: mockFa2
    var eveVaultSet : Array<Number>     = []
    var malloryVaultSet : Array<Number> = [] 
    
    let updateTokenRewardIndexOperation

    let tokenId = 0

    let doormanInstance
    let delegationInstance
    let mvnTokenInstance
    
    let mockFa12TokenInstance
    let mockFa2TokenInstance

    let mockUsdMockFa12TokenAggregatorInstance
    let mockUsdMockFa2TokenAggregatorInstance
    let mockUsdMvrkAggregatorInstance
    let mockUsdMvnAggregatorInstance

    let mTokenUsdtInstance
    let mTokenEurtInstance
    let mTokenMvrkInstance

    let governanceInstance
    let governanceProxyInstance

    let lendingControllerInstance
    let vaultFactoryInstance

    let doormanStorage
    let delegationStorage
    let mvnTokenStorage
    let mockFa12TokenStorage
    let mockFa2TokenStorage
    let governanceStorage
    let governanceProxyStorage

    let lendingControllerStorage
    let vaultFactoryStorage

    let updateOperatorsOperation

    before("setup", async () => {

        utils = new Utils();
        await utils.init(bob.sk);
        tezos = utils.tezos
        
        doormanInstance                         = await utils.tezos.contract.at(contractDeployments.doorman.address);
        delegationInstance                      = await utils.tezos.contract.at(contractDeployments.delegation.address);
        mvnTokenInstance                        = await utils.tezos.contract.at(contractDeployments.mvnToken.address);
        mockFa12TokenInstance                   = await utils.tezos.contract.at(contractDeployments.mavenFa12Token.address);
        mockFa2TokenInstance                    = await utils.tezos.contract.at(contractDeployments.mavenFa2Token.address);
        governanceInstance                      = await utils.tezos.contract.at(contractDeployments.governance.address);
        governanceProxyInstance                 = await utils.tezos.contract.at(contractDeployments.governanceProxy.address);

        mTokenUsdtInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenUsdt.address);
        mTokenEurtInstance                      = await utils.tezos.contract.at(contractDeployments.mTokenEurt.address);
        mTokenMvrkInstance                       = await utils.tezos.contract.at(contractDeployments.mTokenMvrk.address);

        mockUsdMockFa12TokenAggregatorInstance  = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa12TokenAggregator.address);
        mockUsdMockFa2TokenAggregatorInstance   = await utils.tezos.contract.at(contractDeployments.mockUsdMockFa2TokenAggregator.address);
        mockUsdMvrkAggregatorInstance            = await utils.tezos.contract.at(contractDeployments.mockUsdMvrkAggregator.address);
        mockUsdMvnAggregatorInstance            = await utils.tezos.contract.at(contractDeployments.mockUsdMvnAggregator.address);

        lendingControllerInstance               = await utils.tezos.contract.at(contractDeployments.lendingController.address);
        vaultFactoryInstance                    = await utils.tezos.contract.at(contractDeployments.vaultFactory.address);

        doormanStorage                          = await doormanInstance.storage();
        delegationStorage                       = await delegationInstance.storage();
        mvnTokenStorage                         = await mvnTokenInstance.storage();
        mockFa12TokenStorage                    = await mockFa12TokenInstance.storage();
        mockFa2TokenStorage                     = await mockFa2TokenInstance.storage();
        governanceStorage                       = await governanceInstance.storage();
        governanceProxyStorage                  = await governanceInstance.storage();
        lendingControllerStorage                = await lendingControllerInstance.storage();
        vaultFactoryStorage                     = await vaultFactoryInstance.storage();

        // ------------------------------------------------------------------
        //
        // Update mTokens (i.e. mTokens) tokenRewardIndex by compounding
        //  - this will ensure that fetching user balances through on-chain views are accurate for continuous re-testing
        //
        // ------------------------------------------------------------------
        await signerFactory(tezos, bob.sk);

        const mockFa12LoanToken = await lendingControllerStorage.loanTokenLedger.get("usdt"); 
        const mockFa2LoanToken  = await lendingControllerStorage.loanTokenLedger.get("eurt"); 
        const mavLoanToken      = await lendingControllerStorage.loanTokenLedger.get("mav");

        if(!(mockFa12LoanToken == undefined || mockFa12LoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenUsdtInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(mockFa2LoanToken == undefined || mockFa2LoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenEurtInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

        if(!(mavLoanToken == undefined || mavLoanToken == null)){
            updateTokenRewardIndexOperation = await mTokenMvrkInstance.methods.compound([bob.pkh, eve.pkh]).send();
            await updateTokenRewardIndexOperation.confirmation();
        }

    });

    // 
    // Test: Create vaults - loan token - loan tokens: MockFA12 Tokens, MockFA2 Tokens, Mav
    //
    describe('setup vaults and context for pause tests below', function () {

        describe('%createVault', function () {
            
            it('user (eve) can create a new vault - LOAN TOKEN: MockFA2', async () => {
                try{        
                    
                    // init variables
                    await signerFactory(tezos, eve.sk);
                    const vaultFactoryStorage       = await vaultFactoryInstance.storage();
                    const vaultId                   = vaultFactoryStorage.vaultCounter.toNumber();
                    const vaultOwner                = eve.pkh;
                    const vaultName                 = "newVault";
                    const loanTokenName             = "eurt";
                    const vaultConfig               = 0; // vault config - standard type
                    const depositorsConfig          = "whitelist";

                    const userCreatesNewVaultOperation = await vaultFactoryInstance.methods.createVault(
                        baker.pkh,  
                        vaultConfig,
                        loanTokenName,
                        vaultName,
                        null,
                        depositorsConfig,
                        []
                    ).send();
                    await userCreatesNewVaultOperation.confirmation();

                    const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                    const vaultHandle = {
                        "id"    : vaultId,
                        "owner" : vaultOwner
                    }
                    const vaultRecord = await updatedLendingControllerStorage.vaults.get(vaultHandle);

                    assert.equal(vaultRecord.loanToken              , loanTokenName);
                    assert.equal(vaultRecord.loanOutstandingTotal   , 0);
                    assert.equal(vaultRecord.loanPrincipalTotal     , 0);
                    assert.equal(vaultRecord.loanInterestTotal      , 0);

                    const vaultOriginatedContract = await utils.tezos.contract.at(vaultRecord.address);
                    const vaultOriginatedContractStorage : vaultStorageType = await vaultOriginatedContract.storage();

                    assert.equal(vaultOriginatedContractStorage.admin , contractDeployments.vaultFactory.address);

                    // push new vault id to vault set
                    eveVaultSet.push(vaultId);

                } catch(e){
                    console.log(e);
                } 

            });    

        }); // end test: create vaults with mav as initial deposit



        // 
        // Test: Deposit into vault
        //
        describe('%deposit test', function () {
        
            it('user (eve) can deposit mav into her vaults', async () => {
                
                // init variables
                await signerFactory(tezos, eve.sk);
                const vaultId            = eveVaultSet[0];
                const vaultOwner         = eve.pkh;
                const depositAmountMumav = 10000000;
                const depositAmountMav   = 10;

                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                const lendingControllerStorage      = await lendingControllerInstance.storage();
                const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

                // get vault contract
                const vaultAddress             = vault.address;
                const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
                const eveVaultInstanceStorage  = await eveVaultInstance.storage();

                const eveDepositMavOperation  = await eveVaultInstance.methods.initVaultAction(
                    "deposit",
                    depositAmountMumav,                   // amt
                    "mav"                                 // token
                ).send({ mumav : true, amount : depositAmountMumav });
                await eveDepositMavOperation.confirmation();

                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const mavCollateralBalance            = await updatedVault.collateralBalanceLedger.get('mav');
                
                assert.equal(mavCollateralBalance, MAV(depositAmountMav));

            });

            it('user (eve) can deposit mock FA12 tokens into her vault (depositors: any)', async () => {
        
                // init variables
                await signerFactory(tezos, eve.sk);
                const vaultId            = eveVaultSet[0];
                const vaultOwner         = eve.pkh;

                const tokenName          = "usdt";
                const tokenType          = "fa12";
                const depositAmount      = 10000000;   // 10 Mock FA12 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();
                
                // create vault handle
                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };
                
                const vault                     = await lendingControllerStorage.vaults.get(vaultHandle);

                // get vault contract
                const vaultAddress              = vault.address;
                const vaultInstance             = await utils.tezos.contract.at(vaultAddress);

                // get mock fa12 token storage
                const mockFa12TokenStorage              = await mockFa12TokenInstance.storage();
                
                // get initial eve's Mock FA12 Token balance
                const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();

                // get initial vault's Mock FA12 Token balance
                const vaultMockFa12Ledger                = await mockFa12TokenStorage.ledger.get(vaultAddress);            
                const vaultInitialMockFa12TokenBalance   = vaultMockFa12Ledger == undefined ? 0 : vaultMockFa12Ledger.balance.toNumber();

                // eve resets mock FA12 tokens allowance then set new allowance to deposit amount
                // reset token allowance
                const resetTokenAllowance = await mockFa12TokenInstance.methods.approve(
                    vaultAddress,
                    0
                ).send();
                await resetTokenAllowance.confirmation();

                // set new token allowance
                const setNewTokenAllowance = await mockFa12TokenInstance.methods.approve(
                    vaultAddress,
                    depositAmount
                ).send();
                await setNewTokenAllowance.confirmation();

                // eve deposits mock FA12 tokens into vault
                const eveDepositMockFa12TokenOperation  = await vaultInstance.methods.initVaultAction(
                    "deposit",
                    depositAmount,          
                    tokenName
                ).send();
                await eveDepositMockFa12TokenOperation.confirmation();

                const updatedLendingControllerStorage   = await lendingControllerInstance.storage();
                const updatedVault                      = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const mockFa12TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);

                // vault Mock FA12 Token Collateral Balance
                assert.equal(mockFa12TokenCollateralBalance, depositAmount);

                // check Eve's Mock FA12 Token balance
                const updatedMockFa12TokenStorage      = await mockFa12TokenInstance.storage();
                const updatedEveMockFa12Ledger         = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMockFa12Ledger.balance, eveInitialMockFa12TokenBalance - depositAmount);

                // check vault's Mock FA12 Token Balance
                const vaultMockFa12Account             = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
                assert.equal(vaultMockFa12Account.balance, vaultInitialMockFa12TokenBalance + depositAmount);

            });

            it('user (eve) can deposit mock FA2 tokens into her vault (depositors: any)', async () => {
        
                // init variables
                await signerFactory(tezos, eve.sk);
                const vaultId            = eveVaultSet[0];
                const vaultOwner         = eve.pkh;
                const tokenName          = "eurt";
                const tokenType          = "fa2";
                const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();

                // create vault handle
                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                // get vault from Lending Controller        
                const vault = await lendingControllerStorage.vaults.get(vaultHandle);

                // get vault contract
                const vaultAddress             = vault.address;
                const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

                // get mock fa2 token storage
                const mockFa2TokenStorage       = await mockFa2TokenInstance.storage();
                
                // get initial eve's Mock FA2 Token balance
                const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                // get initial vault's Mock FA2 Token balance
                const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
                const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

                // get initial vault collateral token balance
                const vaultInitialTokenCollateralBalance = vault.collateralBalanceLedger.get(tokenName) == undefined ? 0 : vault.collateralBalanceLedger.get(tokenName).toNumber();

                // update operators for vault
                updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
                await updateOperatorsOperation.confirmation();

                // eve deposits mock FA2 tokens into vault
                const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                    "deposit",
                    depositAmount, 
                    tokenName
                ).send();
                await eveDepositTokenOperation.confirmation();

                const updatedLendingControllerStorage       = await lendingControllerInstance.storage();
                const updatedVault                          = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const vaultMockFa2TokenCollateralBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);

                // vault Mock FA2 Token Collateral Balance
                assert.equal(vaultMockFa2TokenCollateralBalance, vaultInitialTokenCollateralBalance + depositAmount);

                // check Eve's Mock FA2 Token balance
                const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
                const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - depositAmount);

                // check vault's Mock FA2 Token Balance
                const vaultMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
                assert.equal(vaultMockFa2Account, vaultInitialMockFa2TokenBalance + depositAmount);

            });

        }); // end test: deposit mav into vault



        // 
        // Test: Liquidity tests into Lending Pool
        //
        describe('liquidity tests', function () {

            it('%addLiquidity - user (eve) can add liquidity for mock FA2 token into Lending Controller token pool (10 MockFA2 Tokens)', async () => {
        
                // init variables
                await signerFactory(tezos, eve.sk);
                const loanTokenName = "eurt";
                const liquidityAmount = 10000000; // 10 Mock FA2 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();
                
                // get mock fa2 token storage and lp token pool mock fa2 token storage
                const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
                const mTokenPoolMockFa2TokenStorage   = await mTokenEurtInstance.storage();
                
                // get initial eve's Mock FA2 Token balance
                const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                // get initial eve's mEurt Token - Mock FA2 Token - balance
                const eveMEurtTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMEurtTokenTokenBalance    = eveMEurtTokenLedger == undefined ? 0 : eveMEurtTokenLedger.toNumber();

                // get initial lending controller's Mock FA2 Token balance
                const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
                const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

                // get initial lending controller token pool total
                const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
                const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

                // update operators for vault
                updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, contractDeployments.lendingController.address, tokenId);
                await updateOperatorsOperation.confirmation();

                // eve deposits mock FA12 tokens into lending controller token pool
                const eveDepositTokenOperation  = await lendingControllerInstance.methods.addLiquidity(
                    loanTokenName,
                    liquidityAmount
                ).send();
                await eveDepositTokenOperation.confirmation();

                // get updated storages
                const updatedLendingControllerStorage  = await lendingControllerInstance.storage();
                const updatedMockFa2TokenStorage       = await mockFa2TokenInstance.storage();
                
                const updatedMEurtTokenTokenStorage     = await mTokenEurtInstance.storage();

                // check new balance for loan token pool total
                const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
                assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal + liquidityAmount);

                // check Eve's Mock FA12 Token balance
                const updatedEveMockFa2Ledger          = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance - liquidityAmount);

                // check Lending Controller's Mock FA2 Token Balance
                const lendingControllerMockFa2Account             = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
                assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance + liquidityAmount);

                // check Eve's mEurt Token Token balance
                const updatedEveMEurtTokenLedger        = await updatedMEurtTokenTokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMEurtTokenLedger, eveInitialMEurtTokenTokenBalance + liquidityAmount);        

            });

            it('%removeLiquidity - user (eve) can remove liquidity for mock FA2 token from Lending Controller token pool (1 MockFA2 Tokens)', async () => {
        
                // update token reward index for mockFa2 loan token
                await signerFactory(tezos, bob.sk);
                updateTokenRewardIndexOperation = await mTokenEurtInstance.methods.transfer([
                {
                    from_: bob.pkh,
                    txs: [
                        {
                            to_: eve.pkh,
                            token_id: 0,
                            amount: 0,
                        },
                    ]
                }]).send();
                await updateTokenRewardIndexOperation.confirmation();

                // init variables
                await signerFactory(tezos, eve.sk);
                const loanTokenName = "eurt";
                const withdrawAmount = 1000000; // 1 Mock FA2 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();
                
                // get mock fa12 token storage and lp token pool mock fa2 token storage
                const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
                const mTokenPoolMockFa2TokenStorage   = await mTokenEurtInstance.storage();
                
                // get initial eve's Mock FA2 Token balance
                const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                // get initial eve's mEurt Token - Mock FA2 Token - balance
                const eveMEurtTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMEurtTokenTokenBalance    = eveMEurtTokenLedger == undefined ? 0 : eveMEurtTokenLedger.toNumber();

                // get initial lending controller's Mock FA2 Token balance
                const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
                const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

                // get initial lending controller token pool total
                const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
                const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

                // eve withdraws mock FA2 tokens liquidity from lending controller token pool
                const eveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                    loanTokenName,
                    withdrawAmount, 
                ).send();
                await eveWithdrawTokenOperation.confirmation();

                // get updated storages
                const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
                const updatedMockFa2TokenStorage              = await mockFa2TokenInstance.storage();
                const updatedMEurtTokenTokenStorage   = await mTokenEurtInstance.storage();

                // Summary - Liquidity Removed for Mock FA2 Token
                // 1) Loan Token Pool Record Balance - decrease
                // 2) Lending Controller Token Balance - decrease
                // 3) User mToken Balance - decrease
                // 4) User Token Balance - increase

                // 1) check new balance for loan token pool total
                const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
                assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

                // 2) check Lending Controller's Mock FA2 Token Balance
                const lendingControllerMockFa2Account  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
                assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance - withdrawAmount);

                // 3) check Eve's mEurt Token Token balance
                const updatedEveMEurtTokenLedger        = await updatedMEurtTokenTokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMEurtTokenLedger, eveInitialMEurtTokenTokenBalance - withdrawAmount);        

                // 4) check Eve's Mock FA2 Token balance
                const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance + withdrawAmount);

            });

        }); // end test: add liquidity 



        // 
        // Test: borrow 
        //
        describe('vault borrow and withdraw', function () {

            it('%borrow - user (eve) can borrow 1 Mock FA2 Tokens', async () => {

                await signerFactory(tezos, eve.sk);
                const vaultId            = eveVaultSet[0];
                const vaultOwner         = eve.pkh;
                const borrowAmount       = 1000000; // 1 Mock FA2 Tokens

                // setup vault handle and vault record
                const vaultHandle = {
                    "id"    : vaultId,
                    "owner" : vaultOwner
                };
                const vaultRecord = await lendingControllerStorage.vaults.get(vaultHandle);

                const vaultConfigRecord      = lendingControllerStorage.vaultConfigLedger.get(vaultRecord.vaultConfig);
                const decimals               = lendingControllerStorage.config.decimals;       // e.g. 3
                const minimumLoanFeePercent  = vaultConfigRecord.minimumLoanFeePercent;        // e.g. 1%
                const minimumLoanFee         = (borrowAmount * minimumLoanFeePercent) / (10 ** decimals);
                const finalLoanAmount        = borrowAmount - minimumLoanFee;

                // get initial variables
                const initialLoanOutstandingTotal   = vaultRecord.loanOutstandingTotal.toNumber();
                const initialLoanPrincipalTotal     = vaultRecord.loanPrincipalTotal.toNumber();
                const initialLoanInterestTotal      = vaultRecord.loanInterestTotal.toNumber();

                // get initial eve's Mock FA2 Token balance
                const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount).send();
                await eveBorrowOperation.confirmation();

                // get updated storage
                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const updatedVaultRecord              = await updatedLendingControllerStorage.vaults.get(vaultHandle);

                const updatedLoanOutstandingTotal     = updatedVaultRecord.loanOutstandingTotal;
                const updatedLoanPrincipalTotal       = updatedVaultRecord.loanPrincipalTotal;
                const updatedLoanInterestTotal        = updatedVaultRecord.loanInterestTotal;

                const updatedMockFa2TokenStorage      = await mockFa2TokenInstance.storage();
                const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                const updatedEveMockFa2TokenBalance   = updatedEveMockFa2Ledger.toNumber();

                assert.equal(updatedLoanOutstandingTotal, initialLoanOutstandingTotal + borrowAmount);
                assert.equal(updatedLoanPrincipalTotal, initialLoanPrincipalTotal + borrowAmount);
                assert.equal(updatedLoanInterestTotal, 0);

                // check eve Mock FA2 Token balance
                assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + finalLoanAmount);

            });

            it('user (eve) can withdraw mav from her vault', async () => {

                await signerFactory(tezos, eve.sk);
                const vaultId              = eveVaultSet[0]; 
                const vaultOwner           = eve.pkh;
                const withdrawAmount       = 1000000; // 1 mav
                const tokenName            = 'mav';

                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                const lendingControllerStorage      = await lendingControllerInstance.storage();
                const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

                const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

                // get vault contract
                const vaultAddress = vault.address;

                // get initial MVRK balance for Eve and Vault
                const eveMvrkLedger             = await utils.tezos.tz.getBalance(eve.pkh);
                const eveInitialMvrkBalance     = eveMvrkLedger.toNumber();

                const vaultMvrkLedger           = await utils.tezos.tz.getBalance(vaultAddress);
                const vaultInitialMvrkBalance   = vaultMvrkLedger.toNumber();

                const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

                // withdraw operation
                const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                    "withdraw",
                    withdrawAmount,                 
                    tokenName                            
                ).send();
                await eveWithdrawOperation.confirmation();

                // get updated storages for lending controller and vault
                const updatedLendingControllerStorage       = await lendingControllerInstance.storage();
                const updatedVault                          = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const updatedVaultCollateralTokenBalance    = await updatedVault.collateralBalanceLedger.get(tokenName);

                // get updated MVRK balance for Eve and Vault
                const updatedEveMvrkLedger             = await utils.tezos.tz.getBalance(eve.pkh);
                const updatedEveMvrkBalance            = updatedEveMvrkLedger.toNumber();

                const updatedVaultMvrkLedger           = await utils.tezos.tz.getBalance(vaultAddress);
                const updatedVaultMvrkBalance          = updatedVaultMvrkLedger.toNumber();

                assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
                assert.equal(updatedVaultMvrkBalance, vaultInitialMvrkBalance - withdrawAmount);

                // account for minute differences from gas in sending transaction
                assert.equal(almostEqual(updatedEveMvrkBalance, eveInitialMvrkBalance + withdrawAmount, 0.0001), true)            

            });


            it('user (eve) can withdraw mockFa12 token from her vault', async () => {
                try{
                    await signerFactory(tezos, eve.sk);
                    const vaultId              = eveVaultSet[0]; 
                    const vaultOwner           = eve.pkh;
                    const withdrawAmount       = 1000000; // 1 mockFa12 token
                    const tokenName            = 'usdt';
        
                    const vaultHandle = {
                        "id"     : vaultId,
                        "owner"  : vaultOwner
                    };
                    const lendingControllerStorage      = await lendingControllerInstance.storage();
                    const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);
        
                    const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);
        
                    // get vault contract
                    const vaultAddress = vault.address;
        
                    // get initial balance for Eve and Vault
                    const eveMockFa12Ledger                 = await mockFa12TokenStorage.ledger.get(eve.pkh);            
                    const eveInitialMockFa12TokenBalance    = eveMockFa12Ledger == undefined ? 0 : eveMockFa12Ledger.balance.toNumber();
        
                    const vaultMockFa12Ledger               = await mockFa12TokenStorage.ledger.get(vaultAddress);            
                    const vaultInitialMockFa12TokenBalance  = vaultMockFa12Ledger == undefined ? 0 : vaultMockFa12Ledger.balance.toNumber();
        
                    const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
        
                    // withdraw operation
                    const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                        "withdraw",
                        withdrawAmount,                 
                        tokenName                            
                    ).send();
                    await eveWithdrawOperation.confirmation();
        
                    // get updated storages for lending controller and vault
                    const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
                    const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                    const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
                    const updatedMockFa12TokenStorage          = await mockFa12TokenInstance.storage();
        
                    // get updated balance for Eve and Vault
                    const updatedEveMockFa12Ledger             = await updatedMockFa12TokenStorage.ledger.get(eve.pkh);            
                    const updatedEveMockFa12TokenBalance       = updatedEveMockFa12Ledger == undefined ? 0 : updatedEveMockFa12Ledger.balance.toNumber();
        
                    const updatedVaultMockFa12Ledger           = await updatedMockFa12TokenStorage.ledger.get(vaultAddress);            
                    const updatedVaultMockFa12TokenBalance     = updatedVaultMockFa12Ledger == undefined ? 0 : updatedVaultMockFa12Ledger.balance.toNumber();
                    
        
                    assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
                    assert.equal(updatedVaultMockFa12TokenBalance, vaultInitialMockFa12TokenBalance - withdrawAmount);
                    assert.equal(updatedEveMockFa12TokenBalance, eveInitialMockFa12TokenBalance + withdrawAmount);
        

                } catch(e){
                    console.dir(e, {depth:5})
                }
            });


            it('user (eve) can withdraw mockFa2 token from her vault', async () => {

                await signerFactory(tezos, eve.sk);
                const vaultId              = eveVaultSet[0]; 
                const vaultOwner           = eve.pkh;
                const withdrawAmount       = 1000000; // 1 mockFa2 token
                const tokenName            = 'eurt';

                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                const lendingControllerStorage      = await lendingControllerInstance.storage();
                const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

                const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

                // get vault contract
                const vaultAddress = vault.address;

                // get initial balance for Eve and Vault
                const eveMockFa2Ledger                  = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance     = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
                const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

                const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

                // withdraw operation
                const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                    "withdraw",
                    withdrawAmount,                 
                    tokenName                            
                ).send();
                await eveWithdrawOperation.confirmation();

                // get updated storages for lending controller and vault
                const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
                const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
                const updatedMockFa2TokenStorage           = await mockFa2TokenInstance.storage();

                // get updated balance for Eve and Vault
                const updatedEveMockFa2Ledger              = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                const updatedEveMockFa2TokenBalance        = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

                const updatedVaultMockFa2Ledger            = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
                const updatedVaultMockFa2TokenBalance      = updatedVaultMockFa2Ledger == undefined ? 0 : updatedVaultMockFa2Ledger.toNumber();
                

                assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
                assert.equal(updatedVaultMockFa2TokenBalance, vaultInitialMockFa2TokenBalance - withdrawAmount);
                assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + withdrawAmount);

            });
        })

    })

    // 
    // Test: Pause Loan Token - cannot add liquidity, can remove liquidity
    //
    describe('test paused loan token', function () {
    
        it('admin should be able to update and pause a loan token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);
                
                const updateLoanTokenActionType                = "updateLoanToken";
                const tokenName                                = "eurt";
                const interestRateDecimals                     = 27;
                
                const newOracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;

                const newReserveRatio                          = 2000; // 20% reserves (4 decimals)
                const newOptimalUtilisationRate                = 50 * (10 ** (interestRateDecimals - 2));   // 50% utilisation rate kink
                const newBaseInterestRate                      = 10  * (10 ** (interestRateDecimals - 2));  // 5%
                const newMaxInterestRate                       = 50 * (10 ** (interestRateDecimals - 2));  // 25% 
                const newInterestRateBelowOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 10% 
                const newInterestRateAboveOptimalUtilisation   = 30 * (10 ** (interestRateDecimals - 2));  // 20%
                const newMinRepaymentAmount                    = 20000;
                const isPaused                                 = true;

                const adminUpdateMockFa2LoanTokenOperation = await lendingControllerInstance.methods.setLoanToken(

                    updateLoanTokenActionType,
                    
                    tokenName,

                    newOracleAddress,
                    
                    newReserveRatio,
                    newOptimalUtilisationRate,
                    newBaseInterestRate,
                    newMaxInterestRate,
                    newInterestRateBelowOptimalUtilisation,
                    newInterestRateAboveOptimalUtilisation,
                    newMinRepaymentAmount,

                    isPaused
                    
                ).send();
                await adminUpdateMockFa2LoanTokenOperation.confirmation();

                lendingControllerStorage = await lendingControllerInstance.storage();
                const updatedMockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get(tokenName); 

                assert.equal(updatedMockFa2LoanToken.tokenName      , tokenName);
                assert.equal(updatedMockFa2LoanToken.isPaused       , isPaused);
                
            } catch(e){
                console.log(e);
            } 
        });

        it('user (eve) should not be able to add liqudity if loan token is paused', async () => {

            try{        

                // init variables
                await signerFactory(tezos, eve.sk);
                const loanTokenName = "eurt";
                const liquidityAmount = 10000000; // 10 Mock FA2 Tokens

                // update operators for vault
                updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, contractDeployments.lendingController.address, tokenId);
                await updateOperatorsOperation.confirmation();

                // eve fail to deposit mock FA2 tokens into lending controller token pool as the loan token is paused
                const failEveDepositTokenOperation  = lendingControllerInstance.methods.addLiquidity(
                    loanTokenName,
                    liquidityAmount
                );
                await chai.expect(failEveDepositTokenOperation.send()).to.be.rejected;    

            } catch(e){
                console.log(e);
            } 
        });

        it('user (eve) should still be able to remove liqudity even if loan token is paused', async () => {

            try{       
                
                // zero transfer to update token reward index
                await signerFactory(tezos, bob.sk);
                updateTokenRewardIndexOperation = await fa2Transfer(mTokenEurtInstance, bob.pkh, eve.pkh, 0, 0);
                await updateTokenRewardIndexOperation.confirmation();

                // init variables
                await signerFactory(tezos, eve.sk);
                const loanTokenName = "eurt";
                const withdrawAmount = 1000000; // 1 Mock FA2 Tokens

                lendingControllerStorage = await lendingControllerInstance.storage();
                
                // get mock fa12 token storage and lp token pool mock fa2 token storage
                const mockFa2TokenStorage              = await mockFa2TokenInstance.storage();
                const mTokenPoolMockFa2TokenStorage   = await mTokenEurtInstance.storage();
                
                // get initial eve's Mock FA2 Token balance
                const eveMockFa2Ledger                 = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance    = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                // get initial eve's mEurt Token - Mock FA2 Token - balance
                const eveMEurtTokenLedger                 = await mTokenPoolMockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMEurtTokenTokenBalance    = eveMEurtTokenLedger == undefined ? 0 : eveMEurtTokenLedger.toNumber();

                // get initial lending controller's Mock FA2 Token balance
                const lendingControllerMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
                const lendingControllerInitialMockFa2TokenBalance   = lendingControllerMockFa2Ledger == undefined ? 0 : lendingControllerMockFa2Ledger.toNumber();

                // get initial lending controller token pool total
                const initialLoanTokenRecord                 = await lendingControllerStorage.loanTokenLedger.get(loanTokenName);
                const lendingControllerInitialTokenPoolTotal = initialLoanTokenRecord.tokenPoolTotal.toNumber();

                // eve withdraws mock FA2 tokens liquidity from lending controller token pool
                const eveWithdrawTokenOperation  = await lendingControllerInstance.methods.removeLiquidity(
                    loanTokenName,
                    withdrawAmount, 
                ).send();
                await eveWithdrawTokenOperation.confirmation();

                // get updated storages
                const updatedLendingControllerStorage         = await lendingControllerInstance.storage();
                const updatedMockFa2TokenStorage              = await mockFa2TokenInstance.storage();
                const updatedMEurtTokenTokenStorage   = await mTokenEurtInstance.storage();

                // lendingControllerStorage = await lendingControllerInstance.storage();
                const updatedMockFa2LoanToken   = await lendingControllerStorage.loanTokenLedger.get('eurt'); 

                // Summary - Liquidity Removed for Mock FA2 Token
                // 1) Loan Token Pool Record Balance - decrease
                // 2) Lending Controller Token Balance - decrease
                // 3) User mToken Balance - decrease
                // 4) User Token Balance - increase

                // 1) check new balance for loan token pool total
                const updatedLoanTokenRecord           = await updatedLendingControllerStorage.loanTokenLedger.get(loanTokenName);
                assert.equal(updatedLoanTokenRecord.tokenPoolTotal, lendingControllerInitialTokenPoolTotal - withdrawAmount);

                // 2) check Lending Controller's Mock FA2 Token Balance
                const lendingControllerMockFa2Account  = await updatedMockFa2TokenStorage.ledger.get(contractDeployments.lendingController.address);            
                assert.equal(lendingControllerMockFa2Account, lendingControllerInitialMockFa2TokenBalance - withdrawAmount);

                // 3) check Eve's mEurt Token Token balance
                const updatedEveMEurtTokenLedger        = await updatedMEurtTokenTokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMEurtTokenLedger, eveInitialMEurtTokenTokenBalance - withdrawAmount);        

                // 4) check Eve's Mock FA2 Token balance
                const updatedEveMockFa2Ledger         = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                assert.equal(updatedEveMockFa2Ledger, eveInitialMockFa2TokenBalance + withdrawAmount);
                
            } catch(e){
                console.log(e);
            } 
        });


        it('user (eve) should still be able to deposit into vault even if loan token is paused', async () => {

            try{       

                const vaultId            = eveVaultSet[0]; // vault with mockFa2 loan token
                const vaultOwner         = eve.pkh;
                const depositAmountMav   = 1;
                const depositAmountMumav = 1000000;

                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                const vault                    = await lendingControllerStorage.vaults.get(vaultHandle);

                // get vault contract
                const vaultAddress             = vault.address;
                const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);
                const eveVaultInstanceStorage  = await eveVaultInstance.storage();

                const initialMavCollateralBalance   = await vault.collateralBalanceLedger.get('mav');

                const eveDepositMavOperation   = await eveVaultInstance.methods.initVaultAction(
                    "deposit",              // vault action type
                    depositAmountMumav,     // amt
                    "mav"                   // token
                ).send({ mumav : true, amount : depositAmountMumav });
                await eveDepositMavOperation.confirmation();

                const updatedLendingControllerStorage = await lendingControllerInstance.storage();
                const updatedVault                    = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const mavCollateralBalance            = await updatedVault.collateralBalanceLedger.get('mav');
                
                assert.equal(mavCollateralBalance, initialMavCollateralBalance.toNumber() + MAV(depositAmountMav));
                
            } catch(e){
                console.log(e);
            } 
        });


        it('user (eve) should not be able to borrow from vault if loan token is paused', async () => {

            try{        

                const vaultId            = eveVaultSet[0]; // vault with mockFa2 loan token
                const vaultOwner         = eve.pkh;
                const borrowAmount       = 100000;

                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                const vault = await lendingControllerStorage.vaults.get(vaultHandle);

                // borrow operation
                const eveBorrowOperation = await lendingControllerInstance.methods.borrow(vaultId, borrowAmount);
                await chai.expect(eveBorrowOperation.send()).to.be.rejected;    

                
            } catch(e){
                console.log(e);
            } 
        });


        it('user (eve) should still be able to withdraw from vault even if loan token is paused', async () => {

            try{        

                await signerFactory(tezos, eve.sk);
                const vaultId              = eveVaultSet[0]; 
                const vaultOwner           = eve.pkh;
                const withdrawAmount       = 100000; // 0.1 mockFa2 token
                const tokenName            = 'eurt';

                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                const lendingControllerStorage      = await lendingControllerInstance.storage();
                const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

                const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

                // get vault contract
                const vaultAddress = vault.address;

                // get initial balance for Eve and Vault
                const eveMockFa2Ledger                  = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance     = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
                const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

                const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

                // withdraw operation
                const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                    "withdraw",
                    withdrawAmount,                 
                    tokenName                            
                ).send();
                await eveWithdrawOperation.confirmation();

                // get updated storages for lending controller and vault
                const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
                const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
                const updatedMockFa2TokenStorage           = await mockFa2TokenInstance.storage();

                // get updated balance for Eve and Vault
                const updatedEveMockFa2Ledger              = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                const updatedEveMockFa2TokenBalance        = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

                const updatedVaultMockFa2Ledger            = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
                const updatedVaultMockFa2TokenBalance      = updatedVaultMockFa2Ledger == undefined ? 0 : updatedVaultMockFa2Ledger.toNumber();
                
                assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
                assert.equal(updatedVaultMockFa2TokenBalance, vaultInitialMockFa2TokenBalance - withdrawAmount);
                assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + withdrawAmount);

                
            } catch(e){
                console.log(e);
            } 
        });

    });


    // 
    // Test: Pause Loan Token - cannot add liquidity, can remove liquidity
    //
    describe('test paused collateral token', function () {

        it('admin should be able to update and pause a collateral token', async () => {

            try{        
                
                // init variables
                await signerFactory(tezos, bob.sk);

                const tokenName                             = "eurt";

                const updateCollateralTokenActionType       = "updateCollateralToken";
                const oracleAddress                         = contractDeployments.mockUsdMockFa2TokenAggregator.address;
                const stakingContractAddress                = null;
                const maxDepositAmount                      = null;
                const isPaused                              = true;
                
                const adminSetMockFa2CollateralTokenOperation = await lendingControllerInstance.methods.setCollateralToken(

                    updateCollateralTokenActionType,
                    
                    tokenName,
                    oracleAddress,
                    isPaused,

                    stakingContractAddress,
                    maxDepositAmount

                ).send();
                await adminSetMockFa2CollateralTokenOperation.confirmation();

                lendingControllerStorage               = await lendingControllerInstance.storage();
                const updatedMockFa2CollateralToken    = await lendingControllerStorage.collateralTokenLedger.get(tokenName); 

                // collateral token should now be paused
                assert.equal(updatedMockFa2CollateralToken.isPaused       , isPaused);

            } catch(e){
                console.log(e);
            } 
        });


        it('user (eve) should not be able to deposit mock FA2 collateral tokens into her vault', async () => {

            // init variables
            await signerFactory(tezos, eve.sk);
            const vaultId            = eveVaultSet[0];
            const vaultOwner         = eve.pkh;
            const tokenName          = "eurt";
            const depositAmount      = 10000000;   // 10 Mock FA2 Tokens

            lendingControllerStorage = await lendingControllerInstance.storage();

            // create vault handle
            const vaultHandle = {
                "id"     : vaultId,
                "owner"  : vaultOwner
            };

            // get vault from Lending Controller        
            const vault = await lendingControllerStorage.vaults.get(vaultHandle);

            // get vault contract
            const vaultAddress             = vault.address;
            const vaultInstance            = await utils.tezos.contract.at(vaultAddress);

            // update operators for vault
            updateOperatorsOperation = await updateOperators(mockFa2TokenInstance, eve.pkh, vaultAddress, tokenId);
            await updateOperatorsOperation.confirmation();

            // eve fails to deposit mock FA2 tokens into vault
            const eveDepositTokenOperation  = await vaultInstance.methods.initVaultAction(
                "deposit",
                depositAmount, 
                tokenName
            );
            await chai.expect(eveDepositTokenOperation.send()).to.be.rejected;    

        });

        it('user (eve) should still be able to withdraw from vault even if collateral token is paused', async () => {

            try{        

                await signerFactory(tezos, eve.sk);
                const vaultId              = eveVaultSet[0]; 
                const vaultOwner           = eve.pkh;
                const withdrawAmount       = 100000; // 0.1 mockFa2 token
                const tokenName            = 'eurt';

                const vaultHandle = {
                    "id"     : vaultId,
                    "owner"  : vaultOwner
                };

                const lendingControllerStorage      = await lendingControllerInstance.storage();
                const vault                         = await lendingControllerStorage.vaults.get(vaultHandle);

                const initialVaultCollateralTokenBalance   = await vault.collateralBalanceLedger.get(tokenName);

                // get vault contract
                const vaultAddress = vault.address;

                // get initial balance for Eve and Vault
                const eveMockFa2Ledger                  = await mockFa2TokenStorage.ledger.get(eve.pkh);            
                const eveInitialMockFa2TokenBalance     = eveMockFa2Ledger == undefined ? 0 : eveMockFa2Ledger.toNumber();

                const vaultMockFa2Ledger                = await mockFa2TokenStorage.ledger.get(vaultAddress);            
                const vaultInitialMockFa2TokenBalance   = vaultMockFa2Ledger == undefined ? 0 : vaultMockFa2Ledger.toNumber();

                const eveVaultInstance         = await utils.tezos.contract.at(vaultAddress);

                // withdraw operation
                const eveWithdrawOperation  = await eveVaultInstance.methods.initVaultAction(
                    "withdraw",
                    withdrawAmount,                 
                    tokenName                            
                ).send();
                await eveWithdrawOperation.confirmation();

                // get updated storages for lending controller and vault
                const updatedLendingControllerStorage      = await lendingControllerInstance.storage();
                const updatedVault                         = await updatedLendingControllerStorage.vaults.get(vaultHandle);
                const updatedVaultCollateralTokenBalance   = await updatedVault.collateralBalanceLedger.get(tokenName);
                const updatedMockFa2TokenStorage           = await mockFa2TokenInstance.storage();

                // get updated balance for Eve and Vault
                const updatedEveMockFa2Ledger              = await updatedMockFa2TokenStorage.ledger.get(eve.pkh);            
                const updatedEveMockFa2TokenBalance        = updatedEveMockFa2Ledger == undefined ? 0 : updatedEveMockFa2Ledger.toNumber();

                const updatedVaultMockFa2Ledger            = await updatedMockFa2TokenStorage.ledger.get(vaultAddress);            
                const updatedVaultMockFa2TokenBalance      = updatedVaultMockFa2Ledger == undefined ? 0 : updatedVaultMockFa2Ledger.toNumber();

                assert.equal(updatedVaultCollateralTokenBalance, initialVaultCollateralTokenBalance - withdrawAmount);
                assert.equal(updatedVaultMockFa2TokenBalance, vaultInitialMockFa2TokenBalance - withdrawAmount);
                assert.equal(updatedEveMockFa2TokenBalance, eveInitialMockFa2TokenBalance + withdrawAmount);
                
            } catch(e){
                console.log(e);
            } 
        });

    });

});