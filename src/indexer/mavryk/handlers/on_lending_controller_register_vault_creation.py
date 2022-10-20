
from mavryk.utils.persisters import persist_token_metadata
from mavryk.types.lending_controller.parameter.register_vault_creation import RegisterVaultCreationParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage, TokenTypeItem3 as fa12, TokenTypeItem4 as fa2, TokenTypeItem5 as tez
import mavryk.models as models
from dateutil import parser

async def on_lending_controller_register_vault_creation(
    ctx: HandlerContext,
    register_vault_creation: Transaction[RegisterVaultCreationParameter, LendingControllerStorage],
) -> None:

    # Get operation info
    lending_controller_address  = register_vault_creation.data.target_address
    vaults_storage              = register_vault_creation.storage.vaults
    vault_owner_address         = register_vault_creation.parameter.vaultOwner

    # Create / Update record
    lending_controller          = await models.LendingController.get(
        address = lending_controller_address
    )
    vault_owner, _              = await models.MavrykUser.get_or_create(
        address = vault_owner_address
    )
    await vault_owner.save()
    for vault_storage in vaults_storage:
        vault_address                           = vault_storage.value.address
        vault_loan_token_name                   = vault_storage.value.loanToken
        vault_loan_oustanding_total             = float(vault_storage.value.loanOutstandingTotal)
        vault_loan_principal_total              = float(vault_storage.value.loanPrincipalTotal)
        vault_loan_interest_total               = float(vault_storage.value.loanInterestTotal)
        vault_loan_decimals                     = float(vault_storage.value.loanDecimals)
        vault_borrow_index                      = float(vault_storage.value.borrowIndex)
        vault_last_updated_block_level          = int(vault_storage.value.lastUpdatedBlockLevel)
        vault_last_updated_timestamp            = parser.parse(vault_storage.value.lastUpdatedTimestamp)
        vault_marked_for_liquidation_level      = int(vault_storage.value.markedForLiquidationLevel)
        vault_liquidation_end_level             = int(vault_storage.value.liquidationEndLevel)
        vault_internal_id                       = int(vault_storage.key.id)
        loan_token_storage                      = register_vault_creation.storage.loanTokenLedger[vault_loan_token_name]
        loan_token_type_storage                 = loan_token_storage.tokenType
        loan_token_address                      = ""

        # Get loan token address
        if type(loan_token_type_storage) == fa12:
            loan_token_address          = loan_token_type_storage.fa12
        elif type(loan_token_type_storage) == fa2:
            loan_token_address          = loan_token_type_storage.fa2.tokenContractAddress
        elif type(loan_token_type_storage) == tez:
            loan_token_address          = "XTZ"
        
        lending_controller_loan_token           = await models.LendingControllerLoanToken.get(
            lending_controller  = lending_controller,
            loan_token_address  = loan_token_address
        )
        vault, _                                = await models.Vault.get_or_create(
            address = vault_address
        )
        await vault.save()
        lending_controller_vault, _             = await models.LendingControllerVault.get_or_create(
            lending_controller  = lending_controller,
            vault               = vault,
            owner               = vault_owner,
            loan_token          = lending_controller_loan_token
        )
        lending_controller_vault.internal_id                        = vault_internal_id
        lending_controller_vault.loan_outstanding_total             = vault_loan_oustanding_total
        lending_controller_vault.loan_principal_total               = vault_loan_principal_total
        lending_controller_vault.loan_interest_total                = vault_loan_interest_total
        lending_controller_vault.loan_decimals                      = vault_loan_decimals
        lending_controller_vault.borrow_index                       = vault_borrow_index
        lending_controller_vault.last_updated_block_level           = vault_last_updated_block_level
        lending_controller_vault.last_updated_timestamp             = vault_last_updated_timestamp
        lending_controller_vault.marked_for_liquidation_level       = vault_marked_for_liquidation_level
        lending_controller_vault.liquidation_end_level              = vault_liquidation_end_level
        await lending_controller_vault.save()
