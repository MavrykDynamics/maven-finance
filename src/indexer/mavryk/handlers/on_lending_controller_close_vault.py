from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.close_vault import CloseVaultParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_close_vault(
    ctx: HandlerContext,
    close_vault: Transaction[CloseVaultParameter, LendingControllerStorage],
) -> None:

    try:
        # Get operation info
        lending_controller_address  = close_vault.data.target_address
        timestamp                   = close_vault.data.timestamp
        level                       = close_vault.data.level
        operation_hash              = close_vault.data.hash
        sender_address              = close_vault.data.sender_address
        vault_owner_address         = close_vault.data.sender_address
        vault_internal_id           = int(close_vault.parameter.__root__)
    
        # Update record
        lending_controller          = await models.LendingController.get(
            address             = lending_controller_address,
            mock_time           = False
        )
        owner                       = await models.mavryk_user_cache.get(address=vault_owner_address)
        lending_controller_vault    = await models.LendingControllerVault.filter(
            lending_controller  = lending_controller,
            owner               = owner,
            internal_id         = vault_internal_id
        ).first()
        lending_controller_vault.open   = False
        loan_token                      = await lending_controller_vault.loan_token
        await lending_controller_vault.save()
    
        # Update collateral balance ledger
        vault_collateral_balances   = await models.LendingControllerVaultCollateralBalance.filter(lending_controller_vault=lending_controller_vault).all()
        for vault_collateral_balance in vault_collateral_balances:
            vault_collateral_balance.deposited_amount   = 0
            await vault_collateral_balance.save()
    
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
            type                = models.LendingControllerOperationType.CLOSE_VAULT,
            amount              = 0
        )
        await history_data.save()

    except BaseException as e:
         await save_error_report(e)

