from mavryk.utils.error_reporting import save_error_report

from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.pause_all import PauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_vault_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address   = pause_all.data.target_address
        create_vault_paused     = pause_all.storage.breakGlassConfig.createVaultIsPaused
    
        # Update record
        vault_factory           = await models.VaultFactory.get(
            address = vault_factory_address
        )
        vault_factory.create_vault_paused   = create_vault_paused
        await vault_factory.save()

    except BaseException:
         await save_error_report()

