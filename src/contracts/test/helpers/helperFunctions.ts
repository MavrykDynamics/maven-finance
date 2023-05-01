const { InMemorySigner } = require("@taquito/signer");
import { BigNumber } from "bignumber.js"

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

export const fixedPointAccuracy = 10**27;

// ------------------------------------------------------------------------------
// RPC Nodes
// ------------------------------------------------------------------------------

export const rpcNodes = {
    activenet: "https://mainnet.smartpy.io",
    ghostnet : "https://ghostnet.ecadinfra.com"
}

// ------------------------------------------------------------------------------
// Signer Factory
// ------------------------------------------------------------------------------

export async function signerFactory (tezos, pk) {
    await tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) })
    return tezos
}

// ------------------------------------------------------------------------------
// Common Functions
// ------------------------------------------------------------------------------

export async function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomNumberFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
  
export const almostEqual = (actual, expected, delta) => {
    let greaterLimit  = expected + expected * delta
    let lowerLimit    = expected - expected * delta
    return actual <= greaterLimit && actual >= lowerLimit
}


export async function getStorageMapValue (contractStorage, mapName, key) {
    const storageMapValue = await contractStorage[mapName].get(key);
    return storageMapValue;
}


export async function updateWhitelistContracts (contractInstance, key, address, updateType) {
    const updateWhitelistContractsOperation = await contractInstance.methods.updateWhitelistContracts(key, address, updateType).send();
    return updateWhitelistContractsOperation;
}


export async function updateGeneralContracts (contractInstance, key, address, updateType) {
    const updateGeneralContractsOperation = await contractInstance.methods.updateGeneralContracts(key, address, updateType).send();
    return updateGeneralContractsOperation;
}


export async function updateWhitelistTokenContracts (contractInstance, key, address, updateType) {
    const updateWhitelistTokenContractsOperation = await contractInstance.methods.updateWhitelistTokenContracts(key, address, updateType).send();
    return updateWhitelistTokenContractsOperation;
}

// ------------------------------------------------------------------------------
// Token Approvals and Operators
// ------------------------------------------------------------------------------

export async function updateOperators (tokenContractInstance, owner, operator, tokenId) {
    const updateOperatorsOperation = await tokenContractInstance.methods.update_operators([
        {
            add_operator: {
                owner    : owner,
                operator : operator,
                token_id : tokenId,
            },
        }
    ]).send();
    return updateOperatorsOperation;
}


export async function removeOperators (tokenContractInstance, owner, operator, tokenId) {
    const updateOperatorsOperation = await tokenContractInstance.methods.update_operators([
        {
            remove_operator: {
                owner    : owner,
                operator : operator,
                token_id : tokenId,
            },
        }
    ]).send();
    return updateOperatorsOperation;
}


export async function fa12Transfer (tokenContractInstance, from, to, tokenAmount) {
    const transferOperation = await tokenContractInstance.methods.transfer(from, to, tokenAmount).send()
    return transferOperation;
}


export async function fa2Transfer (tokenContractInstance, from, to, tokenId, tokenAmount) {
    const transferOperation = await tokenContractInstance.methods.transfer([
        {
            from_ : from,
            txs: [
                {
                    to_      : to,
                    token_id : tokenId,
                    amount   : tokenAmount,
                }
            ]
        }
    ]).send()
    return transferOperation;
}


export async function fa2MultiTransfer (tokenContractInstance, from, transferDestination) {
    
    let transactions = [];
    for(let i = 0; i < transferDestination.length; i++){
        const singleTransaction = {
            to_      : transferDestination[i][0],
            token_id : transferDestination[i][1],
            amount   : transferDestination[i][2],
        };
        transactions.push(singleTransaction);
    }

    const transferOperation = await tokenContractInstance.methods.transfer([
        {
            from_ : from,
            txs   : transactions
        }
    ]).send()
    return transferOperation;
}


export function mistakenTransferFa2Token (contractInstance, to, tokenContractAddress, tokenId, tokenAmount) {
    const mistakenTransferOperation = contractInstance.methods.mistakenTransfer(
    [
        {
            "to_"    : to,
            "token"  : {
                "fa2" : {
                    "tokenContractAddress": tokenContractAddress,
                    "tokenId" : tokenId
                }
            },
            "amount" : tokenAmount
        }
    ])
    return mistakenTransferOperation;
}


export function mistakenTransferFa12Token (contractInstance, to, tokenContractAddress, tokenAmount) {
    const mistakenTransferOperation = contractInstance.methods.mistakenTransfer(
    [
        {
            "to_"    : to,
            "token"  : {
                "fa12" : tokenContractAddress
            },
            "amount" : tokenAmount
        }
    ])
    return mistakenTransferOperation;
}



// export async function fa2MultiTransfer (tokenContractInstance, transferDestination) {
    
//     let transferDestinations = [];
//     for(let i = 0; i < transferDestination.length; i++){

//         let transactions = [];
//         for(let i = 0; i < transferDestination[i].txs.length; i++){
//             const singleTransaction = {
//                 to_      : transferDestination[i][0],
//                 token_id : transferDestination[i][1],
//                 amount   : transferDestination[i][2],
//             };
//             transactions.push(singleTransaction);
//         }

//         const singleTransferDestination = {
//             from : transferDestination[i].from,
//             txs  : transactions
//         };
//         transferDestinations.push(singleTransferDestination);
//     }

//     const transferOperation = await tokenContractInstance.methods.transfer(transferDestinations).send()
//     return transferOperation;
// }


// ------------------------------------------------------------------------------
// Doorman Helpers
// ------------------------------------------------------------------------------

export const calculateMavrykLoyaltyIndex = (stakedMvkTotal : number, mvkTotalSupply : number) => {
    return Math.trunc((stakedMvkTotal * 100 * fixedPointAccuracy) / mvkTotalSupply);
}


export const calculateExitFeePercent = (mavrykLoyaltyIndex : number) => {
    return ( ((300_000 * fixedPointAccuracy) - (5_250 * mavrykLoyaltyIndex)) * fixedPointAccuracy + 25 * mavrykLoyaltyIndex * mavrykLoyaltyIndex) / (10_000 * fixedPointAccuracy)
}


export const calculateExitFeeRewards = (initialStakedMvkBalance : number, updatedParticipationFeesPerShare : number, updatedAccumulatedFeesPerShare : number) => {
    const currentFeesPerShare = Math.abs(updatedAccumulatedFeesPerShare - updatedParticipationFeesPerShare);
    const exitFeeRewards = Math.trunc(currentFeesPerShare * initialStakedMvkBalance / fixedPointAccuracy);
    return exitFeeRewards
}


export const calcUpdatedAccumulatedFeesPerShare = (paidFee : number, unstakeAmount : number, stakedMvkTotalSupply : number, accumulatedFeesPerShare : BigNumber) => {

    const stakedTotalWithoutUnstakeAmount = Math.abs(stakedMvkTotalSupply - unstakeAmount);
    let newAccumulatedFeesPerShare = accumulatedFeesPerShare.toNumber();

    if(stakedTotalWithoutUnstakeAmount > 0){
        newAccumulatedFeesPerShare = accumulatedFeesPerShare.toNumber() + Number(Math.trunc(paidFee / stakedTotalWithoutUnstakeAmount));
    }
    return newAccumulatedFeesPerShare

}

export const calcIncrementAccumulatedFeesPerShare = (paidFee : number, unstakeAmount : number, stakedMvkTotalSupply : number) => {

    const stakedTotalWithoutUnstakeAmount = Math.abs(stakedMvkTotalSupply - unstakeAmount);
    
    if(stakedTotalWithoutUnstakeAmount > 0){
        return Number(Math.trunc(paidFee / stakedTotalWithoutUnstakeAmount));
    }

}



// ------------------------------------------------------------------------------
// Satellite Rewards Helpers
// ------------------------------------------------------------------------------


export const calcRewardsPerShareAfterDistributeRewards = (rewardAmount : number, satelliteFee : number, satelliteTotalStakedMvk : number) => {

    const satelliteFeeReward                    = Math.floor((satelliteFee * rewardAmount) / 10000);
    const totalDistributionAmountForDelegates   = rewardAmount - satelliteFeeReward;
    const incrementRewardsPerShare              = totalDistributionAmountForDelegates / satelliteTotalStakedMvk;

    return incrementRewardsPerShare
} 
