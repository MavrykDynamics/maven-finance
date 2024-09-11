// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "./transferTypes.ligo"
#include "../contractTypes/treasuryTypes.ligo"
#include "../contractTypes/mvnTokenTypes.ligo"

// ------------------------------------------------------------------------------
// Transfer Helper Functions Begin
// ------------------------------------------------------------------------------

function transferMav(const to_ : contract(unit); const amt : mav) : operation is Mavryk.transaction(unit, amt, to_)


function transferFa12Token(const from_ : address; const to_ : address; const tokenAmount : nat; const tokenContractAddress : address) : operation is
    block{

        const transferParams : fa12TransferType = (from_,(to_,tokenAmount));

        const tokenContract : contract(fa12TransferType) =
            case (Mavryk.get_entrypoint_opt("%transfer", tokenContractAddress) : option(contract(fa12TransferType))) of [
                    Some (c) -> c
                |   None     -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA12_CONTRACT_NOT_FOUND) : contract(fa12TransferType))
            ];

    } with (Mavryk.transaction(transferParams, 0mav, tokenContract))


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
        case (Mavryk.get_entrypoint_opt("%transfer", tokenContractAddress) : option(contract(fa2TransferType))) of [
                Some (c) -> c
            |   None     -> (failwith(error_TRANSFER_ENTRYPOINT_IN_FA2_CONTRACT_NOT_FOUND) : contract(fa2TransferType))
        ];
        
} with (Mavryk.transaction(transferParams, 0mav, tokenContract))

// ------------------------------------------------------------------------------
// Transfer Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Common Operation Helpers
// ------------------------------------------------------------------------------

// helper function to get transfer entrypoint in treasury contract
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Mavryk.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to get %mint entrypoint from MVN Token address
function getMintEntrypointFromTokenAddress(const token_address : address) : contract(mintType) is
    case (Mavryk.get_entrypoint_opt(
        "%mint",
        token_address) : option(contract(mintType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_MINT_ENTRYPOINT_IN_MVN_TOKEN_CONTRACT_NOT_FOUND) : contract(mintType))
        ];



// helper function to send mint MVN and transfer operation to treasury
function sendMintMvnAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvnAndTransferType) is
    case (Mavryk.get_entrypoint_opt(
        "%mintMvnAndTransfer",
        contractAddress) : option(contract(mintMvnAndTransferType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_MINT_MVN_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvnAndTransferType))
        ];



// verify that token is allowed for operation fold
function verifyTokenAllowedForOperationFold(const invalidTokenAddress : address; const transferParams : transferActionType; const errorCode : nat) : unit is
block {

    for transferDestination in list transferParams block {
        case transferDestination.token of [
            |   Mav         -> skip
            |   Fa12(token) -> if token = invalidTokenAddress then failwith(errorCode) else skip
            |   Fa2(token)  -> if token.tokenContractAddress = invalidTokenAddress then failwith(errorCode) else skip
        ]
    };
    
} with unit



// Create transfer operations
function transferOperationFold(const transferParams : transferDestinationType; var operationList: list(operation)) : list(operation) is
block {

    const transferTokenOperation : operation = case transferParams.token of [
        |   Mav         -> transferMav((Mavryk.get_contract_with_error(transferParams.to_, "Error. Contract not found at given address") : contract(unit)), transferParams.amount * 1mumav)
        |   Fa12(token) -> transferFa12Token(Mavryk.get_self_address(), transferParams.to_, transferParams.amount, token)
        |   Fa2(token)  -> transferFa2Token(Mavryk.get_self_address(), transferParams.to_, transferParams.amount, token.tokenId, token.tokenContractAddress)
    ];

    operationList := transferTokenOperation # operationList

} with operationList