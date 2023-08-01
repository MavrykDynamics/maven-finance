from mavryk.utils.contracts import get_token_standard
from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller_mock_time.parameter.vault_deposit_staked_token import VaultDepositStakedTokenParameter
from mavryk.types.lending_controller_mock_time.storage import LendingControllerMockTimeStorage, TokenTypeItem1 as Fa2
import mavryk.models as models
from dateutil import parser

async def vault_deposit_staked_token(
    ctx: HandlerContext,
    vault_deposit_staked_token: Transaction[VaultDepositStakedTokenParameter, LendingControllerMockTimeStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address  = vault_deposit_staked_token.data.target_address
        timestamp                   = vault_deposit_staked_token.data.timestamp
        level                       = vault_deposit_staked_token.data.level
        operation_hash              = vault_deposit_staked_token.data.hash
        sender_address              = vault_deposit_staked_token.data.sender_address
        collateral_token_name       = vault_deposit_staked_token.parameter.tokenName
        vault_deposit_amount        = float(vault_deposit_staked_token.parameter.depositAmount)
        vault_internal_id           = int(vault_deposit_staked_token.parameter.vaultId)
        vault_owner_address         = vault_deposit_staked_token.data.sender_address
        vaults_storage              = vault_deposit_staked_token.storage.vaults
    
        # Update record
        lending_controller          = await models.LendingController.get(
            network             = ctx.datasource.network,
            address             = lending_controller_address,
            mock_time           = True
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
                loan_token_storage                      = vault_deposit_staked_token.storage.loanTokenLedger[loan_token_name]
                loan_token_token_reward_index           = float(loan_token_storage.tokenRewardIndex) 
                m_token                                 = await loan_token.m_token
                if loan_token_token_reward_index > m_token.token_reward_index:
                    m_token.token_reward_index          = loan_token_token_reward_index
                    await m_token.save()
                loan_token.token_pool_total             = float(loan_token_storage.tokenPoolTotal)
                loan_token.raw_m_tokens_total_supply    = float(loan_token_storage.rawMTokensTotalSupply)
                loan_token.total_borrowed               = float(loan_token_storage.totalBorrowed)
                loan_token.total_remaining              = float(loan_token_storage.totalRemaining)
                loan_token.last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
                loan_token.borrow_index                 = float(loan_token_storage.borrowIndex)
                loan_token.utilisation_rate             = float(loan_token_storage.utilisationRate)
                loan_token.current_interest_rate        = float(loan_token_storage.currentInterestRate)
                await loan_token.save()
    
                # Save collateral balance ledger
                collateral_token_amount                 = float(vault_collateral_balance_ledger[collateral_token_name])
                collateral_token_storage                = vault_deposit_staked_token.storage.collateralTokenLedger[collateral_token_name]
                collateral_token_total_deposited        = float(collateral_token_storage.totalDeposited)
                collateral_token_address                = collateral_token_storage.tokenContractAddress

                # Get token id
                token_id                                = 0
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

                lending_controller_collateral_token     = await models.LendingControllerCollateralToken.get(
                    lending_controller          = lending_controller,
                    token                       = token
                )
                lending_controller_collateral_token.total_deposited = collateral_token_total_deposited
                await lending_controller_collateral_token.save()

                lending_controller_collateral_balance, _= await models.LendingControllerVaultCollateralBalance.get_or_create(
                    lending_controller_vault    = lending_controller_vault,
                    collateral_token            = lending_controller_collateral_token
                )
                lending_controller_collateral_balance.balance   = collateral_token_amount
                await lending_controller_collateral_balance.save()
    
                # Save history data
                sender                                  = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=sender_address)
                history_data                            = models.LendingControllerHistoryData(
                    lending_controller  = lending_controller,
                    loan_token          = loan_token,
                    collateral_token    = lending_controller_collateral_token,
                    vault               = lending_controller_vault,
                    sender              = sender,
                    operation_hash      = operation_hash,
                    timestamp           = timestamp,
                    level               = level,
                    type                = models.LendingControllerOperationType.DEPOSIT_STAKED_TOKEN,
                    amount              = vault_deposit_amount
                )
                await history_data.save()

    except BaseException as e:
        await save_error_report(e)

