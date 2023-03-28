const { InMemorySigner } = require("@taquito/signer");

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

export const almostEqual = (actual, expected, delta) => {
    let greaterLimit  = expected + expected * delta
    let lowerLimit    = expected - expected * delta
    return actual <= greaterLimit && actual >= lowerLimit
}


export async function updateWhitelistContracts (contractInstance, key, address) {
    const updateWhitelistContractsOperation = await contractInstance.methods.updateWhitelistContracts(key, address).send();
    return updateWhitelistContractsOperation;
}


export async function updateGeneralContracts (contractInstance, key, address) {
    const updateGeneralContractsOperation = await contractInstance.methods.updateGeneralContracts(key, address).send();
    return updateGeneralContractsOperation;
}


export async function updateWhitelistTokenContracts (contractInstance, key, address) {
    const updateWhitelistTokenContractsOperation = await contractInstance.methods.updateWhitelistTokenContracts(key, address).send();
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

