from mavryk.utils.error_reporting import save_error_report

from mavryk.types.vault_factory.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_vault_factory_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address   = toggle_pause_entrypoint.data.target_address
        create_vault_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.createVaultIsPaused
    
        # Update record
        await models.VaultFactory.filter(
            network = ctx.datasource.network,
            address = vault_factory_address
        ).update(
            create_vault_paused   = create_vault_paused
        )

    except BaseException as e:
         await save_error_report(e)

