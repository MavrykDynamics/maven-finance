from maven.utils.error_reporting import save_error_report

from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from maven.types.vault_factory.tezos_parameters.unpause_all import UnpauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TzktTransaction[UnpauseAllParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address   = unpause_all.data.target_address
        create_vault_paused     = unpause_all.storage.breakGlassConfig.createVaultIsPaused
    
        # Update record
        await models.VaultFactory.filter(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = vault_factory_address
        ).update(
            create_vault_paused   = create_vault_paused
        )
    

    except BaseException as e:
        await save_error_report(e)

