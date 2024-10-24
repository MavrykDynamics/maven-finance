from maven.utils.error_reporting import save_error_report

from maven.types.vault_factory.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TezosTransaction[TogglePauseEntrypointParameter, VaultFactoryStorage],
) -> None:

    try:
        # Get operation info
        vault_factory_address   = toggle_pause_entrypoint.data.target_address
        create_vault_paused     = toggle_pause_entrypoint.storage.breakGlassConfig.createVaultIsPaused
    
        # Update record
        await models.VaultFactory.filter(
            network = 'atlasnet',
            address = vault_factory_address
        ).update(
            create_vault_paused   = create_vault_paused
        )

    except BaseException as e:
        await save_error_report(e)

