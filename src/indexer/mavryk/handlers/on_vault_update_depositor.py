
from mavryk.types.vault.parameter.update_depositor import UpdateDepositorParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vault.storage import VaultStorage, Depositor as Any, Depositor1 as Whitelist
import mavryk.models as models

async def on_vault_update_depositor(
    ctx: HandlerContext,
    update_depositor: Transaction[UpdateDepositorParameter, VaultStorage],
) -> None:
    
    # Get operation info
    vault_address       = update_depositor.data.target_address
    depositors          = update_depositor.storage.depositors
    allowance_type      = models.VaultAllowance.ANY

    # Update record
    vault               = await models.Vault.get(
        address = vault_address
    )
    vault_depositors    = await models.VaultDepositor.filter(vault=vault).all()
    for vault_depositor in vault_depositors:
        await vault_depositor.delete()

    if type(depositors) == Any:
        allowance_type  = models.VaultAllowance.ANY
    elif type(depositors) == Whitelist:
        allowance_type  = models.VaultAllowance.WHITELIST
        for depositor_address in depositors.whitelist:
            depositor, _        = await models.MavrykUser.get_or_create(
                address = depositor_address
            )
            await depositor.save()
            vault_depositor, _  = await models.VaultDepositor.get_or_create(
                vault       = vault,
                depositor   = depositor
            )
            await vault_depositor.save()

    vault.allowance = allowance_type
    await vault.save()
