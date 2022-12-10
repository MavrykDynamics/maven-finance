// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "./transferTypes.ligo"
#include "../contractTypes/treasuryTypes.ligo"
#include "../contractTypes/mvkTokenTypes.ligo"

// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferTez(const to_ : contract(unit); const amt : tez) : operation is Tezos.transaction(unit, amt, to_)


function transferFa12Token(const from_ : address; const to_ : address; const tokenAmount : nat; const tokenContractAddress : address) : operation is
    block{

        const transferParams : fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract : contract(fa12TransferType) =
            case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress) : option(contract(fa12TransferType))) of [
                    Some (c) -> c
                |   None     -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND) : contract(fa12TransferType))
            ];

    } with (Tezos.transaction(transferParams, 0tez, tokenContract))


function transferFa2Token(const from_ : address; const to_ : address; const tokenAmount : nat; const tokenId : nat; const tokenContractAddress : address) : operation is
block{

    const transferParams : fa2TransferType = list[
            record[
                from_ = from_;
                txs = list[
                    record[
                        to_      = to_;
                        token_id = tokenId;
                        amount   = tokenAmount;
                    ]
                ]
            ]
        ];

    const tokenContract : contract(fa2TransferType) =
        case (Tezos.get_entrypoint_opt("%transfer", tokenContractAddress) : option(contract(fa2TransferType))) of [
                Some (c) -> c
            |   None     -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];
        
} with (Tezos.transaction(transferParams, 0tez, tokenContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Common Operation Helpers
// ------------------------------------------------------------------------------

// helper function to get transfer entrypoint in treasury contract
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to get %mint entrypoint from MVK Token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintType) is
    case (Tezos.get_entrypoint_opt(
        "%mint",
        token_address) : option(contract(mintType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_MINT_ENTRYPOINT_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : contract(mintType))
        ];



// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
    case (Tezos.get_entrypoint_opt(
        "%mintMvkAndTransfer",
        contractAddress) : option(contract(mintMvkAndTransferType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
        ];
