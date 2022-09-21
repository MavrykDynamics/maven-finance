
from dipdup.context import HandlerContext
from mavryk.types.lending_controller.parameter.repay import RepayParameter
from dipdup.models import Transaction
from mavryk.types.lending_controller.storage import LendingControllerStorage
from dateutil import parser
import mavryk.models as models

async def on_lending_controller_repay(
    ctx: HandlerContext,
    repay: Transaction[RepayParameter, LendingControllerStorage],
) -> None:
    # Get operation info
    lending_controller_address              = repay.data.target_address
    vault_internal_id                       = int(repay.parameter.vaultId)
    vaults_storage                          = repay.storage.vaults
    lending_controller                      = await models.LendingController.get(
        address             = lending_controller_address
    )
    lending_controller_vault                = await models.LendingControllerVault.get(
        lending_controller  = lending_controller,
        internal_id         = vault_internal_id
    )
    loan_token                              = await lending_controller_vault.loan_token
    loan_token_name                         = loan_token.loan_token_name
    loan_token_storage                      = repay.storage.loanTokenLedger[loan_token_name]
    loan_token_token_pool_total             = float(loan_token_storage.tokenPoolTotal)
    loan_token_lp_tokens_total              = float(loan_token_storage.lpTokensTotal)
    loan_token_total_remaining              = float(loan_token_storage.totalRemaining)
    loan_token_last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
    loan_token_borrow_index                 = float(loan_token_storage.borrowIndex)
    loan_token_utilisation_rate             = float(loan_token_storage.utilisationRate)
    loan_token_current_interest_rate        = float(loan_token_storage.currentInterestRate)

    # Update loan token
    loan_token.token_pool_total             = loan_token_token_pool_total
    loan_token.lp_token_total               = loan_token_lp_tokens_total
    loan_token.total_remaining              = loan_token_total_remaining
    loan_token.last_updated_block_level     = loan_token_last_updated_block_level
    loan_token.borrow_index                 = loan_token_borrow_index
    loan_token.utilisation_rate             = loan_token_utilisation_rate
    loan_token.current_interest_rate        = loan_token_current_interest_rate
    await loan_token.save()

    # Update vault
    for vault_storage in vaults_storage:
        if int(vault_storage.key.id) == vault_internal_id:
            vault_loan_oustanding_total             = float(vault_storage.value.loanOutstandingTotal)
            vault_loan_principal_total              = float(vault_storage.value.loanPrincipalTotal)
            vault_loan_interest_total               = float(vault_storage.value.loanInterestTotal)
            vault_loan_decimals                     = float(vault_storage.value.loanDecimals)
            vault_borrow_index                      = float(vault_storage.value.borrowIndex)
            vault_last_updated_block_level          = int(vault_storage.value.lastUpdatedBlockLevel)
            vault_last_updated_timestamp            = parser.parse(vault_storage.value.lastUpdatedTimestamp)
            vault_marked_for_liquidation_timestamp  = parser.parse(vault_storage.value.markedForLiquidationTimestamp)

            # Save updated vault
            lending_controller_vault                = await models.LendingControllerVault.get(
                lending_controller  = lending_controller,
                internal_id         = vault_internal_id
            )
            lending_controller_vault.internal_id                        = vault_internal_id
            lending_controller_vault.loan_outstanding_total             = vault_loan_oustanding_total
            lending_controller_vault.loan_principal_total               = vault_loan_principal_total
            lending_controller_vault.loan_interest_total                = vault_loan_interest_total
            lending_controller_vault.loan_decimals                      = vault_loan_decimals
            lending_controller_vault.borrow_index                       = vault_borrow_index
            lending_controller_vault.last_updated_block_level           = vault_last_updated_block_level
            lending_controller_vault.last_updated_timestamp             = vault_last_updated_timestamp
            lending_controller_vault.marked_for_liquidation_timestamp   = vault_marked_for_liquidation_timestamp
            await lending_controller_vault.save()
