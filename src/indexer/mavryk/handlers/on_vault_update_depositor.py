
from mavryk.types.vault.parameter.update_depositor import UpdateDepositorParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault.storage import VaultStorage, DepositorsConfigItem as Any, DepositorsConfigItem1 as Whitelist
import mavryk.models as models

async def on_vault_update_depositor(
    ctx: HandlerContext,
    update_depositor: Transaction[UpdateDepositorParameter, VaultStorage],
) -> None:
    
    # Get operation info
    vault_address       = update_depositor.data.target_address
    depositor_address   = update_depositor.parameter.depositorAddress
    depositor_config    = update_depositor.parameter.depositorsConfig
    add_depositor       = update_depositor.parameter.addOrRemoveBool
    allowance_type      = models.VaultAllowance.ANY

    # Update record
    vault               = await models.Vault.get(
        address = vault_address
    )
    depositor           = await models.mavryk_user_cache.get(address=depositor_address)
    vault_depositor, _  = await models.VaultDepositor.get_or_create(
        vault       = vault,
        depositor   = depositor
    )
    if add_depositor:
        await vault_depositor.save()
    else:
        await vault_depositor.delete()

    if type(depositor_config) == Any:
        allowance_type  = models.VaultAllowance.ANY
    elif type(depositor_config) == Whitelist:
        allowance_type  = models.VaultAllowance.WHITELIST

    vault.allowance = allowance_type
    await vault.save()
