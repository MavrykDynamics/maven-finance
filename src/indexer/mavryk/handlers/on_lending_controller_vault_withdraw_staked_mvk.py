
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.vault_withdraw_staked_mvk import VaultWithdrawStakedMvkParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_lending_controller_vault_withdraw_staked_mvk(
    ctx: HandlerContext,
    vault_withdraw_staked_mvk: Transaction[VaultWithdrawStakedMvkParameter, LendingControllerStorage],
) -> None:

    # Get operation info
    lending_controller_address  = vault_withdraw_staked_mvk.data.target_address
    timestamp                   = vault_withdraw_staked_mvk.data.timestamp
    level                       = vault_withdraw_staked_mvk.data.level
    operation_hash              = vault_withdraw_staked_mvk.data.hash
    sender_address              = vault_withdraw_staked_mvk.data.sender_address
    vault_withdraw_amount       = float(vault_withdraw_staked_mvk.parameter.withdrawAmount)
    vault_internal_id           = int(vault_withdraw_staked_mvk.parameter.vaultId)
    vault_owner_address         = vault_withdraw_staked_mvk.data.sender_address
    vaults_storage              = vault_withdraw_staked_mvk.storage.vaults

    # Update record
    lending_controller          = await models.LendingController.get(
        address         = lending_controller_address,
        mock_time       = False
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
            vault_collateral_balance_ledger         = vault_storage.value.collateralBalanceLedger

            # Save updated vault
            lending_controller_vault                = await models.LendingControllerVault.get(
                lending_controller  = lending_controller,
                owner               = vault_owner,
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
            lending_controller_vault.marked_for_liquidation_level       = vault_marked_for_liquidation_level
            lending_controller_vault.liquidation_end_level              = vault_liquidation_end_level
            await lending_controller_vault.save()

            # Save loan token
            loan_token                              = await lending_controller_vault.loan_token
            loan_token_name                         = loan_token.loan_token_name
            loan_token_storage                      = vault_withdraw_staked_mvk.storage.loanTokenLedger[loan_token_name]
            loan_token.token_pool_total             = float(loan_token_storage.tokenPoolTotal)
            loan_token.lp_token_total               = float(loan_token_storage.lpTokensTotal)
            loan_token.total_remaining              = float(loan_token_storage.totalRemaining)
            loan_token.last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
            loan_token.borrow_index                 = float(loan_token_storage.borrowIndex)
            loan_token.utilisation_rate             = float(loan_token_storage.utilisationRate)
            loan_token.current_interest_rate        = float(loan_token_storage.currentInterestRate)
            await loan_token.save()

            # Save collateral balance ledger
            for collateral_token_name in vault_collateral_balance_ledger:
                collateral_token_amount                     = float(vault_collateral_balance_ledger[collateral_token_name])
                collateral_token_storage                    = vault_withdraw_staked_mvk.storage.collateralTokenLedger[collateral_token_name]
                collateral_token_address                    = collateral_token_storage.tokenContractAddress
                
                lending_controller_collateral_token         = await models.LendingControllerCollateralToken.get(
                    lending_controller          = lending_controller,
                    token_address               = collateral_token_address
                )
                lending_controller_collateral_balance, _    = await models.LendingControllerVaultCollateralBalance.get_or_create(
                    lending_controller_vault    = lending_controller_vault,
                    token                       = lending_controller_collateral_token
                )
                lending_controller_collateral_balance.balance   = collateral_token_amount
                await lending_controller_collateral_balance.save()

            # Save history data
            sender, _                               = await models.MavrykUser.get_or_create(
                address             = sender_address
            )
            await sender.save()
            history_data                            = models.LendingControllerHistoryData(
                lending_controller  = lending_controller,
                vault               = lending_controller_vault,
                sender              = sender,
                operation_hash      = operation_hash,
                timestamp           = timestamp,
                level               = level,
                type                = models.LendingControllerOperationType.WITHDRAW_SMVK,
                amount              = vault_withdraw_amount
            )
            await history_data.save()
