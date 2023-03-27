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
// Token Approvals and Operators
// ------------------------------------------------------------------------------

export async function updateOperators (tokenContractInstance, owner, tokenContractAddress, tokenId) {
    const updateOperatorsOperation = await tokenContractInstance.methods.update_operators([
        {
            add_operator: {
                owner: owner,
                operator: tokenContractAddress,
                token_id: tokenId,
            },
        }
    ]).send();
    return updateOperatorsOperation;
}

