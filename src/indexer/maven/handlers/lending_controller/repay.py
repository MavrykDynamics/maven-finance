from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.lending_controller.tezos_parameters.repay import RepayParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.lending_controller.tezos_storage import LendingControllerStorage
from dateutil import parser
from maven import models as models

async def repay(
    ctx: HandlerContext,
    repay: TezosTransaction[RepayParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address              = repay.data.target_address
        timestamp                               = repay.data.timestamp
        level                                   = repay.data.level
        operation_hash                          = repay.data.hash
        sender_address                          = repay.data.sender_address
        vault_repay_amount                      = float(repay.parameter.quantity)
        vault_internal_id                       = int(repay.parameter.vaultId)
        vaults_storage                          = repay.storage.vaults
        lending_controller                      = await models.LendingController.get(
            network             = 'atlasnet',
            address             = lending_controller_address,
        )
        lending_controller_vault, _             = await models.LendingControllerVault.get_or_create(
            lending_controller  = lending_controller,
            internal_id         = vault_internal_id
        )
        await lending_controller_vault.save()
        loan_token                              = await lending_controller_vault.loan_token
        loan_token_name                         = loan_token.loan_token_name
        loan_token_storage                      = repay.storage.loanTokenLedger[loan_token_name]
        loan_token_token_pool_total             = float(loan_token_storage.tokenPoolTotal)
        loan_token_m_tokens_total               = float(loan_token_storage.rawMTokensTotalSupply)
        loan_token_total_borrowed               = float(loan_token_storage.totalBorrowed)
        loan_token_total_remaining              = float(loan_token_storage.totalRemaining)
        loan_token_last_updated_block_level     = int(loan_token_storage.lastUpdatedBlockLevel)
        loan_token_token_reward_index           = float(loan_token_storage.tokenRewardIndex)
        loan_token_borrow_index                 = float(loan_token_storage.borrowIndex)
        loan_token_utilisation_rate             = float(loan_token_storage.utilisationRate)
        loan_token_current_interest_rate        = float(loan_token_storage.currentInterestRate)
    
        # Update loan token
        m_token                                 = await loan_token.m_token
        if loan_token_token_reward_index > m_token.token_reward_index:
            m_token.token_reward_index          = loan_token_token_reward_index
            await m_token.save()
        loan_token.token_pool_total             = loan_token_token_pool_total
        loan_token.raw_m_tokens_total_supply    = loan_token_m_tokens_total
        loan_token.total_borrowed               = loan_token_total_borrowed
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
                vault_marked_for_liquidation_level      = int(vault_storage.value.markedForLiquidationLevel)
                vault_liquidation_end_level             = int(vault_storage.value.liquidationEndLevel)
    
                # Save updated vault
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
    
                # Calculate final repay amount
                new_loan_outstanding_total                                  = 0
                final_repay_amount                                          = 0
    
                if (lending_controller_vault.loan_outstanding_total > 0):
                    if (lending_controller_vault.borrow_index > 0) :
                        new_loan_outstanding_total                          = (lending_controller_vault.loan_outstanding_total * loan_token_borrow_index) / lending_controller_vault.borrow_index
    
                if vault_repay_amount > new_loan_outstanding_total:
                    final_repay_amount  = vault_repay_amount
                else:
                    final_repay_amount  = new_loan_outstanding_total
    
                # Save history data
                sender                                  = await models.get_user(network='atlasnet', address=sender_address)
                history_data                            = models.LendingControllerHistoryData(
                    lending_controller  = lending_controller,
                    loan_token          = loan_token,
                    vault               = lending_controller_vault,
                    sender              = sender,
                    operation_hash      = operation_hash,
                    timestamp           = timestamp,
                    level               = level,
                    type                = models.LendingControllerOperationType.REPAY,
                    amount              = final_repay_amount
                )
                await history_data.save()

    except BaseException as e:
        await save_error_report(e)

