
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.lending_controller.parameter.close_vault import CloseVaultParameter
from mavryk.types.lending_controller.storage import LendingControllerStorage
import mavryk.models as models

async def on_lending_controller_close_vault(
    ctx: HandlerContext,
    close_vault: Transaction[CloseVaultParameter, LendingControllerStorage],
) -> None:

    # Get operation info
    lending_controller_address  = close_vault.data.target_address
    vault_owner_address         = close_vault.data.sender_address
    vault_internal_id           = int(close_vault.parameter.__root__)
    vaults_storage              = close_vault.storage.vaults

    # Update record
    lending_controller          = await models.LendingController.get(
        address             = lending_controller_address,
        mock_time           = False
    )
    owner                       = await models.mavryk_user_cache.get(address=vault_owner_address)
    lending_controller_vault    = await models.LendingControllerVault.get(
        lending_controller  = lending_controller,
        owner               = owner,
        internal_id         = vault_internal_id
    )
    lending_controller_vault.open   = False

    # Update collateral balance ledger
    vault_collateral_balances   = await models.LendingControllerVaultCollateralBalance.filter(lending_controller_vault=lending_controller_vault).all()
    for vault_collateral_balance in vault_collateral_balances:
        vault_collateral_balance.deposited_amount   = 0
        await vault_collateral_balance.save()
