from mavryk.utils.contracts import get_token_standard
from mavryk.utils.error_reporting import save_error_report

from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage, TokenTypeItem1 as Fa2
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.lending_controller_mock_time.parameter.liquidate_vault import LiquidateVaultParameter
import mavryk.models as models
from dateutil import parser

async def on_lending_controller_mock_time_liquidate_vault(
    ctx: HandlerContext,
    liquidate_vault: Transaction[LiquidateVaultParameter, LendingControllerMockTimeStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address  = liquidate_vault.data.target_address
        timestamp                   = liquidate_vault.data.timestamp
        level                       = liquidate_vault.data.level
        operation_hash              = liquidate_vault.data.hash
        sender_address              = liquidate_vault.data.sender_address
        liquidation_amount          = float(liquidate_vault.parameter.amount)
        vault_owner_address         = liquidate_vault.parameter.vaultOwner
        vault_internal_id           = int(liquidate_vault.parameter.vaultId)
        vaults_storage              = liquidate_vault.storage.vaults
    
        # Update record
        lending_controller          = await models.LendingController.get(
            network         = ctx.datasource.network,
            address         = lending_controller_address,
            mock_time       = True
        )
        vault_owner                 = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=vault_owner_address)
        
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
                loan_token_storage                      = liquidate_vault.storage.loanTokenLedger[loan_token_name]
                loan_token.token_pool_total             = float(loan_token_storage.tokenPoolTotal)
                loan_token.m_tokens_total               = float(loan_token_storage.mTokensTotal)
                loan_token.total_borrowed               = float(loan_token_storage.totalBorrowed)
                loan_token.total_remaining              = float(loan_token_storage.totalRemaining)
                loan_token.last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
                loan_token.borrow_index                 = float(loan_token_storage.borrowIndex)
                loan_token.utilisation_rate             = float(loan_token_storage.utilisationRate)
                loan_token.current_interest_rate        = float(loan_token_storage.currentInterestRate)
                await loan_token.save()
    
                # Save collateral balance ledger
                for collateral_token_name in vault_collateral_balance_ledger:
                    collateral_token_amount                     = float(vault_collateral_balance_ledger[collateral_token_name])
                    collateral_token_storage                    = liquidate_vault.storage.collateralTokenLedger[collateral_token_name]
                    collateral_token_address                    = collateral_token_storage.tokenContractAddress

                    # Get token id
                    token_id                                    = 0
                    if type(collateral_token_storage.tokenType) == Fa2:
                        token_id    = int(collateral_token_storage.tokenType.fa2.tokenId)

                    # Get the token standard
                    standard = await get_token_standard(
                        ctx,
                        collateral_token_address
                    )

                    # Get the related token
                    token, _                                = await models.Token.get_or_create(
                        network             = ctx.datasource.network,
                        token_address       = collateral_token_address,
                        token_id            = token_id
                    )
                    token.token_standard    = standard
                    await token.save()

                    lending_controller_collateral_token         = await models.LendingControllerCollateralToken.filter(
                        lending_controller          = lending_controller,
                        collateral_token            = token
                    ).first()
                    lending_controller_collateral_balance, _    = await models.LendingControllerVaultCollateralBalance.get_or_create(
                        lending_controller_vault    = lending_controller_vault,
                        token                       = lending_controller_collateral_token
                    )
                    lending_controller_collateral_balance.balance   = collateral_token_amount
                    await lending_controller_collateral_balance.save()
    
                # Save history data
                sender                                  = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=sender_address)
                history_data                            = models.LendingControllerHistoryData(
                    lending_controller  = lending_controller,
                    loan_token          = loan_token,
                    vault               = lending_controller_vault,
                    sender              = sender,
                    operation_hash      = operation_hash,
                    timestamp           = timestamp,
                    level               = level,
                    type                = models.LendingControllerOperationType.LIQUIDATE_VAULT,
                    amount              = liquidation_amount
                )
                await history_data.save()

    except BaseException as e:
         await save_error_report(e)

