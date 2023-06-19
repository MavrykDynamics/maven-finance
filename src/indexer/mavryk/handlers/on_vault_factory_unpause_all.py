from mavryk.utils.error_reporting import save_error_report

from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.unpause_all import UnpauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_vault_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address   = unpause_all.data.target_address
        create_vault_paused     = unpause_all.storage.breakGlassConfig.createVaultIsPaused
    
        # Update record
        await models.VaultFactory.filter(
            network = ctx.datasource.network,
            address = vault_factory_address
        ).update(
            create_vault_paused   = create_vault_paused
        )
    

    except BaseException as e:
         await save_error_report(e)

