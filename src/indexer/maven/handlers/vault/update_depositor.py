from maven.utils.error_reporting import save_error_report

from maven.types.vault.tezos_parameters.update_depositor import UpdateDepositorParameter, Allowance as Any, Allowance1 as Whitelist
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.vault.tezos_storage import VaultStorage
import maven.models as models

async def update_depositor(
    ctx: HandlerContext,
    update_depositor: TezosTransaction[UpdateDepositorParameter, VaultStorage],
) -> None:

    try:
        # Get operation info
        vault_address       = update_depositor.data.target_address
        depositor           = update_depositor.parameter.allowance
        allowance_type      = models.VaultAllowance.ANY
    
        # Update record
        vault               = await models.Vault.get(
            network = 'atlasnet',
            address = vault_address
        )
    
        if type(depositor) == Any:
            reset_whitelist     = not depositor.any
            if reset_whitelist:
                allowance_type      = models.VaultAllowance.WHITELIST
                vault_depositors    = await models.VaultDepositor.filter(vault = vault).all()
                for vault_depositor in vault_depositors:
                    await vault_depositor.delete()
            else:
                allowance_type      = models.VaultAllowance.ANY
        elif type(depositor) == Whitelist:
            allowance_type      = models.VaultAllowance.WHITELIST
            depositor_address   = depositor.whitelist.address
            add_depositor       = depositor.whitelist.bool
            user                = await models.maven_user_cache.get(network='atlasnet', address=depositor_address)
            vault_depositor, _  = await models.VaultDepositor.get_or_create(
                vault       = vault,
                depositor   = user
            )
            if add_depositor:
                await vault_depositor.save()
            else:
                await vault_depositor.delete()
    
        vault.allowance = allowance_type
        await vault.save()

    except BaseException as e:
        await save_error_report(e)

