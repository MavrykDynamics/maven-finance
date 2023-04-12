
from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage, TokenTypeItem3 as fa12, TokenTypeItem4 as fa2, TokenTypeItem5 as tez
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.mark_for_liquidation import MarkForLiquidationParameter
import mavryk.models as models
from dateutil import parser

async def on_lending_controller_mock_time_mark_for_liquidation(
    ctx: HandlerContext,
    mark_for_liquidation: Transaction[MarkForLiquidationParameter, LendingControllerMockTimeStorage],
) -> None:

    # Get operation info
    lending_controller_address              = mark_for_liquidation.data.target_address
    timestamp                               = mark_for_liquidation.data.timestamp
    level                                   = mark_for_liquidation.data.level
    operation_hash                          = mark_for_liquidation.data.hash
    sender_address                          = mark_for_liquidation.data.sender_address
    vault_internal_id                       = int(mark_for_liquidation.parameter.vaultId)
    vault_owner_address                     = mark_for_liquidation.parameter.vaultOwner
    vaults_storage                          = mark_for_liquidation.storage.vaults

    # Update records
    lending_controller          = await models.LendingController.get(
        address         = lending_controller_address,
        mock_time       = True
    )
    vault_owner                 = await models.mavryk_user_cache.get(address=vault_owner_address)

    for vault_storage in vaults_storage:
        if int(vault_storage.key.id) == vault_internal_id and vault_storage.key.owner == vault_owner_address:
            vault_loan_oustanding_total             = float(vault_storage.value.loanOutstandingTotal)
            vault_loan_principal_total              = float(vault_storage.value.loanPrincipalTotal)
            vault_loan_interest_total               = float(vault_storage.value.loanInterestTotal)
            vault_loan_decimals                     = float(vault_storage.value.loanDecimals)
            vault_borrow_index                      = float(vault_storage.value.borrowIndex)
            vault_last_updated_block_level          = int(vault_storage.value.lastUpdatedBlockLevel)
            vault_last_updated_timestamp            = parser.parse(vault_storage.value.lastUpdatedTimestamp)
            vault_marked_for_liquidation_level      = int(vault_storage.value.markedForLiquidationLevel)
            vault_liquidation_end_level             = int(vault_storage.value.liquidationEndLevel)

            # Save updated vault
            lending_controller_vault                = await models.LendingControllerVault.filter(
                lending_controller  = lending_controller,
                owner               = vault_owner,
                internal_id         = vault_internal_id
            ).first()
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

            # Save loan token
            loan_token                              = await lending_controller_vault.loan_token
            loan_token_name                         = loan_token.loan_token_name
            loan_token_storage                      = mark_for_liquidation.storage.loanTokenLedger[loan_token_name]
            loan_token.token_pool_total             = float(loan_token_storage.tokenPoolTotal)
            loan_token.m_tokens_total               = float(loan_token_storage.mTokensTotal)
            loan_token.total_borrowed               = float(loan_token_storage.totalBorrowed)
            loan_token.total_remaining              = float(loan_token_storage.totalRemaining)
            loan_token.last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
            loan_token.borrow_index                 = float(loan_token_storage.borrowIndex)
            loan_token.utilisation_rate             = float(loan_token_storage.utilisationRate)
            loan_token.current_interest_rate        = float(loan_token_storage.currentInterestRate)
            await loan_token.save()

            # Save history data
            sender                                  = await models.mavryk_user_cache.get(address=sender_address)
            history_data                            = models.LendingControllerHistoryData(
                lending_controller  = lending_controller,
                loan_token          = loan_token,
                vault               = lending_controller_vault,
                sender              = sender,
                operation_hash      = operation_hash,
                timestamp           = timestamp,
                level               = level,
                type                = models.LendingControllerOperationType.MARK_FOR_LIQUIDATION,
                amount              = 0
            )
            await history_data.save()
