from maven.utils.error_reporting import save_error_report

from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from maven.types.vault_factory.tezos_parameters.pause_all import PauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TezosTransaction[PauseAllParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address   = pause_all.data.target_address
        create_vault_paused     = pause_all.storage.breakGlassConfig.createVaultIsPaused
    
        # Update record
        await models.VaultFactory.filter(
            network = 'atlasnet',
            address = vault_factory_address
        ).update(
            create_vault_paused   = create_vault_paused
        )

    except BaseException as e:
        await save_error_report(e)

